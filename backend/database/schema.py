import sqlite3
import os
from contextlib import contextmanager

# Always resolve to absolute path from the backend directory
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_db_env = os.getenv("DATABASE_URL", "speakflow.db")
# If the env path is relative, make it absolute relative to backend dir
DB_PATH = _db_env if os.path.isabs(_db_env) else os.path.join(_BACKEND_DIR, os.path.basename(_db_env))

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Students table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            grade INTEGER NOT NULL,
            level TEXT DEFAULT 'Level 1',
            created_at TEXT DEFAULT (datetime('now'))
        )
        ''')
        
        # Sessions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            student_id TEXT REFERENCES students(id),
            target_sentence TEXT,
            transcript TEXT,
            audio_path TEXT,
            wpm REAL,
            accuracy REAL,
            overall_score INTEGER,
            timestamp TEXT DEFAULT (datetime('now'))
        )
        ''')
        
        # Signal data table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS signal_data (
            session_id TEXT PRIMARY KEY REFERENCES sessions(id),
            pauses TEXT,
            pitch_series TEXT,
            pitch_variance REAL,
            repetition_count INTEGER DEFAULT 0,
            hesitation_count INTEGER DEFAULT 0
        )
        ''')
        
        # Diagnoses table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS diagnoses (
            session_id TEXT PRIMARY KEY REFERENCES sessions(id),
            phonetic_result TEXT,
            difficulty_result TEXT,
            engagement_result TEXT,
            practice_result TEXT,
            progress_result TEXT
        )
        ''')
        
        # Seed demo student if not exists
        cursor.execute('''
        INSERT OR IGNORE INTO students (id, name, grade, level, created_at)
        VALUES ('student-1', 'Aarav Sharma', 3, 'Level 2', datetime('now'))
        ''')
        
        conn.commit()

if __name__ == "__main__":
    print("Initializing Database...")
    init_db()
    print(f"Database initialized at {DB_PATH}")
