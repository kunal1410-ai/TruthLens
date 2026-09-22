"""
TruthLens Hackathon Criteria Verification Script
Runs against a live server. Default: http://localhost:8000
Usage: python verify_hackathon_criteria.py [base_url]
"""
import sys
import json
import urllib.request
import urllib.error

BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8000"

PASS = "✅ PASS"
FAIL = "❌ FAIL"
results = []


def req(method, path, body=None):
    url = BASE_URL + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if body else {}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def check(label, passed, detail=""):
    status = PASS if passed else FAIL
    results.append((status, label, detail))
    print(f"  {status}  {label}")
    if not passed and detail:
        print(f"       ↳ {detail}")


print(f"\n{'='*60}")
print(f"  TruthLens Hackathon Criteria Verifier")
print(f"  Target: {BASE_URL}")
print(f"{'='*60}\n")

# ── 1. Health endpoint ──────────────────────────────────────────
print("[ Health ]")
status, body = req("GET", "/api/health")
check("GET /api/health returns 200", status == 200)
check("Body is {ok: true}", body == {"ok": True}, f"got {body}")

# ── 2. Submit a claim ───────────────────────────────────────────
print("\n[ Submit a Claim ]")
status, claim = req("POST", "/api/claims", {
    "text": "breaking news about election results",
    "sourcePlatform": "X",
    "category": "Politics",
})
check("POST /api/claims returns 201", status == 201)
check("Response has camelCase fields", "sourcePlatform" in claim and "riskLevel" in claim, str(list(claim.keys())))
check("Initial status is 'Unverified'", claim.get("status") == "Unverified", f"got: {claim.get('status')}")
check("riskLevel is 'High Risk'", claim.get("riskLevel") == "High Risk", f"got: {claim.get('riskLevel')}")
check("Flags is a list of objects", isinstance(claim.get("flags"), list) and all(isinstance(f, dict) for f in claim["flags"]), str(claim.get("flags")))
types = [f["type"] for f in claim.get("flags", [])]
check("Sensational flag fired", "Sensational" in types, f"flags: {types}")
check("Unsourced flag fired", "Unsourced" in types, f"flags: {types}")
check("Every flag has a non-empty reason", all(f.get("reason", "") for f in claim.get("flags", [])), str(claim.get("flags")))
CLAIM_ID = claim.get("id")

# ── 3. Invalid enum rejected ────────────────────────────────────
print("\n[ Validation ]")
status, _ = req("POST", "/api/claims", {"text": "x", "sourcePlatform": "TikTok", "category": "Politics"})
check("Invalid sourcePlatform → 422", status == 422, f"got {status}")
status, _ = req("POST", "/api/claims", {"text": "x", "sourcePlatform": "X", "category": "Sports"})
check("Invalid category → 422", status == 422, f"got {status}")

# ── 4. Risk engine edge cases ───────────────────────────────────
print("\n[ Risk Engine ]")
_, c = req("POST", "/api/claims", {"text": "BREAKING", "sourcePlatform": "X", "category": "Politics"})
check("BREAKING (uppercase) → Sensational", "Sensational" in [f["type"] for f in c.get("flags", [])], str(c.get("flags")))

_, c = req("POST", "/api/claims", {"text": "Breaking: news", "sourcePlatform": "X", "category": "Politics"})
check("Breaking (titlecase) → Sensational", "Sensational" in [f["type"] for f in c.get("flags", [])], str(c.get("flags")))

_, c = req("POST", "/api/claims", {"text": "breaking news", "sourcePlatform": "X", "category": "Politics"})
check("breaking (lowercase) → Sensational", "Sensational" in [f["type"] for f in c.get("flags", [])], str(c.get("flags")))

_, c = req("POST", "/api/claims", {"text": "NASA DISCOVERS WATER", "sourcePlatform": "X", "category": "Other"})
ftypes = [f["type"] for f in c.get("flags", [])]
check("NASA DISCOVERS WATER → Shouting (not Sensational)", "Shouting" in ftypes and "Sensational" not in ftypes, f"flags: {ftypes}")

_, c = req("POST", "/api/claims", {"text": "12345 !!! ???", "sourcePlatform": "Other", "category": "Other"})
ftypes = [f["type"] for f in c.get("flags", [])]
check("'12345 !!! ???' → Shouting NOT triggered", "Shouting" not in ftypes, f"flags: {ftypes}")

_, c = req("POST", "/api/claims", {"text": "Normal sentence here.", "sourcePlatform": "X", "category": "Politics"})
check("Normal text + no source → exactly 1 flag (Normal risk)", c.get("riskLevel") == "Normal" and len(c.get("flags", [])) == 1, f"riskLevel={c.get('riskLevel')}, flags={len(c.get('flags', []))}")

_, c = req("POST", "/api/claims", {
    "text": "Normal sentence here.",
    "sourcePlatform": "X",
    "category": "Politics",
    "sourceLink": "https://example.com",
})
check("Normal text + source → 0 flags, Normal risk", c.get("riskLevel") == "Normal" and len(c.get("flags", [])) == 0, f"riskLevel={c.get('riskLevel')}, flags={c.get('flags')}")

# ── 5. Detail view ──────────────────────────────────────────────
print("\n[ Detail View ]")
status, detail = req("GET", f"/api/claims/{CLAIM_ID}")
check("GET /api/claims/:id returns 200", status == 200)
required_fields = ["id", "text", "sourcePlatform", "category", "sourceLink", "status", "riskLevel", "flags", "reviewerNote", "submittedAt", "reviewedAt"]
missing = [f for f in required_fields if f not in detail]
check("All required fields present", not missing, f"missing: {missing}")
check("No snake_case fields leaked", "source_platform" not in detail and "risk_level" not in detail, str(list(detail.keys())))
status, _ = req("GET", "/api/claims/99999")
check("GET /api/claims/99999 → 404", status == 404, f"got {status}")

# ── 6. Review workflow ──────────────────────────────────────────
print("\n[ Review Workflow ]")
status, reviewed = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {
    "status": "Verified True",
    "reviewerNote": "Confirmed by official sources.",
})
check("PATCH /api/claims/:id/review returns 200", status == 200)
check("status updated to 'Verified True'", reviewed.get("status") == "Verified True", f"got: {reviewed.get('status')}")
check("reviewerNote stored", reviewed.get("reviewerNote") == "Confirmed by official sources.")
check("reviewedAt set", reviewed.get("reviewedAt") is not None)
check("text unchanged (byte-for-byte)", reviewed.get("text") == "breaking news about election results", f"got: {reviewed.get('text')}")

# Re-review allowed
status, re_reviewed = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {
    "status": "False",
    "reviewerNote": "Correction after further review.",
})
check("Re-review allowed (status overwritten)", status == 200 and re_reviewed.get("status") == "False", f"got status={status}, verdict={re_reviewed.get('status')}")

# Invalid status
status, _ = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {"status": "VERIFIED_TRUE", "reviewerNote": "Note."})
check("Invalid status (VERIFIED_TRUE) → 422", status == 422, f"got {status}")

# Empty reviewerNote
status, _ = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {"status": "False", "reviewerNote": ""})
check("Empty reviewerNote → 422", status == 422, f"got {status}")

# Immutable field text
status, body = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {"status": "False", "reviewerNote": "Note.", "text": "Injected"})
check("Immutable 'text' in body → 400", status == 400, f"got {status}: {body}")

# Immutable field sourcePlatform
status, _ = req("PATCH", f"/api/claims/{CLAIM_ID}/review", {"status": "False", "reviewerNote": "Note.", "sourcePlatform": "Instagram"})
check("Immutable 'sourcePlatform' in body → 400", status == 400, f"got {status}")

# 404 for missing claim
status, _ = req("PATCH", "/api/claims/99999/review", {"status": "False", "reviewerNote": "Note."})
check("PATCH on missing claim → 404", status == 404, f"got {status}")

# ── 7. Feed ordering (DP1) ──────────────────────────────────────
print("\n[ Feed Ordering — DP1 ]")
status, feed = req("GET", "/api/claims")
check("GET /api/claims returns 200", status == 200)

# Verify 3-tier order
prev_tier = 0
tier_ok = True
for c in feed:
    if c["status"] == "Unverified" and c["riskLevel"] == "High Risk":
        tier = 1
    elif c["status"] == "Unverified":
        tier = 2
    else:
        tier = 3
    if tier < prev_tier:
        tier_ok = False
        break
    prev_tier = tier
check("DP1 3-tier ordering: T1→T2→T3 never violated", tier_ok, f"Feed order: {[(c['status'],c['riskLevel']) for c in feed[:6]]}")

# ── 8. Filters ──────────────────────────────────────────────────
print("\n[ Filters ]")
status, health_claims = req("GET", "/api/claims?category=Health")
check("Filter by category=Health works", all(c["category"] == "Health" for c in health_claims), f"got categories: {set(c['category'] for c in health_claims)}")

status, vt_claims = req("GET", "/api/claims?status=Verified%20True")
check("Filter by status='Verified True' works", all(c["status"] == "Verified True" for c in vt_claims), f"got statuses: {set(c['status'] for c in vt_claims)}")

status, combo = req("GET", "/api/claims?category=Finance&status=Verified%20True")
check("Combined category+status filter works", all(c["category"] == "Finance" and c["status"] == "Verified True" for c in combo) if combo else True)

# ── Summary ─────────────────────────────────────────────────────
passed = sum(1 for r in results if r[0] == PASS)
total = len(results)
print(f"\n{'='*60}")
print(f"  Results: {passed}/{total} passed")
if passed == total:
    print("  🎉 All criteria verified!")
else:
    print(f"  ⚠️  {total - passed} check(s) failed — see ❌ above")
print(f"{'='*60}\n")
sys.exit(0 if passed == total else 1)
