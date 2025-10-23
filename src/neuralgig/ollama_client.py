"""Utilities for calling a local Ollama server to generate AI-assisted content."""
from __future__ import annotations

import os
from typing import List, Optional

try:
    import httpx  # type: ignore
except ImportError:  # pragma: no cover - fallback when httpx unavailable
    httpx = None  # type: ignore
    import json
    import urllib.request

DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "qwen")
DEFAULT_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")


class OllamaClient:
    """Minimal client for the Ollama REST API."""

    def __init__(self, base_url: str = DEFAULT_BASE_URL, model: str = DEFAULT_MODEL, timeout: float = 10.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def _invoke(self, prompt: str, model: Optional[str] = None, history: Optional[List[dict]] = None) -> str:
        target_model = (model or self.model).strip()
        payload: dict = {"model": target_model, "stream": False}
        if history:
            payload["messages"] = history
        else:
            payload["prompt"] = prompt
        try:
            if httpx is not None:
                if "messages" in payload:
                    response = httpx.post(
                        f"{self.base_url}/api/chat",
                        json=payload,
                        timeout=self.timeout,
                    )
                    response.raise_for_status()
                    data = response.json()
                    if isinstance(data, dict):
                        message = data.get("message") or {}
                        return (message.get("content") or "").strip()
                    if isinstance(data, list):
                        return "".join(chunk.get("message", {}).get("content", "") for chunk in data if isinstance(chunk, dict)).strip()
                    return ""
                response = httpx.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=self.timeout,
                )
                response.raise_for_status()
                data = response.json()
            else:
                endpoint = "/api/chat" if "messages" in payload else "/api/generate"
                request = urllib.request.Request(
                    f"{self.base_url}{endpoint}",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(request, timeout=self.timeout) as resp:  # type: ignore[attr-defined]
                    raw = resp.read().decode("utf-8")
                data = json.loads(raw)
            text = data.get("response") or ""
            return text.strip()
        except Exception:
            raise

    def generate_summary(self, role: str, model: Optional[str] = None) -> str:
        """Generate a short learning summary for a given role using the specified model if provided."""
        prompt = (
            "You are an expert mentor crafting actionable roadmaps. "
            "Return a learning plan that strictly follows this structure:\n"
            "Learning Plan For {role}\n"
            "Phase 1: Foundation\n- Objective: ...\n- Key Concepts:\n  1. ...\n  2. ...\n- Quick Wins:\n  - ...\n  - ...\n"
            "Phase 2: Build\n- Objective: ...\n- Skills & Tools To Practice:\n  1. ...\n  2. ...\n- Guided Exercises:\n  - ...\n  - ...\n"
            "Phase 3: Ship\n- Objective: ...\n- Checklist Before Shipping:\n  1. ...\n  2. ...\n- Suggested Deliverables:\n  - ...\n  - ...\n"
            "Continuous Improvement\n- Review cadence: ...\n- Community / Mentorship: ...\n- Metrics to watch: ...\n"
            "Resources\n- Article: ...\n- Course: ...\n- Toolkit/Docs: ...\n"
            "Automation Hooks\n- Integrations: ...\n- Alerts & AI copilots: ...\n"
            "Next Check-in\n- Date: ...\n- Focus: ...\n"
            "Populate each placeholder with role-appropriate details. Use bullet points exactly as shown."
        ).format(role=role)
        try:
            text = self._invoke(prompt, model=model)
            return text or self._fallback_summary(role)
        except Exception:
            return self._fallback_summary(role)

    def generate_completion(
        self,
        message: str,
        model: Optional[str] = None,
        history: Optional[List[dict]] = None,
    ) -> str:
        """Return a conversational reply given an arbitrary user message."""

        system_prompt = (
            "You are NeuralGig's senior AI copilot. Respond like a seasoned GPT-5 assistant: warm, concise, and insightful. "
            "Use natural language, highlight key ideas with short paragraphs or bullet points, and end with a clear next step when helpful. "
            "Speak directly to the user, and weave in practical recommendations grounded in modern product and engineering workflows."
        )

        messages: List[dict] = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})

        try:
            text = self._invoke(message, model=model, history=messages)
            return text.strip() or "I'm here and ready to help—what should we tackle next?"
        except Exception:
            return "I'm offline right now. Please ensure your Ollama service is running and try again."

    def generate_completion_with_history(
        self, message: str, history: List[dict], model: Optional[str] = None
    ) -> str:
        try:
            return self._invoke(message, model=model, history=history) or "Let's keep going—what else would help?"
        except Exception:
            return "I'm offline right now. Please ensure your Ollama service is running and try again."

    @staticmethod
    def _fallback_summary(role: str) -> str:
        role_key = role.lower().replace(" ", "-")
        role_title = _ROLE_TITLES.get(role_key, role.title())
        outline = _ROLE_OUTLINES.get(role_key, _ROLE_OUTLINES["ai-engineer"])
        resources = curated_resources(role_key)

        def format_list(items: list[str], marker: str) -> str:
            if not items:
                return ""
            if marker:
                return "\n".join(f"{marker} {item}" for item in items)
            return "\n".join(items)

        def format_numbered(items: list[str]) -> str:
            return "\n".join(f"  {idx + 1}. {item}" for idx, item in enumerate(items))

        resources_lines = []
        for resource in resources[:3]:
            label = resource["type"]
            resources_lines.append(f"- {label}: {resource['title']} — {resource['url']}")

        return (
            f"Learning Plan For {role_title}\n"
            "========================\n\n"
            "Phase 1: Foundation / Beginning\n"
            f"- Objective: {outline['foundation']['objective']}\n"
            "- Key Concepts:\n"
            f"{format_numbered(outline['foundation']['concepts'])}\n"
            "- Quick Wins:\n"
            f"{format_list(outline['foundation']['quick_wins'], '  -')}\n\n"
            "Phase 2: Build / Deepen\n"
            f"- Objective: {outline['build']['objective']}\n"
            "- Skills & Tools To Practice:\n"
            f"{format_numbered(outline['build']['skills'])}\n"
            "- Guided Exercises:\n"
            f"{format_list(outline['build']['exercises'], '  -')}\n\n"
            "Phase 3: Ship / Operationalize\n"
            f"- Objective: {outline['ship']['objective']}\n"
            "- Checklist Before Shipping:\n"
            f"{format_numbered(outline['ship']['checklist'])}\n"
            "- Suggested Deliverables:\n"
            f"{format_list(outline['ship']['deliverables'], '  -')}\n\n"
            "Continuous Improvement\n"
            f"- Review cadence: {outline['continuous']['cadence']}\n"
            f"- Community / Mentorship: {outline['continuous']['community']}\n"
            f"- Metrics to watch: {outline['continuous']['metrics']}\n\n"
            "Resources\n"
            f"{format_list(resources_lines, '')}\n\n"
            "Automation Hooks (Optional)\n"
            f"- Integrations: {outline['automation']['integrations']}\n"
            f"- Alerts & AI copilots: {outline['automation']['alerts']}\n\n"
            "Next Check-in\n"
            f"- Date: {outline['check_in']['date']}\n"
            f"- Focus: {outline['check_in']['focus']}"
        )


_ROLE_TITLES = {
    "ai-engineer": "AI Engineer",
    "full-stack": "Full Stack Engineer",
    "ml-ops": "ML Ops Specialist",
    "product-designer": "Product Designer",
}

_ROLE_OUTLINES = {
    "ai-engineer": {
        "foundation": {
            "objective": "Ground yourself in modern ML fundamentals and responsible AI principles.",
            "concepts": [
                "Data pipelines — understand data readiness, feature governance, and evaluation baselines",
                "Model evaluation — know how to quantify accuracy, drift, and safety constraints",
            ],
            "quick_wins": [
                "Audit an existing model for bias and performance regressions",
                "Document an AI experiment template with success metrics",
            ],
        },
        "build": {
            "objective": "Prototype and iterate on production-grade AI services.",
            "skills": [
                "Experiment tracking — instrument MLflow or Weights & Biases in your stack",
                "Prompt / retrieval design — build robust retrieval-augmented generation flows",
            ],
            "exercises": [
                "Ship a retraining pipeline with automated evaluation gates",
                "Pair with design to scope AI UX guardrails for a pilot feature",
            ],
        },
        "ship": {
            "objective": "Harden, monitor, and hand off AI features with confidence.",
            "checklist": [
                "Load-test inference endpoints under realistic workloads",
                "Instrument observability for accuracy, cost, and latency thresholds",
            ],
            "deliverables": [
                "Production deployment playbook with rollback strategy",
                "Post-launch monitoring dashboard and incident contacts",
            ],
        },
        "continuous": {
            "cadence": "Weekly experiment review + monthly architecture sync",
            "community": "NeuralGig AI guild, open-source forums, office hours with product",
            "metrics": "Inference latency, win-rate vs baselines, model cost per request",
        },
        "automation": {
            "integrations": "Jira, Datadog, Feature Store",
            "alerts": "Daily model health summary in Slack, retraining reminders in Notion",
        },
        "check_in": {
            "date": "30 days after launch",
            "focus": "Review uplift vs baseline and prioritize next iteration",
        },
    },
    "full-stack": {
        "foundation": {
            "objective": "Strengthen system design and DX fundamentals across the stack.",
            "concepts": [
                "API contracts — align backend/frontend boundaries with typed schemas",
                "Performance budgets — bake P95 targets into planning and QA",
            ],
            "quick_wins": [
                "Map critical paths with tracing tools (e.g., OpenTelemetry)",
                "Refactor shared UI primitives with accessibility baked in",
            ],
        },
        "build": {
            "objective": "Ship resilient features that span modern frontends and APIs.",
            "skills": [
                "Edge rendering — optimize Next.js streaming + caching",
                "Observability — unify logs/metrics/traces for faster triage",
            ],
            "exercises": [
                "Build feature flags with gradual rollout and analytics",
                "Pair with product to codify acceptance criteria via tests",
            ],
        },
        "ship": {
            "objective": "Operationalize releases with confidence and clarity.",
            "checklist": [
                "Complete automated regression suite and accessibility checks",
                "Run canary deploys with rollback plan and pager rotation",
            ],
            "deliverables": [
                "Release notes + customer comms template",
                "Runbook with post-release monitoring tasks",
            ],
        },
        "continuous": {
            "cadence": "Sprint review + fortnightly tech-debt triage",
            "community": "Frontend guild, API design roundtables, mentee pairing",
            "metrics": "Cycle time, escaped bugs, Core Web Vitals",
        },
        "automation": {
            "integrations": "Linear, Vercel, Sentry",
            "alerts": "Deploy status summaries in Slack and error spikes via PagerDuty",
        },
        "check_in": {
            "date": "End of current sprint",
            "focus": "Assess shipped value vs goals and refine next backlog slice",
        },
    },
    "ml-ops": {
        "foundation": {
            "objective": "Secure data and infrastructure foundations for ML workflows.",
            "concepts": [
                "Data lineage — ensure reproducibility and auditing",
                "CI/CD for models — codify testing and deployment gates",
            ],
            "quick_wins": [
                "Automate data validation with expectations and alerts",
                "Document the current model inventory with owners",
            ],
        },
        "build": {
            "objective": "Operationalize training, serving, and monitoring pipelines.",
            "skills": [
                "Container orchestration — manage GPU/CPU workloads",
                "Feature store management — reuse signals across teams",
            ],
            "exercises": [
                "Implement canary deployments for models with auto-rollbacks",
                "Integrate drift detection into monitoring stack",
            ],
        },
        "ship": {
            "objective": "Deliver compliant, maintainable ML services at scale.",
            "checklist": [
                "Verify governance requirements (privacy, bias, audit logs)",
                "Stress test serving endpoints and resource autoscaling",
            ],
            "deliverables": [
                "Operational runbooks with escalation paths",
                "Model performance dashboards with cost overlays",
            ],
        },
        "continuous": {
            "cadence": "Weekly ops standup + monthly drift review",
            "community": "MLOps guild, vendor office hours, internal forums",
            "metrics": "Drift rate, rollout frequency, infra spend vs budget",
        },
        "automation": {
            "integrations": "Airflow, Kubeflow, Grafana",
            "alerts": "Model health summaries to Slack + ticket creation on incidents",
        },
        "check_in": {
            "date": "45 days from rollout",
            "focus": "Evaluate model stability and iterate on automation gaps",
        },
    },
    "product-designer": {
        "foundation": {
            "objective": "Deepen discovery and systems-thinking fundamentals.",
            "concepts": [
                "Jobs-to-be-done mapping — clarify user outcomes",
                "Design tokens — ensure scalable multi-brand systems",
            ],
            "quick_wins": [
                "Audit accessibility on a core flow and file quick fixes",
                "Run a lightning interview to validate assumptions",
            ],
        },
        "build": {
            "objective": "Prototype and validate end-to-end experiences fast.",
            "skills": [
                "Design-to-dev handoff — streamline via tokenized libraries",
                "Collaborative prototyping — leverage AI for content and variants",
            ],
            "exercises": [
                "Deliver an interactive prototype with annotated intents",
                "Co-run a design critique and synthesize decisions",
            ],
        },
        "ship": {
            "objective": "Launch measurable experiences with cross-functional partners.",
            "checklist": [
                "Finalize usability testing + QA feedback",
                "Prepare release notes + success metrics dashboard",
            ],
            "deliverables": [
                "Implementation-ready Figma package",
                "Post-launch insight report highlighting impact",
            ],
        },
        "continuous": {
            "cadence": "Bi-weekly design reviews + quarterly research share-outs",
            "community": "Design guild, accessibility council, mentor sessions",
            "metrics": "Task completion, NPS, adoption of new experiences",
        },
        "automation": {
            "integrations": "Figma, Notion, Loom",
            "alerts": "Weekly insight digests + auto-tagged user feedback to Slack",
        },
        "check_in": {
            "date": "2 weeks post-launch",
            "focus": "Review qualitative + quantitative feedback and plan iterations",
        },
    },
}


def curated_resources(role: str) -> List[dict]:
    """Return curated resource links for a given role."""
    base_resources = {
        "ai-engineer": [
            {
                "title": "Hands-on Machine Learning with Scikit-Learn and TensorFlow (free chapter)",
                "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
                "type": "Article",
            },
            {
                "title": "Hugging Face course",
                "url": "https://huggingface.co/learn/nlp-course",
                "type": "Course",
            },
            {
                "title": "LangChain cookbook",
                "url": "https://python.langchain.com/docs/get_started/introduction",
                "type": "Guide",
            },
        ],
        "full-stack": [
            {
                "title": "Full Stack Open",
                "url": "https://fullstackopen.com/en/",
                "type": "Course",
            },
            {
                "title": "Next.js documentation",
                "url": "https://nextjs.org/docs",
                "type": "Docs",
            },
            {
                "title": "Practical Guide to FastAPI",
                "url": "https://fastapi.tiangolo.com/tutorial/",
                "type": "Guide",
            },
        ],
        "ml-ops": [
            {
                "title": "Made With ML - MLOps",
                "url": "https://madewithml.com/courses/mlops/",
                "type": "Course",
            },
            {
                "title": "Practical MLOps book (open source)",
                "url": "https://github.com/GokuMohandas/practical-mlops",
                "type": "Guide",
            },
            {
                "title": "Mlflow quickstart",
                "url": "https://mlflow.org/docs/latest/quickstart.html",
                "type": "Docs",
            },
        ],
        "product-designer": [
            {
                "title": "Google UX Design certificate (audit for free)",
                "url": "https://www.coursera.org/professional-certificates/google-ux-design",
                "type": "Course",
            },
            {
                "title": "IDEO Design Kit",
                "url": "https://www.designkit.org/methods",
                "type": "Toolkit",
            },
            {
                "title": "Accessibility fundamentals",
                "url": "https://www.w3.org/WAI/fundamentals/",
                "type": "Guide",
            },
        ],
        "product-manager": [
            {
                "title": "Reforge Product Strategy",
                "url": "https://www.reforge.com/product-strategy",
                "type": "Program",
            },
            {
                "title": "SVPG Product Discovery toolkit",
                "url": "https://www.svpg.com/product-discovery/",
                "type": "Toolkit",
            },
            {
                "title": "Google Product Manager interview lessons",
                "url": "https://www.coursera.org/learn/pm-interview",
                "type": "Course",
            },
        ],
        "project-manager": [
            {
                "title": "Atlassian agile project management guide",
                "url": "https://www.atlassian.com/agile/project-management",
                "type": "Guide",
            },
            {
                "title": "Notion project operating system template",
                "url": "https://www.notion.so/templates/project-os",
                "type": "Template",
            },
            {
                "title": "PMI free webinars",
                "url": "https://www.pmi.org/learning/training-development/free-webinars",
                "type": "Webinar",
            },
        ],
        "growth-marketer": [
            {
                "title": "HubSpot inbound marketing certification",
                "url": "https://academy.hubspot.com/courses/inbound-marketing",
                "type": "Course",
            },
            {
                "title": "Growth.design case studies",
                "url": "https://growth.design/case-studies/",
                "type": "Case Study",
            },
            {
                "title": "Ahrefs SEO training",
                "url": "https://ahrefs.com/academy",
                "type": "Course",
            },
        ],
        "customer-success": [
            {
                "title": "Practical CSM online academy (free tier)",
                "url": "https://www.practicalcsm.com/",
                "type": "Course",
            },
            {
                "title": "Gainsight essential playbooks",
                "url": "https://www.gainsight.com/customer-success-playbooks/",
                "type": "Playbook",
            },
            {
                "title": "ChurnZero health score guide",
                "url": "https://churnzero.net/resources/customer-health-scores/",
                "type": "Guide",
            },
        ],
        "operations-lead": [
            {
                "title": "Notion operating cadence templates",
                "url": "https://www.notion.so/templates/operations",
                "type": "Template",
            },
            {
                "title": "McKinsey operations insights",
                "url": "https://www.mckinsey.com/capabilities/operations/our-insights",
                "type": "Article",
            },
            {
                "title": "Modern Treasury finance operations handbook",
                "url": "https://www.moderntreasury.com/resources/finance-operations",
                "type": "Guide",
            },
        ],
    }
    return base_resources.get(role, base_resources["ai-engineer"])
