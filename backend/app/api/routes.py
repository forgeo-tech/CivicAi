"""Emergency route hazard checker – decision support only."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from app.database import get_db
from app.models import Incident
from app.schemas import RouteRequest, RouteResponse, RouteSegment

router = APIRouter(prefix="/api/routes", tags=["routes"])

# Simple bounding-box proximity check along a straight line.
# For production, replace with a real routing engine (OSRM, GraphHopper).


def _segments_along_route(orig_lat, orig_lon, dest_lat, dest_lon, steps=5) -> List[tuple]:
    """Interpolate steps along a straight line."""
    out = []
    for i in range(steps):
        t = i / (steps - 1)
        out.append((
            orig_lat + (dest_lat - orig_lat) * t,
            orig_lon + (dest_lon - orig_lon) * t,
        ))
    return out


@router.post("/emergency", response_model=RouteResponse)
def emergency_route(req: RouteRequest, db: Session = Depends(get_db)):
    pts = _segments_along_route(req.origin_lat, req.origin_lon, req.dest_lat, req.dest_lon)

    # Fetch recent incidents within a rough radius (0.05 deg ~ 5 km)
    incidents = db.query(Incident).all()

    segments: List[RouteSegment] = []
    for i, (lat, lon) in enumerate(pts):
        # Check nearby incidents
        nearby = [
            inc for inc in incidents
            if inc.lat is not None and inc.lon is not None
            and abs(inc.lat - lat) < 0.05 and abs(inc.lon - lon) < 0.05
        ]
        max_priority = max((inc.priority_score for inc in nearby), default=0)

        if max_priority >= 70:
            hazard = "high"
            warning = f"High-risk segment near {lat:.4f},{lon:.4f} – reported issues nearby"
        elif max_priority >= 30:
            hazard = "medium"
            warning = f"Moderate risk at {lat:.4f},{lon:.4f}"
        else:
            hazard = "none"
            warning = "No known hazards"

        segments.append(RouteSegment(
            segment_id=f"seg-{i}",
            start_lat=pts[i][0], start_lon=pts[i][1],
            end_lat=pts[min(i + 1, len(pts) - 1)][0],
            end_lon=pts[min(i + 1, len(pts) - 1)][1],
            hazard_level=hazard,
            warning=warning,
        ))

    high_risk = [s for s in segments if s.hazard_level == "high"]

    return RouteResponse(
        route_id=str(uuid4()),
        segments=segments,
        high_risk_segments=high_risk,
        alternative_available=len(high_risk) > 0,
    )
