import React, { useState, useRef, useEffect } from 'react';
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
  Link as LinkIcon,
  ChevronDown,
  Check
} from 'lucide-react';

/* ================= Official Platform Brand SVGs ================= */
const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={{ flexShrink: 0 }}>
    <path fill="#25D366" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"/>
    <path fill="#ffffff" d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.91 1.23 3.11.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35z"/>
  </svg>
);

const TwitterXLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ flexShrink: 0, color: '#0f172a' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="ig-gradient-icon" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-gradient-icon)"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="#ffffff" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="#ffffff" strokeWidth="1.8"/>
    <circle cx="16.8" cy="7.2" r="1.1" fill="#ffffff"/>
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#1877F2"/>
    <path fill="#ffffff" d="M15.12 12.78l.48-3.13h-3v-2.03c0-.86.42-1.7 1.77-1.7h1.37V3.25c-.24-.03-1.07-.1-2.04-.1-2.08 0-3.44 1.26-3.44 3.54v2.09H7.5v3.13h2.76V22h3.41v-9.22h1.45z"/>
  </svg>
);

const TelegramLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#24A1DE"/>
    <path fill="#ffffff" d="M5.4 11.9l11.4-4.7c.5-.2 1 .1.8.7l-1.9 9.1c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1L8.9 13.5l-2.8-.9c-.6-.2-.6-.6.1-.9z"/>
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
    <path fill="#FF0000" d="M23.5 6.2c-.3-1-.9-1.8-1.9-2-1.7-.5-8.6-.5-8.6-.5s-6.9 0-8.6.5c-1 .3-1.6 1.1-1.9 2-.5 1.7-.5 5.3-.5 5.3s0 3.6.5 5.3c.3 1 .9 1.8 1.9 2 1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5c1-.3 1.6-1.1 1.9-2 .5-1.7.5-5.3.5-5.3s0-3.6-.5-5.3z"/>
    <polygon fill="#ffffff" points="9.6,15.6 15.6,11.5 9.6,7.4"/>
  </svg>
);

const RedditLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#FF4500"/>
    <path fill="#ffffff" d="M19.5 12c0-.8-.7-1.5-1.5-1.5-.4 0-.7.2-.9.4-1.1-.8-2.6-1.3-4.3-1.4l.7-3.5 2.4.5c0 .6.5 1 1.1 1 .6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.7-.6c-.1 0-.3.1-.3.2l-.9 4.1c-1.8.1-3.3.6-4.4 1.4-.2-.2-.5-.4-.9-.4-.8 0-1.5.7-1.5 1.5 0 .6.3 1.1.8 1.3-.1.3-.1.6-.1.9 0 2.4 2.8 4.4 6.3 4.4s6.3-2 6.3-4.4c0-.3 0-.6-.1-.9.5-.2.8-.7.8-1.3zm-10.3.9c0-.6.5-1.1 1.1-1.1s1.1.5 1.1 1.1-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1zm5.7 2.6c-.7.7-2 .7-2.9.7-.9 0-2.2 0-2.9-.7-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 1.6.5 2.5.5.9 0 2-.1 2.5-.5.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.2-1.5c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1s.5 1.1.5 1.1z"/>
  </svg>
);

const OtherLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const PLATFORM_OPTIONS = [
  { id: 'WhatsApp', label: 'WhatsApp', icon: <WhatsAppLogo /> },
  { id: 'Twitter / X', label: 'Twitter / X', icon: <TwitterXLogo /> },
  { id: 'Instagram', label: 'Instagram', icon: <InstagramLogo /> },
  { id: 'Facebook', label: 'Facebook', icon: <FacebookLogo /> },
  { id: 'Telegram', label: 'Telegram', icon: <TelegramLogo /> },
  { id: 'YouTube', label: 'YouTube', icon: <YouTubeLogo /> },
  { id: 'Reddit', label: 'Reddit', icon: <RedditLogo /> },
  { id: 'Other', label: 'Other', icon: <OtherLogo /> },
];

export default function SubmitClaim({ onClaimCreated, onViewFeed }) {
  const [text, setText] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('WhatsApp');
  const [category, setCategory] = useState('Politics');
  const [sourceLink, setSourceLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Custom Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map platform selection to backend schema validation values
  const mapPlatformForBackend = (platform) => {
    if (platform === 'Twitter / X' || platform === 'X') return 'X';
    if (platform === 'WhatsApp') return 'WhatsApp';
    if (platform === 'Instagram') return 'Instagram';
    return 'Other'; // Facebook, Telegram, YouTube, Reddit, Other safely map to 'Other'
  };

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
        sourcePlatform: mapPlatformForBackend(sourcePlatform),
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
      setSourcePlatform('Twitter / X');
      setCategory('Politics');
      setSourceLink('https://energy.gov/news/2026/battery-grant');
    }
  };

  // Find currently selected platform object (handles 'X' alias from presets as 'Twitter / X')
  const currentSelectedPlatform = PLATFORM_OPTIONS.find(
    (p) => p.id === sourcePlatform || (sourcePlatform === 'X' && p.id === 'Twitter / X')
  ) || PLATFORM_OPTIONS[0];

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
            {/* Source Platform with Official Brand Icons */}
            <div className="form-group" ref={dropdownRef}>
              <label id="platform-label" className="form-label">
                Source Platform <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div className="custom-platform-dropdown">
                <button
                  type="button"
                  id="platform-select"
                  className={`custom-select-trigger ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setDropdownOpen(false);
                    if (e.key === 'ArrowDown' && !dropdownOpen) setDropdownOpen(true);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  aria-labelledby="platform-label"
                >
                  <div className="custom-select-value">
                    <span className="custom-select-icon">{currentSelectedPlatform.icon}</span>
                    <span>{currentSelectedPlatform.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 custom-select-chevron ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="custom-select-menu" role="listbox" aria-labelledby="platform-label">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const isSelected = currentSelectedPlatform.id === platform.id;
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSourcePlatform(platform.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <div className="custom-select-option-content">
                            <span className="custom-select-icon">{platform.icon}</span>
                            <span>{platform.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
