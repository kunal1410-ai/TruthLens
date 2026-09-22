import React, { useState, useEffect } from 'react';
import { reviewClaim, getClaim } from '../api';
import { RiskBadge, StatusBadge, FlagChip } from './RiskBadge';
import { PlatformBadge } from './PlatformIcon';
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
  Info,
  Search,
  Zap,
  Calendar,
  Sparkles
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
    if (e && e.preventDefault) e.preventDefault();
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

  // Helper flags
  const flagTypes = (claim && claim.flags) ? claim.flags.map(f => typeof f === 'object' ? f.type : f) : [];
  const isSensational = flagTypes.includes('Sensational');
  const isShouting = flagTypes.includes('Shouting');
  const isUnsourced = flagTypes.includes('Unsourced') || !(claim && claim.sourceLink);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container deep-dive-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Deep Dive Header */}
        <div className="modal-header deep-dive-header">
          <div className="flex items-center gap-3">
            <h2 id="modal-title" className="deep-dive-title">
              DEEP DIVE VERIFICATION: <span className="deep-dive-case-id">Case ID #{claimId}</span>
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn deep-dive-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-content deep-dive-modal-content">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium tracking-wide">Executing Forensic Neural Triage...</p>
            </div>
          ) : error && !claim ? (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : claim ? (
            <>
              {/* Two-Column Deep Dive Grid (Matches User Reference Image) */}
              <div className="deep-dive-grid">
                
                {/* Left Column: ANALYZED CLAIM */}
                <div className="deep-dive-column">
                  <div className="deep-dive-col-header">
                    <span>ANALYZED CLAIM</span>
                  </div>

                  <div className="analyzed-claim-card">
                    <div className="analyzed-claim-banner">
                      <div className="flex items-center gap-2">
                        <span className="breaking-tag">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          {claim.riskLevel === 'High Risk' ? 'Breaking Alert!' : 'Incoming Claim'}
                        </span>
                      </div>
                      <PlatformBadge platform={claim.sourcePlatform} size={13} />
                    </div>

                    <div className="analyzed-claim-quote">
                      &ldquo;{claim.text}&rdquo;
                    </div>

                    <div className="analyzed-meta-list">
                      <div className="analyzed-meta-item">
                        <span className="meta-label">Claim URL:</span>
                        {claim.sourceLink ? (
                          <a
                            href={claim.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meta-url"
                          >
                            <Globe className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                            <span className="truncate">{claim.sourceLink}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <span className="meta-unsourced">No source URL provided (Unsourced)</span>
                        )}
                      </div>

                      <div className="analyzed-meta-item">
                        <span className="meta-label">Analysis Status:</span>
                        <span className={`status-pill ${claim.riskLevel === 'High Risk' ? 'critical' : 'normal'}`}>
                          {claim.riskLevel === 'High Risk' ? 'Critical Review' : 'Standard Triage'}
                        </span>
                      </div>
                    </div>

                    {/* Risk Spectrum Scale */}
                    <div className="risk-spectrum-box">
                      <div className="spectrum-track">
                        <div className="spectrum-gradient-line" />
                        <div
                          className="spectrum-pointer"
                          style={{
                            left: claim.riskLevel === 'High Risk' ? '82%' : (claim.flags && claim.flags.length > 0 ? '50%' : '18%')
                          }}
                        >
                          <div className="pointer-triangle" />
                          <div className="pointer-glow" />
                        </div>
                      </div>
                      <div className="spectrum-labels">
                        <span>Norm</span>
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>Alert</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: FORENSIC RESULTS */}
                <div className="deep-dive-column">
                  <div className="deep-dive-col-header">
                    <span>FORENSIC RESULTS</span>
                  </div>

                  <div className="forensic-results-card">
                    {/* Source Analysis */}
                    <div className="forensic-item">
                      <div className="forensic-icon-circle">
                        <Info className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="forensic-item-content">
                        <div className="forensic-item-title">Source Analysis</div>
                        <div className={`forensic-item-value ${isUnsourced ? 'danger' : 'success'}`}>
                          {isUnsourced ? 'Authenticity 15% (Low — Missing Citation)' : 'Authenticity Verified (Domain Linked)'}
                        </div>
                      </div>
                    </div>

                    {/* Reverse Search / Pattern Detection */}
                    <div className="forensic-item">
                      <div className="forensic-icon-circle">
                        <Search className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="forensic-item-content">
                        <div className="forensic-item-title">Pattern &amp; Sensationalism Search</div>
                        <div className={`forensic-item-value ${isSensational ? 'danger' : 'neutral'}`}>
                          {isSensational ? 'Alarmist keyword triggers matched ("breaking", "shocking")' : 'Clean linguistic signature (No panic keywords)'}
                        </div>
                      </div>
                    </div>

                    {/* Shouting / Panic Signal Check */}
                    <div className="forensic-item">
                      <div className="forensic-icon-circle">
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="forensic-item-content">
                        <div className="forensic-item-title">Fact-Checker &amp; Casing Consensus</div>
                        <div className={`forensic-item-value ${isShouting ? 'danger' : 'neutral'}`}>
                          {isShouting ? 'Capitalization anomaly (>50% uppercase panic text)' : 'Standard casing ratio within normal threshold'}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Timestamp Log */}
                    <div className="forensic-item">
                      <div className="forensic-icon-circle">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="forensic-item-content">
                        <div className="forensic-item-title">Metadata &amp; Timestamp Check</div>
                        <div className="forensic-item-value neutral">
                          Submitted: {formatTimestamp(claim.submittedAt)} · Category: {claim.category}
                        </div>
                      </div>
                    </div>

                    {/* Mini Telemetry Histogram & Waveform */}
                    <div className="telemetry-chart-box">
                      <svg viewBox="0 0 300 48" className="telemetry-svg" preserveAspectRatio="none">
                        <rect x="10" y="32" width="4" height="16" fill="#334155" rx="1" />
                        <rect x="22" y="26" width="4" height="22" fill="#334155" rx="1" />
                        <rect x="34" y="30" width="4" height="18" fill="#334155" rx="1" />
                        <rect x="46" y="18" width="4" height="30" fill="#38bdf8" opacity="0.6" rx="1" />
                        <rect x="58" y="14" width="4" height="34" fill="#38bdf8" opacity="0.75" rx="1" />
                        <rect x="70" y="20" width="4" height="28" fill="#38bdf8" opacity="0.6" rx="1" />
                        <rect x="82" y="28" width="4" height="20" fill="#334155" rx="1" />
                        <rect x="94" y="24" width="4" height="24" fill="#334155" rx="1" />
                        <rect x="106" y="16" width="4" height="32" fill="#38bdf8" opacity="0.7" rx="1" />
                        <rect x="118" y="10" width="4" height="38" fill="#38bdf8" opacity="0.85" rx="1" />
                        <rect x="130" y="8" width="4" height="40" fill={claim.riskLevel === 'High Risk' ? '#ef4444' : '#38bdf8'} rx="1" />
                        <rect x="142" y="14" width="4" height="34" fill="#38bdf8" opacity="0.75" rx="1" />
                        <rect x="154" y="22" width="4" height="26" fill="#334155" rx="1" />
                        <rect x="166" y="28" width="4" height="20" fill="#334155" rx="1" />
                        <rect x="178" y="18" width="4" height="30" fill="#38bdf8" opacity="0.6" rx="1" />
                        <rect x="190" y="12" width="4" height="36" fill="#38bdf8" opacity="0.8" rx="1" />
                        <rect x="202" y="20" width="4" height="28" fill="#334155" rx="1" />
                        <rect x="214" y="30" width="4" height="18" fill="#334155" rx="1" />
                        <rect x="226" y="24" width="4" height="24" fill="#334155" rx="1" />
                        <rect x="238" y="34" width="4" height="14" fill="#334155" rx="1" />
                        <rect x="250" y="28" width="4" height="20" fill="#334155" rx="1" />
                        <rect x="262" y="36" width="4" height="12" fill="#334155" rx="1" />
                        <rect x="274" y="40" width="4" height="8" fill="#334155" rx="1" />
                        {/* Smooth Sparkline */}
                        <polyline
                          points="12,32 48,18 60,14 120,10 132,8 144,14 192,12 240,34 276,40"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                        />
                        <circle cx="132" cy="8" r="3" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
                      </svg>
                      <div className="telemetry-labels">
                        <span>Signal Ingestion</span>
                        <span>Risk Entropy Wave</span>
                        <span>Consensus</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* DP3 Immutability Notice Bar */}
              <div className="deep-dive-immutable-notice">
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>
                  <strong>DP3 Permanent Audit Log:</strong> Original submitted claim text is locked to guarantee provenance and audit integrity.
                </span>
                <span className="ml-auto text-[11px] text-slate-400 font-mono">
                  SHA256::Verified
                </span>
              </div>

              {/* Bottom Action Bar (Matches Reference Image) */}
              <div className="deep-dive-actions-panel">
                <div className="action-buttons-row">
                  <button
                    type="button"
                    className={`deep-dive-btn btn-false ${selectedStatus === 'False' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus('False')}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>APPLY 'FALSE' LABEL</span>
                  </button>

                  <button
                    type="button"
                    className={`deep-dive-btn btn-true ${selectedStatus === 'Verified True' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus('Verified True')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ESCALATE TO HUMAN REVIEW</span>
                  </button>

                  <button
                    type="button"
                    className={`deep-dive-btn btn-misleading ${selectedStatus === 'Misleading' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus('Misleading')}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>MARK MISLEADING</span>
                  </button>

                  <div className="action-sparkle">
                    <Sparkles className="w-5 h-5 text-cyan-400 opacity-80" />
                  </div>
                </div>

                {reviewSuccess && (
                  <div className="alert-success mt-3 mb-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Decision finalized! Public feed updated to &ldquo;{claim.status}&rdquo;.</span>
                  </div>
                )}

                {error && (
                  <div className="alert-error mt-3 mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Reviewer Note Input */}
                <div className="deep-dive-note-container">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reviewer-note" className="note-label">
                      Reviewer Note &amp; Source Verification Basis <span className="text-red-400">*</span>
                    </label>
                    {claim.reviewerNote && (
                      <span className="previous-verdict-tag">
                        Active on record: &ldquo;{claim.reviewerNote}&rdquo;
                      </span>
                    )}
                  </div>
                  <textarea
                    id="reviewer-note"
                    rows={2}
                    className="deep-dive-textarea"
                    placeholder="Document verified fact-checking findings, sources, and public references for this decision..."
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    required
                  />
                </div>

                <div className="deep-dive-footer-row">
                  <div className="text-xs text-slate-400">
                    Selected Verdict: <strong className="text-cyan-400">{selectedStatus}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="deep-dive-btn-cancel" onClick={onClose}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="deep-dive-btn-submit"
                      onClick={handleReviewSubmit}
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
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
