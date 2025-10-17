# NeuralGig Product Requirements Document (PRD)

## Overview
NeuralGig is an AI-native freelancing platform that instantly connects clients with qualified freelancers or small teams. The platform uses AI to:

1. Understand client project briefs and required skills.
2. Match available freelancers or assemble agile teams in real-time.
3. Provide a personalized AI co-pilot for freelancers so they can learn new roles rapidly and access the right tools.
4. Manage milestone-based escrow payments with transparent release criteria.

The business model charges clients a project fee and offers premium AI features and profile boosting for freelancers.

## Goals & Non-Goals
### Goals
- Deliver a matching engine that evaluates skill coverage, availability, and rating.
- Assemble teams when a single freelancer cannot cover all requirements.
- Provide AI-driven onboarding recommendations for freelancers.
- Support milestone-based escrow payments with release logic.
- Expose the platform as a Python package with unit-test coverage.
- Offer a lightweight web frontend that exercises the full workflow against the prototype API.

### Non-Goals
- Building a production web or mobile UI.
- Implementing real payment processors or KYC flows.
- Handling long-running background tasks or async workloads.

## User Stories
1. **Client** posts a project specifying required skills, hours, and preferences. They expect matching results ranked by fit.
2. **Freelancer** maintains a profile that reflects their skills, availability, rating, and tool stack. They can access AI onboarding recommendations for skill gaps.
3. **Platform Operator** configures milestone payments and releases funds when milestones are completed and approved.

## Functional Requirements
### Matching Engine
- Accepts a project definition with required skills and hours.
- Considers freelancer skill proficiency, availability, and rating.
- Returns individual matches when a single freelancer can cover requirements.
- Returns small team combinations (up to configurable size) to cover required skills if an individual cannot.
- Scores matches by skill coverage, availability sufficiency, and average rating.
- Exposes explanations describing how each requirement is covered.

### AI Onboarding Assistant
- Calculates skill gaps for a freelancer relative to a project.
- Generates a structured learning plan containing resources and practice actions.
- Recommends AI tools from the platform’s library based on missing competencies.

### Payment Escrow
- Supports creating milestones with descriptions and amounts.
- Enforces that total milestone amounts match the project budget.
- Allows marking milestones as complete and releasing funds accordingly.
- Prevents releasing funds for incomplete or unapproved milestones.

## System Design
- Implemented as a Python package (`neuralgig`) to keep scope manageable.
- Core modules:
  - `models`: domain models for freelancers, projects, milestones.
  - `matching`: algorithms to evaluate and score matches.
  - `ai_tools`: onboarding assistant for role preparation.
  - `payments`: milestone-based escrow management.
- `prototype`: FastAPI service layer exposing CRUD, matching, onboarding, and payment configuration endpoints for demonstrations.
- `frontend`: static HTML/CSS/JS user interface that calls the FastAPI backend and visualizes AI insights.
- Unit tests will validate domain logic and edge cases.

## Success Metrics
- Matching engine returns deterministic, well-ranked results for given test fixtures.
- AI onboarding assistant outputs actionable learning plans covering all gaps.
- Payment escrow enforces milestone totals and release rules under tests.
- 90%+ unit test coverage across modules (stretch goal; not enforced).

## Future Enhancements
- Natural language parsing of project briefs.
- Real-time availability sync via calendar integrations.
- Automated contract generation and legal compliance workflows.
- Marketplace analytics for freelancers to benchmark performance.

