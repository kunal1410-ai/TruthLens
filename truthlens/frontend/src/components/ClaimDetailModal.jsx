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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Info
} from 'lucide-react';

export default function ClaimDetailModal({ claimId, onClose, onClaimUpdated }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form State — exact spec status strings
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
      setError('Reviewer note is required to explain the factual basis of your verdict.');
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
      setError(err.message || 'Failed to submit review decision.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Pending review';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  if (!claimId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span id="modal-title" className="claim-id-tag font-bold text-sm">
              Claim #{claimId}
            </span>
            {claim && (
              <div className="flex items-center gap-2">
                <span className="platform-tag">{claim.sourcePlatform}</span>
                <span className="category-tag">{claim.category}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Loading claim triage record...</p>
            </div>
          ) : error && !claim ? (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
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

              {/* DP3: Immutable Claim Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="section-title">Submitted Claim Text</span>
                  <div
                    className="immutable-badge"
                    title="DP3: Original claim text is permanently locked at submission time to preserve audit trail integrity."
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Permanent Record (DP3 Immutable)</span>
                  </div>
                </div>
                <div className="claim-text-display">
                  &ldquo;{claim.text}&rdquo;
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Original text and automated triage flags are frozen upon submission. Text cannot be edited to alter its risk profile.
                </p>
              </div>

              {/* Source & Metadata Grid */}
              <div className="detail-meta-grid">
                <div className="meta-box">
                  <span className="meta-box-label">Source Evidence</span>
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
                    <span className="text-xs font-semibold" style={{ color: '#92400e' }}>
                      ⚠️ No source link provided (Unsourced signal triggered)
                    </span>
                  )}
                </div>

                <div className="meta-box">
                  <span className="meta-box-label">Triggered Risk Signals</span>
                  <div className="flex flex-col gap-1 mt-0.5">
                    {claim.flags && claim.flags.length > 0 ? (
                      claim.flags.map((flag, i) => (
                        <FlagChip key={i} flag={flag} />
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No automated risk flags triggered</span>
                    )}
                  </div>
                </div>

                <div className="meta-box">
                  <span className="meta-box-label">Submitted Timestamp</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimestamp(claim.submittedAt)}</span>
                  </div>
                </div>

                <div className="meta-box">
                  <span className="meta-box-label">Last Human Verification</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimestamp(claim.reviewedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Existing Review Note on Record */}
              {claim.reviewerNote && (
                <div className="existing-review-box">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Current Human Reviewer Note:</span>
                  </div>
                  <p className="text-sm text-slate-800 bg-white p-3 rounded-md border border-blue-200">
                    {claim.reviewerNote}
                  </p>
                </div>
              )}

              {/* Human Reviewer Workspace */}
              <div className="human-review-card">
                <div className="review-card-header">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-base">Human Verification Decision</h3>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Fact-Checker Portal
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3.5">
                  Automated flags only detect viral patterns. Select the verified truth status below based on credible factual evidence. Submitting an update will refresh the public feed.
                </p>

                {reviewSuccess && (
                  <div className="alert-success mb-3">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Verdict saved! Status updated to &ldquo;{claim.status}&rdquo;.</span>
                  </div>
                )}

                {error && (
                  <div className="alert-error mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3.5">
                  {/* Status Selection Buttons */}
                  <div>
                    <label className="form-label mb-2">Select Veracity Status:</label>
                    <div className="status-selector-grid">
                      <button
                        type="button"
                        className={`status-btn status-btn-true ${selectedStatus === 'Verified True' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('Verified True')}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Verified True</div>
                          <div className="text-[11px] text-slate-500">Confirmed by credible evidence</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`status-btn status-btn-false ${selectedStatus === 'False' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('False')}
                      >
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">False</div>
                          <div className="text-[11px] text-slate-500">Refuted by reliable sources</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`status-btn status-btn-misleading ${selectedStatus === 'Misleading' ? 'selected' : ''}`}
                        onClick={() => setSelectedStatus('Misleading')}
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">Misleading</div>
                          <div className="text-[11px] text-slate-500">Out of context or exaggerated</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Reviewer Note */}
                  <div className="form-group">
                    <label htmlFor="reviewer-note" className="form-label">
                      Reviewer Note <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      id="reviewer-note"
                      rows={3}
                      className="form-textarea"
                      placeholder="Explain the factual finding, citing reputable fact-checking sources, government records, or context..."
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      required
                    />
                    <span className="form-hint">
                      Required — transparent explanation shown on the public feed card.
                    </span>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={submittingReview || !reviewerNote.trim()}
                    >
                      {submittingReview ? (
                        <span>Saving Verdict...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Verification Decision</span>
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
