"""
Shared pytest fixtures for Wakeeli pipeline and extraction tests.
"""
import itertools
import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use a fresh in-memory SQLite DB for every test session.
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def make_extract_result(
    classification="B",
    bare_greeting=False,
    listing_type=None,
    location=None,
    budget_min=None,
    budget_max=None,
    bedrooms=None,
    bathrooms=None,
    furnishing=None,
    name=None,
    not_link_or_id=False,
    link_or_id=None,
    confidence=0.9,
):
    """Build a fake extract_entities return value."""
    return {
        "classification": classification,
        "bare_greeting": bare_greeting,
        "user_info": {"name": name, "not_link_or_id": not_link_or_id},
        "property_info": {
            "link_or_id": link_or_id,
            "listing_type": listing_type,
            "location": location,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "property_type": None,
            "furnishing": furnishing,
            "timeline": None,
        },
        "confidence": confidence,
    }


def make_llm_response(text: str) -> MagicMock:
    """Return a mock anthropic messages response with the given text."""
    mock_resp = MagicMock()
    mock_resp.content = [MagicMock(text=text)]
    usage = MagicMock()
    usage.input_tokens = 10
    usage.output_tokens = 5
    usage.cache_creation_input_tokens = 0
    usage.cache_read_input_tokens = 0
    mock_resp.usage = usage
    return mock_resp


# ------------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------------

_conv_counter = itertools.count(start=5000)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    """Create all DB tables once per test session."""
    from app.models import Base
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """
    Provide a fresh DB session for each test.

    Wraps each test in a connection-level transaction so that even explicit
    db.commit() calls inside process_user_message are captured and rolled
    back after the test ends. This guarantees a clean slate between tests.
    """
    connection = test_engine.connect()
    trans = connection.begin()
    session = TestSession(bind=connection)
    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        connection.close()


@pytest.fixture
def conv_id():
    """Return a unique conversation ID and clean up the agent session afterwards."""
    cid = next(_conv_counter)
    yield cid
    # Clear session state from the in-process cache
    try:
        from app.services import agent as agent_module
        agent_module._sessions.pop(cid, None)
    except Exception:
        pass
