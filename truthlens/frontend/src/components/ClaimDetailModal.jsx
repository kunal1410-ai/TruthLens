import React, { useState, useEffect } from 'react';
import { reviewClaim, getClaim, getClaims } from '../api';
import { RiskBadge, StatusBadge, FlagChip } from './RiskBadge';
import {
  X,
  Clock,
  Globe,
  ExternalLink,
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  ArrowRight,
} from 'lucide-react';

export default function ClaimDetailModal({ claimId, onClose, onClaimUpdated, onNavigateClaim }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form State — use exact spec status strings
  const [selectedStatus, setSelectedStatus] = useState('Verified True');
  const [reviewerNote, setReviewerNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [noMoreClaims, setNoMoreClaims] = useState(false);

  const fetchDetail = async (idToFetch) => {
    setLoading(true);
    setError(null);
    setNoMoreClaims(false);
    try {
      const data = await getClaim(idToFetch);
      setClaim(data);
      if (data.reviewerNote) {
        setReviewerNote(data.reviewerNote);
      } else {
        setReviewerNote('');
      }
      if (data.status && data.status !== 'Unverified') {
        setSelectedStatus(data.status);
      } else {
        setSelectedStatus('Verified True');
      }
    } catch (err) {
      setError(err.message || 'Failed to load claim detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) {
      setReviewSuccess(false);
      fetchDetail(claimId);
    }
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

  const handleNextClaim = async () => {
    setError(null);
    try {
      const feedClaims = await getClaims();
      // feedClaims is returned in DP1 triage order (Tier 1 -> Tier 2 -> Tier 3)
      // Prefer the next UNVERIFIED claim that comes after currently reviewed claim
      const currentIndex = feedClaims.findIndex((c) => c.id === claimId);
      let nextClaim = null;
      if (currentIndex !== -1) {
        nextClaim = feedClaims.slice(currentIndex + 1).find((c) => c.status === 'Unverified');
      }
      // If none found after current, find ANY remaining unverified claim
      if (!nextClaim) {
        nextClaim = feedClaims.find((c) => c.status === 'Unverified' && c.id !== claimId);
      }

      if (nextClaim) {
        setReviewSuccess(false);
        if (onNavigateClaim) {
          onNavigateClaim(nextClaim.id);
        } else {
          fetchDetail(nextClaim.id);
        }
      } else {
        setNoMoreClaims(true);
      }
    } catch (err) {
      setError('Failed to fetch next claim in queue.');
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
        {/* 1. Modal Header — Claim identification */}
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

              {/* Success / Next Claim Banner */}
              {reviewSuccess && (
                <div className="alert-success flex items-center justify-between flex-wrap gap-2 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      Review saved! Status updated to &ldquo;{claim.status}&rdquo;.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                      onClick={handleNextClaim}
                    >
                      <span>Next Claim</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="preset-btn text-xs py-1"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* End of Queue State */}
              {noMoreClaims && (
                <div className="p-4 my-2 rounded-lg bg-blue-50 border border-blue-200 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto" />
                  <p className="text-xs font-semibold text-blue-900">
                    All unverified claims in the triage queue have been reviewed!
                  </p>
                  <button
                    type="button"
                    className="preset-btn mt-2"
                    onClick={onClose}
                  >
                    Return to Feed
                  </button>
                </div>
              )}

              {error && (
                <div className="alert-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* 2, 3, 4. Human Review Decision Form (Moved to the TOP) */}
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

                <form onSubmit={handleReviewSubmit} className="space-y-3 mt-2">
                  {/* VERDICT Selection */}
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

                  {/* Reviewer Note Field */}
                  <div className="form-group">
                    <label htmlFor="reviewer-note" className="form-label">
                      Reviewer Note <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reviewer-note"
                      rows={2}
                      className="form-textarea"
                      placeholder="Explain the finding, citing fact-checking sources, public records, or context..."
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      required
                    />
                    <span className="form-hint">Required — explain the basis for your verdict.</span>
                  </div>

                  {/* Action Buttons: Submit Review, Close, Next Claim */}
                  <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                    <button type="button" className="preset-btn text-xs py-1.5" onClick={onClose}>
                      Close
                    </button>
                    {reviewSuccess && (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        onClick={handleNextClaim}
                      >
                        <span>Next Claim</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="submit-btn text-xs py-1.5"
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

              {/* 5. Supporting Context Below */}
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
                  Per DP3, claim text and risk flags are permanently frozen at submission time.
                </span>
              </div>

              {/* Source & Risk Metadata Grid */}
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

                {/* Risk Flags — full detailed reasons */}
                <div className="meta-box">
                  <span className="meta-box-label">Triggered Risk Flags</span>
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    {claim.flags && claim.flags.length > 0 ? (
                      claim.flags.map((flag, i) => (
                        <FlagChip key={i} flag={flag} showReason={true} />
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

              {/* Existing Reviewer Note on Record (if present) */}
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
