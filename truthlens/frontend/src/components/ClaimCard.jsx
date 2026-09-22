import React from 'react';
import { RiskBadge, StatusBadge, FlagChip } from './RiskBadge';
import { PlatformBadge } from './PlatformIcon';
import { Clock, ArrowUpRight, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ClaimCard({ claim, onSelect }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const isUnverifiedHighRisk = claim.status === 'Unverified' && claim.riskLevel === 'High Risk';
  const isReviewed = claim.status !== 'Unverified';

  return (
    <article
      className={`claim-card ${isUnverifiedHighRisk ? 'claim-card-high-risk' : ''}`}
      onClick={() => onSelect(claim)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(claim);
        }
      }}
      aria-label={`Claim #${claim.id}: ${claim.text.slice(0, 60)}...`}
    >
      {/* Priority Triage Banner for High Risk + Unverified */}
      {isUnverifiedHighRisk && (
        <div className="high-risk-alert-bar">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>Priority Triage — High Urgency Claim</span>
          <span className="high-risk-alert-subtext">Needs Reviewer Verification</span>
        </div>
      )}

      <div className="card-top-row">
        <div className="card-meta-tags">
          <PlatformBadge platform={claim.sourcePlatform} />
          <span className="category-tag">{claim.category}</span>
          <span className="claim-id-tag">#{claim.id}</span>
        </div>

        <div className="card-badges-group">
          <RiskBadge level={claim.riskLevel} />
          <StatusBadge status={claim.status} />
        </div>
      </div>

      <p className="claim-card-text">
        {claim.text}
      </p>

      {/* Structured Risk Signals / Flags */}
      {claim.flags && claim.flags.length > 0 && (
        <div className="card-flags-row">
          <span className="flags-label">Signals:</span>
          {claim.flags.map((flag, i) => (
            <FlagChip key={i} flag={flag} />
          ))}
        </div>
      )}

      {/* Human Reviewer Note Preview */}
      {claim.reviewerNote && (
        <div className="card-review-snippet">
          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p>
              <strong>Reviewer Finding:</strong> &ldquo;{claim.reviewerNote}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="card-bottom-row">
        <div className="card-timestamp">
          <Clock className="w-3.5 h-3.5" />
          <span>Submitted {formatTime(claim.submittedAt)}</span>
        </div>

        <div className="card-action-link">
          <span>{isReviewed ? 'View Verdict & Details' : 'Triage & Verify'}</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
