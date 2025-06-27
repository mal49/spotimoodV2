import React, { createContext, useContext, useReducer, useCallback } from 'react';

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
  showPlaylistModal: false,
  selectedVideo: null,
};

function searchReducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        query: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        error: null,
      };
    case 'CLEAR_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: {
          videos: [],
          artists: [],
          albums: [],
        },
      };
    case 'SET_SHOW_PLAYLIST_MODAL':
      return {
        ...state,
        showPlaylistModal: action.payload,
      };
    case 'SET_SELECTED_VIDEO':
      return {
        ...state,
        selectedVideo: action.payload,
      };
    default:
      return state;
  }
}

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setQuery = useCallback((query) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const searchYouTube = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`http://localhost:3001/api/search-music?query=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Transform the response to match the expected format
        const transformedData = {
          videos: data.videos || [],
          artists: [], // Server doesn't return artists, keeping empty
          albums: [], // Server doesn't return albums, keeping empty
        };
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: transformedData });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search request failed');
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

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

  const value = {
    ...state,
    setQuery,
    searchYouTube,
    clearSearchResults,
    openPlaylistModal,
    closePlaylistModal,
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