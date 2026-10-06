"""Demo fallback inference – clearly labeled as synthetic, NOT real AI predictions."""

from typing import List

from app.services.inference import InferenceService, IssueResult


class DemoFallbackService(InferenceService):
    """Synthetic demo service used when no real model is configured.

    All results are fabricated for demonstration purposes only.
    The frontend MUST display a banner indicating demo mode.
    """

    DEMO_ISSUES = [
        {"issue_type": "pothole", "confidence": 0.87, "severity": "high", "priority_score": 78,
         "priority_reasons": ["Large depression on travel lane", "High traffic volume area"]},
        {"issue_type": "damaged_road", "confidence": 0.64, "severity": "medium", "priority_score": 35,
         "priority_reasons": ["Surface cracking observed"]},
        {"issue_type": "broken_streetlight", "confidence": 0.91, "severity": "medium", "priority_score": 28,
         "priority_reasons": ["Non-functional light at intersection"]},
        {"issue_type": "overflowing_drain", "confidence": 0.72, "severity": "high", "priority_score": 65,
         "priority_reasons": ["Water pooling on road surface"]},
    ]

    def analyze(self, image_path: str, lat: float | None = None, lon: float | None = None) -> List[IssueResult]:
        # Return a deterministic subset so the demo is repeatable
        result = self.DEMO_ISSUES[0]
        return [IssueResult(**result)]

    def is_real_model(self) -> bool:
        return False
