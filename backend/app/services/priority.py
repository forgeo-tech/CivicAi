"""Priority engine for calculating severity and routing priority score."""

from typing import Tuple, List

# Basic scoring weights
SEVERITY_BASE = {
    "critical": 50,
    "high": 35,
    "medium": 20,
    "low": 5
}

def calculate_priority(issue_type: str, severity: str, confidence: float, lat: float | None = None, lon: float | None = None) -> Tuple[float, List[str]]:
    """Calculate a 0-100 priority score and return explainable reasons."""
    reasons = []

    # 1. Base Severity Score
    score = SEVERITY_BASE.get(severity.lower(), 10)
    reasons.append(f"Base severity '{severity}' adds {score} pts")

    # 2. Confidence Modifier (highly confident detections boost priority slightly)
    if confidence > 0.8:
        conf_bonus = 10
        score += conf_bonus
        reasons.append(f"High AI confidence ({(confidence*100):.0f}%) adds {conf_bonus} pts")
    elif confidence < 0.5:
        conf_penalty = -10
        score += conf_penalty
        reasons.append(f"Low AI confidence ({(confidence*100):.0f}%) reduces priority by {abs(conf_penalty)} pts")

    # 3. Traffic Importance / Sensitive Location Proximity (Mocked based on coordinates)
    # If it's near the hackathon center (mocked as e.g. 12.97, 77.59), bump priority
    if lat is not None and lon is not None:
        # Mock logic: is it near city center?
        dist_from_center = abs(lat - 12.97) + abs(lon - 77.59)
        if dist_from_center < 0.05:
            loc_bonus = 25
            score += loc_bonus
            reasons.append(f"High traffic importance (near city center) adds {loc_bonus} pts")
        else:
            reasons.append("Standard location (no traffic bonus)")
    else:
        reasons.append("No location provided (cannot assess traffic/route impact)")
        score -= 5  # small penalty for missing geolocation

    # clamp 0-100
    final_score = max(0.0, min(100.0, float(score)))

    if final_score >= 80:
        reasons.append(f"OVERALL: {final_score:.0f}/100 - Emergency Route Impact potential")

    return final_score, reasons
