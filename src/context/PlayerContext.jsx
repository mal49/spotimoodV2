import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext();

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
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
        currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
      };
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: action.payload.length > 0 ? 0 : -1,
      };
    case 'REMOVE_FROM_QUEUE':
      const newQueue = state.queue.filter((_, idx) => idx !== action.payload);
      let newCurrentIndex = state.currentIndex;
      if (state.currentIndex >= action.payload) {
        newCurrentIndex = Math.max(-1, state.currentIndex - 1);
      }
      if (newQueue.length === 0) {
        newCurrentIndex = -1;
      }
      return {
        ...state,
        queue: newQueue,
        currentIndex: newCurrentIndex,
      };
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
      };
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
        isBuffering: action.payload ? false : state.isBuffering,
      };
    case 'SET_BUFFERING':
      return {
        ...state,
        isBuffering: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        hasError: action.payload,
        isPlaying: action.payload ? false : state.isPlaying,
        isBuffering: false,
      };
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffle: !state.isShuffle,
      };
    case 'SET_REPEAT_MODE':
      return {
        ...state,
        repeatMode: action.payload,
      };
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
      };
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };
    case 'CLEAR_QUEUE':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef(null);
  const isPlayerReadyRef = useRef(false);
  const timeUpdateIntervalRef = useRef(null);

  // Safe player function wrapper with improved error handling
  const safePlayerCall = useCallback((method, ...args) => {
    try {
      if (playerRef.current && typeof playerRef.current[method] === 'function' && isPlayerReadyRef.current) {
        return playerRef.current[method](...args);
      }
    } catch (error) {
      console.warn(`Error calling player method ${method}:`, error);
      dispatch({ type: 'SET_ERROR', payload: true });
    }
    return null;
  }, []);

  const handlePlayerReady = useCallback((player) => {
    playerRef.current = player;
    isPlayerReadyRef.current = true;
    dispatch({ type: 'SET_ERROR', payload: false });
    safePlayerCall('setVolume', state.volume);
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
        break;
      case 2: // Paused
        dispatch({ type: 'SET_PLAYING', payload: false });
        dispatch({ type: 'SET_BUFFERING', payload: false });
        break;
      case 3: // Buffering
        dispatch({ type: 'SET_BUFFERING', payload: true });
        break;
      case 0: // Video ended
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

  const setVolume = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    safePlayerCall('setVolume', clampedVolume);
    dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
  }, [safePlayerCall]);

  const seekTo = useCallback((time) => {
    const clampedTime = Math.max(0, Math.min(state.duration, time));
    safePlayerCall('seekTo', clampedTime);
    dispatch({ type: 'SET_CURRENT_TIME', payload: clampedTime });
  }, [state.duration, safePlayerCall]);

  // Improved time tracking with error handling
  useEffect(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    if (state.isPlaying && isPlayerReadyRef.current) {
      timeUpdateIntervalRef.current = setInterval(() => {
        try {
          const currentTime = safePlayerCall('getCurrentTime');
          if (currentTime !== null && currentTime >= 0) {
            dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
          }
        } catch (error) {
          console.warn('Error getting current time:', error);
        }
      }, 1000);
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [state.isPlaying, safePlayerCall]);

  // Handle song changes with better error handling
  useEffect(() => {
    if (
      state.currentIndex >= 0 &&
      state.queue[state.currentIndex] &&
      isPlayerReadyRef.current
    ) {
      const currentSong = state.queue[state.currentIndex];
      
      // Reset current time when switching songs
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
      dispatch({ type: 'SET_ERROR', payload: false });
      
      // Load the new video
      if (currentSong.id) {
        try {
          safePlayerCall('loadVideoById', currentSong.id);
          
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
  }, [state.currentIndex, state.queue, state.isPlaying, safePlayerCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
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