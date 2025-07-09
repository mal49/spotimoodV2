import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  const { user, isAuthenticated } = useAuth();

  const fetchPlaylists = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not authenticated - set empty playlists instead of throwing error
        dispatch({ type: 'SET_PLAYLISTS', payload: [] });
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_PLAYLISTS', payload: data || [] });
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
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (playlistError) throw playlistError;

      // Fetch playlist songs with song details
      const { data: playlistSongs, error: songsError } = await supabase
        .from('playlist_songs')
        .select(`
          *,
          songs (*)
        `)
        .eq('playlist_id', playlistId)
        .order('position');

      if (songsError) throw songsError;

      // Format the playlist with songs
      const playlistWithSongs = {
        ...playlist,
        songs: playlistSongs?.map(ps => ({
          ...ps.songs,
          position: ps.position
        })) || []
      };

      dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: playlistWithSongs });
      return playlistWithSongs;
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'Please sign in to create playlists' });
        return null;
      }

      const { data, error } = await supabase
        .from('playlists')
        .insert([
          {
            ...playlistData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_PLAYLIST', payload: data });
      return data;
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
      const { data, error } = await supabase
        .from('playlists')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', playlistId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_PLAYLIST', payload: data });
      
      // Update current playlist if it's the one being updated
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        const updatedCurrentPlaylist = { ...state.currentPlaylist, ...data };
        dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: updatedCurrentPlaylist });
      }
      
      return data;
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
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_PLAYLIST', payload: playlistId });
      
      // Clear current playlist if it's the one being deleted
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: null });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist]);

  const addSongToPlaylist = useCallback(async (playlistId, songData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'Please sign in to add songs to playlists' });
        return false;
      }

      // First, ensure the song exists in the songs table
      const { data: existingSong, error: songSelectError } = await supabase
        .from('songs')
        .select('*')
        .eq('youtube_id', songData.youtube_id)
        .single();

      let song = existingSong;

      if (songSelectError && songSelectError.code === 'PGRST116') {
        // Song doesn't exist, create it
        const { data: newSong, error: songInsertError } = await supabase
          .from('songs')
          .insert([{
            youtube_id: songData.youtube_id,
            title: songData.title,
            artist: songData.artist || songData.channelTitle,
            duration: songData.duration,
            thumbnail_url: songData.thumbnail,
            channel_title: songData.channelTitle,
          }])
          .select()
          .single();

        if (songInsertError) throw songInsertError;
        song = newSong;
      } else if (songSelectError) {
        throw songSelectError;
      }

      // Get the next position in the playlist
      const { data: lastSong, error: positionError } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const nextPosition = (lastSong?.position || 0) + 1;

      // Add song to playlist
      const { error: playlistSongError } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: playlistId,
          song_id: song.id,
          position: nextPosition,
        }]);

      if (playlistSongError) throw playlistSongError;

      // Refresh the current playlist if it's the one being updated
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        await fetchPlaylistById(playlistId);
      }

      return true;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist, fetchPlaylistById]);

  const removeSongFromPlaylist = useCallback(async (playlistId, songId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'Please sign in to modify playlists' });
        return false;
      }

      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) throw error;

      // Refresh the current playlist if it's the one being updated
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        await fetchPlaylistById(playlistId);
      }

      return true;
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist, fetchPlaylistById]);

  const reorderPlaylistSongs = useCallback(async (playlistId, songIds) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_ERROR', payload: 'Please sign in to reorder playlists' });
        return false;
      }

      // Update positions for all songs
      const updates = songIds.map((songId, index) => ({
        playlist_id: playlistId,
        song_id: songId,
        position: index + 1,
      }));

      // Delete existing entries and insert new ones with updated positions
      const { error: deleteError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('playlist_songs')
        .insert(updates);

      if (insertError) throw insertError;

      // Refresh the current playlist if it's the one being updated
      if (state.currentPlaylist && state.currentPlaylist.id === playlistId) {
        await fetchPlaylistById(playlistId);
      }

      return true;
    } catch (error) {
      console.error('Error reordering playlist songs:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlaylist, fetchPlaylistById]);

  const setCreating = useCallback((isCreating) => {
    dispatch({ type: 'SET_CREATING', payload: isCreating });
  }, []);

  // Auto-fetch playlists when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPlaylists();
    } else {
      // Clear playlists when user signs out
      dispatch({ type: 'SET_PLAYLISTS', payload: [] });
      dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: null });
    }
  }, [isAuthenticated, user, fetchPlaylists]);

  const value = {
    ...state,
    fetchPlaylists,
    fetchPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
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