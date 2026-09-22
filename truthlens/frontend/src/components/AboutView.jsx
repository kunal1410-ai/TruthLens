import React from 'react';
import { Shield, AlertTriangle, ArrowUpDown, Eye, Lock, CheckCircle, Flame, Layers } from 'lucide-react';

export default function AboutView({ onStartDemo }) {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          Hackathon Architecture & Decision Guide
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How TruthLens Triages Misinformation
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-2xl mx-auto">
          Built on the core principle: <strong className="text-slate-900">Risk does not equal Falsehood</strong>. TruthLens automates triage prioritization so human reviewers can act where harm spreads fastest.
        </p>
      </div>

      {/* Five Boxes Flow */}
      <div className="flow-card">
        <h2 className="section-title mb-4 text-center">The 5 Core Pipeline Boxes</h2>
        <div className="pipeline-grid">
          <div className="pipeline-step">
            <div className="pipeline-num">1</div>
            <div className="pipeline-title">Submit Claim</div>
            <div className="pipeline-desc">User pastes text, selects platform & category, optional source.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">2</div>
            <div className="pipeline-title">Analyze Risk</div>
            <div className="pipeline-desc">Deterministic 3-rule engine flags sensationalism, shouting, & unsourced content.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">3</div>
            <div className="pipeline-title">Public Feed</div>
            <div className="pipeline-desc">Transparent feed with DP1 (Risk-first ordering) and DP2 (Unverified public visibility).</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">4</div>
            <div className="pipeline-title">Detail View</div>
            <div className="pipeline-desc">Inspect metadata, timestamps, and DP3 (Immutable original claim text).</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">5</div>
            <div className="pipeline-title">Human Review</div>
            <div className="pipeline-desc">Reviewer selects Verified True, False, or Misleading with contextual notes.</div>
          </div>
        </div>
      </div>

      {/* The 3 Decision Points */}
      <h2 className="section-title text-xl mb-4 mt-8">The Three Architectural Decisions</h2>
      <div className="decisions-grid">
        <div className="decision-card">
          <div className="decision-header">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">DP1 — Risk-First Ordering</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2">
            Feed sorts HIGH risk claims above NORMAL claims, regardless of submission timestamp. Within each risk tier, recency applies. Triage demands addressing viral urgency before harmless recent posts.
          </p>
        </div>

        <div className="decision-card">
          <div className="decision-header">
            <Eye className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">DP2 — Unverified Visibility</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2">
            Unverified claims are displayed openly in the public feed with a high-visibility ⚠️ UNVERIFIED warning. Quarantining claims slows community awareness; transparent labelling encourages vigilance.
          </p>
        </div>

        <div className="decision-card">
          <div className="decision-header">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">DP3 — Immutable Claim Text</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2">
            Once submitted, claim text is permanently locked in the database. Fact-checkers can only append review status and notes. Any altered claim must be submitted as a new record to protect audit integrity.
          </p>
        </div>
      </div>

      {/* The 3 Risk Engine Rules */}
      <div className="rules-section mt-8">
        <h2 className="section-title text-xl mb-4">Deterministic Risk Engine Rules</h2>
        <div className="rules-grid">
          <div className="rule-item">
            <div className="rule-badge bg-orange-100 text-orange-800">Rule 1 — Sensational</div>
            <p className="text-xs text-slate-700 mt-2">
              Triggers if text contains: <code className="rule-code">&quot;breaking&quot;</code>, <code className="rule-code">&quot;shocking&quot;</code>, or <code className="rule-code">&quot;share before deleted&quot;</code> (case-insensitive).
            </p>
          </div>

          <div className="rule-item">
            <div className="rule-badge bg-purple-100 text-purple-800">Rule 2 — Shouting</div>
            <p className="text-xs text-slate-700 mt-2">
              Triggers if uppercase letters exceed <strong>50%</strong> of all alphabetic characters, indicating panic capitalization or alarmist phrasing.
            </p>
          </div>

          <div className="rule-item">
            <div className="rule-badge bg-amber-100 text-amber-800">Rule 3 — Unsourced</div>
            <p className="text-xs text-slate-700 mt-2">
              Triggers if the submitter does not provide a valid verification source link (empty or missing URL).
            </p>
          </div>
        </div>

        <div className="triage-callout mt-4">
          <Flame className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-xs text-slate-800">
            <strong>Triage Formula:</strong> 2 or more flags &rarr; <span className="text-red-700 font-bold">HIGH RISK</span>. 0 or 1 flag &rarr; <span className="text-emerald-700 font-bold">NORMAL RISK</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
