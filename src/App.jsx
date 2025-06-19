import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/pages/landingPages.jsx'
import HomePage from './components/pages/homePage.jsx'
import Sidebar from './components/Layout/sidebar.jsx';
import Header from './components/Layout/header.jsx';
import NowPlayingBar from './components/Layout/NowPlayingBar.jsx';
import MoodQuestionnaireModal from './components/mood/MoodQuestionnaireModal.jsx'
import PlaylistManager from './components/PlaylistManager.jsx'
import SearchResults from './components/SearchResults.jsx'
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import PlaylistDetail from './components/PlaylistDetail.jsx'
import AuthPage from './components/pages/authPage.jsx'
import SubscriptionPage from './components/pages/subscriptionPage.jsx'
import FeedbackPage from './components/pages/feedbackPage.jsx'
import FeedbackModal from './components/UI/FeedbackModal.jsx'

function SongAdder() {
  const { addToQueue } = usePlayer();
  const [form, setForm] = useState({ id: '', title: '', artist: '', thumbnail: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id && form.title) {
      addToQueue({ ...form });
      setForm({ id: '', title: '', artist: '', thumbnail: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-20 left-0 right-0 flex space-x-2 p-4 bg-dark-card z-10">
      <input name="id" value={form.id} onChange={handleChange} placeholder="YouTube Video ID" className="p-2 rounded bg-dark-bg text-text-light" required />
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="p-2 rounded bg-dark-bg text-text-light" required />
      <input name="artist" value={form.artist} onChange={handleChange} placeholder="Artist" className="p-2 rounded bg-dark-bg text-text-light" />
      <input name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="Thumbnail URL" className="p-2 rounded bg-dark-bg text-text-light" />
      <button type="submit" className="bg-primary-purple text-text-light px-4 py-2 rounded">Add Song</button>
    </form>
  );
}

function MainLayout({ children, onOpenFeedback }) {
  return (
    <div className='flex h-screen bg-dark-bg text-text-light'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
        <NowPlayingBar />
      </div>
      
      {/* Floating Feedback Button */}
      <button
        onClick={onOpenFeedback}
        className="fixed bottom-24 right-6 bg-primary-purple text-text-light p-4 rounded-full shadow-lg hover:bg-[#C879E6] transition-all duration-200 hover:scale-110 z-40"
        title="Send Feedback"
      >
        <span className="text-xl">💬</span>
      </button>
    </div>
  );
}

function App() {
  const [showMainApp, setShowMainApp] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [showMoodQuestionnaire, setShowMoodQuestionnaire] = useState(false);
  const [userHasStoredMood, setUsersHadStoresMood] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const storedMood = localStorage.getItem('userMood');
    if (storedMood) {
      setUsersHadStoresMood(true);
    }
  }, []);

  const handleGetStarted = () => {
    setShowMainApp(true);
    setShowMoodQuestionnaire(true);
  };

  const handleMoodSubmitted = (mood) => {
    localStorage.setItem('userMood', mood);
    setUsersHadStoresMood(true);
    setShowMoodQuestionnaire(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowMainApp(true);
    if (!userHasStoredMood) {
      setShowMoodQuestionnaire(true);
    }
  };

  return (
    <PlayerProvider>
      <Router>
        <div className={`h-screen ${!showMainApp ? 'bg-light-purple-bg' : 'bg-dark-bg'}`}>
          {!showMainApp ? (
            <Routes>
              <Route path="/" element={<LandingPage onGetStarted={handleGetStarted}/>} />
              <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <MainLayout onOpenFeedback={() => setShowFeedbackModal(true)}>
              <Routes>
                <Route path="/" element={
                  <HomePage 
                    generatedPlaylist={generatedPlaylist}
                    setGeneratedPlaylist={setGeneratedPlaylist}
                    userHasStoredMood={userHasStoredMood}
                  />
                } />
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
              onClose={() => setShowMoodQuestionnaire(false)}
              onSubmitMood={handleMoodSubmitted}
            />
          )}
          
          {showFeedbackModal && (
            <FeedbackModal 
              isOpen={showFeedbackModal}
              onClose={() => setShowFeedbackModal(false)}
            />
          )}
        </div>
      </Router>
    </PlayerProvider>
  );
}

export default App
  