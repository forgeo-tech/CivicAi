"""Work order generation from an incident."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Incident, WorkOrder
from app.schemas import WorkOrderResponse

router = APIRouter(prefix="/api/work-orders", tags=["work-orders"])


@router.post("/{incident_id}", response_model=WorkOrderResponse)
def create_work_order(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    wo = WorkOrder(
        incident_id=inc.id,
        title=f"Repair: {inc.issue_type}",
        description=f"Priority {inc.priority_score:.0f}/100 – {inc.priority_reasons}",
        status="pending",
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)
    return wo


@router.get("/", response_model=list[WorkOrderResponse])
def list_work_orders(db: Session = Depends(get_db)):
    return db.query(WorkOrder).order_by(WorkOrder.created_at.desc()).all()
