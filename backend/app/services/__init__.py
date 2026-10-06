"""Inference service factory – picks real model or demo fallback based on config."""

from app.config import AI_MODEL
from app.services.inference import InferenceService
from app.services.demo_fallback import DemoFallbackService
from app.services.real_inference import RealInferenceService

_service = None

def get_inference_service() -> InferenceService:
    global _service
    if _service is None:
        if AI_MODEL:
            _service = RealInferenceService()
        else:
            _service = DemoFallbackService()
    return _service
