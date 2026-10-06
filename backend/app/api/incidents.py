"""Incident CRUD + image upload + analysis endpoint."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime

from app.database import get_db
from app.models import Incident, WorkOrder
from app.schemas import AnalyzeRequest, AnalyzeResponse, IncidentResponse, IncidentStatusUpdate
from app.services import get_inference_service
from app.services.priority import calculate_priority

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


@router.post("/upload", response_model=AnalyzeResponse)
async def upload_and_analyze(
    image: UploadFile = File(...),
    lat: float | None = None,
    lon: float | None = None,
    location_name: str | None = None,
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
    priority_score, priority_reasons = calculate_priority(r.issue_type, r.severity, r.confidence, lat, lon)

    incident = Incident(
        image_path=str(file_path),
        issue_type=r.issue_type,
        confidence=r.confidence,
        severity=r.severity,
        priority_score=priority_score,
        priority_reasons="; ".join(priority_reasons),
        lat=lat,
        lon=lon,
        location_name=location_name
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Bundle result for old schema response locally
    out_results = r.__dict__.copy()
    out_results["priority_score"] = priority_score
    out_results["priority_reasons"] = priority_reasons
    return AnalyzeResponse(incident_id=incident.id, results=out_results)


@router.get("/", response_model=list[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.put("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: int, update: IncidentStatusUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = update.status
    db.commit()
    db.refresh(inc)
    return inc
