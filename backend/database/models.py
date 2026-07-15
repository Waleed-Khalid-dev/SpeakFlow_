from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StudentCreate(BaseModel):
    name: str
    grade: int

class PipelineRunRequest(BaseModel):
    student_id: str
    target_sentence: str
    audio_base64: Optional[str] = None
    # For demo without real audio, we accept mocked signal data
    mocked_signal_data: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
