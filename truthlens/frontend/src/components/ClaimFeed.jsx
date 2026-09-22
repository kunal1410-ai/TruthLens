import React, { useState, useEffect, useMemo } from 'react';
import ClaimCard from './ClaimCard';
import { getClaims } from '../api';
import {
  Layers,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export default function ClaimFeed({ onSelectClaim, onNavigateSubmit, refreshSignal }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClaims({
        category: categoryFilter,
        status: statusFilter,
      });
      setClaims(data);
    } catch (err) {
      setError(err.message || 'Failed to load claims feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [categoryFilter, statusFilter, refreshSignal]);

  const categories = ['All', 'Politics', 'Health', 'Finance', 'Other'];

  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Unverified', value: 'Unverified' },
    { label: 'Verified True', value: 'Verified True' },
    { label: 'False', value: 'False' },
    { label: 'Misleading', value: 'Misleading' },
  ];

  // Filter by search query client-side
  const filteredClaims = useMemo(() => {
    if (!searchQuery.trim()) return claims;
    const q = searchQuery.toLowerCase().trim();
    return claims.filter((c) =>
      c.text.toLowerCase().includes(q) ||
      (c.sourcePlatform && c.sourcePlatform.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      String(c.id).includes(q)
    );
  }, [claims, searchQuery]);

  // Real-time statistics based on loaded claims
  const totalCount = claims.length;
  const highRiskCount = claims.filter((c) => c.riskLevel === 'High Risk').length;
  const unverifiedCount = claims.filter((c) => c.status === 'Unverified').length;
  const reviewedCount = totalCount - unverifiedCount;

  return (
    <div className="feed-container">
      {/* Triage Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{highRiskCount}</div>
            <div className="stat-label">High Risk (Priority Queue)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#d97706' }}>{unverifiedCount}</div>
            <div className="stat-label">Awaiting Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#059669' }}>{reviewedCount}</div>
            <div className="stat-label">Human Reviewed</div>
          </div>
        </div>
      </div>

      {/* Triage Rule Callout Banner */}
      <aside className="triage-callout-card" aria-label="Triage philosophy banner">
        <div className="triage-callout-text">
          <h4>
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            Neutrality &amp; Human-in-the-Loop Principle
          </h4>
          <p>
            <strong>High Risk does NOT mean False.</strong> The automated engine flags sensational, shouting, or unsourced patterns to surface urgency. Only human reviewers determine factual truth.
          </p>
        </div>
        <div className="triage-rule-pill">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DP1: High Risk Surfaced First</span>
        </div>
      </aside>

      {/* Feed Control Panel (Search + Category + Status Filters + Refresh) */}
      <div className="feed-control-panel">
        <div className="feed-control-top">
          <div className="search-input-wrapper">
            <Search className="w-4 h-4 search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search claims, keywords, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search claims"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={fetchFeed}
            disabled={loading}
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
        </div>

        <div className="feed-filter-groups">
          <div className="filter-row">
            <span className="filter-label">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            <div className="filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${categoryFilter === cat ? 'chip-active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Status:</span>
            <div className="filter-chips">
              {statuses.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`chip ${statusFilter === st.value ? 'chip-active' : ''}`}
                  onClick={() => setStatusFilter(st.value)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-error mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchFeed} className="font-semibold underline ml-auto text-xs">
            Try again
          </button>
        </div>
      )}

      {/* Claims List */}
      <div className="feed-list">
        {loading && claims.length === 0 ? (
          <div className="empty-state">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Loading Claims Queue...</h3>
            <p className="text-sm text-slate-500 mt-1">Retrieving latest triaged submissions from TruthLens</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-lg">No Claims Match Your Filter</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No claims found matching "${searchQuery}". Try clearing search or adjusting filters.`
                : `No claims found for Category "${categoryFilter}" and Status "${statusFilter}".`}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                className="chip chip-active"
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
              {onNavigateSubmit && (
                <button
                  type="button"
                  className="nav-cta-btn"
                  onClick={onNavigateSubmit}
                >
                  Submit a Claim
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onSelect={onSelectClaim}
            />
          ))
        )}
      </div>
    </div>
  );
}
