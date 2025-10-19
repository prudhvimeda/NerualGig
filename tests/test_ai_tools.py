from neuralgig.ai_tools import AIOnboardingAssistant
from neuralgig.models import FreelancerProfile, ProjectRequirement


def test_generate_learning_plan_identifies_gaps():
    assistant = AIOnboardingAssistant()
    freelancer = FreelancerProfile(
        freelancer_id="f1",
        name="Dana",
        skills={"frontend": 2, "backend": 3},
        availability_hours=20,
        rating=4.5,
    )
    project = ProjectRequirement(
        project_id="p10",
        title="Full Stack Dashboard",
        required_skills={"frontend": 4, "backend": 4},
        hours_needed=25,
        budget=12000,
        preferred_tools=["Storybook"],
    )

    plan = assistant.generate_learning_plan(freelancer, project)

    assert plan.skill_gaps == {"frontend": 2, "backend": 1}
    assert plan.resources
    assert any("AI co-pilot" in action for action in plan.practice_actions)


def test_recommend_tools_combines_domains_and_preferences():
    assistant = AIOnboardingAssistant()
    project = ProjectRequirement(
        project_id="p11",
        title="ML Analytics",
        required_skills={"machine learning": 4, "data": 3},
        hours_needed=30,
        budget=15000,
        preferred_tools=["Custom Dashboard"],
    )

    tools = assistant.recommend_tools(project)

    assert "Jupyter" in tools
    assert "Metabase" in tools
    assert "Custom Dashboard" in tools

