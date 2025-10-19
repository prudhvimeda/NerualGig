"""Matching engine for NeuralGig."""
from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations
from typing import Iterable, List, Sequence, Tuple

from .models import (
    FreelancerProfile,
    MatchExplanation,
    MatchResult,
    ProjectRequirement,
    SkillMap,
)


@dataclass
class MatchingConfig:
    max_group_size: int = 3
    min_coverage_threshold: float = 0.6
    availability_weight: float = 0.2
    skill_weight: float = 0.6
    rating_weight: float = 0.2

    def validate(self) -> None:
        if self.max_group_size < 1:
            raise ValueError("max_group_size must be positive")
        total_weight = self.availability_weight + self.skill_weight + self.rating_weight
        if round(total_weight, 2) != 1.0:
            raise ValueError("matching weights must sum to 1.0")


class MatchingEngine:
    """Evaluates freelancers and teams for a project."""

    def __init__(self, config: MatchingConfig | None = None) -> None:
        self.config = config or MatchingConfig()
        self.config.validate()

    def match_project(
        self,
        project: ProjectRequirement,
        freelancers: Sequence[FreelancerProfile],
    ) -> List[MatchResult]:
        candidates: List[MatchResult] = []
        for team in self._generate_candidate_teams(project, freelancers):
            coverage = self._team_skill_coverage(team, project.required_skills)
            if coverage < self.config.min_coverage_threshold:
                continue
            availability_score = self._team_availability_score(team, project.hours_needed)
            rating_score = self._team_rating_score(team)
            score = (
                coverage * self.config.skill_weight
                + availability_score * self.config.availability_weight
                + rating_score * self.config.rating_weight
            )
            explanation = self._build_explanation(team, project, coverage, availability_score, rating_score)
            candidates.append(
                MatchResult(
                    freelancers=list(team),
                    score=round(score, 3),
                    coverage=round(coverage, 3),
                    explanation=explanation,
                )
            )
        return sorted(candidates, key=lambda result: result.score, reverse=True)

    def _generate_candidate_teams(
        self,
        project: ProjectRequirement,
        freelancers: Sequence[FreelancerProfile],
    ) -> Iterable[Tuple[FreelancerProfile, ...]]:
        if not project.allow_group:
            for freelancer in freelancers:
                if freelancer.has_capacity_for(project.hours_needed):
                    yield (freelancer,)
            return

        for size in range(1, min(self.config.max_group_size, len(freelancers)) + 1):
            for team in combinations(freelancers, size):
                if self._team_has_capacity(team, project.hours_needed):
                    yield team

    def _team_has_capacity(
        self, team: Sequence[FreelancerProfile], hours_needed: float
    ) -> bool:
        return sum(member.availability_hours for member in team) >= hours_needed

    def _team_skill_coverage(
        self, team: Sequence[FreelancerProfile], required: SkillMap
    ) -> float:
        if not required:
            return 1.0
        skill_totals = {skill: 0 for skill in required}
        for member in team:
            for skill, level in member.skills.items():
                if skill in skill_totals:
                    skill_totals[skill] = max(skill_totals[skill], level)
        coverage = 0.0
        for skill, needed_level in required.items():
            coverage += min(skill_totals.get(skill, 0), needed_level) / max(needed_level, 1)
        return coverage / len(required)

    def _team_availability_score(
        self, team: Sequence[FreelancerProfile], hours_needed: float
    ) -> float:
        total_hours = sum(member.availability_hours for member in team)
        return min(total_hours / hours_needed, 1.0)

    def _team_rating_score(self, team: Sequence[FreelancerProfile]) -> float:
        if not team:
            return 0.0
        return sum(member.rating for member in team) / (5 * len(team))

    def _build_explanation(
        self,
        team: Sequence[FreelancerProfile],
        project: ProjectRequirement,
        coverage: float,
        availability_score: float,
        rating_score: float,
    ) -> MatchExplanation:
        skill_alignment: dict[str, str] = {}
        for skill, needed_level in project.required_skills.items():
            contributors = [
                f"{member.name}({member.skills.get(skill, 0)})"
                for member in team
                if member.skills.get(skill, 0) > 0
            ]
            if contributors:
                skill_alignment[skill] = ", ".join(contributors)
            else:
                skill_alignment[skill] = "Uncovered"

        availability_comment = (
            f"Team availability covers {availability_score * 100:.0f}% of required hours"
        )
        rating_comment = f"Average rating score contribution: {rating_score * 100:.0f}%"
        return MatchExplanation(
            skill_alignment=skill_alignment,
            availability_comment=availability_comment,
            rating_comment=rating_comment,
        )

