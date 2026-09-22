import React from 'react';
import { Shield, Send, ListFilter, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div 
          className="brand" 
          onClick={() => setActiveTab('feed')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('feed'); }}
          aria-label="TruthLens Home"
        >
          <div className="brand-logo">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="brand-title-group">
            <div className="brand-title">
              Truth<span>Lens</span>
            </div>
            <div className="brand-subtitle">Misinformation Triage Platform</div>
          </div>
        </div>

        <div className="nav-actions-group">
          <nav className="nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <ListFilter className="w-4 h-4" />
              <span>Public Feed</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              <Send className="w-4 h-4" />
              <span>Submit Claim</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Triage Rules</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
