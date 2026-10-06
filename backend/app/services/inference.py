"""AI inference service interface. Model-agnostic – swap the backend by replacing this module."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass
import torch


@dataclass
class IssueResult:
    issue_type: str
    confidence: float
    severity: str


class InferenceService(ABC):
    """Abstract interface for AI inference backends."""

    @abstractmethod
    def analyze(self, image_path: str, lat: float | None = None, lon: float | None = None) -> List[IssueResult]:
        ...

    @abstractmethod
    def is_real_model(self) -> bool:
        """Return True only when a real trained model is loaded."""
        ...

    def is_cuda_available(self) -> bool:
        """Check if CUDA is available for inference."""
        return torch.cuda.is_available()
