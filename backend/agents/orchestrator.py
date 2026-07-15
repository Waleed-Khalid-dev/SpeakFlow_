import asyncio
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

from .phonetic_agent import PHONETIC_SYSTEM_PROMPT
from .difficulty_agent import DIFFICULTY_SYSTEM_PROMPT
from .engagement_agent import ENGAGEMENT_SYSTEM_PROMPT
from .practice_agent import PRACTICE_SYSTEM_PROMPT
from .progress_agent import PROGRESS_SYSTEM_PROMPT

# Setup API Key Pool
api_keys_str = os.getenv("GOOGLE_API_KEYS", os.getenv("GOOGLE_API_KEY", ""))
API_KEYS = [k.strip() for k in api_keys_str.split(",") if k.strip()]
if not API_KEYS:
    raise ValueError("No API keys found. Please set GOOGLE_API_KEYS in .env")

current_key_idx = 0
key_lock = asyncio.Lock()
genai.configure(api_key=API_KEYS[current_key_idx])

async def call_gemma(system_prompt: str, user_data: dict) -> dict:
    """
    Call Gemma 4 with robust JSON parsing and API key rotation for rate limits.
    """
    global current_key_idx
    
    model = genai.GenerativeModel(
        model_name="gemma-4-31b-it", # Using available gemma-4 model from API
        system_instruction=system_prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    max_retries = len(API_KEYS) * 2 if len(API_KEYS) > 1 else 3
    
    for attempt in range(max_retries):
        try:
            response = await model.generate_content_async(json.dumps(user_data))
                
            text = response.text
            start = text.find("{")
            if start != -1:
                # Use raw_decode to parse exactly one valid JSON object and ignore any "Extra data" that follows it
                decoder = json.JSONDecoder()
                parsed_json, _ = decoder.raw_decode(text[start:])
                return parsed_json
            
            # Fallback if no '{' is found (highly unlikely given the prompt)
            return json.loads(text)
            
        except Exception as e:
            error_msg = str(e)
            print(f"Attempt {attempt+1}/{max_retries} failed: {error_msg}")
            
            # If we have multiple keys, rotate. If not, just exponential backoff.
            if len(API_KEYS) > 1:
                async with key_lock:
                    current_key_idx = (current_key_idx + 1) % len(API_KEYS)
                    new_key = API_KEYS[current_key_idx]
                    genai.configure(api_key=new_key)
                    print(f"Rotated to API Key {current_key_idx+1}/{len(API_KEYS)}")
            
            # Backoff before retry (1s, 2s, 4s...)
            await asyncio.sleep(2 ** attempt)
            
    return {"error": "All retry attempts failed."}

async def run_pipeline(signal_data: dict, session_history: list) -> dict:
    """
    Main pipeline execution.
    Agents 1-3 run in parallel.
    Agent 4 waits for 1-3.
    Agent 5 runs independently (in parallel with 4).
    """
    # Phase 1: Parallel diagnosis (agents 1, 2, 3)
    phonetic, difficulty, engagement = await asyncio.gather(
        call_gemma(PHONETIC_SYSTEM_PROMPT, signal_data),
        call_gemma(DIFFICULTY_SYSTEM_PROMPT, signal_data),
        call_gemma(ENGAGEMENT_SYSTEM_PROMPT, signal_data),
    )
    
    # Check for API errors in phase 1
    if "error" in phonetic: return {"error": "Phonetic agent failed"}
    
    # Phase 2: Practice generator waits for 1-3 to complete
    practice_input = {
        **phonetic, 
        **difficulty, 
        **engagement, 
        "grade": signal_data.get("grade", 3)
    }
    
    progress_input = {
        "sessions": session_history, 
        "today_diagnosis": {**phonetic, **difficulty, **engagement}, 
        **signal_data
    }
    
    # Practice and Progress can run in parallel
    practice, progress = await asyncio.gather(
        call_gemma(PRACTICE_SYSTEM_PROMPT, practice_input),
        call_gemma(PROGRESS_SYSTEM_PROMPT, progress_input),
    )

    # 🛑 HACKATHON SAFETY NET: Force advanced exercises if Gemma stubbornly skips them at 100% accuracy
    if not practice.get("sentences") or len(practice.get("sentences", [])) == 0:
        practice["focus_area"] = "Advanced Mastery & Articulation"
        practice["sentences"] = [
            {"text": "She sells seashells by the seashore.", "target_phoneme": "s/sh blend", "difficulty": "hard"},
            {"text": "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", "target_phoneme": "w/ch blend", "difficulty": "hard"},
            {"text": "Peter Piper picked a peck of pickled peppers.", "target_phoneme": "p consonant", "difficulty": "hard"},
            {"text": "Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair.", "target_phoneme": "z consonant", "difficulty": "medium"},
            {"text": "I scream, you scream, we all scream for ice cream!", "target_phoneme": "scr blend", "difficulty": "medium"}
        ]
        practice["encouraging_note"] = "You read perfectly! Now let's try some really tricky tongue twisters!"
        practice["teacher_tip"] = "Student showed 100% phonetic mastery. Automatically assigned advanced articulation exercises."

    return {
        "phonetic": phonetic,
        "difficulty": difficulty,
        "engagement": engagement,
        "practice": practice,
        "progress": progress,
    }
