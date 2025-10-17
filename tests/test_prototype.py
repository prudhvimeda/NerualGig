"""Integration tests for the FastAPI prototype."""
from __future__ import annotations

import pytest

pytest.importorskip("fastapi")
pytest.importorskip("fastapi.testclient")

from fastapi.testclient import TestClient

from neuralgig.prototype import create_app


def _create_basic_freelancers(client: TestClient) -> None:
    payloads = [
        {
            "freelancer_id": "alice",
            "name": "Alice",
            "skills": {"machine learning": 4, "backend": 3},
            "availability_hours": 30,
            "rating": 4.5,
        },
        {
            "freelancer_id": "bob",
            "name": "Bob",
            "skills": {"frontend": 5, "machine learning": 2},
            "availability_hours": 20,
            "rating": 4.2,
        },
    ]
    for payload in payloads:
        response = client.post("/freelancers", json=payload)
        assert response.status_code == 201


def _create_sample_project(client: TestClient) -> None:
    response = client.post(
        "/projects",
        json={
            "project_id": "proj-1",
            "title": "AI Product Squad",
            "required_skills": {"machine learning": 4, "frontend": 3},
            "hours_needed": 40,
            "budget": 5000,
            "preferred_tools": ["Weights & Biases"],
        },
    )
    assert response.status_code == 201


def test_end_to_end_flow() -> None:
    client = TestClient(create_app())
    _create_basic_freelancers(client)
    _create_sample_project(client)

    match_response = client.post("/projects/proj-1/match", json={"top_n": 1})
    assert match_response.status_code == 200
    match_payload = match_response.json()
    assert len(match_payload["matches"]) == 1
    best_match = match_payload["matches"][0]
    assert best_match["freelancers"][0]["freelancer_id"] in {"alice", "bob"}

    onboarding_response = client.get("/projects/proj-1/onboarding/alice")
    assert onboarding_response.status_code == 200
    onboarding_plan = onboarding_response.json()
    assert onboarding_plan["summary"].startswith("Plan for AI Product Squad")
    assert "tool_recommendations" in onboarding_plan

    schedule_response = client.post(
        "/projects/proj-1/milestones",
        json={
            "milestones": [
                {"name": "Design", "amount": 2000},
                {"name": "Delivery", "amount": 3000},
            ]
        },
    )
    assert schedule_response.status_code == 201
    schedule = schedule_response.json()
    assert schedule["total_budget"] == 5000
    assert len(schedule["milestones"]) == 2

    complete_response = client.post("/projects/proj-1/milestones/Design/complete")
    assert complete_response.status_code == 200
    approve_response = client.post("/projects/proj-1/milestones/Design/approve")
    assert approve_response.status_code == 200
    approved_schedule = approve_response.json()
    design_milestone = next(
        milestone for milestone in approved_schedule["milestones"] if milestone["name"] == "Design"
    )
    assert design_milestone["is_completed"] is True
    assert design_milestone["is_approved"] is True


def test_budget_validation_error() -> None:
    client = TestClient(create_app())
    _create_basic_freelancers(client)
    _create_sample_project(client)

    response = client.post(
        "/projects/proj-1/milestones",
        json={"milestones": [{"name": "Only", "amount": 1000}]},
    )
    assert response.status_code == 400
    assert "budget" in response.json()["detail"].lower()


def test_duplicate_freelancer_rejected() -> None:
    client = TestClient(create_app())
    payload = {
        "freelancer_id": "alice",
        "name": "Alice",
        "skills": {},
        "availability_hours": 10,
    }
    first = client.post("/freelancers", json=payload)
    second = client.post("/freelancers", json=payload)
    assert first.status_code == 201
    assert second.status_code == 409


def test_cors_preflight_request() -> None:
    client = TestClient(create_app())
    response = client.options(
        "/projects",
        headers={
            "origin": "http://localhost:4173",
            "access-control-request-method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"
