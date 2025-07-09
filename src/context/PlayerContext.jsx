import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext();

// State persistence helpers
const PLAYER_STORAGE_KEY = 'spotimood-player-state';

const loadPersistedPlayerState = () => {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        queue: parsed.queue || [],
        currentIndex: parsed.currentIndex ?? -1,
        volume: parsed.volume ?? 100,
        isShuffle: parsed.isShuffle || false,
        repeatMode: parsed.repeatMode || 'none',
        // Don't restore playback state - always start paused
        isPlaying: false,
        duration: 0,
        currentTime: 0,
        isBuffering: false,
        hasError: false,
        isRestoringState: true, // Flag to indicate we're restoring state
      };
    }
  } catch (error) {
    console.warn('Failed to load persisted player state:', error);
  }
  return {};
};

const savePlayerStateToStorage = (state) => {
  try {
    const stateToSave = {
      queue: state.queue,
      currentIndex: state.currentIndex,
      volume: state.volume,
      isShuffle: state.isShuffle,
      repeatMode: state.repeatMode,
    };
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to save player state:', error);
  }
};

const initialState = {
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 'none', // 'none', 'one', 'all'
  volume: 100,
  duration: 0,
  currentTime: 0,
  isBuffering: false,
  hasError: false,
  isRestoringState: false,
  lastLoadedSongId: null, // Track the last loaded song to prevent unnecessary reloads
  ...loadPersistedPlayerState(), // Load persisted state
};

function playerReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'ADD_TO_QUEUE':
      newState = {
        ...state,
        queue: [...state.queue, action.payload],
        currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
        isRestoringState: false,
      };
      break;
    case 'SET_QUEUE':
      newState = {
        ...state,
        queue: action.payload,
        currentIndex: action.payload.length > 0 ? 0 : -1,
        isRestoringState: false,
      };
      break;
    case 'REMOVE_FROM_QUEUE':
      const newQueue = state.queue.filter((_, idx) => idx !== action.payload);
      let newCurrentIndex = state.currentIndex;
      if (state.currentIndex >= action.payload) {
        newCurrentIndex = Math.max(-1, state.currentIndex - 1);
      }
      if (newQueue.length === 0) {
        newCurrentIndex = -1;
      }
      newState = {
        ...state,
        queue: newQueue,
        currentIndex: newCurrentIndex,
        isRestoringState: false,
      };
      break;
    case 'SET_CURRENT_INDEX':
      newState = {
        ...state,
        currentIndex: action.payload,
        isRestoringState: false,
      };
      break;
    case 'SET_PLAYING':
      newState = {
        ...state,
        isPlaying: action.payload,
        isBuffering: action.payload ? false : state.isBuffering,
      };
      break;
    case 'SET_BUFFERING':
      newState = {
        ...state,
        isBuffering: action.payload,
      };
      break;
    case 'SET_ERROR':
      newState = {
        ...state,
        hasError: action.payload,
        isPlaying: action.payload ? false : state.isPlaying,
        isBuffering: false,
      };
      break;
    case 'TOGGLE_SHUFFLE':
      newState = {
        ...state,
        isShuffle: !state.isShuffle,
      };
      break;
    case 'SET_REPEAT_MODE':
      newState = {
        ...state,
        repeatMode: action.payload,
      };
      break;
    case 'SET_VOLUME':
      newState = {
        ...state,
        volume: action.payload,
      };
      break;
    case 'SET_DURATION':
      newState = {
        ...state,
        duration: action.payload,
      };
      break;
    case 'SET_CURRENT_TIME':
      newState = {
        ...state,
        currentTime: action.payload,
      };
      break;
    case 'SET_LAST_LOADED_SONG_ID':
      newState = {
        ...state,
        lastLoadedSongId: action.payload,
      };
      break;
    case 'CLEAR_RESTORING_FLAG':
      newState = {
        ...state,
        isRestoringState: false,
      };
      break;
    case 'CLEAR_QUEUE':
      newState = {
        ...initialState,
        volume: state.volume, // Keep volume setting
        lastLoadedSongId: null,
      };
      break;
    default:
      return state;
  }
  
  // Save persistent state (but not playback state like isPlaying, currentTime, etc.)
  if (['ADD_TO_QUEUE', 'SET_QUEUE', 'REMOVE_FROM_QUEUE', 'SET_CURRENT_INDEX', 'TOGGLE_SHUFFLE', 'SET_REPEAT_MODE', 'SET_VOLUME'].includes(action.type)) {
    savePlayerStateToStorage(newState);
  }
  
  return newState;
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef(null);
  const isPlayerReadyRef = useRef(false);
  const timeUpdateIntervalRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const pendingVolumeRef = useRef(null);

  // Clear restoring flag after initial mount
  useEffect(() => {
    if (state.isRestoringState) {
      // Give time for any initial effects to run, then clear the flag
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_RESTORING_FLAG' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isRestoringState]);

  // Add page visibility handling for player state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden - save current state
        savePlayerStateToStorage(state);
      } else if (document.visibilityState === 'visible') {
        // Page is visible again - restore volume setting if needed
        if (isPlayerReadyRef.current && playerRef.current && state.volume !== pendingVolumeRef.current) {
          setTimeout(() => {
            try {
              if (typeof playerRef.current.setVolume === 'function') {
                playerRef.current.setVolume(state.volume);
              }
            } catch (error) {
              console.warn('Error restoring volume after visibility change:', error);
            }
          }, 100);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state]);

  // Safe player function wrapper with improved error handling
  const safePlayerCall = useCallback((method, ...args) => {
    try {
      if (playerRef.current && typeof playerRef.current[method] === 'function' && isPlayerReadyRef.current) {
        return playerRef.current[method](...args);
      }
    } catch (error) {
      console.warn(`Error calling player method ${method}:`, error);
      // Only dispatch error for critical methods, not for volume changes
      if (method !== 'setVolume') {
        dispatch({ type: 'SET_ERROR', payload: true });
      }
    }
    return null;
  }, []);

  const handlePlayerReady = useCallback((player) => {
    playerRef.current = player;
    isPlayerReadyRef.current = true;
    dispatch({ type: 'SET_ERROR', payload: false });
    
    // Set initial volume
    setTimeout(() => {
      try {
        const volumeToSet = pendingVolumeRef.current || state.volume;
        console.log('Setting initial volume on player ready:', volumeToSet);
        if (typeof player.setVolume === 'function') {
          player.setVolume(volumeToSet);
          console.log('Initial volume set successfully');
          pendingVolumeRef.current = null;
        }
      } catch (error) {
        console.warn('Error setting initial volume (non-critical):', error);
        pendingVolumeRef.current = null;
      }
    }, 200);
    
    // Get initial duration
    setTimeout(() => {
      try {
        const duration = player.getDuration();
        if (duration && duration > 0) {
          dispatch({ type: 'SET_DURATION', payload: duration });
          console.log('Player ready - Duration set:', duration);
        }
      } catch (error) {
        console.warn('Error getting initial duration:', error);
      }
    }, 500);
  }, [state.volume, safePlayerCall]);

  const handlePlayerStateChange = useCallback((event) => {
    if (!event || typeof event.data !== 'number') return;

    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    switch (event.data) {
      case 1: // Playing
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_BUFFERING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: false });
        
        // Apply any pending volume changes when playing starts (safe state)
        setTimeout(() => {
          if (pendingVolumeRef.current !== null && playerRef.current) {
            console.log('Applying pending volume change during play state:', pendingVolumeRef.current);
            try {
              if (typeof playerRef.current.setVolume === 'function') {
                playerRef.current.setVolume(pendingVolumeRef.current);
                console.log('Pending volume applied successfully');
                pendingVolumeRef.current = null;
              }
            } catch (error) {
              console.warn('Error applying pending volume (non-critical):', error);
              // Clear pending volume even if it fails to prevent loops
              pendingVolumeRef.current = null;
            }
          }
        }, 100);
        
        // Ensure we have duration when playing starts
        setTimeout(() => {
          const duration = safePlayerCall('getDuration');
          if (duration && duration > 0) {
            dispatch({ type: 'SET_DURATION', payload: duration });
            console.log('Playing started - Duration updated:', duration);
          }
        }, 100);
        break;
      case 2: // Paused
        dispatch({ type: 'SET_PLAYING', payload: false });
        dispatch({ type: 'SET_BUFFERING', payload: false });
        break;
      case 3: // Buffering
        dispatch({ type: 'SET_BUFFERING', payload: true });
        break;
      case 0: // Ended
        dispatch({ type: 'SET_PLAYING', payload: false });
        dispatch({ type: 'SET_BUFFERING', payload: false });
        
        // Handle auto-play next with current state
        if (state.repeatMode === 'one') {
          safePlayerCall('seekTo', 0);
          safePlayerCall('playVideo');
          dispatch({ type: 'SET_PLAYING', payload: true });
        } else if (state.repeatMode === 'all' || state.currentIndex < state.queue.length - 1) {
          setTimeout(() => {
            // Use a callback to get fresh state
            dispatch((prevState) => {
              if (prevState.currentIndex < prevState.queue.length - 1) {
                return { type: 'SET_CURRENT_INDEX', payload: prevState.currentIndex + 1 };
              } else if (prevState.repeatMode === 'all') {
                return { type: 'SET_CURRENT_INDEX', payload: 0 };
              }
              return prevState;
            });
          }, 100);
        }
        break;
      case 5: // Video cued
        // Update duration when video is cued
        setTimeout(() => {
          const duration = safePlayerCall('getDuration');
          if (duration && duration > 0) {
            dispatch({ type: 'SET_DURATION', payload: duration });
          }
        }, 100);
        break;
    }
  }, [state.repeatMode, state.currentIndex, state.queue.length, safePlayerCall]);

  // Memoized navigation functions to prevent state issues
  const playNext = useCallback(() => {
    dispatch((prevState) => {
      if (!prevState.queue.length) return prevState;
      
      if (prevState.currentIndex < prevState.queue.length - 1) {
        return { type: 'SET_CURRENT_INDEX', payload: prevState.currentIndex + 1 };
      } else if (prevState.repeatMode === 'all') {
        return { type: 'SET_CURRENT_INDEX', payload: 0 };
      }
      return prevState;
    });
  }, []);

  const playPrevious = useCallback(() => {
    dispatch((prevState) => {
      if (!prevState.queue.length) return prevState;
      
      if (prevState.currentIndex > 0) {
        return { type: 'SET_CURRENT_INDEX', payload: prevState.currentIndex - 1 };
      } else if (prevState.repeatMode === 'all') {
        return { type: 'SET_CURRENT_INDEX', payload: prevState.queue.length - 1 };
      }
      return prevState;
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!state.queue.length || state.currentIndex === -1) return;
    
    if (state.isPlaying) {
      safePlayerCall('pauseVideo');
    } else {
      safePlayerCall('playVideo');
    }
  }, [state.queue.length, state.currentIndex, state.isPlaying, safePlayerCall]);

  // Simplified and safer volume control
  const setVolume = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    
    // Update UI immediately for responsive feedback
    dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
    
    // Clear existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    // Simple debounced volume application - no complex state checking
    volumeTimeoutRef.current = setTimeout(() => {
      try {
        if (isPlayerReadyRef.current && playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(clampedVolume);
          console.log('Volume set successfully:', clampedVolume);
          pendingVolumeRef.current = null;
        } else {
          // Store volume for when player becomes ready
          pendingVolumeRef.current = clampedVolume;
          console.log('Volume stored for later application:', clampedVolume);
        }
      } catch (error) {
        console.warn('Error setting volume (will retry):', error);
        pendingVolumeRef.current = clampedVolume;
      }
    }, 100);
  }, []);

  const seekTo = useCallback((time) => {
    if (state.duration > 0) {
      const clampedTime = Math.max(0, Math.min(state.duration, time));
      dispatch({ type: 'SET_CURRENT_TIME', payload: clampedTime });
      safePlayerCall('seekTo', clampedTime, true);
    }
  }, [state.duration, safePlayerCall]);

  // Time tracking effect
  useEffect(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    if (state.isPlaying && isPlayerReadyRef.current && playerRef.current) {
      console.log('Starting time tracking interval');
      timeUpdateIntervalRef.current = setInterval(() => {
        try {
          const currentTime = safePlayerCall('getCurrentTime');
          const duration = safePlayerCall('getDuration');
          
          if (currentTime !== null && currentTime >= 0) {
            dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
          }
          
          // Update duration if it changed
          if (duration !== null && duration > 0 && duration !== state.duration) {
            dispatch({ type: 'SET_DURATION', payload: duration });
          }
        } catch (error) {
          console.warn('Error getting current time:', error);
        }
      }, 100); // Changed from 1000ms to 100ms for smooth time tracking
    } else {
      console.log('Time tracking not started:', {
        isPlaying: state.isPlaying,
        isPlayerReady: isPlayerReadyRef.current,
        hasPlayer: !!playerRef.current
      });
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [state.isPlaying, state.duration, safePlayerCall]);

  // Handle song changes with better error handling - FIXED to prevent unnecessary reloads
  useEffect(() => {
    if (
      state.currentIndex >= 0 &&
      state.queue[state.currentIndex] &&
      isPlayerReadyRef.current &&
      !state.isRestoringState // Don't reload if we're just restoring state
    ) {
      const currentSong = state.queue[state.currentIndex];
      
      // Check if this song is already loaded to prevent unnecessary reloads
      if (currentSong.id === state.lastLoadedSongId) {
        console.log('Song already loaded, skipping reload:', currentSong.title);
        return;
      }
      
      // Reset current time when switching songs
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
      dispatch({ type: 'SET_ERROR', payload: false });
      
      // Load the new video
      if (currentSong.id) {
        try {
          console.log('Loading new video:', currentSong.title);
          safePlayerCall('loadVideoById', currentSong.id);
          
          // Track the loaded song ID
          dispatch({ type: 'SET_LAST_LOADED_SONG_ID', payload: currentSong.id });
          
          // Get duration after loading
          setTimeout(() => {
            const duration = safePlayerCall('getDuration');
            if (duration && duration > 0) {
              dispatch({ type: 'SET_DURATION', payload: duration });
              console.log('Video loaded - Duration set:', duration);
            }
          }, 1000);
          
          // If we were playing, continue playing the new song
          if (state.isPlaying) {
            setTimeout(() => {
              safePlayerCall('playVideo');
            }, 100);
          }
        } catch (error) {
          console.error('Error loading video:', error);
          dispatch({ type: 'SET_ERROR', payload: true });
        }
      }
    }
  }, [state.currentIndex, state.queue, state.isRestoringState, state.lastLoadedSongId, safePlayerCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      // Clear pending volume
      pendingVolumeRef.current = null;
    };
  }, []);

  const value = {
    // State
    queue: state.queue,
    currentIndex: state.currentIndex,
    currentSong: state.queue[state.currentIndex] || null,
    isPlaying: state.isPlaying,
    isShuffle: state.isShuffle,
    repeatMode: state.repeatMode,
    volume: state.volume,
    duration: state.duration,
    currentTime: state.currentTime,
    isBuffering: state.isBuffering,
    hasError: state.hasError,
    
    // Actions
    addToQueue: (song) => dispatch({ type: 'ADD_TO_QUEUE', payload: song }),
    setQueue: (songs) => dispatch({ type: 'SET_QUEUE', payload: songs }),
    removeFromQueue: (idx) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: idx }),
    setCurrentIndex: (idx) => dispatch({ type: 'SET_CURRENT_INDEX', payload: idx }),
    setPlaying: (playing) => dispatch({ type: 'SET_PLAYING', payload: playing }),
    toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
    setRepeatMode: (mode) => dispatch({ type: 'SET_REPEAT_MODE', payload: mode }),
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    togglePlay,
    clearQueue: () => dispatch({ type: 'CLEAR_QUEUE' }),
    handlePlayerReady,
    handlePlayerStateChange,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
} 