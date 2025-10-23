"""FastAPI prototype for the NeuralGig platform."""
from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta
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
from .ollama_client import OllamaClient, curated_resources


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


class LearningRequest(BaseModel):
    role: str = Field(default="ai-engineer", description="Role identifier, e.g., ai-engineer or full-stack")
    model: Optional[str] = Field(default=None, description="Ollama model identifier to use for generation")


class ReleaseMilestoneRequest(BaseModel):
    project_id: str = Field(..., description="Identifier of the project to update")
    milestone_name: str = Field(..., description="Name of the milestone to release")


class ApplicationSubmission(BaseModel):
    project_id: str = Field(..., description="Identifier of the project the freelancer is applying to")


class ApplicationAction(BaseModel):
    application_id: str = Field(..., description="Identifier of the freelancer application to update")


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message to the NeuralGig assistant")
    model: Optional[str] = Field(default=None, description="Ollama model identifier to use for generation")
    history: Optional[List[ChatTurn]] = Field(default=None, description="Previous messages in this conversation")


class PrototypeState:
    """In-memory storage for the prototype."""

    def __init__(self) -> None:
        self.freelancers: Dict[str, FreelancerProfile] = {}
        self.projects: Dict[str, ProjectRequirement] = {}
        self.payment_schedules: Dict[str, PaymentSchedule] = {}
        self.matching_engine = MatchingEngine()
        self.ai_assistant = AIOnboardingAssistant()
        self.ollama = OllamaClient()
        now = datetime.utcnow()
        self.client_profile = {
            "name": "Jordan Patel",
            "company": "Neuron Labs",
            "email": "jordan@neuronlabs.ai",
            "timezone": "UTC-5",
            "preferences": {
                "hiringFocus": ["AI Engineering", "Data Product", "Design Systems"],
                "communication": "Weekly syncs + shared Notion hub",
            },
            "billing": {
                "currency": "USD",
                "paymentMethod": "Multi-currency treasury",
                "invoices": 18,
            },
            "account": {"teams": 4, "activeProjects": 3},
        }
        self.client_applications = [
            {
                "id": "app-901",
                "projectName": "Generative analytics assistant",
                "submittedAt": (now - timedelta(days=1)).isoformat(),
                "status": "reviewing",
            },
            {
                "id": "app-902",
                "projectName": "Composable design system refresh",
                "submittedAt": (now - timedelta(days=3)).isoformat(),
                "status": "accepted",
            },
            {
                "id": "app-903",
                "projectName": "LLM evaluation automation",
                "submittedAt": (now - timedelta(days=6)).isoformat(),
                "status": "new",
            },
        ]
        self.client_talent = [
            {
                "id": "tal-120",
                "name": "Alex Rivera",
                "role": "AI Platform Engineer",
                "location": "Remote • NYC",
                "rate": 165,
                "score": 0.92,
                "tags": ["LangChain", "LLM Ops", "AWS"],
                "summary": "Scaled inference infra for multi-billion token workloads, specializing in retrieval augmented generation.",
            },
            {
                "id": "tal-121",
                "name": "Maya Chen",
                "role": "Full-stack Prototyper",
                "location": "Remote • Berlin",
                "rate": 140,
                "score": 0.88,
                "tags": ["Next.js", "Supabase", "Tailwind"],
                "summary": "Rapidly ships production-ready prototypes with design systems literacy and AI-driven UX experimentation.",
            },
            {
                "id": "tal-122",
                "name": "Miles O'Donnell",
                "role": "Product Design Lead",
                "location": "Remote • Austin",
                "rate": 135,
                "score": 0.9,
                "tags": ["Design Systems", "Accessibility", "Figma Tokens"],
                "summary": "Partnered with platform squads to ship accessible component libraries and design tokens that stay in sync with production.",
            },
            {
                "id": "tal-123",
                "name": "Priya Desai",
                "role": "Growth Marketing Lead",
                "location": "Remote • Singapore",
                "rate": 120,
                "score": 0.87,
                "tags": ["Lifecycle", "Experimentation", "SEO"],
                "summary": "Drives measurable ARR with lifecycle experiments, SEO programs, and paid campaigns for AI-first SaaS products.",
            },
            {
                "id": "tal-124",
                "name": "Diego Martínez",
                "role": "Customer Success Architect",
                "location": "Hybrid • Mexico City",
                "rate": 110,
                "score": 0.89,
                "tags": ["Playbooks", "Health Scores", "Renewals"],
                "summary": "Builds playbooks and analytics to lift retention, leading customer success motions for venture-backed platforms.",
            },
        ]
        self.client_payments = [
            {
                "projectId": "proj-gen-analytics",
                "projectName": "Generative analytics assistant",
                "totalBudget": 85000,
                "milestones": [
                    {
                        "name": "Research & architecture",
                        "dueDate": (now + timedelta(days=7)).isoformat(),
                        "amount": 15000,
                        "status": "pending",
                    },
                    {
                        "name": "MVP delivery",
                        "dueDate": (now + timedelta(days=32)).isoformat(),
                        "amount": 35000,
                        "status": "pending",
                    },
                    {
                        "name": "Production launch",
                        "dueDate": (now - timedelta(days=4)).isoformat(),
                        "amount": 35000,
                        "status": "released",
                    },
                ],
            },
            {
                "projectId": "proj-design-system-refresh",
                "projectName": "Composable design system refresh",
                "totalBudget": 46000,
                "milestones": [
                    {
                        "name": "Design audit & token mapping",
                        "dueDate": (now - timedelta(days=1)).isoformat(),
                        "amount": 12000,
                        "status": "in-review",
                    },
                    {
                        "name": "Component kit handoff",
                        "dueDate": (now + timedelta(days=21)).isoformat(),
                        "amount": 16500,
                        "status": "pending",
                    },
                    {
                        "name": "Enablement & rollout playbook",
                        "dueDate": (now + timedelta(days=45)).isoformat(),
                        "amount": 17500,
                        "status": "pending",
                    },
                ],
            },
            {
                "projectId": "proj-onboarding-copilot",
                "projectName": "AI onboarding copilot",
                "totalBudget": 72000,
                "milestones": [
                    {
                        "name": "Workflow mapping",
                        "dueDate": (now - timedelta(days=6)).isoformat(),
                        "amount": 18000,
                        "status": "released",
                    },
                    {
                        "name": "Pilot cohort onboarding",
                        "dueDate": (now + timedelta(days=3)).isoformat(),
                        "amount": 22000,
                        "status": "in-review",
                    },
                    {
                        "name": "Automation rollout",
                        "dueDate": (now + timedelta(days=30)).isoformat(),
                        "amount": 32000,
                        "status": "pending",
                    },
                ],
            },
        ]
        self.freelancer_profile = {
            "name": "Quinn Harper",
            "headline": "Senior AI Engineer & Full-stack Lead",
            "location": "Remote • Toronto",
            "email": "quinn.harper@neuralgig.dev",
            "hourlyRate": 150,
            "availability": {"hoursPerWeek": 25, "timezone": "UTC-4"},
            "skills": ["Python", "LangChain", "Next.js", "FastAPI", "Prompt Engineering"],
            "bio": "Builder focused on shipping trustworthy AI products. Previously led ML acceleration at a growth-stage startup.",
            "social": {
                "github": "https://github.com/quinn-harper",
                "linkedin": "https://www.linkedin.com/in/quinn-harper/",
                "portfolio": "https://neuralgig.dev/quinn",
            },
        }
        self.freelancer_applications = [
            {
                "id": "pitch-701",
                "projectName": "Realtime anomaly detection platform",
                "submittedAt": (now - timedelta(days=2)).isoformat(),
                "status": "new",
            },
            {
                "id": "pitch-702",
                "projectName": "Agentic customer success bot",
                "submittedAt": (now - timedelta(days=5)).isoformat(),
                "status": "accepted",
            },
            {
                "id": "pitch-703",
                "projectName": "AI onboarding copilot",
                "submittedAt": (now - timedelta(days=7)).isoformat(),
                "status": "reviewing",
            },
        ]
        self.freelancer_projects = [
            {
                "id": "proj-mlops-001",
                "title": "Realtime anomaly detection platform",
                "client": "SignalForge",
                "budget": 42000,
                "durationWeeks": 8,
                "description": "Design streaming inference workflows with GPU auto-scaling, evaluation harnesses, and observability.",
                "tags": ["Python", "Kafka", "Grafana", "LLM Ops"],
                "suitabilityScore": 0.95,
            },
            {
                "id": "proj-proto-002",
                "title": "AI-native product analytics",
                "client": "Orbital",
                "budget": 28000,
                "durationWeeks": 6,
                "description": "Ship a Next.js dashboard with RAG insights and metric insights copilots.",
                "tags": ["Next.js", "Supabase", "LangChain"],
                "suitabilityScore": 0.89,
            },
            {
                "id": "proj-design-system-refresh",
                "title": "Composable design system refresh",
                "client": "Neuron Labs",
                "budget": 46000,
                "durationWeeks": 10,
                "description": "Implement a design token pipeline, integrate Figma handoff with Storybook, and partner with AI teams on component automation.",
                "tags": ["TypeScript", "Design Tokens", "Storybook", "Accessibility"],
                "suitabilityScore": 0.86,
            },
            {
                "id": "proj-onboarding-copilot",
                "title": "AI onboarding copilot",
                "client": "Neuron Labs",
                "budget": 72000,
                "durationWeeks": 12,
                "description": "Build workflows that personalize onboarding plans with LLMs, integrate with HRIS systems, and deliver production-ready APIs.",
                "tags": ["FastAPI", "LangGraph", "PostgreSQL", "React"],
                "suitabilityScore": 0.9,
            },
            {
                "id": "proj-llm-evals",
                "title": "LLM evaluation automation",
                "client": "Atlas Metrics",
                "budget": 38000,
                "durationWeeks": 7,
                "description": "Automate evaluation pipelines for generative models, including dataset curation, bias checks, and human-in-the-loop review dashboards.",
                "tags": ["Python", "Weights & Biases", "Evaluation", "Prompt Engineering"],
                "suitabilityScore": 0.91,
            },
        ]
        self.freelancer_payments = [
            {
                "projectId": "proj-gen-analytics",
                "projectName": "Generative analytics assistant",
                "client": "Neuron Labs",
                "amount": 15000,
                "dueDate": (now + timedelta(days=7)).isoformat(),
                "status": "upcoming",
            },
            {
                "projectId": "proj-rag-customer",
                "projectName": "RAG customer success bot",
                "client": "SupportAI",
                "amount": 16500,
                "dueDate": (now - timedelta(days=3)).isoformat(),
                "status": "released",
            },
            {
                "projectId": "proj-design-system-refresh",
                "projectName": "Composable design system refresh",
                "client": "Neuron Labs",
                "amount": 12000,
                "dueDate": (now - timedelta(days=1)).isoformat(),
                "status": "in-review",
            },
            {
                "projectId": "proj-onboarding-copilot",
                "projectName": "AI onboarding copilot",
                "client": "Neuron Labs",
                "amount": 22000,
                "dueDate": (now + timedelta(days=3)).isoformat(),
                "status": "upcoming",
            },
        ]
        self.learning_cache: Dict[str, Dict[str, object]] = {}

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

    def get_learning_plan(self, role: str, model: Optional[str] = None) -> Dict[str, object]:
        role_key = role.lower()
        model_key = (model or self.ollama.model).lower()
        cache_key = f"{role_key}:{model_key}"
        if cache_key not in self.learning_cache:
            summary = self.ollama.generate_summary(role_key.replace("-", " "), model=model_key)
            resources = curated_resources(role_key)
            self.learning_cache[cache_key] = {
                "focusRole": role_key,
                "model": model_key,
                "summary": summary,
                "resources": resources,
            }
        return self.learning_cache[cache_key]

    def release_client_milestone(self, project_id: str, milestone_name: str) -> Dict[str, object]:
        for schedule in self.client_payments:
            if schedule["projectId"] == project_id:
                for milestone in schedule["milestones"]:
                    if milestone["name"] == milestone_name:
                        milestone["status"] = "released"
                        milestone["releasedAt"] = datetime.utcnow().isoformat()
                        return schedule
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    def submit_freelancer_application(self, project_id: str) -> Dict[str, object]:
        project = next((proj for proj in self.freelancer_projects if proj["id"] == project_id), None)
        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        new_id = f"pitch-{700 + len(self.freelancer_applications) + 1}"
        application = {
            "id": new_id,
            "projectName": project["title"],
            "submittedAt": datetime.utcnow().isoformat(),
            "status": "reviewing",
        }
        self.freelancer_applications.insert(0, application)
        return application

    def withdraw_freelancer_application(self, application_id: str) -> Dict[str, object]:
        for application in self.freelancer_applications:
            if application["id"] == application_id:
                application["status"] = "withdrawn"
                application["withdrawnAt"] = datetime.utcnow().isoformat()
                return application
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    def chat_with_assistant(
        self,
        message: str,
        model: Optional[str] = None,
        history: Optional[List[ChatTurn]] = None,
    ) -> Dict[str, str]:
        formatted_history: Optional[List[dict]] = None
        if history:
            formatted_history = []
            for turn in history:
                role = turn.role if turn.role in {"user", "assistant"} else "user"
                formatted_history.append({"role": role, "content": turn.content})

        reply = self.ollama.generate_completion(message, model=model, history=formatted_history)
        return {"reply": reply}


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

    @app.get("/client/dashboard")
    def client_dashboard() -> Dict[str, object]:
        profile = state.client_profile
        upcoming: List[Dict[str, object]] = []
        for schedule in state.client_payments:
            for milestone in schedule["milestones"]:
                upcoming.append(
                    {
                        "projectId": schedule["projectId"],
                        "projectName": schedule["projectName"],
                        "dueDate": milestone["dueDate"],
                        "amount": milestone["amount"],
                    }
                )
        upcoming.sort(key=lambda entry: entry["dueDate"])
        recommendations = [
            {
                "id": talent["id"],
                "name": talent["name"],
                "role": talent["role"],
                "score": talent["score"],
                "tags": talent["tags"],
            }
            for talent in state.client_talent
        ]
        return {
            "account": {
                "name": profile["name"],
                "avatar": "https://ui-avatars.com/api/?name=Jordan+Patel",
                "teams": profile["account"]["teams"],
                "activeProjects": profile["account"]["activeProjects"],
            },
            "upcomingMilestones": upcoming[:4],
            "recommendations": recommendations[:4],
        }

    @app.get("/client/applications")
    def client_applications() -> List[Dict[str, object]]:
        return state.client_applications

    @app.post("/client/projects", status_code=status.HTTP_201_CREATED)
    def client_create_project(payload: ProjectPayload) -> Dict[str, object]:
        return create_project(payload)

    @app.get("/client/talent")
    def client_talent() -> List[Dict[str, object]]:
        return state.client_talent

    @app.get("/client/payments")
    def client_payments() -> List[Dict[str, object]]:
        return state.client_payments

    @app.post("/client/payments/release")
    def client_release_payment(payload: ReleaseMilestoneRequest) -> Dict[str, object]:
        schedule = state.release_client_milestone(payload.project_id, payload.milestone_name)
        return schedule

    @app.get("/client/profile")
    def client_profile() -> Dict[str, object]:
        profile = dict(state.client_profile)
        account = profile.pop("account")
        profile["teams"] = account["teams"]
        profile["activeProjects"] = account["activeProjects"]
        return profile

    @app.get("/freelancer/dashboard")
    def freelancer_dashboard() -> Dict[str, object]:
        learning_plan = state.get_learning_plan("ai-engineer")
        return {
            "profile": {
                "name": state.freelancer_profile["name"],
                "role": state.freelancer_profile["headline"],
                "focusAreas": state.freelancer_profile["skills"][:4],
                "availableHours": state.freelancer_profile["availability"]["hoursPerWeek"],
            },
            "activeEngagements": [
                {
                    "projectId": schedule["projectId"],
                    "title": schedule["projectName"],
                    "client": schedule["client"],
                    "progress": 72 if schedule["status"] != "upcoming" else 35,
                    "nextMilestone": schedule["dueDate"],
                }
                for schedule in state.freelancer_payments
            ],
            "aiLearningPlan": learning_plan,
        }

    @app.get("/freelancer/applications")
    def freelancer_applications() -> List[Dict[str, object]]:
        return state.freelancer_applications

    @app.post("/freelancer/applications", status_code=status.HTTP_201_CREATED)
    def freelancer_submit_application(payload: ApplicationSubmission) -> Dict[str, object]:
        return state.submit_freelancer_application(payload.project_id)

    @app.post("/freelancer/applications/withdraw")
    def freelancer_withdraw_application(payload: ApplicationAction) -> Dict[str, object]:
        return state.withdraw_freelancer_application(payload.application_id)

    @app.get("/freelancer/projects")
    def freelancer_projects() -> List[Dict[str, object]]:
        return state.freelancer_projects

    @app.get("/freelancer/payments")
    def freelancer_payments() -> List[Dict[str, object]]:
        return state.freelancer_payments

    @app.get("/freelancer/profile")
    def freelancer_profile() -> Dict[str, object]:
        return state.freelancer_profile

    @app.get("/freelancer/learning")
    def freelancer_learning(role: str = "ai-engineer", model: Optional[str] = None) -> Dict[str, object]:
        return state.get_learning_plan(role, model)

    @app.post("/freelancer/learning", status_code=status.HTTP_202_ACCEPTED)
    def refresh_learning_plan(request: LearningRequest) -> Dict[str, object]:
        role_key = request.role.lower()
        model_key = (request.model or state.ollama.model).lower()
        cache_key = f"{role_key}:{model_key}"
        state.learning_cache.pop(cache_key, None)
        return state.get_learning_plan(request.role, request.model)

    @app.post("/assistant/chat")
    def assistant_chat(request: ChatRequest) -> Dict[str, str]:
        return state.chat_with_assistant(request.message, request.model, request.history)

    return app


def _find_milestone(schedule: PaymentSchedule, milestone_name: str) -> Milestone:
    for milestone in schedule.milestones:
        if milestone.name == milestone_name:
            return milestone
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")


app = create_app()


__all__ = ["create_app", "app", "PrototypeState"]
