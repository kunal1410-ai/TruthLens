# TruthLens — Architectural Decision Points

## DP1 — Feed Order

### Decision
The public claims feed uses a strict **3-tier ordering** computed server-side:

- **Tier 1**: Unverified + High Risk claims, sorted newest-first within the tier.
- **Tier 2**: Unverified + Normal claims, sorted newest-first within the tier.
- **Tier 3**: All reviewed claims (Verified True, False, or Misleading), sorted newest-first.

### Why
The feed's primary job is triage — surfacing what still needs a human decision. Once a human reviewer has rendered a verdict (any verdict), that claim has already received attention and should not continue to compete for reviewer eyeballs. Burying reviewed claims *below all unverified ones*, regardless of their original risk level, keeps the feed focused on its actual mission rather than functioning as a static risk leaderboard. Within the unverified tier, High Risk claims appear before Normal ones because two or more simultaneous risk signals indicate a higher likelihood of viral spread and potential harm before a verdict arrives. Recency is the tiebreaker within each tier, because misinformation is most dangerous in its first hours of circulation.

---

## DP2 — Visibility

### Decision
All submitted claims are publicly visible at all times — no suppression, no quarantine. However, visibility is **graduated by combined status and risk**:

- **Unverified + High Risk**: displayed with a full-width, warning-colored red banner strip above the claim body — unmistakably loud, not just a small pill.
- **Unverified + Normal**: displayed with a smaller amber "awaiting verification" indicator — visible but less alarming.
- **Reviewed claims**: displayed with normal card styling at reduced visual weight — still present but clearly de-prioritized.

### Why
Suppressing unverified claims entirely trades one harm for another: hiding emerging information prevents citizens who need it from seeing it, and creates the false impression that the platform has already verified everything it shows. Transparency is more honest. At the same time, showing every claim identically — as if all were equally reliable — is also deceptive. Graduated visual signals let users calibrate their own trust: a full red warning banner on Unverified + High Risk claims signals "this needs scrutiny before you share it" without forcing the platform to pretend it has already checked the claim. The severity of the visual treatment is scaled to the actual triage priority, not just a binary verified/unverified toggle.

---

## DP3 — Editing

### Decision
Claim text, sourcePlatform, category, and sourceLink are **permanently immutable** once submitted. There is no edit endpoint, no edit button anywhere in the UI, and the PATCH `/review` endpoint actively rejects (400) any request body that includes these fields. Corrections must be filed as a brand-new claim submission.

Risk flags are also **frozen at submission time and never recalculated** — not even hypothetically. The API stores flags as a JSON blob that is never touched after creation, regardless of any downstream operations on the claim.

### Why
Fact-checking systems live or die on their audit trail. A human reviewer's verdict ("False", "Verified True", "Misleading") is a statement *about the specific text that was submitted*. Allowing that text to change would break the chain of custody: the reviewer would have evaluated something that no longer exists in the system, and the verdict would become meaningless or, worse, misleading. Flags must be frozen for the same reason: a system that recomputes flags on edited text would allow a bad actor to quietly launder a claim's risk score by editing out the sensational keywords after initial submission, while keeping the original (now-severed) verdict. Immutability of both text and flags is the only design that preserves the evidentiary integrity the platform exists to protect.
