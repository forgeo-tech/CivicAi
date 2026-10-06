"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    image_path: str
    lat: Optional[float] = None
    lon: Optional[float] = None


class IssueResult(BaseModel):
    issue_type: str
    confidence: float
    severity: str
    priority_score: float
    priority_reasons: List[str]


class AnalyzeResponse(BaseModel):
    incident_id: int
    results: IssueResult


class IncidentStatusUpdate(BaseModel):
    status: str


class IncidentResponse(BaseModel):
    id: int
    image_path: str
    issue_type: str
    confidence: float
    severity: str
    status: Optional[str] = None
    priority_score: float
    priority_reasons: str
    lat: Optional[float]
    lon: Optional[float]
    location_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkOrderResponse(BaseModel):
    id: int
    incident_id: int
    title: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RouteSegment(BaseModel):
    segment_id: str
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    hazard_level: str  # none, low, medium, high
    warning: str


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    dest_lat: float
    dest_lon: float


class RouteResponse(BaseModel):
    route_id: str
    segments: List[RouteSegment]
    high_risk_segments: List[RouteSegment]
    alternative_available: bool
    disclaimer: str = ("This route analysis is decision support only. "
                       "No route is guaranteed safe. Verify conditions before traveling.")
