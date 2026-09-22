import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SubmitClaim from './components/SubmitClaim';
import ClaimFeed from './components/ClaimFeed';
import ClaimDetailModal from './components/ClaimDetailModal';
import AboutView from './components/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleClaimCreated = (newClaim) => {
    setRefreshSignal((prev) => prev + 1);
  };

  const handleClaimSelected = (claim) => {
    setSelectedClaimId(claim.id);
  };

  const handleCloseModal = () => {
    setSelectedClaimId(null);
  };

  const handleClaimUpdated = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'feed' && (
          <ClaimFeed
            onSelectClaim={handleClaimSelected}
            onNavigateSubmit={() => setActiveTab('submit')}
            refreshSignal={refreshSignal}
          />
        )}

        {activeTab === 'submit' && (
          <SubmitClaim
            onClaimCreated={handleClaimCreated}
            onViewFeed={() => setActiveTab('feed')}
          />
        )}

        {activeTab === 'about' && (
          <AboutView onStartDemo={() => setActiveTab('submit')} />
        )}
      </main>

      {/* Claim Detail & Human Review Modal */}
      {selectedClaimId && (
        <ClaimDetailModal
          claimId={selectedClaimId}
          onClose={handleCloseModal}
          onClaimUpdated={handleClaimUpdated}
          onNavigateClaim={(nextId) => setSelectedClaimId(nextId)}
        />
      )}
    </div>
  );
}
