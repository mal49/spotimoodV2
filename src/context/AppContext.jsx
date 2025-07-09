import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

// State persistence helper
const STORAGE_KEY = 'spotimood-app-state';

const loadPersistedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only restore certain fields, not authentication state
      return {
        userHasStoredMood: parsed.userHasStoredMood || false,
        showMoodQuestionnaire: parsed.showMoodQuestionnaire || false,
        showFeedbackModal: false, // Always start with modal closed
        generatedPlaylist: parsed.generatedPlaylist || null,
        _restored: true, // Flag to indicate state was restored
      };
    }
  } catch (error) {
    console.warn('Failed to load persisted app state:', error);
  }
  return {};
};

const saveStateToStorage = (state) => {
  try {
    const stateToSave = {
      userHasStoredMood: state.userHasStoredMood,
      showMoodQuestionnaire: state.showMoodQuestionnaire,
      generatedPlaylist: state.generatedPlaylist,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to save app state:', error);
  }
};

const initialState = {
  isAuthenticated: false,
  showMainApp: false,
  showMoodQuestionnaire: false,
  userHasStoredMood: false,
  showFeedbackModal: false,
  generatedPlaylist: null,
  showStateRestoredToast: false,
  ...loadPersistedState(), // Load persisted state on initialization
};

function appReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      newState = {
        ...state,
        isAuthenticated: action.payload,
      };
      break;
    case 'SET_SHOW_MAIN_APP':
      newState = {
        ...state,
        showMainApp: action.payload,
      };
      break;
    case 'SET_SHOW_MOOD_QUESTIONNAIRE':
      newState = {
        ...state,
        showMoodQuestionnaire: action.payload,
      };
      break;
    case 'SET_USER_HAS_STORED_MOOD':
      newState = {
        ...state,
        userHasStoredMood: action.payload,
      };
      break;
    case 'SET_SHOW_FEEDBACK_MODAL':
      newState = {
        ...state,
        showFeedbackModal: action.payload,
      };
      break;
    case 'SET_GENERATED_PLAYLIST':
      newState = {
        ...state,
        generatedPlaylist: action.payload,
      };
      break;
    case 'SET_SHOW_STATE_RESTORED_TOAST':
      newState = {
        ...state,
        showStateRestoredToast: action.payload,
      };
      break;
    case 'RESET_APP_STATE':
      // Clear persisted state when resetting
      localStorage.removeItem(STORAGE_KEY);
      newState = {
        ...initialState,
        isAuthenticated: false,
        showMainApp: false,
        showMoodQuestionnaire: false,
        userHasStoredMood: false,
        showFeedbackModal: false,
        generatedPlaylist: null,
        showStateRestoredToast: false,
      };
      break;
    default:
      return state;
  }
  
  // Save state after each change (except for authentication state)
  if (action.type !== 'SET_AUTHENTICATED' && action.type !== 'SET_SHOW_MAIN_APP' && action.type !== 'SET_SHOW_STATE_RESTORED_TOAST') {
    saveStateToStorage(newState);
  }
  
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Show toast notification if state was restored
  useEffect(() => {
    if (state._restored && isAuthenticated) {
      dispatch({ type: 'SET_SHOW_STATE_RESTORED_TOAST', payload: true });
      // Auto-hide after showing
      setTimeout(() => {
        dispatch({ type: 'SET_SHOW_STATE_RESTORED_TOAST', payload: false });
      }, 3000);
    }
  }, [state._restored, isAuthenticated]);

  // Update authentication state based on Supabase Auth
  useEffect(() => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
    
    if (isAuthenticated) {
      // If user is authenticated, show main app
      dispatch({ type: 'SET_SHOW_MAIN_APP', payload: true });
    } else {
      // When user signs out, reset to landing page and clear state
      dispatch({ type: 'SET_SHOW_MAIN_APP', payload: false });
      // Clear persisted state on logout
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated]);

  // Check for stored mood on initialization and when user changes
  useEffect(() => {
    const storedMood = localStorage.getItem('userMood');
    const hasStoredMood = !!storedMood;
    
    if (hasStoredMood !== state.userHasStoredMood) {
      dispatch({ type: 'SET_USER_HAS_STORED_MOOD', payload: hasStoredMood });
    }
  }, [user, state.userHasStoredMood]);

  // Add page visibility handling to prevent state loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible again - refresh stored mood state
        const storedMood = localStorage.getItem('userMood');
        const hasStoredMood = !!storedMood;
        
        if (hasStoredMood !== state.userHasStoredMood) {
          dispatch({ type: 'SET_USER_HAS_STORED_MOOD', payload: hasStoredMood });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.userHasStoredMood]);

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

  const closeStateRestoredToast = () => {
    dispatch({ type: 'SET_SHOW_STATE_RESTORED_TOAST', payload: false });
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
    closeStateRestoredToast,
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