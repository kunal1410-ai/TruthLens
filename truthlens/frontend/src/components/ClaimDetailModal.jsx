import React, { useState, useEffect } from 'react';
import { reviewClaim, getClaim } from '../api';
import { RiskBadge, StatusBadge, FlagChip } from './RiskBadge';
import {
  X,
  Clock,
  Globe,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function ClaimDetailModal({ claimId, onClose, onClaimUpdated }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form State — use exact spec status strings
  const [selectedStatus, setSelectedStatus] = useState('Verified True');
  const [reviewerNote, setReviewerNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClaim(claimId);
      setClaim(data);
      if (data.reviewerNote) {
        setReviewerNote(data.reviewerNote);
      }
      if (data.status && data.status !== 'Unverified') {
        setSelectedStatus(data.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load claim detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) fetchDetail();
  }, [claimId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    if (!reviewerNote.trim()) {
      setError('Reviewer note is required.');
      return;
    }

    setSubmittingReview(true);
    setError(null);
    setReviewSuccess(false);

    try {
      const updated = await reviewClaim(claimId, {
        status: selectedStatus,
        reviewerNote: reviewerNote.trim(),
      });
      setClaim(updated);
      setReviewSuccess(true);
      if (onClaimUpdated) onClaimUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  if (!claimId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className="claim-id-tag">Claim #{claimId}</span>
            {claim && (
              <>
                <span className="platform-tag">{claim.sourcePlatform}</span>
                <span className="category-tag">{claim.category}</span>
              </>
            )}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading claim details...</div>
          ) : error && !claim ? (
            <div className="alert-error m-4"><span>{error}</span></div>
          ) : claim ? (
            <>
              {/* Triage Overview Bar */}
              <div className="detail-triage-bar">
                <div className="detail-triage-item">
                  <span className="detail-meta-label">Calculated Risk:</span>
                  <RiskBadge level={claim.riskLevel} />
                </div>
                <div className="detail-triage-item">
                  <span className="detail-meta-label">Verification Status:</span>
                  <StatusBadge status={claim.status} />
                </div>
              </div>

              {/* 🔒 Immutable Claim Text (DP3) */}
              <div className="detail-section">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="section-title">Submitted Claim Text</span>
                  <div
                    className="immutable-badge"
                    title="Original claim text is permanently locked (DP3). Flags are also frozen — never recalculated, even hypothetically — to prevent text from laundering its own risk score."
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>🔒 Immutable</span>
                  </div>
                </div>
                <div className="claim-text-display">
                  &ldquo;{claim.text}&rdquo;
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Per DP3, claim text and risk flags are permanently frozen at submission time. Corrections require a brand-new claim submission.
                </span>
              </div>

              {/* Source & Metadata Grid */}
              <div className="detail-meta-grid">
                <div className="meta-box">
                  <span className="meta-box-label">Source Link</span>
                  {claim.sourceLink ? (
                    <a
                      href={claim.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{claim.sourceLink}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-amber-800 text-xs italic font-medium">
                      ⚠️ No source provided (Unsourced flag active)
                    </span>
                  )}
                </div>

                {/* Risk Flags — always show type + reason */}
                <div className="meta-box">
                  <span className="meta-box-label">Triggered Risk Flags</span>
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    {claim.flags && claim.flags.length > 0 ? (
                      claim.flags.map((flag, i) => (
                        <FlagChip key={i} flag={flag} />
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No flags triggered</span>
                    )}
                  </div>
                </div>

                <div className="meta-box">
                  <span className="meta-box-label">Submitted At</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimestamp(claim.submittedAt)}</span>
                  </div>
                </div>

                <div className="meta-box">
                  <span className="meta-box-label">Reviewed At</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimestamp(claim.reviewedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Existing Reviewer Note */}
              {claim.reviewerNote && (
                <div className="existing-review-box">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Human Review Note on Record:</span>
                  </div>
                  <p className="text-sm text-slate-800 bg-white p-3 rounded border border-blue-200">
                    {claim.reviewerNote}
                  </p>
                </div>
              )}

              {/* Human Review Form */}
              <div className="human-review-card">
                <div className="review-card-header">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-base">Human Review Decision</h3>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                    Manual Verification Workflow
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3">
                  Algorithms assess triage urgency; only human fact-checkers determine truth. Select the final verification status below. Re-reviewing is allowed — your decision will overwrite the previous verdict.
                </p>

                {reviewSuccess && (
                  <div className="alert-success">
                    <Check className="w-4 h-4" />
                    <span>Review decision saved! Status updated to "{claim.status}".</span>
                  </div>
                )}

                {error && (
                  <div className="alert-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Status Selection — exact spec strings */}
                  <div>
                    <label className="form-label mb-1.5 block">Select Veracity Status:</label>
                    <div className="status-selector-grid">
                      <button
                        type="button"
                        className={`status-btn status-btn-true ${selectedStatus === 'Verified True' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('Verified True')}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-bold text-xs">Verified True</div>
                          <div className="text-[10px] opacity-80">Supported by reliable sources</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`status-btn status-btn-false ${selectedStatus === 'False' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('False')}
                      >
                        <XCircle className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-bold text-xs">False</div>
                          <div className="text-[10px] opacity-80">Refuted by credible evidence</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`status-btn status-btn-misleading ${selectedStatus === 'Misleading' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('Misleading')}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-bold text-xs">Misleading</div>
                          <div className="text-[10px] opacity-80">Out of context or exaggerated</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Reviewer Note — required */}
                  <div className="form-group">
                    <label htmlFor="reviewer-note" className="form-label">
                      Reviewer Note <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reviewer-note"
                      rows={3}
                      className="form-textarea"
                      placeholder="Explain the finding, citing fact-checking sources, public records, or context..."
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      required
                    />
                    <span className="form-hint">Required — must explain the basis for your verdict.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className="preset-btn" onClick={onClose}>
                      Close
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={submittingReview || !reviewerNote.trim()}
                    >
                      {submittingReview ? (
                        <span>Saving Decision...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
