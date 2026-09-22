import React, { useState } from 'react';
import { createClaim } from '../api';
import { RiskBadge, FlagChip, StatusBadge } from './RiskBadge';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Link as LinkIcon
} from 'lucide-react';

export default function SubmitClaim({ onClaimCreated, onViewFeed }) {
  const [text, setText] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('WhatsApp');
  const [category, setCategory] = useState('Politics');
  const [sourceLink, setSourceLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter the claim text to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createClaim({
        text: text.trim(),
        sourcePlatform,
        category,
        sourceLink: sourceLink.trim() || undefined,
      });

      setResult(created);
      // Clear form inputs
      setText('');
      setSourcePlatform('WhatsApp');
      setCategory('Politics');
      setSourceLink('');
      if (onClaimCreated) {
        onClaimCreated(created);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit and triage claim.');
    } finally {
      setLoading(false);
    }
  };

  const fillSample = (sampleType) => {
    setError(null);
    setResult(null);
    if (sampleType === 'sensational') {
      setText('BREAKING: Shocking secret cure for diabetes discovered by doctors! Share before deleted!');
      setSourcePlatform('WhatsApp');
      setCategory('Health');
      setSourceLink('');
    } else if (sampleType === 'shouting') {
      setText('NASA DISCOVERS WATER ON MARS AGAIN — MAJOR ANNOUNCEMENT COMING TONIGHT');
      setSourcePlatform('Instagram');
      setCategory('Other');
      setSourceLink('');
    } else if (sampleType === 'normal') {
      setText('The Department of Energy announced a new renewable battery research grant today.');
      setSourcePlatform('X');
      setCategory('Politics');
      setSourceLink('https://energy.gov/news/2026/battery-grant');
    }
  };

  return (
    <div className="submit-container">
      <div className="form-card">
        <div className="card-header">
          <div className="card-badge">Step 1 — Input &amp; Triage</div>
          <h2 className="card-title">Submit Viral Claim</h2>
          <p className="card-desc">
            Submit a suspicious viral claim for automated risk triage. Our deterministic risk engine evaluates sensational keywords, panic shouting, and missing sources. Every submission is preserved publicly as <strong>"Unverified"</strong> until a human fact-checker reviews it.
          </p>
        </div>

        {/* Quick Demo Pre-fills for Hackathon Graders */}
        <div className="preset-bar">
          <span className="preset-label">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Hackathon Demo Presets:
          </span>
          <button
            type="button"
            className="preset-btn"
            onClick={() => fillSample('sensational')}
          >
            Sensational + Unsourced (High Risk)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => fillSample('shouting')}
          >
            Shouting + Unsourced (High Risk)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => fillSample('normal')}
          >
            Normal + Sourced (Normal)
          </button>
        </div>

        {error && (
          <div className="alert-error mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-body">
          {/* Claim Text */}
          <div className="form-group">
            <label htmlFor="claim-text" className="form-label">
              Claim Text <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="claim-text"
              rows={4}
              className="form-textarea"
              placeholder="e.g. BREAKING: SHOCKING NEWS! SHARE BEFORE DELETED..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <span className="form-hint">
              Original claim text is permanently locked once submitted (DP3 Immutability).
            </span>
          </div>

          <div className="form-row">
            {/* Source Platform */}
            <div className="form-group">
              <label htmlFor="platform-select" className="form-label">
                Source Platform <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="platform-select"
                className="form-select"
                value={sourcePlatform}
                onChange={(e) => setSourcePlatform(e.target.value)}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="X">X (formerly Twitter)</option>
                <option value="Instagram">Instagram</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category-select" className="form-label">
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Politics">Politics</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Source Link */}
          <div className="form-group">
            <label htmlFor="source-link" className="form-label">
              Source Link / Evidence URL <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="source-link"
              type="url"
              className="form-input"
              placeholder="https://example.com/source-url"
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
            />
            <span className="form-hint">
              Providing a credible source link avoids the <strong>Unsourced</strong> risk flag.
            </span>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <span>Triaging &amp; Analyzing Risk...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit &amp; Triage Claim</span>
              </>
            )}
          </button>
        </form>

        {/* Real-Time Triage Result Card */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <strong className="text-slate-900 text-sm">Submission Triaged Successfully</strong>
              </div>
              <span className="text-xs font-semibold text-slate-500">Claim #{result.id}</span>
            </div>

            <div className="result-meta-row">
              <div className="result-meta-item">
                <span className="result-meta-label">Automated Urgency:</span>
                <RiskBadge level={result.riskLevel} />
              </div>
              <div className="result-meta-item">
                <span className="result-meta-label">Verification Status:</span>
                <StatusBadge status={result.status} />
              </div>
            </div>

            <div className="mt-3">
              <span className="result-meta-label">Detected Risk Flags:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {result.flags && result.flags.length > 0 ? (
                  result.flags.map((flag, i) => <FlagChip key={i} flag={flag} />)
                ) : (
                  <span className="text-xs text-slate-500 italic">None (Clean triage score)</span>
                )}
              </div>
            </div>

            <div className="result-quote">
              &ldquo;{result.text}&rdquo;
            </div>

            <div className="result-footer">
              <p className="result-explanation">
                {result.riskLevel === 'High Risk' ? (
                  <span style={{ color: '#991b1b' }}>
                    <strong>Priority Triage:</strong> Multiple risk flags were detected. This claim is placed at the top of the reviewer triage feed.{' '}
                    <strong>High Risk does NOT mean False</strong> — awaiting human reviewer verdict.
                  </span>
                ) : (
                  <span style={{ color: '#334155' }}>
                    <strong>Normal Priority:</strong> Fewer than 2 risk signals detected. Claim queued in the public feed for human fact-checking.
                  </span>
                )}
              </p>

              {onViewFeed && (
                <button
                  type="button"
                  className="view-feed-btn"
                  onClick={onViewFeed}
                >
                  <span>View in Public Feed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
