# NeuralGig

NeuralGig is an AI-native freelancing platform prototype focused on real-time talent matching, AI onboarding assistance, and milestone-based escrow payments. This repository contains a Python package that models the core business logic and provides unit tests.

## Features
- **Intelligent Matching Engine**: Scores freelancers and small teams against project requirements based on skill coverage, availability, and ratings.
- **AI Onboarding Assistant**: Generates learning plans and AI tool recommendations to help freelancers ramp up for new roles quickly.
- **Milestone Escrow**: Manages milestone creation, completion, and fund release with validation of project budgets.
- **Product Requirements Document**: Located in [`docs/PRD.md`](docs/PRD.md), outlining the scope and functional requirements.
- **Marketing Website Prototype**: A multi-page frontend that showcases the platform for clients and freelancers while linking into the interactive console.

## Getting Started
1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

2. Run the unit tests:

```bash
pytest
```

3. Start the FastAPI prototype locally:

```bash
uvicorn neuralgig.prototype:app --reload
```

Once running, explore the interactive docs at http://127.0.0.1:8000/docs to try project creation, matching, onboarding plans, and payment milestone management end-to-end.

4. Launch the Next.js application (new)

```bash
cd web
npm install
npm run dev
```

The app runs at http://localhost:3000 and integrates Google / GitHub OAuth via NextAuth, the FastAPI backend, and Ollama-powered learning plans. Copy `web/.env.example` to `web/.env.local` and fill in the missing secrets (Google client secret, GitHub credentials, NextAuth secret, etc.).

> The legacy static marketing site remains available under `frontend/` if you still want to serve it with `python -m http.server 4173 -d frontend`.

## AI learning copilot

NeuralGig now integrates with a local [Ollama](https://ollama.com/) instance to generate bespoke learning summaries for freelancers. Install Ollama, pull a lightweight open-source model, and keep the service running:

```bash
ollama pull phi3
ollama serve
```

You can override the defaults with `OLLAMA_MODEL` and `OLLAMA_BASE_URL` environment variables.

## Where to See the Output

- **Backend API**: When you run `uvicorn neuralgig.prototype:app --reload`, FastAPI hosts interactive documentation at http://127.0.0.1:8000/docs. You can trigger the project, matching, onboarding, and payment endpoints directly from that interface and inspect the JSON responses.
- **Frontend Website**: After starting `python -m http.server 4173 -d frontend`, open http://127.0.0.1:4173. The landing page contains a live console that talks to the backend (once it is running) and marketing subpages that showcase each part of the NeuralGig experience.
- **Automated Tests**: Running `pytest` prints the results of the unit test suite to the terminal, exercising the same matching, AI onboarding, and payment logic that powers the prototype.

## Project Structure
```
.
├── docs
│   └── PRD.md
├── src
│   └── neuralgig
│       ├── __init__.py
│       ├── ai_tools.py
│       ├── matching.py
│       ├── models.py
│       ├── payments.py
│       └── prototype.py
├── frontend
│   ├── app.js
│   ├── contact.html
│   ├── clients.html
│   ├── index.html
│   ├── platform.html
│   ├── pricing.html
│   ├── resources.html
│   ├── styles.css
│   └── talent.html
└── tests
    ├── test_ai_tools.py
    ├── test_matching.py
    ├── test_payments.py
    └── test_prototype.py
```

## Development
- Keep new modules covered by unit tests.
- Extend the matching engine to support more sophisticated ranking and personalization as needed.
