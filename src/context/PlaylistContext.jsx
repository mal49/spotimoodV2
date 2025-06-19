import React, { createContext, useContext, useReducer, useCallback } from 'react';

const PlaylistContext = createContext();

const initialState = {
  playlists: [],
  isLoading: false,
  error: null,
  isCreating: false,
  currentPlaylist: null,
};

function playlistReducer(state, action) {
  switch (action.type) {
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
    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload,
        error: null,
      };
    case 'ADD_PLAYLIST':
      return {
        ...state,
        playlists: [...state.playlists, action.payload],
      };
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.id ? action.payload : playlist
        ),
      };
    case 'REMOVE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter(playlist => playlist.id !== action.payload),
      };
    case 'SET_CREATING':
      return {
        ...state,
        isCreating: action.payload,
      };
    case 'SET_CURRENT_PLAYLIST':
      return {
        ...state,
        currentPlaylist: action.payload,
      };
    default:
      return state;
  }
}

export function PlaylistProvider({ children }) {
  const [state, dispatch] = useReducer(playlistReducer, initialState);

  const fetchPlaylists = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch('http://localhost:3001/api/playlists');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_PLAYLISTS', payload: data });
      } else {
        throw new Error('Failed to fetch playlists');
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchPlaylistById = useCallback(async (playlistId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: data });
        return data;
      } else {
        throw new Error('Failed to fetch playlist');
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createPlaylist = useCallback(async (playlistData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch('http://localhost:3001/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...playlistData, songs: [] }),
      });

      if (response.ok) {
        const createdPlaylist = await response.json();
        dispatch({ type: 'ADD_PLAYLIST', payload: createdPlaylist });
        return createdPlaylist;
      } else {
        throw new Error('Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updatePlaylist = useCallback(async (playlistId, updates) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedPlaylist = await response.json();
        dispatch({ type: 'UPDATE_PLAYLIST', payload: updatedPlaylist });
        
        // Update current playlist if it's the one being updated
        if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
          dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: updatedPlaylist });
        }
        
        return updatedPlaylist;
      } else {
        throw new Error('Failed to update playlist');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist]);

  const deletePlaylist = useCallback(async (playlistId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch({ type: 'REMOVE_PLAYLIST', payload: playlistId });
        
        // Clear current playlist if it's the one being deleted
        if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
          dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: null });
        }
        
        return true;
      } else {
        throw new Error('Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist]);

  const setCreating = useCallback((isCreating) => {
    dispatch({ type: 'SET_CREATING', payload: isCreating });
  }, []);

  const value = {
    ...state,
    fetchPlaylists,
    fetchPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    setCreating,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
} 