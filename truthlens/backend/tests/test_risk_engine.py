"""
TruthLens Risk Engine Unit Tests + API Integration Tests
Covers all spec-required test scenarios from the testing checklist.
"""
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.risk_engine import (
    check_sensational,
    check_shouting,
    check_unsourced,
    analyze_risk,
)
from app.main import app
from app.database import Base, get_db


# ═══════════════════════════════════════════════════════════════════════════════
# UNIT TESTS — Risk Engine (pure logic, no DB)
# ═══════════════════════════════════════════════════════════════════════════════

class TestCheckSensational:
    """Spec requirement: case-insensitive substring match for "breaking",
    "shocking", "share before deleted"."""

    def test_breaking_uppercase(self):
        triggered, reason = check_sensational("BREAKING NEWS TODAY")
        assert triggered is True
        assert "breaking" in reason.lower()

    def test_breaking_titlecase(self):
        triggered, reason = check_sensational("Breaking: Big story")
        assert triggered is True

    def test_breaking_lowercase(self):
        triggered, reason = check_sensational("this is breaking news")
        assert triggered is True

    def test_shocking_triggers(self):
        triggered, reason = check_sensational("SHOCKING new discovery!")
        assert triggered is True
        assert "shocking" in reason.lower()

    def test_share_before_deleted_triggers(self):
        triggered, reason = check_sensational("SHARE BEFORE DELETED everyone!")
        assert triggered is True
        assert "share before deleted" in reason.lower()

    def test_share_before_deleted_mixed_case(self):
        triggered, _ = check_sensational("Share Before Deleted please")
        assert triggered is True

    def test_normal_text_no_trigger(self):
        triggered, _ = check_sensational("Normal scientific report published yesterday.")
        assert triggered is False

    def test_empty_string_no_trigger(self):
        triggered, _ = check_sensational("")
        assert triggered is False

    def test_reason_string_not_empty_when_triggered(self):
        triggered, reason = check_sensational("BREAKING: something")
        assert triggered is True
        assert len(reason) > 0


class TestCheckShouting:
    """Spec requirement: >50% of alphabetic chars are uppercase
    AND at least 5 alphabetic characters total."""

    def test_all_caps_triggers(self):
        triggered, reason = check_shouting("NASA DISCOVERS WATER")
        assert triggered is True
        assert len(reason) > 0

    def test_nasa_discovers_water_no_sensational(self):
        """Spec explicitly says 'NASA DISCOVERS WATER' should trigger Shouting ONLY, not Sensational."""
        s_triggered, _ = check_sensational("NASA DISCOVERS WATER")
        sh_triggered, _ = check_shouting("NASA DISCOVERS WATER")
        assert s_triggered is False, "NASA DISCOVERS WATER must NOT trigger Sensational"
        assert sh_triggered is True, "NASA DISCOVERS WATER must trigger Shouting"

    def test_12345_symbols_no_trigger(self):
        """Spec: '12345 !!! ???' must NOT trigger Shouting — no alphabetic chars."""
        triggered, _ = check_shouting("12345 !!! ???")
        assert triggered is False

    def test_empty_no_trigger(self):
        triggered, _ = check_shouting("")
        assert triggered is False

    def test_exactly_50pct_not_triggered(self):
        """Boundary: exactly 50% uppercase should NOT trigger (rule is strictly >50%)."""
        # "ABCDefgh" — 4 upper, 4 lower = exactly 50%
        triggered, _ = check_shouting("ABCDefgh")
        assert triggered is False

    def test_above_50pct_triggers(self):
        # "ABCDEfgh" — 5 upper, 3 lower = 62.5% > 50%
        triggered, _ = check_shouting("ABCDEfgh")
        assert triggered is True

    def test_fewer_than_5_alpha_no_trigger(self):
        """Guard: fewer than 5 alphabetic chars means never trigger Shouting."""
        # "AB!!!" — 2 alphabetic chars (both upper), but < 5 total alpha
        triggered, _ = check_shouting("AB!!!")
        assert triggered is False

    def test_exactly_4_alpha_no_trigger(self):
        # "ABCD 123" — 4 alphabetic (all upper), should NOT trigger
        triggered, _ = check_shouting("ABCD 123")
        assert triggered is False

    def test_exactly_5_alpha_all_upper_triggers(self):
        # "ABCDE" — exactly 5 alphabetic, all upper = 100% > 50%
        triggered, _ = check_shouting("ABCDE")
        assert triggered is True

    def test_normal_sentence_no_trigger(self):
        triggered, _ = check_shouting("Standard sentence structure with normal capitalization.")
        assert triggered is False

    def test_digits_excluded_from_ratio(self):
        """Digits must not count in the alphabetic ratio."""
        # "ABC 123456789" — 3 uppercase alpha, 0 lowercase alpha
        # But only 3 alphabetic chars total — below 5 guard
        triggered, _ = check_shouting("ABC 123456789")
        assert triggered is False

    def test_reason_not_empty_when_triggered(self):
        triggered, reason = check_shouting("THIS IS ALL CAPS SHOUTING")
        assert triggered is True
        assert len(reason) > 0


class TestCheckUnsourced:
    def test_none_triggers(self):
        triggered, reason = check_unsourced(None)
        assert triggered is True
        assert len(reason) > 0

    def test_empty_string_triggers(self):
        triggered, _ = check_unsourced("")
        assert triggered is True

    def test_whitespace_only_triggers(self):
        triggered, _ = check_unsourced("   ")
        assert triggered is True

    def test_valid_url_no_trigger(self):
        triggered, _ = check_unsourced("https://reuters.com/article/123")
        assert triggered is False


class TestAnalyzeRisk:
    """Integration of the full risk engine — level + structured flags."""

    def test_normal_text_with_source_zero_flags(self):
        """Spec: normal mixed-case sentence with source link → 0 flags, Normal."""
        text = "Scientists released findings on climate patterns today."
        risk_level, flags = analyze_risk(text, "https://nature.com/articles/12345")
        assert risk_level == "Normal"
        assert flags == []

    def test_breaking_no_source_high_risk(self):
        """Spec: breaking + no source → High Risk, Sensational + Unsourced."""
        risk_level, flags = analyze_risk("breaking news today", None)
        assert risk_level == "High Risk"
        types = [f["type"] for f in flags]
        assert "Sensational" in types
        assert "Unsourced" in types

    def test_exactly_one_flag_is_normal(self):
        """Spec: exactly 1 flag → still 'Normal', not 'High Risk', but flag shown."""
        # Unsourced only (normal text, no source)
        risk_level, flags = analyze_risk("A regular news update about local events.", None)
        assert risk_level == "Normal"
        assert len(flags) == 1
        assert flags[0]["type"] == "Unsourced"
        assert len(flags[0]["reason"]) > 0

    def test_single_flag_still_shown(self):
        """Spec: 'Store ALL fired flags regardless of level (even a single flag)'."""
        risk_level, flags = analyze_risk("Normal text here.", None)
        assert len(flags) == 1
        assert flags[0]["type"] == "Unsourced"

    def test_sensational_and_unsourced_two_flags(self):
        risk_level, flags = analyze_risk("SHOCKING: everything changed today!", None)
        assert risk_level == "High Risk"
        types = [f["type"] for f in flags]
        assert "Sensational" in types
        assert "Unsourced" in types

    def test_shouting_and_unsourced_two_flags(self):
        """NASA DISCOVERS WATER: Shouting + Unsourced = High Risk."""
        risk_level, flags = analyze_risk("NASA DISCOVERS WATER ON MARS AGAIN", None)
        assert risk_level == "High Risk"
        types = [f["type"] for f in flags]
        assert "Shouting" in types
        assert "Unsourced" in types
        assert "Sensational" not in types

    def test_all_three_flags(self):
        risk_level, flags = analyze_risk(
            "BREAKING SHOCKING NEWS SHARE BEFORE DELETED", None
        )
        assert risk_level == "High Risk"
        types = [f["type"] for f in flags]
        assert "Sensational" in types
        assert "Shouting" in types
        assert "Unsourced" in types

    def test_12345_symbols_no_shouting(self):
        """Spec: '12345 !!! ???' must NOT trigger Shouting."""
        risk_level, flags = analyze_risk("12345 !!! ???", None)
        types = [f["type"] for f in flags]
        assert "Shouting" not in types
        # Only Unsourced fires (no source link)
        assert "Unsourced" in types
        assert risk_level == "Normal"  # only 1 flag

    def test_all_flags_have_reason(self):
        """Spec: 'Every flag shown anywhere must include why it fired.'"""
        _, flags = analyze_risk("BREAKING SCREAMING NEWS", None)
        for flag in flags:
            assert "reason" in flag
            assert len(flag["reason"]) > 0, f"Flag {flag['type']} has empty reason"

    def test_risk_level_values_are_exact_spec_strings(self):
        """Risk level must be exactly 'High Risk' or 'Normal' — not HIGH/NORMAL."""
        rl1, _ = analyze_risk("BREAKING NEWS NOW SHARE", None)
        assert rl1 == "High Risk", f"Expected 'High Risk', got '{rl1}'"

        rl2, _ = analyze_risk("Normal update today.", "https://example.com")
        assert rl2 == "Normal", f"Expected 'Normal', got '{rl2}'"


# ═══════════════════════════════════════════════════════════════════════════════
# INTEGRATION TESTS — Full API (in-memory SQLite)
# ═══════════════════════════════════════════════════════════════════════════════

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=True)


class TestHealthEndpoint:
    def test_health_returns_ok_true(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data == {"ok": True}, f"Expected {{ok: true}}, got {data}"


class TestSubmitClaim:
    def test_submit_breaking_no_source_high_risk(self, client):
        """Checklist #1: breaking + no source → High Risk, Sensational + Unsourced flags."""
        res = client.post("/api/claims", json={
            "text": "breaking news about the election",
            "sourcePlatform": "X",
            "category": "Politics",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["riskLevel"] == "High Risk"
        types = [f["type"] for f in data["flags"]]
        assert "Sensational" in types
        assert "Unsourced" in types
        assert data["status"] == "Unverified"

    def test_submit_normal_with_source_zero_flags(self, client):
        """Checklist #2: normal text + source → Normal, empty flags."""
        res = client.post("/api/claims", json={
            "text": "The economy grew by 2% last quarter.",
            "sourcePlatform": "X",
            "category": "Finance",
            "sourceLink": "https://economydata.gov/q3-2026",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["riskLevel"] == "Normal"
        assert data["flags"] == []
        assert data["status"] == "Unverified"

    def test_submit_12345_symbols_no_shouting(self, client):
        """Checklist #3: '12345 !!! ???' must NOT trigger Shouting."""
        res = client.post("/api/claims", json={
            "text": "12345 !!! ???",
            "sourcePlatform": "Other",
            "category": "Other",
        })
        assert res.status_code == 201
        data = res.json()
        types = [f["type"] for f in data["flags"]]
        assert "Shouting" not in types

    def test_submit_one_flag_still_normal(self, client):
        """Checklist #4: 1 flag → 'Normal' not 'High Risk', but flag shown."""
        res = client.post("/api/claims", json={
            "text": "A normal-looking sentence with regular capitalization.",
            "sourcePlatform": "WhatsApp",
            "category": "Health",
            # No sourceLink — only Unsourced fires
        })
        assert res.status_code == 201
        data = res.json()
        assert data["riskLevel"] == "Normal"
        assert len(data["flags"]) == 1
        assert data["flags"][0]["type"] == "Unsourced"

    def test_submit_returns_risk_immediately(self, client):
        """On submit: run risk engine immediately and show result back to user."""
        res = client.post("/api/claims", json={
            "text": "SHOCKING: secrets revealed!",
            "sourcePlatform": "Instagram",
            "category": "Other",
        })
        assert res.status_code == 201
        data = res.json()
        # Result shown immediately in response
        assert "riskLevel" in data
        assert "flags" in data
        assert data["id"] is not None

    def test_submit_requires_text(self, client):
        res = client.post("/api/claims", json={
            "sourcePlatform": "X",
            "category": "Politics",
        })
        assert res.status_code == 422

    def test_submit_invalid_platform_rejected(self, client):
        res = client.post("/api/claims", json={
            "text": "Some claim",
            "sourcePlatform": "TikTok",
            "category": "Politics",
        })
        assert res.status_code == 422

    def test_submit_invalid_category_rejected(self, client):
        res = client.post("/api/claims", json={
            "text": "Some claim",
            "sourcePlatform": "X",
            "category": "Sports",
        })
        assert res.status_code == 422

    def test_flags_include_reasons(self, client):
        """Spec: every flag must include reason, never just a bare label."""
        res = client.post("/api/claims", json={
            "text": "BREAKING: everything changed!",
            "sourcePlatform": "X",
            "category": "Politics",
        })
        data = res.json()
        for flag in data["flags"]:
            assert "type" in flag
            assert "reason" in flag
            assert len(flag["reason"]) > 0, f"Flag {flag['type']} has empty reason"

    def test_status_starts_unverified(self, client):
        res = client.post("/api/claims", json={
            "text": "Some test claim.",
            "sourcePlatform": "X",
            "category": "Other",
        })
        assert res.json()["status"] == "Unverified"


class TestReviewWorkflow:
    def _submit(self, client, text="Test claim text."):
        res = client.post("/api/claims", json={
            "text": text,
            "sourcePlatform": "X",
            "category": "Politics",
        })
        assert res.status_code == 201
        return res.json()["id"]

    def test_review_verified_true(self, client):
        """Checklist #5: review → status/reviewerNote/reviewedAt updated."""
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "Verified True",
            "reviewerNote": "Confirmed by official government press release.",
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "Verified True"
        assert data["reviewerNote"] == "Confirmed by official government press release."
        assert data["reviewedAt"] is not None

    def test_review_false(self, client):
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
            "reviewerNote": "No evidence found for this claim.",
        })
        assert res.status_code == 200
        assert res.json()["status"] == "False"

    def test_review_misleading(self, client):
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "Misleading",
            "reviewerNote": "Out of context information presented as fact.",
        })
        assert res.status_code == 200
        assert res.json()["status"] == "Misleading"

    def test_text_unchanged_after_review(self, client):
        """Checklist #6: original text must be byte-for-byte unchanged after review."""
        original_text = "Scientists discover water on Mars."
        claim_id = self._submit(client, original_text)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "Verified True",
            "reviewerNote": "Confirmed by NASA press conference.",
        })
        assert res.status_code == 200
        assert res.json()["text"] == original_text

    def test_review_allows_re_review(self, client):
        """Spec: do allow re-reviewing — overwrite status + reviewerNote + reviewedAt."""
        claim_id = self._submit(client)
        client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "Verified True",
            "reviewerNote": "First review.",
        })
        res2 = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "Misleading",
            "reviewerNote": "Correction after further investigation.",
        })
        assert res2.status_code == 200
        assert res2.json()["status"] == "Misleading"
        assert res2.json()["reviewerNote"] == "Correction after further investigation."

    def test_review_invalid_status_rejected(self, client):
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "VERIFIED_TRUE",
            "reviewerNote": "This uses wrong status string.",
        })
        assert res.status_code == 422

    def test_review_empty_reviewer_note_rejected(self, client):
        """Spec: 400 if reviewerNote is empty."""
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
            "reviewerNote": "",
        })
        assert res.status_code == 422

    def test_review_missing_reviewer_note_rejected(self, client):
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
        })
        assert res.status_code == 422

    def test_review_immutable_text_rejected(self, client):
        """Spec: 400 if body contains text (immutable field)."""
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
            "reviewerNote": "Review note.",
            "text": "Trying to change the text",
        })
        assert res.status_code == 400

    def test_review_immutable_platform_rejected(self, client):
        claim_id = self._submit(client)
        res = client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
            "reviewerNote": "Review note.",
            "sourcePlatform": "Instagram",
        })
        assert res.status_code == 400

    def test_review_404_missing_claim(self, client):
        res = client.patch("/api/claims/99999/review", json={
            "status": "False",
            "reviewerNote": "Review note.",
        })
        assert res.status_code == 404


class TestFeedOrdering:
    def test_dp1_three_tier_ordering(self, client):
        """Checklist #7: GET /api/claims order must match DP1 3-tier rule."""
        # Submit: Normal reviewed (tier 3)
        r1 = client.post("/api/claims", json={
            "text": "Normal text with source link.",
            "sourcePlatform": "X",
            "category": "Finance",
            "sourceLink": "https://example.com",
        })
        id1 = r1.json()["id"]
        client.patch(f"/api/claims/{id1}/review", json={
            "status": "Verified True",
            "reviewerNote": "Confirmed.",
        })

        # Submit: Unverified Normal (tier 2)
        r2 = client.post("/api/claims", json={
            "text": "Another normal unverified claim here.",
            "sourcePlatform": "WhatsApp",
            "category": "Health",
        })
        id2 = r2.json()["id"]

        # Submit: Unverified High Risk (tier 1)
        r3 = client.post("/api/claims", json={
            "text": "BREAKING SHOCKING CRISIS NOW HAPPENING",
            "sourcePlatform": "Instagram",
            "category": "Politics",
        })
        id3 = r3.json()["id"]

        res = client.get("/api/claims")
        assert res.status_code == 200
        claims = res.json()

        assert len(claims) == 3

        # Tier 1 (Unverified + High Risk) must come first
        assert claims[0]["id"] == id3
        assert claims[0]["status"] == "Unverified"
        assert claims[0]["riskLevel"] == "High Risk"

        # Tier 2 (Unverified + Normal) must come second
        assert claims[1]["id"] == id2
        assert claims[1]["status"] == "Unverified"

        # Tier 3 (Reviewed) must come last
        assert claims[2]["id"] == id1
        assert claims[2]["status"] == "Verified True"

    def test_high_risk_reviewed_goes_to_tier3(self, client):
        """High Risk claims that are reviewed drop to Tier 3 — below unverified Normal."""
        # High Risk reviewed
        r1 = client.post("/api/claims", json={
            "text": "BREAKING SHOCKING LEAKED MEMO",
            "sourcePlatform": "X",
            "category": "Politics",
        })
        client.patch(f"/api/claims/{r1.json()['id']}/review", json={
            "status": "False",
            "reviewerNote": "Debunked.",
        })

        # Normal unverified
        r2 = client.post("/api/claims", json={
            "text": "A regular normal unverified claim without source.",
            "sourcePlatform": "WhatsApp",
            "category": "Health",
        })

        res = client.get("/api/claims")
        claims = res.json()
        # Unverified Normal must appear before reviewed High Risk
        ids = [c["id"] for c in claims]
        assert ids.index(r2.json()["id"]) < ids.index(r1.json()["id"])


class TestFilters:
    def test_filter_by_category(self, client):
        """Checklist #8: filter by category works."""
        client.post("/api/claims", json={"text": "Health claim.", "sourcePlatform": "X", "category": "Health"})
        client.post("/api/claims", json={"text": "Finance claim.", "sourcePlatform": "X", "category": "Finance"})

        res = client.get("/api/claims?category=Health")
        assert res.status_code == 200
        data = res.json()
        assert all(c["category"] == "Health" for c in data)
        assert len(data) == 1

    def test_filter_by_status(self, client):
        """Checklist #8: filter by status works."""
        r = client.post("/api/claims", json={"text": "Claim to verify.", "sourcePlatform": "X", "category": "Politics"})
        claim_id = r.json()["id"]
        client.post("/api/claims", json={"text": "Another unverified claim.", "sourcePlatform": "X", "category": "Health"})

        client.patch(f"/api/claims/{claim_id}/review", json={"status": "Verified True", "reviewerNote": "Confirmed."})

        res = client.get("/api/claims?status=Verified True")
        assert res.status_code == 200
        data = res.json()
        assert all(c["status"] == "Verified True" for c in data)

    def test_filter_combined(self, client):
        """Checklist #8: category + status filter work together."""
        client.post("/api/claims", json={"text": "Health verified claim.", "sourcePlatform": "X", "category": "Health"})
        r = client.post("/api/claims", json={"text": "Finance claim to verify.", "sourcePlatform": "X", "category": "Finance"})
        client.patch(f"/api/claims/{r.json()['id']}/review", json={"status": "Verified True", "reviewerNote": "Confirmed."})

        res = client.get("/api/claims?category=Finance&status=Verified True")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["category"] == "Finance"
        assert data[0]["status"] == "Verified True"


class TestDetailView:
    def test_detail_returns_all_required_fields(self, client):
        """Spec detail view must include: full text, all risk flags (with reasons),
        reviewerNote, submittedAt, sourcePlatform, category, sourceLink, status, reviewedAt."""
        r = client.post("/api/claims", json={
            "text": "BREAKING claim for detail test!",
            "sourcePlatform": "Instagram",
            "category": "Health",
            "sourceLink": "https://example.com",
        })
        claim_id = r.json()["id"]
        client.patch(f"/api/claims/{claim_id}/review", json={
            "status": "False",
            "reviewerNote": "Detail test review note.",
        })

        res = client.get(f"/api/claims/{claim_id}")
        assert res.status_code == 200
        data = res.json()

        required_fields = [
            "id", "text", "sourcePlatform", "category", "sourceLink",
            "status", "riskLevel", "flags", "reviewerNote", "submittedAt", "reviewedAt"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"

        # Verify flag reasons are present
        for flag in data["flags"]:
            assert "type" in flag
            assert "reason" in flag

    def test_detail_404_missing(self, client):
        res = client.get("/api/claims/99999")
        assert res.status_code == 404


class TestApiFieldNames:
    """Verify the JSON response uses camelCase keys matching the spec exactly."""

    def test_response_uses_camel_case_fields(self, client):
        res = client.post("/api/claims", json={
            "text": "Test claim.",
            "sourcePlatform": "X",
            "category": "Politics",
            "sourceLink": "https://example.com",
        })
        assert res.status_code == 201
        data = res.json()
        assert "sourcePlatform" in data
        assert "sourceLink" in data
        assert "riskLevel" in data
        assert "submittedAt" in data
        # Snake_case versions must NOT appear
        assert "source_platform" not in data
        assert "source_link" not in data
        assert "risk_level" not in data
        assert "submitted_at" not in data
