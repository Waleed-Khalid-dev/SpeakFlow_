import json
import uuid
import base64
import tempfile
import os
import difflib
from fastapi import APIRouter, HTTPException
from agents.orchestrator import run_pipeline
from database.schema import get_db_connection
from database.models import PipelineRunRequest

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])


def _process_audio(audio_path: str, target_sentence: str, grade: int) -> dict:
    """
    Full DSP pipeline: Whisper (word-level transcription) + Librosa (acoustic features).
    Returns structured signal_data dict ready for the 5 Gemma agents.
    This is the exact same logic verified by test_audio_pipeline.py.
    """
    import whisper
    import librosa
    import numpy as np

    # Safety net: ensure ffmpeg is in PATH for this thread / subprocess
    _FFMPEG_BINS = [
        r"C:\Users\Ace\AppData\Local\Microsoft\WinGet\Packages"
        r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
        r"\ffmpeg-8.1.2-full_build\bin",
        r"C:\Program Files\ffmpeg\bin",
        r"C:\ffmpeg\bin",
    ]
    for _bin in _FFMPEG_BINS:
        if os.path.isfile(os.path.join(_bin, "ffmpeg.exe")):
            if _bin not in os.environ.get("PATH", ""):
                os.environ["PATH"] = _bin + os.pathsep + os.environ["PATH"]
            break

    print(f"[DSP] Loading Whisper tiny model...")
    model = whisper.load_model(os.getenv("WHISPER_MODEL", "tiny"))

    print(f"[DSP] Transcribing {audio_path}...")
    result = model.transcribe(audio_path, word_timestamps=True, language="en")
    transcript = result["text"].strip()
    print(f"[DSP] Transcript: \"{transcript}\"")

    # --- Word-level timing from Whisper ---
    words_spoken = []
    all_word_times = []
    for seg in result.get("segments", []):
        for w in seg.get("words", []):
            words_spoken.append({
                "word": w["word"].strip(),
                "start": round(w["start"], 3),
                "end":   round(w["end"],   3),
                "duration_ms": round((w["end"] - w["start"]) * 1000),
                "probability": round(w.get("probability", 1.0), 3),
            })
            all_word_times.append((w["start"], w["end"]))

    # --- Pause detection (gaps > 400ms between words) ---
    pauses = []
    for i in range(1, len(all_word_times)):
        gap = all_word_times[i][0] - all_word_times[i - 1][1]
        if gap > 0.4:
            pauses.append({
                "after_word": words_spoken[i - 1]["word"],
                "duration_ms": round(gap * 1000),
            })

    # --- WPM from word count + total duration ---
    total_duration = result["segments"][-1]["end"] if result.get("segments") else 1.0
    word_count = len(transcript.split())
    wpm = round((word_count / total_duration) * 60, 1) if total_duration > 0 else 0.0

    print(f"[DSP] WPM: {wpm}, Duration: {total_duration:.1f}s, Pauses: {len(pauses)}")

    # --- Librosa acoustic analysis ---
    print(f"[DSP] Running Librosa pitch analysis...")
    y, sr = librosa.load(audio_path, sr=None, mono=True)

    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
    )
    valid_f0 = (
        f0[voiced_flag]
        if (f0 is not None and voiced_flag is not None and voiced_flag.any())
        else __import__("numpy").array([0.0])
    )
    pitch_variance = round(float(__import__("numpy").var(valid_f0)), 2)
    print(f"[DSP] Pitch variance: {pitch_variance}")

    return {
        # Transcription
        "transcript":          transcript,
        "words_spoken":        words_spoken,

        # Fluency metrics (for Difficulty + Phonetic agents)
        "wpm":                 wpm,
        "pause_count":         len(pauses),
        "pauses":              pauses,
        "repetition_count":    0,
        "hesitation_count":    len(pauses),

        # Acoustic metrics (for Engagement agent)
        "pitch_variance":      pitch_variance,
        "pitch_series":        valid_f0[:10].tolist(),
        "pause_durations":     [p["duration_ms"] for p in pauses],
        "session_duration_seconds": round(total_duration),
        "accuracy_trend":      "stable",

        # Context for all agents
        "grade":               grade,
        "target_sentence":     target_sentence,
    }


@router.post("/run")
async def execute_pipeline(request: PipelineRunRequest):
    # ── 1. Fetch student + session history ────────────────────────────────────
    student_grade = 3
    session_history = []

    with get_db_connection() as conn:
        student = conn.execute(
            "SELECT * FROM students WHERE id = ?", (request.student_id,)
        ).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        student_grade = student["grade"]

        history_rows = conn.execute(
            "SELECT * FROM sessions WHERE student_id = ? ORDER BY timestamp DESC LIMIT 10",
            (request.student_id,),
        ).fetchall()
        session_history = [dict(r) for r in history_rows]

    # ── 2. Build signal_data ───────────────────────────────────────────────────
    signal_data = {}

    if request.mocked_signal_data:
        # Demo/test mode: accept pre-built data
        signal_data = dict(request.mocked_signal_data)
        signal_data["grade"] = student_grade
        signal_data["target_sentence"] = request.target_sentence

    elif request.audio_base64:
        # Real mode: decode audio → Whisper + Librosa → structured features
        audio_bytes = base64.b64decode(request.audio_base64)

        # Detect audio format from the first bytes (magic bytes)
        # WebM: starts with 0x1A 0x45 0xDF 0xA3
        # OGG:  starts with b'OggS'
        # MP4/M4A: bytes 4-8 == b'ftyp'
        ext = ".webm"  # default — most browsers use webm
        if audio_bytes[:4] == b'OggS':
            ext = ".ogg"
        elif len(audio_bytes) > 8 and audio_bytes[4:8] == b'ftyp':
            ext = ".mp4"
        elif audio_bytes[:4] == b'RIFF':
            ext = ".wav"

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            print(f"[DSP] Audio format detected: {ext}, size: {len(audio_bytes)} bytes")
            signal_data = _process_audio(tmp_path, request.target_sentence, student_grade)

        except Exception as e:
            print(f"[DSP ERROR] {e}")
            raise HTTPException(
                status_code=500, detail=f"Audio processing failed: {str(e)}"
            )
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either audio_base64 or mocked_signal_data.",
        )

    # ── 3. Run 5-agent Gemma pipeline ─────────────────────────────────────────
    print("[PIPELINE] Dispatching to 5 Gemma agents...")
    results = await run_pipeline(signal_data, session_history)

    if "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])

    # ── 4. Compute a real overall_score from agent outputs ────────────────────
    wpm = signal_data.get("wpm", 0)
    grade = signal_data.get("grade", 3)
    # Grade-level expected WPM benchmarks
    expected_wpm = {1: 60, 2: 90, 3: 110, 4: 140, 5: 160, 6: 180}
    target_wpm = expected_wpm.get(grade, 110)
    fluency_score = min(100, round((wpm / target_wpm) * 100)) if target_wpm else 50
    engagement = results.get("engagement", {})
    engagement_score = round(engagement.get("engagement_level", 0.7) * 100)
    overall_score = round((fluency_score * 0.6) + (engagement_score * 0.4))

    # ── 5. Persist to database ─────────────────────────────────────────────────
    session_id = str(uuid.uuid4())
    transcript = signal_data.get("transcript", "")
    
    # Calculate real string-matching accuracy
    accuracy_ratio = difflib.SequenceMatcher(None, request.target_sentence.lower(), transcript.lower()).ratio()
    accuracy_percentage = round(accuracy_ratio * 100)
    
    try:
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions
                    (id, student_id, target_sentence, transcript, wpm, accuracy, overall_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    request.student_id,
                    request.target_sentence,
                    transcript,
                    signal_data.get("wpm", 0.0),
                    round(accuracy_percentage / 100, 2),
                    overall_score,
                ),
            )
            conn.execute(
                """
                INSERT INTO diagnoses
                    (session_id, phonetic_result, difficulty_result,
                     engagement_result, practice_result, progress_result)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    json.dumps(results["phonetic"]),
                    json.dumps(results["difficulty"]),
                    json.dumps(results["engagement"]),
                    json.dumps(results["practice"]),
                    json.dumps(results["progress"]),
                ),
            )
            conn.commit()
        print(f"[DB] Session {session_id} saved.")
    except Exception as e:
        print(f"[DB WARN] Could not save session: {e}")
        # Never fail the request because of a DB write error

    # ── 6. Return full response to frontend ────────────────────────────────────
    return {
        "session_id":   session_id,
        "transcript":   transcript,
        "wpm":          signal_data.get("wpm", 0),
        "overall_score": overall_score,
        "accuracy":     accuracy_percentage,
        "pauses":       signal_data.get("pauses", 0),
        "diagnosis":    results,
    }
