"""NeuralGig package exports."""
from typing import NoReturn

from .ai_tools import AIOnboardingAssistant, LearningPlan, LearningResource
from .matching import MatchingConfig, MatchingEngine
from .models import (
    FreelancerProfile,
    MatchExplanation,
    MatchResult,
    Milestone,
    PaymentSchedule,
    ProjectRequirement,
)
from .payments import EscrowEvent, PaymentEscrow

try:  # pragma: no cover - dependency availability
    from .prototype import PrototypeState, app, create_app
except ModuleNotFoundError:  # pragma: no cover
    PrototypeState = None
    app = None

    def create_app(*_: object, **__: object) -> NoReturn:
        raise ModuleNotFoundError(
            "FastAPI is required to use neuralgig.prototype. Install the 'fastapi' dependency."
        )

    _prototype_exports: list[str] = []
else:
    _prototype_exports = ["create_app", "app", "PrototypeState"]

__all__ = [
    "AIOnboardingAssistant",
    "LearningPlan",
    "LearningResource",
    "MatchingConfig",
    "MatchingEngine",
    "FreelancerProfile",
    "MatchExplanation",
    "MatchResult",
    "Milestone",
    "PaymentSchedule",
    "ProjectRequirement",
    "EscrowEvent",
    "PaymentEscrow",
    *_prototype_exports,
]

