import React, { useState, useEffect } from 'react';
import ClaimCard from './ClaimCard';
import { getClaims } from '../api';
import { Filter, RefreshCw, AlertTriangle, ShieldCheck, Flame, Layers } from 'lucide-react';

export default function ClaimFeed({ onSelectClaim, onNavigateSubmit, refreshSignal }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('All');
  // Status filter uses exact spec strings
  const [statusFilter, setStatusFilter] = useState('All');

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

  // Exact spec status strings + All
  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: '⚠️ Unverified', value: 'Unverified' },
    { label: 'Verified True', value: 'Verified True' },
    { label: 'False', value: 'False' },
    { label: 'Misleading', value: 'Misleading' },
  ];

  // Live stats
  const totalCount = claims.length;
  const highRiskCount = claims.filter((c) => c.riskLevel === 'High Risk').length;
  const unverifiedCount = claims.filter((c) => c.status === 'Unverified').length;
  const reviewedCount = totalCount - unverifiedCount;

  return (
    <div className="feed-container">
      {/* Triage Stats Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-50 text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-red-50 text-red-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value text-red-600">{highRiskCount}</div>
            <div className="stat-label">High Risk (Priority Triage)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value text-amber-700">{unverifiedCount}</div>
            <div className="stat-label">Awaiting Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="stat-value text-emerald-600">{reviewedCount}</div>
            <div className="stat-label">Human Reviewed</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar — only category + status per spec (no extra risk filter) */}
      <div className="feed-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">
            <Filter className="w-3.5 h-3.5" />
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

        <div className="toolbar-section">
          <span className="toolbar-label">Status:</span>
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

        <div className="toolbar-section flex-row-end">
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchFeed}
            title="Refresh Feed"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={fetchFeed} className="underline font-medium text-xs ml-2">
            Try again
          </button>
        </div>
      )}

      <div className="feed-list">
        {loading && claims.length === 0 ? (
          <div className="empty-state">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading claims feed...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-lg">No claims match filters</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              No claims found for category &ldquo;{categoryFilter}&rdquo; and status &ldquo;{statusFilter}&rdquo;.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                className="chip chip-active"
                onClick={() => {
                  setCategoryFilter('All');
                  setStatusFilter('All');
                }}
              >
                Reset Filters
              </button>
              {onNavigateSubmit && (
                <button className="submit-btn" onClick={onNavigateSubmit}>
                  Submit a Claim
                </button>
              )}
            </div>
          </div>
        ) : (
          claims.map((claim) => (
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
