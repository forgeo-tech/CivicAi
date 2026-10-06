"""AI inference service interface. Model-agnostic – swap the backend by replacing this module."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class IssueResult:
    issue_type: str
    confidence: float
    severity: str
    priority_score: float
    priority_reasons: List[str]


class InferenceService(ABC):
    """Abstract interface for AI inference backends."""

    @abstractmethod
    def analyze(self, image_path: str, lat: float | None = None, lon: float | None = None) -> List[IssueResult]:
        ...

    @abstractmethod
    def is_real_model(self) -> bool:
        """Return True only when a real trained model is loaded."""
        ...
