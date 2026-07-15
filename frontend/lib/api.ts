// API Client for FastAPI Backend

const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchStudents() {
  const res = await fetch(`${API_BASE_URL}/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function createStudent(data: {name: string, grade: number, level: string}) {
  const res = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
}

export async function updateStudent(id: string, data: {name: string, grade: number, level: string}) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

export async function deleteStudent(id: string) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete student");
  return res.json();
}



export async function fetchSessions(studentId?: string) {
  const url = studentId 
    ? `${API_BASE_URL}/sessions?student_id=${studentId}` 
    : `${API_BASE_URL}/sessions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function runPipeline(studentId: string, audioBase64: string, targetSentence: string) {
  // Construct the payload expected by the FastAPI PipelineRunRequest
  const payload = {
    student_id: studentId,
    target_sentence: targetSentence,
    audio_base64: audioBase64
  };

  const res = await fetch(`http://127.0.0.1:8000/pipeline/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Pipeline execution failed");
  }

  return res.json();
}
