"""Incident CRUD + image upload + analysis endpoint."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime

from app.database import get_db
from app.models import Incident, WorkOrder
from app.schemas import AnalyzeRequest, AnalyzeResponse, IncidentResponse
from app.services import get_inference_service

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


@router.post("/upload", response_model=AnalyzeResponse)
async def upload_and_analyze(
    image: UploadFile = File(...),
    lat: float | None = None,
    lon: float | None = None,
    db: Session = Depends(get_db),
):
    """Upload an image, run AI analysis, store the incident, and return results."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{image.filename}"
    file_path = UPLOAD_DIR / file_name
    with open(file_path, "wb") as f:
        content = await image.read()
        f.write(content)

    service = get_inference_service()
    results = service.analyze(str(file_path), lat, lon)

    if not results:
        raise HTTPException(status_code=500, detail="No issues detected")

    r = results[0]
    incident = Incident(
        image_path=str(file_path),
        issue_type=r.issue_type,
        confidence=r.confidence,
        severity=r.severity,
        priority_score=r.priority_score,
        priority_reasons="; ".join(r.priority_reasons),
        lat=lat,
        lon=lon,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return AnalyzeResponse(incident_id=incident.id, results=r.__dict__)


@router.get("/", response_model=list[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc
