"""Inference service factory – picks real model or demo fallback based on config."""

from app.config import AI_MODEL, AI_CONFIDENCE_THRESHOLD
from app.services.inference import InferenceService
from app.services.demo_fallback import DemoFallbackService


def get_inference_service() -> InferenceService:
    """Return the configured inference service.

    If AI_MODEL is set and the file exists, a real model backend should be
    wired in here. For now, falls back to the clearly-labeled demo service.
    """
    if AI_MODEL:
        # TODO: load real Ultralytics/YOLO model here
        # from ultralytics import YOLO
        # model = YOLO(AI_MODEL)
        # return RealInferenceService(model, threshold=AI_CONFIDENCE_THRESHOLD)
        pass
    return DemoFallbackService()
