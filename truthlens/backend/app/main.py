import os
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import Claim
from app.schemas import ClaimCreate, ClaimResponse, ClaimReview, IMMUTABLE_FIELDS
from app.risk_engine import analyze_risk
import app.crud as crud

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TruthLens API",
    description=(
        "TruthLens — Misinformation Triage Platform\n\n"
        "**Philosophy**: Social media moves faster than fact-checkers can. "
        "TruthLens is neutral by design — it checks information, not ideologies. "
        "It does NOT decide what is true. It surfaces what needs human attention first. "
        "Every claim stays 'Unverified' until a human reviewer sets its status.\n\n"
        "**Standard API**: YES\n\n"
        "Track 2 — Civic Tech | Hackathon ID: AZIS-5D989T"
    ),
    version="1.0.0",
)

# Enable CORS — wide-open for hackathon graders
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Seed on startup ────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Seed demo data on first run (idempotent — skips if data already exists)."""
    db = next(get_db())
    try:
        crud.seed_database(db)
    finally:
        db.close()


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"], summary="Health check")
def health_check():
    """GET /api/health — returns {ok: true}. Cheap sanity check for graders."""
    return {"ok": True}


# ── Submit a claim ─────────────────────────────────────────────────────────────

@app.post(
    "/api/claims",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Claims"],
    summary="Submit a claim for automated risk triage",
)
def submit_claim(claim_in: ClaimCreate, db: Session = Depends(get_db)):
    """
    Submit a claim. Risk flags are computed **once at submission time** and
    frozen permanently — they are never recalculated, even hypothetically
    (DP3: frozen flags prevent text from laundering its own risk score).

    Returns the full claim object including riskLevel and structured flags
    immediately so submitters see the triage result right away.
    """
    risk_level, flags = analyze_risk(claim_in.text, claim_in.sourceLink)
    created = crud.create_claim(
        db=db,
        claim_in=claim_in,
        risk_level=risk_level,
        flags=flags,
    )
    return created


# ── Public feed ────────────────────────────────────────────────────────────────

@app.get(
    "/api/claims",
    response_model=List[ClaimResponse],
    tags=["Claims"],
    summary="Get public feed (DP1 ordered, filterable by category & status)",
)
def get_claims_feed(
    category: Optional[str] = Query(None, description="Filter by category: Politics | Health | Finance | Other"),
    status_filter: Optional[str] = Query(None, alias="status", description='Filter by status: "Unverified" | "Verified True" | "False" | "Misleading"'),
    db: Session = Depends(get_db),
):
    """
    Returns all claims in DP1 order:
      Tier 1 — Unverified + High Risk (newest first)
      Tier 2 — Unverified + Normal (newest first)
      Tier 3 — Reviewed claims, any status (newest first)

    Both filters are optional and combinable.
    """
    return crud.get_claims(db=db, category=category, status=status_filter)


# ── Detail view ────────────────────────────────────────────────────────────────

@app.get(
    "/api/claims/{claim_id}",
    response_model=ClaimResponse,
    tags=["Claims"],
    summary="Get full claim detail",
)
def get_claim_detail(claim_id: int, db: Session = Depends(get_db)):
    """
    Returns full claim detail including all risk flags with reasons,
    reviewerNote, submittedAt, sourcePlatform, category, sourceLink,
    current status, and reviewedAt (if reviewed).
    """
    claim = crud.get_claim(db=db, claim_id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found.")
    return claim


# ── Review workflow ────────────────────────────────────────────────────────────

@app.patch(
    "/api/claims/{claim_id}/review",
    response_model=ClaimResponse,
    tags=["Claims"],
    summary="Submit human review decision",
)
async def review_claim_endpoint(
    claim_id: int,
    review_in: ClaimReview,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Move a claim from any status to 'Verified True', 'False', or 'Misleading'.
    reviewerNote is required and non-empty.

    Re-reviewing is allowed — the PATCH overwrites status + reviewerNote + reviewedAt.

    **Immutability (DP3)**: Rejected with 400 if the body includes any of:
    text, sourcePlatform, category, sourceLink.
    Flags are also frozen and cannot be changed via any endpoint.

    Returns 404 if claim not found.
    Returns 400 if status invalid, reviewerNote empty, or immutable fields present.
    """
    # Parse raw body to check for immutable-field tampering
    try:
        raw_body: Dict[str, Any] = await request.json()
    except Exception:
        raw_body = {}

    forbidden = set(raw_body.keys()) & IMMUTABLE_FIELDS
    if forbidden:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Fields {sorted(forbidden)} are immutable and cannot be changed via review. "
                "To correct original claim text, submit a new claim."
            ),
        )

    claim = crud.get_claim(db=db, claim_id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found.")

    updated = crud.review_claim(db=db, claim_id=claim_id, review_in=review_in, raw_body=raw_body)
    return updated


# ── Serve built frontend (unified deployment) ──────────────────────────────────

FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
