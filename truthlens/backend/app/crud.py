import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import case, desc, asc
from sqlalchemy.orm import Session

from app.models import Claim
from app.schemas import ClaimCreate, ClaimReview


# ── IMMUTABLE FIELDS — any PATCH body containing these keys is rejected (400) ──
IMMUTABLE_FIELDS = {"text", "sourcePlatform", "category", "sourceLink"}


def create_claim(
    db: Session,
    claim_in: ClaimCreate,
    risk_level: str,
    flags: List[Dict[str, str]],
) -> Claim:
    """Create a new claim with computed risk. Status starts as 'Unverified'."""
    db_claim = Claim(
        text=claim_in.text,
        sourcePlatform=claim_in.sourcePlatform,
        category=claim_in.category,
        sourceLink=claim_in.sourceLink.strip() if claim_in.sourceLink else None,
        status="Unverified",
        riskLevel=risk_level,
        flags=json.dumps(flags),
        reviewerNote=None,
        submittedAt=datetime.now(timezone.utc),
        reviewedAt=None,
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim


def get_claims(
    db: Session,
    category: Optional[str] = None,
    status: Optional[str] = None,
) -> List[Claim]:
    """
    Retrieve claims with optional category/status filters.

    DP1 — 3-tier ordering (server-side):
      Tier 1: Unverified + High Risk   → newest first
      Tier 2: Unverified + Normal      → newest first
      Tier 3: Reviewed (any status)   → newest first

    Rationale: once a human has rendered a verdict, the claim no longer competes
    for reviewer attention — burying it below all unverified ones keeps the feed
    focused on triage, not on being a risk leaderboard.
    """
    query = db.query(Claim)

    if category and category.lower() != "all":
        query = query.filter(Claim.category == category)

    if status and status.lower() != "all":
        query = query.filter(Claim.status == status)

    # DP1: 3-tier priority expression
    tier = case(
        # Tier 1: Unverified + High Risk
        (
            (Claim.status == "Unverified") & (Claim.riskLevel == "High Risk"),
            1,
        ),
        # Tier 2: Unverified + Normal
        (
            (Claim.status == "Unverified") & (Claim.riskLevel == "Normal"),
            2,
        ),
        # Tier 3: everything reviewed
        else_=3,
    )
    query = query.order_by(asc(tier), desc(Claim.submittedAt))
    return query.all()


def get_claim(db: Session, claim_id: int) -> Optional[Claim]:
    """Retrieve a single claim by ID."""
    return db.query(Claim).filter(Claim.id == claim_id).first()


def review_claim(
    db: Session,
    claim_id: int,
    review_in: ClaimReview,
    raw_body: dict,
) -> Optional[Claim]:
    """
    Update status and reviewerNote for a claim.

    DP3 — Immutability: original text, sourcePlatform, category, and sourceLink
    are permanently frozen. Any attempt to touch these fields via the PATCH body
    is rejected with a 400 (handled in the route before this is called).

    Re-reviewing is allowed — overwrite status + reviewerNote + reviewedAt.
    """
    db_claim = get_claim(db, claim_id)
    if not db_claim:
        return None

    db_claim.status = review_in.status
    db_claim.reviewerNote = review_in.reviewerNote
    db_claim.reviewedAt = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_claim)
    return db_claim


# ── Seed data ─────────────────────────────────────────────────────────────────

SEED_CLAIMS = [
    # 1 — High Risk (Sensational + Unsourced) → False
    {
        "text": "BREAKING: Scientists discovered a secret cure for aging!",
        "sourcePlatform": "X",
        "category": "Health",
        "sourceLink": None,
        "review_status": "False",
        "reviewerNote": "No credible source found; fabricated claim.",
    },
    # 2 — High Risk (Shouting + Unsourced) → Unverified
    {
        "text": "NASA DISCOVERS WATER ON MARS AGAIN",
        "sourcePlatform": "Instagram",
        "category": "Other",
        "sourceLink": None,
        "review_status": None,
    },
    # 3 — Normal → Unverified
    {
        "text": "Local health officials warn about rising flu cases this winter.",
        "sourcePlatform": "WhatsApp",
        "category": "Health",
        "sourceLink": "https://cdc.gov/flu/season/2026-warning.html",
        "review_status": None,
    },
    # 4 — High Risk (Sensational + Unsourced) → Verified True
    {
        "text": "BREAKING: New vaccine approved for global use by health authorities",
        "sourcePlatform": "X",
        "category": "Health",
        "sourceLink": None,
        "review_status": "Verified True",
        "reviewerNote": "Confirmed via WHO press release after review.",
    },
    # 5 — High Risk (Sensational + Unsourced) → Misleading
    {
        "text": "SHOCKING new diet melts fat overnight, doctors hate this trick",
        "sourcePlatform": "Instagram",
        "category": "Health",
        "sourceLink": None,
        "review_status": "Misleading",
        "reviewerNote": "No scientific evidence supports overnight fat loss; classic clickbait diet misinformation.",
    },
    # 6 — Normal (1 flag: Unsourced only) → False
    {
        "text": "Your bank account will be frozen unless you act now — click here immediately",
        "sourcePlatform": "Other",
        "category": "Finance",
        "sourceLink": None,
        "review_status": "False",
        "reviewerNote": "Phishing-style financial threat with no credible source; no major bank uses such messaging.",
    },
    # 7 — Normal (sourced) → Verified True
    {
        "text": "The central bank adjusted interest rates by 0.25% today.",
        "sourcePlatform": "X",
        "category": "Finance",
        "sourceLink": "https://centralbank.gov/press/rate-decision-sep2026.html",
        "review_status": "Verified True",
        "reviewerNote": "Confirmed via official central bank press release.",
    },
    # 8 — Normal (sourced) → Verified True
    {
        "text": "City council approved the new park budget in yesterday's meeting.",
        "sourcePlatform": "WhatsApp",
        "category": "Politics",
        "sourceLink": "https://citycouncil.gov/minutes/meeting-sep21-2026.pdf",
        "review_status": "Verified True",
        "reviewerNote": "Confirmed via official city council meeting minutes.",
    },
    # 9 — High Risk (Sensational + Unsourced) → Unverified
    {
        "text": "SHARE BEFORE DELETED: leaked government memo proves everything",
        "sourcePlatform": "Other",
        "category": "Politics",
        "sourceLink": None,
        "review_status": None,
    },
    # 10 — Normal (sourced) → Unverified
    {
        "text": "Quarterly earnings report shows modest growth for the tech sector.",
        "sourcePlatform": "X",
        "category": "Finance",
        "sourceLink": "https://marketwatch.com/earnings/q3-2026-tech-sector.html",
        "review_status": None,
    },
]


def seed_database(db: Session) -> None:
    """
    Idempotently seed 10 demo claims on first run.
    Only seeds if the claims table is completely empty.
    """
    from app.risk_engine import analyze_risk

    if db.query(Claim).count() > 0:
        return  # Already seeded — skip

    now = datetime.now(timezone.utc)

    for i, seed in enumerate(SEED_CLAIMS):
        risk_level, flags = analyze_risk(seed["text"], seed.get("sourceLink"))

        # Use staggered timestamps so ordering within tiers looks natural
        from datetime import timedelta
        submitted_at = now - timedelta(hours=len(SEED_CLAIMS) - i)

        db_claim = Claim(
            text=seed["text"],
            sourcePlatform=seed["sourcePlatform"],
            category=seed["category"],
            sourceLink=seed.get("sourceLink"),
            status="Unverified",
            riskLevel=risk_level,
            flags=json.dumps(flags),
            reviewerNote=None,
            submittedAt=submitted_at,
            reviewedAt=None,
        )
        db.add(db_claim)
        db.flush()  # get ID without committing yet

        # Apply review if specified
        if seed.get("review_status"):
            db_claim.status = seed["review_status"]
            db_claim.reviewerNote = seed.get("reviewerNote")
            db_claim.reviewedAt = submitted_at + timedelta(hours=1)

    db.commit()
