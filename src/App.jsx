import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/pages/landingPages.jsx'
import HomePage from './components/pages/homePage.jsx'
import Sidebar from './components/Layout/sidebar.jsx';
import Header from './components/Layout/header.jsx';
import NowPlayingBar from './components/Layout/nowPlayingBar.jsx';
import MoodQuestionnaireModal from './components/mood/MoodQuestionnaireModal.jsx'
import PlaylistManager from './components/PlaylistManager.jsx'
import SearchResults from './components/SearchResults.jsx'
import { PlayerProvider } from './context/PlayerContext';
import { AppProvider, useApp } from './context/AppContext';
import { PlaylistProvider } from './context/PlaylistContext';
import { SearchProvider } from './context/SearchContext';
import PlaylistDetail from './components/PlaylistDetail.jsx'
import AuthPage from './components/pages/authPage.jsx'
import SubscriptionPage from './components/pages/subscriptionPage.jsx'
import FeedbackPage from './components/pages/feedbackPage.jsx'
import FeedbackModal from './components/UI/FeedbackModal.jsx'

function MainLayout({ children }) {
  const { openFeedbackModal } = useApp();
  
  return (
    <div className='flex h-screen bg-dark-bg text-text-light'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />
        <main className='flex-1 overflow-y-auto pb-24'>
          {children}
        </main>
        <NowPlayingBar />
      </div>
      
      {/* Floating Feedback Button */}
      <button
        onClick={openFeedbackModal}
        className="fixed bottom-24 right-6 bg-primary-purple text-text-light p-4 rounded-full shadow-lg hover:bg-[#C879E6] transition-all duration-200 hover:scale-110 z-40"
        title="Send Feedback"
      >
        <span className="text-xl">💬</span>
      </button>
    </div>
  );
}

function AppContent() {
  const {
    showMainApp,
    showMoodQuestionnaire,
    showFeedbackModal,
    handleGetStarted,
    handleMoodSubmitted,
    handleAuthSuccess,
    closeMoodQuestionnaire,
    closeFeedbackModal
  } = useApp();

  return (
    <Router>
      <div className={`h-screen ${!showMainApp ? 'bg-light-purple-bg' : 'bg-dark-bg'}`}>
        {!showMainApp ? (
          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={handleGetStarted}/>} />
            <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/playlists" element={<PlaylistManager />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        )}
        {showMoodQuestionnaire && (
          <MoodQuestionnaireModal 
            onClose={closeMoodQuestionnaire}
            onSubmitMood={handleMoodSubmitted}
          />
        )}
        
        {showFeedbackModal && (
          <FeedbackModal 
            isOpen={showFeedbackModal}
            onClose={closeFeedbackModal}
          />
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <PlayerProvider>
        <PlaylistProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </PlaylistProvider>
      </PlayerProvider>
    </AppProvider>
  );
}

export default App
  