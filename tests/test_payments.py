import pytest

from neuralgig.models import Milestone, PaymentSchedule
from neuralgig.payments import PaymentEscrow


def build_schedule():
    schedule = PaymentSchedule(project_id="p-pay", total_budget=10000)
    schedule.add_milestone(Milestone(name="Design", amount=3000))
    schedule.add_milestone(Milestone(name="Development", amount=5000))
    schedule.add_milestone(Milestone(name="Launch", amount=2000))
    return schedule


def test_validate_budget_requires_exact_allocation():
    escrow = PaymentEscrow(schedule=build_schedule())
    escrow.validate()

    escrow.schedule.milestones[-1].amount = 3000
    with pytest.raises(ValueError):
        escrow.validate()


def test_release_funds_requires_completion_and_approval():
    escrow = PaymentEscrow(schedule=build_schedule())
    escrow.validate()

    with pytest.raises(RuntimeError):
        escrow.release_funds("Design")

    escrow.mark_milestone_completed("Design")
    with pytest.raises(RuntimeError):
        escrow.release_funds("Design")

    escrow.approve_milestone("Design")
    released_total = escrow.release_funds("Design")

    assert released_total == 3000
    assert escrow.events[-1].action == "released"


def test_release_funds_unknown_milestone():
    escrow = PaymentEscrow(schedule=build_schedule())
    escrow.validate()

    with pytest.raises(KeyError):
        escrow.mark_milestone_completed("QA")

