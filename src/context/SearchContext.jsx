import React, { createContext, useContext, useReducer, useCallback } from 'react';
import config from '../lib/config.js';
import { searchMusicMultiSource } from '../lib/api.js';

const SearchContext = createContext();

const initialState = {
  query: '',
  searchResults: {
    videos: [],
    artists: [],
    albums: [],
  },
  isLoading: false,
  error: null,
  errorCode: null,
  retryAfter: null,
  showPlaylistModal: false,
  selectedVideo: null,
};

function searchReducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload?.message || action.payload,
        errorCode: action.payload?.code || null,
        retryAfter: action.payload?.retryAfter || null
      };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, error: null, errorCode: null };
    case 'CLEAR_SEARCH_RESULTS':
      return { 
        ...state, 
        searchResults: { videos: [], artists: [], albums: [] },
        error: null,
        errorCode: null
      };
    case 'SET_SHOW_PLAYLIST_MODAL':
      return { ...state, showPlaylistModal: action.payload };
    case 'SET_SELECTED_VIDEO':
      return { ...state, selectedVideo: action.payload };
    default:
      return state;
  }
}

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setQuery = useCallback((query) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const searchYouTube = useCallback(async (searchQuery, options = {}) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
      return;
    }

    // Check if we're in a rate limit cooldown
    if (state.errorCode === 'RATE_LIMIT_EXCEEDED' && state.retryAfter) {
      const now = Date.now();
      const lastErrorTime = state.retryAfter * 1000; // Convert to milliseconds
      if (now < lastErrorTime) {
        console.log('Rate limit still active, skipping search');
        return;
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { maxResults = 10, source = 'auto' } = options;
      
      // Use the new multi-source search
      const result = await searchMusicMultiSource(searchQuery.trim(), maxResults, source);
      
      // Debug log to see what we actually received
      console.log('Received result from searchMusicMultiSource:', result);
      
      // Transform the response to match the expected format
      const transformedData = {
        videos: result.results || [],
        artists: [], // Server doesn't return artists, keeping empty
        albums: [], // Server doesn't return albums, keeping empty
        pagination: {
          nextPageToken: null, // Multi-source doesn't support pagination yet
          prevPageToken: null,
          totalResults: result.totalResults || 0,
          resultsPerPage: maxResults
        },
        source: result.source,
        availableSources: result.availableSources
      };
      
      console.log('Transformed data for dispatch:', transformedData);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: transformedData });
      
      // Log the source used for debugging
      if (result.source && result.source !== 'youtube') {
        console.log(`Search completed using ${result.source} API`);
      }
      
    } catch (error) {
      console.error('Error in multi-source search:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        dispatch({ type: 'SET_ERROR', payload: {
          message: 'Network error. Please check your internet connection.',
          code: 'NETWORK_ERROR'
        }});
      } else if (error.message && typeof error.message === 'object') {
        // Handle our custom error objects
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else {
        dispatch({ type: 'SET_ERROR', payload: {
          message: error.message || 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR'
        }});
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.errorCode, state.retryAfter]);

  const clearSearchResults = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
    dispatch({ type: 'SET_QUERY', payload: '' });
  }, []);

  const openPlaylistModal = useCallback((video) => {
    dispatch({ type: 'SET_SELECTED_VIDEO', payload: video });
    dispatch({ type: 'SET_SHOW_PLAYLIST_MODAL', payload: true });
  }, []);

  const closePlaylistModal = useCallback(() => {
    dispatch({ type: 'SET_SHOW_PLAYLIST_MODAL', payload: false });
    dispatch({ type: 'SET_SELECTED_VIDEO', payload: null });
  }, []);

  // Helper function to get user-friendly error messages
  const getErrorMessage = useCallback(() => {
    if (!state.error) return null;

    switch (state.errorCode) {
      case 'QUOTA_EXCEEDED':
        return 'YouTube search limit reached. Please try again in an hour.';
      case 'RATE_LIMIT_EXCEEDED':
        const waitTime = state.retryAfter ? Math.ceil((state.retryAfter - Date.now()) / 1000) : 60;
        return `Too many requests. Please wait ${waitTime} seconds before searching again.`;
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet and try again.';
      case 'API_CONFIG_ERROR':
        return 'Service temporarily unavailable. Please try again later.';
      case 'VALIDATION_ERROR':
        return 'Please enter a valid search query.';
      default:
        return state.error || 'Search failed. Please try again.';
    }
  }, [state.error, state.errorCode, state.retryAfter]);

  // Helper function to check if retry is allowed
  const canRetry = useCallback(() => {
    if (!state.errorCode) return true;
    
    if (state.errorCode === 'RATE_LIMIT_EXCEEDED' && state.retryAfter) {
      return Date.now() >= state.retryAfter;
    }
    
    // Don't allow retry for these error types
    const noRetryErrors = ['API_CONFIG_ERROR', 'VALIDATION_ERROR'];
    return !noRetryErrors.includes(state.errorCode);
  }, [state.errorCode, state.retryAfter]);

  const value = {
    ...state,
    setQuery,
    searchYouTube,
    clearSearchResults,
    openPlaylistModal,
    closePlaylistModal,
    getErrorMessage,
    canRetry,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 