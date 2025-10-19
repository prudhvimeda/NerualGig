"""Milestone-based payment management."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from .models import Milestone, PaymentSchedule


@dataclass
class EscrowEvent:
    milestone: Milestone
    action: str
    amount: float


@dataclass
class PaymentEscrow:
    """Simple in-memory escrow workflow."""

    schedule: PaymentSchedule
    released_amount: float = 0.0
    events: List[EscrowEvent] = field(default_factory=list)

    def validate(self) -> None:
        self.schedule.validate_budget()

    def mark_milestone_completed(self, milestone_name: str) -> None:
        milestone = self._find_milestone(milestone_name)
        milestone.mark_completed()
        self.events.append(EscrowEvent(milestone, "completed", 0.0))

    def approve_milestone(self, milestone_name: str) -> None:
        milestone = self._find_milestone(milestone_name)
        milestone.approve()
        self.events.append(EscrowEvent(milestone, "approved", 0.0))

    def release_funds(self, milestone_name: str) -> float:
        milestone = self._find_milestone(milestone_name)
        if not milestone.is_completed or not milestone.is_approved:
            raise RuntimeError("milestone must be completed and approved before releasing funds")
        self.released_amount += milestone.amount
        self.events.append(EscrowEvent(milestone, "released", milestone.amount))
        return self.released_amount

    def _find_milestone(self, milestone_name: str) -> Milestone:
        for milestone in self.schedule.milestones:
            if milestone.name == milestone_name:
                return milestone
        raise KeyError(f"milestone '{milestone_name}' not found")

