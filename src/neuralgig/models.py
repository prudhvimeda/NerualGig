"""Core domain models for NeuralGig."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional


SkillMap = Dict[str, int]


def normalize_skill_levels(skills: SkillMap) -> SkillMap:
    """Normalize skill proficiency values into the range 0-5."""
    normalized: SkillMap = {}
    for skill, value in skills.items():
        if value < 0:
            normalized[skill] = 0
        elif value > 5:
            normalized[skill] = 5
        else:
            normalized[skill] = int(value)
    return normalized


@dataclass(frozen=True)
class FreelancerProfile:
    """Represents a freelancer on the platform."""

    freelancer_id: str
    name: str
    skills: SkillMap
    availability_hours: float
    rating: float = 0.0
    tools: List[str] = field(default_factory=list)
    active_projects: int = 0

    def __post_init__(self) -> None:
        normalized_skills = normalize_skill_levels(self.skills)
        object.__setattr__(self, "skills", normalized_skills)
        if not 0 <= self.rating <= 5:
            raise ValueError("rating must be between 0 and 5")
        if self.availability_hours < 0:
            raise ValueError("availability_hours cannot be negative")
        if self.active_projects < 0:
            raise ValueError("active_projects cannot be negative")

    def has_capacity_for(self, hours: float) -> bool:
        return self.availability_hours >= hours

    def skill_coverage(self, required: SkillMap) -> float:
        if not required:
            return 1.0
        coverage = 0.0
        for skill, needed_level in required.items():
            freelancer_level = self.skills.get(skill, 0)
            coverage += min(freelancer_level, needed_level) / max(needed_level, 1)
        return coverage / len(required)


@dataclass(frozen=True)
class ProjectRequirement:
    """Represents a project posted by a client."""

    project_id: str
    title: str
    required_skills: SkillMap
    hours_needed: float
    budget: float
    allow_group: bool = True
    preferred_tools: Optional[List[str]] = None

    def __post_init__(self) -> None:
        normalized_skills = normalize_skill_levels(self.required_skills)
        object.__setattr__(self, "required_skills", normalized_skills)
        if self.hours_needed <= 0:
            raise ValueError("hours_needed must be positive")
        if self.budget <= 0:
            raise ValueError("budget must be positive")


@dataclass
class MatchExplanation:
    """Human-readable explanation about how a match satisfies requirements."""

    skill_alignment: Dict[str, str]
    availability_comment: str
    rating_comment: str


@dataclass
class MatchResult:
    """A scored match for a project."""

    freelancers: List[FreelancerProfile]
    score: float
    coverage: float
    explanation: MatchExplanation

    @property
    def freelancer_ids(self) -> List[str]:
        return [freelancer.freelancer_id for freelancer in self.freelancers]

    def describe(self) -> str:
        names = ", ".join(f.name for f in self.freelancers)
        return f"Match(score={self.score:.2f}, coverage={self.coverage:.2f}, freelancers=[{names}])"


@dataclass
class Milestone:
    """A payment milestone for a project."""

    name: str
    amount: float
    is_completed: bool = False
    is_approved: bool = False

    def __post_init__(self) -> None:
        if self.amount <= 0:
            raise ValueError("milestone amount must be positive")

    def mark_completed(self) -> None:
        self.is_completed = True

    def approve(self) -> None:
        if not self.is_completed:
            raise RuntimeError("cannot approve an incomplete milestone")
        self.is_approved = True


@dataclass
class PaymentSchedule:
    """Represents a milestone-based payment plan."""

    project_id: str
    total_budget: float
    milestones: List[Milestone] = field(default_factory=list)

    def add_milestone(self, milestone: Milestone) -> None:
        self.milestones.append(milestone)

    @property
    def total_allocated(self) -> float:
        return sum(milestone.amount for milestone in self.milestones)

    def validate_budget(self) -> None:
        if not self.milestones:
            raise ValueError("at least one milestone is required")
        if round(self.total_allocated, 2) != round(self.total_budget, 2):
            raise ValueError("milestones do not sum to the project budget")

    def iter_pending_milestones(self) -> Iterable[Milestone]:
        for milestone in self.milestones:
            if not milestone.is_approved:
                yield milestone

