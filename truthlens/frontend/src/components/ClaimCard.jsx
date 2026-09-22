import React from 'react';
import { RiskBadge, StatusBadge, FlagChip } from './RiskBadge';
import { Clock, Globe, ArrowUpRight, MessageSquare, AlertTriangle } from 'lucide-react';

export default function ClaimCard({ claim, onSelect }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  const isUnverifiedHighRisk = claim.status === 'Unverified' && claim.riskLevel === 'High Risk';
  const isReviewed = claim.status !== 'Unverified';

  return (
    <div
      className={`claim-card ${isUnverifiedHighRisk ? 'claim-card-high-risk' : ''} ${isReviewed ? 'claim-card-reviewed' : ''}`}
      onClick={() => onSelect(claim)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(claim);
      }}
    >
      <div className="card-top-row">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="platform-tag">{claim.sourcePlatform}</span>
          <span className="category-tag">{claim.category}</span>
          <span className="claim-id-tag">#{claim.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge level={claim.riskLevel} />
          <StatusBadge status={claim.status} />
        </div>
      </div>

      <p className="claim-card-text">
        {claim.text}
      </p>

      {/* Risk Flags — compact tags on feed cards */}
      {claim.flags && claim.flags.length > 0 && (
        <div className="card-flags-row">
          <span className="flags-label">Risk Signals:</span>
          {claim.flags.map((flag, i) => (
            <FlagChip key={i} flag={flag} showReason={false} />
          ))}
        </div>
      )}

      {claim.reviewerNote && (
        <div className="card-review-snippet">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-700 italic line-clamp-1">
            Reviewer: &ldquo;{claim.reviewerNote}&rdquo;
          </p>
        </div>
      )}

      <div className="card-bottom-row">
        <div className="card-timestamp">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTime(claim.submittedAt)}</span>
        </div>

        <div className="card-action-link">
          <span>Inspect &amp; Review</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
