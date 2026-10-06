from typing import List
from ultralytics import YOLO
import torch
from app.services.inference import InferenceService, IssueResult
from app.config import AI_MODEL, AI_CONFIDENCE_THRESHOLD

class RealInferenceService(InferenceService):
    def __init__(self):
        self.model = YOLO(AI_MODEL)
        # Move model to device
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)
        print(f"Loaded real model: {AI_MODEL} on {self.device}")
        print(f"Class names: {self.model.names}")

    def analyze(self, image_path: str, lat: float | None = None, lon: float | None = None) -> List[IssueResult]:
        results = self.model.predict(image_path, conf=AI_CONFIDENCE_THRESHOLD, device=self.device)
        issues = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = self.model.names[cls_id]
                conf = float(box.conf[0])
                # Severity heuristic: higher conf = higher severity for MVP
                severity = "high" if conf > 0.7 else "medium"
                issues.append(IssueResult(issue_type=cls_name, confidence=conf, severity=severity))
        return issues

    def is_real_model(self) -> bool:
        return True
