import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

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
      return {
        ...state,
        queue: newQueue,
        currentIndex: state.currentIndex >= action.payload ? state.currentIndex - 1 : state.currentIndex,
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

  // Safe player function wrapper
  const safePlayerCall = (method, ...args) => {
    try {
      if (playerRef.current && typeof playerRef.current[method] === 'function' && isPlayerReadyRef.current) {
        return playerRef.current[method](...args);
      }
    } catch (error) {
      console.warn(`Error calling player method ${method}:`, error);
    }
    return null;
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    isPlayerReadyRef.current = true;
    safePlayerCall('setVolume', state.volume);
  };

  const handlePlayerStateChange = (event) => {
    if (!event || typeof event.data !== 'number') return;

    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) { // Playing
      dispatch({ type: 'SET_PLAYING', payload: true });
    } else if (event.data === 2) { // Paused
      dispatch({ type: 'SET_PLAYING', payload: false });
    } else if (event.data === 0) { // Video ended
      dispatch({ type: 'SET_PLAYING', payload: false });
      
      // Handle auto-play next
      if (state.repeatMode === 'one') {
        safePlayerCall('seekTo', 0);
        safePlayerCall('playVideo');
        dispatch({ type: 'SET_PLAYING', payload: true });
      } else if (state.repeatMode === 'all' || state.currentIndex < state.queue.length - 1) {
        setTimeout(() => playNext(), 100); // Small delay to prevent race conditions
      }
    } else if (event.data === 5) { // Video cued
      // Update duration when video is cued
      setTimeout(() => {
        const duration = safePlayerCall('getDuration');
        if (duration && duration > 0) {
          dispatch({ type: 'SET_DURATION', payload: duration });
        }
      }, 100);
    }
  };

  const playNext = () => {
    if (!state.queue.length) return;
    
    if (state.currentIndex < state.queue.length - 1) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex + 1 });
    } else if (state.repeatMode === 'all') {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
    }
  };

  const playPrevious = () => {
    if (!state.queue.length) return;
    
    if (state.currentIndex > 0) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex - 1 });
    } else if (state.repeatMode === 'all') {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.queue.length - 1 });
    }
  };

  const togglePlay = () => {
    if (!state.queue.length || state.currentIndex === -1) return;
    
    if (state.isPlaying) {
      safePlayerCall('pauseVideo');
      dispatch({ type: 'SET_PLAYING', payload: false });
    } else {
      safePlayerCall('playVideo');
      dispatch({ type: 'SET_PLAYING', payload: true });
    }
  };

  const setVolume = (volume) => {
    safePlayerCall('setVolume', volume);
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const seekTo = (time) => {
    safePlayerCall('seekTo', time);
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  // Update current time periodically
  useEffect(() => {
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      const currentTime = safePlayerCall('getCurrentTime');
      if (currentTime !== null && currentTime >= 0) {
        dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isPlaying]);

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
      
      // Load the new video
      if (currentSong.id) {
        safePlayerCall('loadVideoById', currentSong.id);
        
        // If we were playing, continue playing the new song
        if (state.isPlaying) {
          setTimeout(() => {
            safePlayerCall('playVideo');
          }, 100);
        }
      }
    }
  }, [state.currentIndex, state.queue]);

  const value = {
    queue: state.queue,
    currentIndex: state.currentIndex,
    currentSong: state.queue[state.currentIndex] || null,
    isPlaying: state.isPlaying,
    isShuffle: state.isShuffle,
    repeatMode: state.repeatMode,
    volume: state.volume,
    duration: state.duration,
    currentTime: state.currentTime,
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