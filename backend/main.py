import os

# ── Inject ffmpeg into PATH so Whisper can decode audio ───────────────────────
# winget installs to a user-local path that isn't in the inherited PATH
# when the process is launched programmatically.
_FFMPEG_CANDIDATES = [
    # winget default install location (Gyan build)
    r"C:\Users\Ace\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.2-full_build\bin",
    # Also check standard Program Files locations
    r"C:\Program Files\ffmpeg\bin",
    r"C:\ffmpeg\bin",
]
for _ffmpeg_bin in _FFMPEG_CANDIDATES:
    if os.path.isfile(os.path.join(_ffmpeg_bin, "ffmpeg.exe")):
        os.environ["PATH"] = _ffmpeg_bin + os.pathsep + os.environ.get("PATH", "")
        print(f"[STARTUP] ffmpeg found and added to PATH: {_ffmpeg_bin}")
        break
else:
    print("[STARTUP WARNING] ffmpeg not found in known locations. Audio processing may fail.")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.schema import init_db
from database.models import HealthResponse
from routers import pipeline, students, sessions

# Ensure .env is loaded if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="SpeakFlow AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Mount routers
app.include_router(pipeline.router)
app.include_router(students.router)
app.include_router(sessions.router)

@app.get("/health")
def health_check():
    api_keys_str = os.getenv("GOOGLE_API_KEYS", os.getenv("GOOGLE_API_KEY", ""))
    api_keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]
    return {"status": "ok", "api_key_count": len(api_keys)}

@app.get("/debug-ffmpeg")
def debug_ffmpeg():
    import subprocess
    import sys
    try:
        r = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        return {"status": "success", "out": r.stdout[:100], "path": os.environ.get("PATH")}
    except Exception as e:
        return {"status": "error", "error": str(e), "type": str(type(e)), "path": os.environ.get("PATH")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
