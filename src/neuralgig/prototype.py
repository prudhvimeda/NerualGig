"""FastAPI prototype for the NeuralGig platform."""
from __future__ import annotations

from dataclasses import asdict
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ai_tools import AIOnboardingAssistant
from .matching import MatchingEngine
from .models import (
    FreelancerProfile,
    MatchResult,
    Milestone,
    PaymentSchedule,
    ProjectRequirement,
)


class FreelancerPayload(BaseModel):
    freelancer_id: str = Field(..., description="Unique identifier for the freelancer")
    name: str
    skills: Dict[str, int] = Field(default_factory=dict)
    availability_hours: float = Field(..., ge=0)
    rating: float = Field(0.0, ge=0, le=5)
    tools: List[str] = Field(default_factory=list)
    active_projects: int = Field(0, ge=0)

    def to_profile(self) -> FreelancerProfile:
        return FreelancerProfile(
            freelancer_id=self.freelancer_id,
            name=self.name,
            skills=dict(self.skills),
            availability_hours=self.availability_hours,
            rating=self.rating,
            tools=list(self.tools),
            active_projects=self.active_projects,
        )


class ProjectPayload(BaseModel):
    project_id: str
    title: str
    required_skills: Dict[str, int] = Field(default_factory=dict)
    hours_needed: float = Field(..., gt=0)
    budget: float = Field(..., gt=0)
    allow_group: bool = True
    preferred_tools: Optional[List[str]] = None

    def to_requirement(self) -> ProjectRequirement:
        return ProjectRequirement(
            project_id=self.project_id,
            title=self.title,
            required_skills=dict(self.required_skills),
            hours_needed=self.hours_needed,
            budget=self.budget,
            allow_group=self.allow_group,
            preferred_tools=list(self.preferred_tools) if self.preferred_tools else None,
        )


class MatchRequest(BaseModel):
    top_n: int = Field(3, gt=0, le=10)


class MilestonePayload(BaseModel):
    name: str
    amount: float = Field(..., gt=0)


class PaymentSchedulePayload(BaseModel):
    milestones: List[MilestonePayload]


class PrototypeState:
    """In-memory storage for the prototype."""

    def __init__(self) -> None:
        self.freelancers: Dict[str, FreelancerProfile] = {}
        self.projects: Dict[str, ProjectRequirement] = {}
        self.payment_schedules: Dict[str, PaymentSchedule] = {}
        self.matching_engine = MatchingEngine()
        self.ai_assistant = AIOnboardingAssistant()

    def require_freelancer(self, freelancer_id: str) -> FreelancerProfile:
        try:
            return self.freelancers[freelancer_id]
        except KeyError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Freelancer not found") from exc

    def require_project(self, project_id: str) -> ProjectRequirement:
        try:
            return self.projects[project_id]
        except KeyError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from exc

    def require_schedule(self, project_id: str) -> PaymentSchedule:
        try:
            return self.payment_schedules[project_id]
        except KeyError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment schedule not found") from exc


def serialize_freelancer(profile: FreelancerProfile) -> Dict[str, object]:
    return asdict(profile)


def serialize_match(result: MatchResult) -> Dict[str, object]:
    return {
        "score": result.score,
        "coverage": result.coverage,
        "freelancers": [serialize_freelancer(freelancer) for freelancer in result.freelancers],
        "explanation": asdict(result.explanation),
    }


def serialize_schedule(schedule: PaymentSchedule) -> Dict[str, object]:
    return {
        "project_id": schedule.project_id,
        "total_budget": schedule.total_budget,
        "milestones": [asdict(milestone) for milestone in schedule.milestones],
        "pending_milestones": [milestone.name for milestone in schedule.iter_pending_milestones()],
    }


def create_app(state: PrototypeState | None = None) -> FastAPI:
    state = state or PrototypeState()
    app = FastAPI(title="NeuralGig Prototype", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.post("/freelancers", status_code=status.HTTP_201_CREATED)
    def register_freelancer(payload: FreelancerPayload) -> Dict[str, object]:
        if payload.freelancer_id in state.freelancers:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Freelancer with this ID already exists",
            )
        profile = payload.to_profile()
        state.freelancers[profile.freelancer_id] = profile
        return serialize_freelancer(profile)

    @app.get("/freelancers")
    def list_freelancers() -> List[Dict[str, object]]:
        return [serialize_freelancer(profile) for profile in state.freelancers.values()]

    @app.post("/projects", status_code=status.HTTP_201_CREATED)
    def create_project(payload: ProjectPayload) -> Dict[str, object]:
        if payload.project_id in state.projects:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project with this ID already exists",
            )
        project = payload.to_requirement()
        state.projects[project.project_id] = project
        return asdict(project)

    @app.get("/projects")
    def list_projects() -> List[Dict[str, object]]:
        return [asdict(project) for project in state.projects.values()]

    @app.post("/projects/{project_id}/match")
    def match_project(project_id: str, request: MatchRequest) -> Dict[str, object]:
        project = state.require_project(project_id)
        if not state.freelancers:
            return {"matches": []}
        matches = state.matching_engine.match_project(project, list(state.freelancers.values()))
        top_matches = matches[: request.top_n]
        return {"matches": [serialize_match(match) for match in top_matches]}

    @app.get("/projects/{project_id}/onboarding/{freelancer_id}")
    def get_onboarding_plan(project_id: str, freelancer_id: str) -> Dict[str, object]:
        project = state.require_project(project_id)
        freelancer = state.require_freelancer(freelancer_id)
        plan = state.ai_assistant.generate_learning_plan(freelancer, project)
        tools = state.ai_assistant.recommend_tools(project)
        response = asdict(plan)
        response["tool_recommendations"] = tools
        response["summary"] = plan.summary()
        return response

    @app.post("/projects/{project_id}/milestones", status_code=status.HTTP_201_CREATED)
    def configure_milestones(project_id: str, payload: PaymentSchedulePayload) -> Dict[str, object]:
        project = state.require_project(project_id)
        schedule = PaymentSchedule(project_id=project.project_id, total_budget=project.budget)
        for entry in payload.milestones:
            schedule.add_milestone(Milestone(name=entry.name, amount=entry.amount))
        try:
            schedule.validate_budget()
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        state.payment_schedules[project.project_id] = schedule
        return serialize_schedule(schedule)

    def _update_milestone(project_id: str, milestone_name: str, action: str) -> Dict[str, object]:
        schedule = state.require_schedule(project_id)
        milestone = _find_milestone(schedule, milestone_name)
        if action == "complete":
            milestone.mark_completed()
        elif action == "approve":
            try:
                milestone.approve()
            except RuntimeError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        return serialize_schedule(schedule)

    @app.get("/projects/{project_id}/milestones")
    def get_milestones(project_id: str) -> Dict[str, object]:
        schedule = state.require_schedule(project_id)
        return serialize_schedule(schedule)

    @app.post("/projects/{project_id}/milestones/{milestone_name}/complete")
    def complete_milestone(project_id: str, milestone_name: str) -> Dict[str, object]:
        return _update_milestone(project_id, milestone_name, "complete")

    @app.post("/projects/{project_id}/milestones/{milestone_name}/approve")
    def approve_milestone(project_id: str, milestone_name: str) -> Dict[str, object]:
        return _update_milestone(project_id, milestone_name, "approve")

    return app


def _find_milestone(schedule: PaymentSchedule, milestone_name: str) -> Milestone:
    for milestone in schedule.milestones:
        if milestone.name == milestone_name:
            return milestone
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")


app = create_app()


__all__ = ["create_app", "app", "PrototypeState"]

