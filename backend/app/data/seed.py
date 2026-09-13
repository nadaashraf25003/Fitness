from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.plan import Plan
from app.models.trainer import Trainer
from app.models.member import Member
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.models.subscription_request import SubscriptionRequest
from app.models.branch import Branch


def seed_initial_data(db: Session) -> None:
    """Populate database with initial admin/staff/reception users, plans, trainers, members, branches, and report data if empty."""
    # 1. Seed Branches
    if db.query(Branch).count() == 0:
        branches = [
            Branch(
                id=1,
                name="Main Branch",
                location="Khanqah",
                phone="01000000000",
                price_per_month=500.0,
                offers="Summer Special 20% Off for annual memberships",
            ),
            Branch(
                id=2,
                name="Downtown Branch",
                location="City Center",
                phone="01000000005",
                price_per_month=600.0,
                offers="Free 1 personal training session",
            ),
        ]
        db.add_all(branches)
        db.commit()

    # 2. Seed Users
    if db.query(User).count() == 0:
        users = [
            User(
                id="u-admin-1",
                name="Gym Admin",
                email="admin@gym.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
            ),
            User(
                id="u-staff-1",
                name="Front Desk Staff",
                email="staff@gym.com",
                hashed_password=get_password_hash("staff123"),
                role="staff",
                is_active=True,
            ),
            User(
                id="u-rec-1",
                name="Reception Employee",
                email="employee@example.com",
                hashed_password=get_password_hash("password123"),
                role="reception",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.commit()

    # 3. Seed Default Plans
    if db.query(Plan).count() == 0:
        plans = [
            Plan(
                id="plan-basic",
                name="Basic Monthly",
                price=29.99,
                duration_months=1,
                features=["Access to Gym Floor", "Locker Room Access", "Free WiFi"],
                is_popular=False,
                is_active=True,
            ),
            Plan(
                id="plan-pro",
                name="Pro 3-Month",
                price=79.99,
                duration_months=3,
                features=["Gym Floor & Cardio", "All Group Classes", "1 Free Trainer Session", "Sauna & Steam"],
                is_popular=True,
                is_active=True,
            ),
            Plan(
                id="plan-vip",
                name="VIP Annual",
                price=249.99,
                duration_months=12,
                features=["24/7 Unlimited Access", "Unlimited Classes", "Dedicated Personal Trainer", "Nutrition Consultation", "Free Merchandise"],
                is_popular=False,
                is_active=True,
            ),
        ]
        db.add_all(plans)
        db.commit()

    # 4. Seed Default Trainers
    if db.query(Trainer).count() == 0:
        trainers = [
            Trainer(
                id="trn-1",
                full_name="Alex Rivera",
                specialty="Strength & Hypertrophy",
                bio="Certified CSCS coach with 8+ years experience helping clients build muscle and power.",
                hourly_rate=45.0,
                phone="+1 555-0192",
                email="alex.rivera@gym.com",
                photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
                is_available=True,
                assigned_members_count=12,
            ),
            Trainer(
                id="trn-2",
                full_name="Sarah Jenkins",
                specialty="HIIT & Weight Loss",
                bio="Former collegiate athlete specializing in high-intensity conditioning and body transformation.",
                hourly_rate=40.0,
                phone="+1 555-0193",
                email="sarah.jenkins@gym.com",
                photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
                is_available=True,
                assigned_members_count=16,
            ),
        ]
        db.add_all(trainers)
        db.commit()

    # 5. Seed Members
    if db.query(Member).count() == 0:
        today_str = date.today().strftime("%Y-%m-%d")
        past_date = (date.today() - timedelta(days=60)).strftime("%Y-%m-%d")
        members = [
            Member(
                id="mem-15",
                member_code="15",
                barcode="123456789",
                branch_id=1,
                full_name="Ahmed",
                email="ahmed@example.com",
                phone="01012345678",
                photo="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                note="VIP member, prefers morning workouts",
                gender="male",
                date_of_birth="1995-03-10",
                join_date=today_str,
                subscription_id="sub-32",
                plan_name="Monthly Standard",
                status="active",
            ),
            Member(
                id="mem-101",
                member_code="101",
                barcode="101010101",
                branch_id=1,
                full_name="James Wilson",
                email="james.w@example.com",
                phone="01000000001",
                gender="male",
                date_of_birth="1992-05-14",
                join_date=today_str,
                subscription_id="sub-pro",
                plan_name="Pro 3-Month",
                status="active",
            ),
            Member(
                id="mem-102",
                member_code="102",
                barcode="102020202",
                branch_id=1,
                full_name="Sophia Chen",
                email="sophia.c@example.com",
                phone="01000000002",
                gender="female",
                date_of_birth="1996-08-22",
                join_date=today_str,
                subscription_id="sub-vip",
                plan_name="VIP Annual",
                status="active",
            ),
            Member(
                id="mem-103",
                member_code="103",
                barcode="103030303",
                branch_id=1,
                full_name="Ahmed Ali",
                email="ahmed.ali@example.com",
                phone="01000000003",
                gender="male",
                date_of_birth="1990-11-05",
                join_date=past_date,
                subscription_id="sub-basic",
                plan_name="Basic Monthly",
                status="expired",
            ),
        ]
        db.add_all(members)
        db.commit()

    # 6. Seed Payments for Income Report
    if db.query(Payment).count() == 0:
        today_str = date.today().strftime("%Y-%m-%d")
        payments = [
            Payment(
                branch_id=1,
                member_id="mem-101",
                member_name="James Wilson",
                subscription_id="sub-pro",
                amount=79.99,
                date=today_str,
                method="visa",
                status="paid",
            ),
            Payment(
                branch_id=1,
                member_id="mem-102",
                member_name="Sophia Chen",
                subscription_id="sub-vip",
                amount=249.99,
                date=today_str,
                method="cash",
                status="paid",
            ),
            Payment(
                branch_id=1,
                member_id="mem-103",
                member_name="Ahmed Ali",
                subscription_id="sub-basic",
                amount=29.99,
                date=today_str,
                method="transfer",
                status="paid",
            ),
        ]
        db.add_all(payments)
        db.commit()

    # 7. Seed Attendance for Top Members Report
    if db.query(Attendance).count() == 0:
        today_str = date.today().strftime("%Y-%m-%d")
        attendances = [
            Attendance(
                branch_id=1,
                member_id="mem-101",
                member_name="James Wilson",
                check_in_time="08:30",
                date=today_str,
            ),
            Attendance(
                branch_id=1,
                member_id="mem-102",
                member_name="Sophia Chen",
                check_in_time="09:15",
                date=today_str,
            ),
        ]
        db.add_all(attendances)
        db.commit()

    # 8. Seed Approved Requests for Subscriptions Report
    if db.query(SubscriptionRequest).count() == 0:
        today_str = date.today().strftime("%Y-%m-%d")
        requests = [
            SubscriptionRequest(
                branch_id=1,
                full_name="James Wilson",
                email="james.w@example.com",
                phone="01000000001",
                plan_id="plan-pro",
                plan_name="Pro 3-Month",
                requested_start_date=today_str,
                request_type="new",
                status="approved",
            ),
            SubscriptionRequest(
                branch_id=1,
                full_name="Sophia Chen",
                email="sophia.c@example.com",
                phone="01000000002",
                plan_id="plan-vip",
                plan_name="VIP Annual",
                requested_start_date=today_str,
                request_type="renew",
                status="approved",
            ),
        ]
        db.add_all(requests)
        db.commit()
