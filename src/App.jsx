import React, { useState } from 'react'
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
import { AuthProvider } from './context/AuthContext';
import { PlaylistProvider } from './context/PlaylistContext';
import { MoodProvider } from './context/MoodContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { SearchProvider } from './context/SearchContext';
import PlaylistDetail from './components/PlaylistDetail.jsx'
import AuthPage from './components/pages/authPage.jsx'
import AuthCallback from './components/pages/authCallback.jsx'
import SubscriptionPage from './components/pages/subscriptionPage.jsx'
import FeedbackPage from './components/pages/feedbackPage.jsx'
import AboutPage from './components/pages/aboutPage.jsx'
import ServicePage from './components/pages/servicePage.jsx'
import ContactPage from './components/pages/contactPage.jsx'
import FeedbackModal from './components/UI/FeedbackModal.jsx'

function MainLayout({ children }) {
  const { openFeedbackModal } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  
  return (
    <div className='flex h-screen bg-dark-bg text-text-light overflow-hidden'>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={closeMobileSidebar}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Sidebar */}
          <div className="relative w-64 h-full bg-black shadow-xl transform transition-transform duration-300 ease-in-out">
            <Sidebar isMobile={true} onClose={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header onToggleMobileSidebar={toggleMobileSidebar} />
        <main className='flex-1 overflow-y-auto pb-24 pt-0 sm:pt-0'>
          {/* Mobile search bar spacing */}
          <div className="sm:hidden h-16"></div>
          {children}
        </main>
        <NowPlayingBar />
      </div>
      
      {/* Floating Feedback Button */}
      <button
        onClick={openFeedbackModal}
        className="fixed bottom-32 right-4 lg:right-6 bg-primary-purple text-text-light p-3 lg:p-4 rounded-full shadow-lg hover:bg-[#C879E6] transition-all duration-200 hover:scale-110 z-40"
        title="Send Feedback"
      >
        <span className="text-lg lg:text-xl">💬</span>
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
    <AuthProvider>
      <AppProvider>
        <MoodProvider>
          <FeedbackProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <SearchProvider>
                  <AppContent />
                </SearchProvider>
              </PlaylistProvider>
            </PlayerProvider>
          </FeedbackProvider>
        </MoodProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App
  