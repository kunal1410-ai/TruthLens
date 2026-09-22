import React from 'react';
import { Shield, Send, ListFilter, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand" onClick={() => setActiveTab('feed')}>
          <div className="brand-logo">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="brand-title">TruthLens</div>
            <div className="brand-subtitle">Risk ≠ Truth — AI triages urgency; humans determine veracity.</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <ListFilter className="w-4 h-4" />
            <span>Public Feed</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <Send className="w-4 h-4" />
            <span>Submit Claim</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Triage Rules</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
