import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, field_validator, model_validator


# ── Enums (exact strings from spec) ──────────────────────────────────────────
VALID_PLATFORMS = {"WhatsApp", "X", "Instagram", "Other"}
VALID_CATEGORIES = {"Politics", "Health", "Finance", "Other"}
# Exact status strings per spec: used in API JSON AND UI badge text
VALID_REVIEW_STATUSES = {"Verified True", "False", "Misleading"}

# Fields that are permanently immutable — PATCH /review must reject any body containing these
IMMUTABLE_FIELDS = {"text", "sourcePlatform", "category", "sourceLink"}


# ── Request schemas ───────────────────────────────────────────────────────────

class ClaimCreate(BaseModel):
    """
    POST /api/claims body.
    camelCase keys match the spec: sourcePlatform, sourceLink.
    """
    model_config = ConfigDict(populate_by_name=True)

    text: str
    sourcePlatform: str
    category: str
    sourceLink: Optional[str] = None

    @field_validator("text")
    @classmethod
    def validate_text_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Claim text cannot be empty.")
        return v  # preserve original text exactly — do NOT strip (DP3: byte-for-byte immutability)

    @field_validator("sourcePlatform")
    @classmethod
    def validate_platform(cls, v: str) -> str:
        if v.strip() not in VALID_PLATFORMS:
            raise ValueError(f"sourcePlatform must be one of {sorted(VALID_PLATFORMS)}")
        return v.strip()

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v.strip() not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(VALID_CATEGORIES)}")
        return v.strip()


class ClaimReview(BaseModel):
    """
    PATCH /api/claims/:id/review body.
    status must be one of the three exact spec strings.
    reviewerNote is required and non-empty.
    """
    model_config = ConfigDict(populate_by_name=True)

    status: str
    reviewerNote: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_REVIEW_STATUSES:
            raise ValueError(
                f'status must be one of: "Verified True", "False", "Misleading"'
            )
        return v

    @field_validator("reviewerNote")
    @classmethod
    def validate_reviewer_note(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("reviewerNote is required and cannot be empty.")
        return v.strip()


# ── Flag schema ───────────────────────────────────────────────────────────────

class FlagDetail(BaseModel):
    type: str
    reason: str


# ── Response schema ───────────────────────────────────────────────────────────

class ClaimResponse(BaseModel):
    """
    Full claim object returned by all endpoints.
    Exposes camelCase keys: sourcePlatform, sourceLink, riskLevel,
    reviewerNote, submittedAt, reviewedAt.
    """
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    text: str
    sourcePlatform: str
    category: str
    sourceLink: Optional[str] = None
    # Exact spec status values: "Unverified" | "Verified True" | "False" | "Misleading"
    status: str
    # Exact spec risk values: "High Risk" | "Normal"
    riskLevel: str
    # Structured flags: [{"type": "Sensational", "reason": "Contains \"breaking\""}, ...]
    flags: List[FlagDetail]
    reviewerNote: Optional[str] = None
    submittedAt: datetime
    reviewedAt: Optional[datetime] = None

    @field_validator("flags", mode="before")
    @classmethod
    def parse_flags(cls, v):
        """Parse flags from JSON string (stored in SQLite) or list."""
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
            except Exception:
                return []
            # Handle legacy plain-string lists
            if isinstance(parsed, list):
                result = []
                for item in parsed:
                    if isinstance(item, dict):
                        result.append(item)
                    elif isinstance(item, str):
                        result.append({"type": item, "reason": ""})
                return result
            return []
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, dict):
                    result.append(item)
                elif isinstance(item, str):
                    result.append({"type": item, "reason": ""})
            return result
        return []

    @field_validator("sourcePlatform", mode="before")
    @classmethod
    def map_platform_field(cls, v):
        """Accept DB column value (source_platform) transparently."""
        return v

    @field_validator("sourceLink", mode="before")
    @classmethod
    def map_source_link_field(cls, v):
        return v

    @field_validator("riskLevel", mode="before")
    @classmethod
    def map_risk_level_field(cls, v):
        return v

    @field_validator("reviewerNote", mode="before")
    @classmethod
    def map_reviewer_note_field(cls, v):
        return v

    @field_validator("submittedAt", mode="before")
    @classmethod
    def map_submitted_at_field(cls, v):
        return v

    @field_validator("reviewedAt", mode="before")
    @classmethod
    def map_reviewed_at_field(cls, v):
        return v
