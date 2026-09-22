"""
TruthLens Risk Analyzer Engine
Deterministic 3-rule risk analyzer for triaging claims:
  1. Sensational — contains "breaking", "shocking", or "share before deleted" (case-insensitive)
  2. Shouting    — uppercase alphabetic chars / total alphabetic chars > 50%
                   AND there are at least 5 alphabetic characters total
  3. Unsourced   — sourceLink is missing, empty, or whitespace-only
  4. Risk level  — "High Risk" if 2+ flags fire, else "Normal"

Flags are frozen at submission time and NEVER recalculated — even on a hypothetical
edit — because a system that recomputes flags on edited text would let manipulated
text quietly launder its own risk score (DP3 rationale).
"""
from typing import List, Tuple, Optional, Dict, Any


SENSATIONAL_KEYWORDS = [
    "breaking",
    "shocking",
    "share before deleted",
]


def check_sensational(text: str) -> Tuple[bool, str]:
    """
    Returns (triggered: bool, reason: str).
    True if text contains any sensational keyword (case-insensitive substring match).
    """
    if not text:
        return False, ""
    lower_text = text.lower()
    for keyword in SENSATIONAL_KEYWORDS:
        if keyword in lower_text:
            return True, f'Contains "{keyword}"'
    return False, ""


def check_shouting(text: str) -> Tuple[bool, str]:
    """
    Returns (triggered: bool, reason: str).
    True if:
      - there are at least 5 alphabetic characters in text, AND
      - more than 50% of those alphabetic characters are uppercase.
    Digits, punctuation, whitespace, and emoji are ignored when computing the ratio.
    """
    if not text:
        return False, ""
    alpha_chars = [ch for ch in text if ch.isalpha()]
    total_alpha = len(alpha_chars)
    # Guard: must have at least 5 alphabetic characters (prevents "12345 !!! ???"-style false positives)
    if total_alpha < 5:
        return False, ""
    upper_count = sum(1 for ch in alpha_chars if ch.isupper())
    ratio = upper_count / total_alpha
    if ratio > 0.50:
        pct = int(ratio * 100)
        return True, f"{pct}% of alphabetic characters are uppercase (>{50}% threshold)"
    return False, ""


def check_unsourced(source_link: Optional[str]) -> Tuple[bool, str]:
    """Returns (triggered: bool, reason: str). True if sourceLink is absent or blank."""
    if source_link is None or len(source_link.strip()) == 0:
        return True, "No source link provided"
    return False, ""


def analyze_risk(
    text: str,
    source_link: Optional[str]
) -> Tuple[str, List[Dict[str, str]]]:
    """
    Analyze claim text and sourceLink against the 3 rules.

    Returns:
        riskLevel: "High Risk" if 2+ flags fired, else "Normal"
        flags:     list of {"type": str, "reason": str} — ALL fired flags,
                   regardless of risk level. A single flag is still shown.
    """
    flags: List[Dict[str, str]] = []

    sensational, s_reason = check_sensational(text)
    if sensational:
        flags.append({"type": "Sensational", "reason": s_reason})

    shouting, sh_reason = check_shouting(text)
    if shouting:
        flags.append({"type": "Shouting", "reason": sh_reason})

    unsourced, u_reason = check_unsourced(source_link)
    if unsourced:
        flags.append({"type": "Unsourced", "reason": u_reason})

    risk_level = "High Risk" if len(flags) >= 2 else "Normal"
    return risk_level, flags
