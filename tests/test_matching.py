from neuralgig.matching import MatchingConfig, MatchingEngine
from neuralgig.models import FreelancerProfile, ProjectRequirement


def build_freelancers():
    return [
        FreelancerProfile(
            freelancer_id="f1",
            name="Alice",
            skills={"machine learning": 5, "data": 3},
            availability_hours=30,
            rating=4.8,
        ),
        FreelancerProfile(
            freelancer_id="f2",
            name="Bob",
            skills={"frontend": 4, "design": 3},
            availability_hours=20,
            rating=4.2,
        ),
        FreelancerProfile(
            freelancer_id="f3",
            name="Charlie",
            skills={"backend": 5, "data": 4},
            availability_hours=25,
            rating=4.9,
        ),
    ]


def test_match_project_returns_ranked_results():
    engine = MatchingEngine()
    project = ProjectRequirement(
        project_id="p1",
        title="AI Web App",
        required_skills={"machine learning": 4, "frontend": 3, "backend": 4},
        hours_needed=40,
        budget=20000,
    )
    results = engine.match_project(project, build_freelancers())

    assert results, "expected at least one match"
    assert results[0].score >= results[-1].score
    assert len(results[0].freelancers) >= 1
    assert results[0].coverage >= engine.config.min_coverage_threshold


def test_match_project_respects_group_toggle():
    config = MatchingConfig(max_group_size=3, min_coverage_threshold=0.5)
    engine = MatchingEngine(config)
    project = ProjectRequirement(
        project_id="p2",
        title="Solo Backend",
        required_skills={"backend": 4},
        hours_needed=15,
        budget=8000,
        allow_group=False,
    )
    freelancers = build_freelancers()
    results = engine.match_project(project, freelancers)

    assert all(len(result.freelancers) == 1 for result in results)


def test_match_project_filters_low_coverage():
    engine = MatchingEngine(MatchingConfig(min_coverage_threshold=0.8))
    project = ProjectRequirement(
        project_id="p3",
        title="Deep Learning Research",
        required_skills={"machine learning": 5, "research": 4},
        hours_needed=30,
        budget=15000,
    )
    freelancers = build_freelancers()
    results = engine.match_project(project, freelancers)

    assert all(result.coverage >= 0.8 for result in results)


