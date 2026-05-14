"""
Pytest configuration with fixtures.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db


@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for testing."""
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=eng)
    return eng


@pytest.fixture(scope="function")
def db_session(engine):
    """Provide a transactional scope for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def test_user(db_session):
    """Create a test user."""
    from app.models.user import User
    from app.core.security import hash_password

    user = User(
        id="test-user-001",
        username="testuser",
        email="test@example.com",
        hashed_password=hash_password("testpass123"),
        display_name="Test User",
        grade="高二理科生",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def test_note(db_session, test_user):
    """Create a test note."""
    from app.models.note import Note, NoteType

    note = Note(
        id="test-note-001",
        user_id=test_user.id,
        title="数学分析：泰勒展开",
        raw_content="f(x) = f(a) + f'(a)(x-a) + f''(a)/2!(x-a)^2 + ...",
        note_type=NoteType.VOICE,
        subject="数学",
        tags='["重点", "微积分"]',
        confidence_score=0.95,
    )
    db_session.add(note)
    db_session.commit()
    db_session.refresh(note)
    return note


@pytest.fixture()
def auth_headers(test_user):
    """Generate auth header for test user."""
    from app.core.security import create_access_token

    token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {token}"}
