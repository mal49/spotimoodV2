import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const initialState = {
  isAuthenticated: false,
  showMainApp: false,
  showMoodQuestionnaire: false,
  userHasStoredMood: false,
  showFeedbackModal: false,
  generatedPlaylist: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'SET_SHOW_MAIN_APP':
      return {
        ...state,
        showMainApp: action.payload,
      };
    case 'SET_SHOW_MOOD_QUESTIONNAIRE':
      return {
        ...state,
        showMoodQuestionnaire: action.payload,
      };
    case 'SET_USER_HAS_STORED_MOOD':
      return {
        ...state,
        userHasStoredMood: action.payload,
      };
    case 'SET_SHOW_FEEDBACK_MODAL':
      return {
        ...state,
        showFeedbackModal: action.payload,
      };
    case 'SET_GENERATED_PLAYLIST':
      return {
        ...state,
        generatedPlaylist: action.payload,
      };
    case 'RESET_APP_STATE':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Update authentication state based on Supabase Auth
  useEffect(() => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
    
    if (isAuthenticated) {
      dispatch({ type: 'SET_SHOW_MAIN_APP', payload: true });
    } else {
      // When user signs out, reset to landing page
      dispatch({ type: 'SET_SHOW_MAIN_APP', payload: false });
    }
  }, [isAuthenticated]);

  // Check for stored mood on initialization
  useEffect(() => {
    const storedMood = localStorage.getItem('userMood');
    if (storedMood) {
      dispatch({ type: 'SET_USER_HAS_STORED_MOOD', payload: true });
    }
  }, []);

  const handleGetStarted = () => {
    dispatch({ type: 'SET_SHOW_MAIN_APP', payload: true });
    dispatch({ type: 'SET_SHOW_MOOD_QUESTIONNAIRE', payload: true });
  };

  const handleMoodSubmitted = (mood) => {
    localStorage.setItem('userMood', mood);
    dispatch({ type: 'SET_USER_HAS_STORED_MOOD', payload: true });
    dispatch({ type: 'SET_SHOW_MOOD_QUESTIONNAIRE', payload: false });
  };

  const handleAuthSuccess = () => {
    // Authentication state is now handled by AuthContext useEffect above
    // Just show the main app and mood questionnaire if needed
    dispatch({ type: 'SET_SHOW_MAIN_APP', payload: true });
    if (!state.userHasStoredMood) {
      dispatch({ type: 'SET_SHOW_MOOD_QUESTIONNAIRE', payload: true });
    }
  };

  const openFeedbackModal = () => {
    dispatch({ type: 'SET_SHOW_FEEDBACK_MODAL', payload: true });
  };

  const closeFeedbackModal = () => {
    dispatch({ type: 'SET_SHOW_FEEDBACK_MODAL', payload: false });
  };

  const closeMoodQuestionnaire = () => {
    dispatch({ type: 'SET_SHOW_MOOD_QUESTIONNAIRE', payload: false });
  };

  const setGeneratedPlaylist = (playlist) => {
    dispatch({ type: 'SET_GENERATED_PLAYLIST', payload: playlist });
  };

  const resetAppState = () => {
    dispatch({ type: 'RESET_APP_STATE' });
  };

  const value = {
    ...state,
    handleGetStarted,
    handleMoodSubmitted,
    handleAuthSuccess,
    openFeedbackModal,
    closeFeedbackModal,
    closeMoodQuestionnaire,
    setGeneratedPlaylist,
    resetAppState,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 