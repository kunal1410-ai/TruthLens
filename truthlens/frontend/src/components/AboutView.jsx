import React from 'react';
import {
  Shield,
  ArrowUpDown,
  Eye,
  Lock,
  Flame,
  CheckCircle2,
  FileText,
  Search,
  UserCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function AboutView({ onStartDemo }) {
  return (
    <div className="about-container">
      {/* Hero Header */}
      <div className="about-hero">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Triage Architecture &amp; Decision Framework</span>
        </div>
        <h1>How TruthLens Triages Misinformation</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
          Built on a fundamental principle: <strong className="text-slate-900">High Risk does NOT mean False</strong>. TruthLens neutralizes algorithmic bias by automating triage prioritization while preserving human judgment for factual truth.
        </p>
      </div>

      {/* The 5-Step Pipeline Flow */}
      <div className="flow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="section-title">End-to-End Triage Workflow</span>
          <span className="text-xs text-slate-400">Step 1 through Step 5</span>
        </div>
        <div className="pipeline-grid">
          <div className="pipeline-step">
            <div className="pipeline-num">1</div>
            <div className="pipeline-title">Submit Claim</div>
            <div className="pipeline-desc">User pastes viral message, selects platform &amp; optional source URL.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">2</div>
            <div className="pipeline-title">Deterministic Risk</div>
            <div className="pipeline-desc">Automated rules detect sensationalism, panic shouting, and missing citations.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">3</div>
            <div className="pipeline-title">Public Feed</div>
            <div className="pipeline-desc">Transparent queue surfaces high-risk urgency first under DP1 and DP2.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">4</div>
            <div className="pipeline-title">Audit Record</div>
            <div className="pipeline-desc">Submitted text is permanently immutable under DP3 to prevent risk laundering.</div>
          </div>
          <div className="pipeline-step">
            <div className="pipeline-num">5</div>
            <div className="pipeline-title">Human Verdict</div>
            <div className="pipeline-desc">Human reviewer marks True, False, or Misleading with factual citation note.</div>
          </div>
        </div>
      </div>

      {/* The Three Architectural Decisions (DP1, DP2, DP3) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-600" />
          <h2 className="section-title text-slate-900 text-sm">The Three Core Decision Points</h2>
        </div>
        <div className="decisions-grid">
          <div className="decision-card">
            <div className="decision-header">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">DP1 — Risk-First Ordering</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-3">
              The public queue sorts <strong>High Risk</strong> claims above normal claims. When fact-checkers open the platform, viral urgency is prioritized over older or low-risk submissions.
            </p>
          </div>

          <div className="decision-card">
            <div className="decision-header">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">DP2 — Unverified Visibility</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-3">
              Unverified claims remain publicly visible with prominent warnings. Quarantining claims creates an information vacuum; transparent warning tags foster community awareness.
            </p>
          </div>

          <div className="decision-card">
            <div className="decision-header">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">DP3 — Immutable Claim Text</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-3">
              Submitted text and automated risk flags are frozen permanently. Allowing edits would enable malicious actors to launder claim text after a high-risk rating is applied.
            </p>
          </div>
        </div>
      </div>

      {/* Deterministic Risk Rules */}
      <div className="flow-card">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-red-600" />
          <h2 className="section-title text-slate-900 text-sm">Deterministic Risk Engine Rules</h2>
        </div>
        <div className="rules-grid">
          <div className="rule-item">
            <span className="rule-badge bg-orange-100 text-orange-800">Rule 1 — Sensationalism</span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Triggers when text matches alarmist viral triggers: <code className="rule-code">breaking</code>, <code className="rule-code">shocking</code>, or <code className="rule-code">share before deleted</code>.
            </p>
          </div>

          <div className="rule-item">
            <span className="rule-badge bg-purple-100 text-purple-800">Rule 2 — Shouting</span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Triggers if uppercase letters exceed <strong>50%</strong> of all alphabetic characters (minimum 5 letters), detecting panic capitalization.
            </p>
          </div>

          <div className="rule-item">
            <span className="rule-badge bg-amber-100 text-amber-800">Rule 3 — Unsourced</span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Triggers if no source link is provided. Credible evidence links provide accountability and prevent unsubstantiated spread.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-700">
            <strong>Triage Scoring Formula:</strong> 2 or more active flags &rarr; <span style={{ color: '#dc2626', fontWeight: 700 }}>HIGH RISK</span>. 0 or 1 flag &rarr; <span style={{ color: '#059669', fontWeight: 700 }}>NORMAL</span>.
          </div>
          {onStartDemo && (
            <button
              type="button"
              className="view-feed-btn"
              onClick={onStartDemo}
            >
              <span>Test Submit Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
