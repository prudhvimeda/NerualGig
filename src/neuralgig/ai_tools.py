"""AI onboarding assistant utilities."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from .models import FreelancerProfile, ProjectRequirement, SkillMap


@dataclass
class LearningResource:
    title: str
    url: str
    focus_area: str


@dataclass
class LearningPlan:
    target_role: str
    skill_gaps: SkillMap
    resources: List[LearningResource]
    practice_actions: List[str]

    def summary(self) -> str:
        items = ", ".join(f"{skill}:{level}" for skill, level in self.skill_gaps.items())
        return f"Plan for {self.target_role} (gaps: {items})"


class AIOnboardingAssistant:
    """Generates learning plans and tool recommendations."""

    TOOL_LIBRARY: Dict[str, List[str]] = {
        "machine learning": ["Jupyter", "Weights & Biases", "Open-Source AutoML"],
        "frontend": ["Figma", "Storybook", "Chromatic"],
        "backend": ["Postman", "Docker", "FastAPI Starter"],
        "data": ["dbt", "Airbyte", "Metabase"],
    }

    def assess_skill_gaps(
        self, freelancer: FreelancerProfile, project: ProjectRequirement
    ) -> SkillMap:
        gaps: SkillMap = {}
        for skill, required_level in project.required_skills.items():
            current_level = freelancer.skills.get(skill, 0)
            if required_level > current_level:
                gaps[skill] = required_level - current_level
        return gaps

    def generate_learning_plan(
        self,
        freelancer: FreelancerProfile,
        project: ProjectRequirement,
    ) -> LearningPlan:
        gaps = self.assess_skill_gaps(freelancer, project)
        resources: List[LearningResource] = []
        practice_actions: List[str] = []
        for skill, deficit in gaps.items():
            focus = f"Level up {skill} by {deficit} points"
            resources.append(
                LearningResource(
                    title=f"{skill.title()} Crash Course",
                    url=f"https://learn.example.com/{skill.replace(' ', '-')}",
                    focus_area=skill,
                )
            )
            practice_actions.append(
                f"Complete a mini-project targeting {skill} with guidance from the AI co-pilot"
            )
        if not resources:
            practice_actions.append("Leverage AI co-pilot to optimize workflow and tools")
        return LearningPlan(
            target_role=project.title,
            skill_gaps=gaps,
            resources=resources,
            practice_actions=practice_actions,
        )

    def recommend_tools(self, project: ProjectRequirement) -> List[str]:
        recommendations: List[str] = []
        for skill in project.required_skills:
            for domain, tools in self.TOOL_LIBRARY.items():
                if domain in skill.lower():
                    recommendations.extend(tool for tool in tools if tool not in recommendations)
        if project.preferred_tools:
            for tool in project.preferred_tools:
                if tool not in recommendations:
                    recommendations.append(tool)
        return recommendations

