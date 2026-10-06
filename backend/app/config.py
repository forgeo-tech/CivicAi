"""CivicAI backend configuration. Loads settings from environment variables with safe defaults."""

from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / os.getenv("DATA_DIR", "data")
UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'civicai.db'}")

# AI inference settings
AI_MODEL = os.getenv("AI_MODEL", "")  # e.g. "yolov8n.pt" – empty => demo fallback
AI_CONFIDENCE_THRESHOLD = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.25"))

# Priority scoring weights
SEVERITY_WEIGHTS = {"critical": 40, "high": 25, "medium": 10, "low": 3}
