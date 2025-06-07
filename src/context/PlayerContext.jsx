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

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.setVolume(state.volume);
  };

  const handlePlayerStateChange = (event) => {
    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 0) { // Video ended
      if (state.repeatMode === 'one') {
        playerRef.current?.seekTo(0);
        playerRef.current?.playVideo();
      } else if (state.repeatMode === 'all' || state.currentIndex < state.queue.length - 1) {
        playNext();
      } else {
        dispatch({ type: 'SET_PLAYING', payload: false });
      }
    }
  };

  const playNext = () => {
    if (state.currentIndex < state.queue.length - 1) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex + 1 });
    } else if (state.repeatMode === 'all') {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
    }
  };

  const playPrevious = () => {
    if (state.currentIndex > 0) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.currentIndex - 1 });
    } else if (state.repeatMode === 'all') {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: state.queue.length - 1 });
    }
  };

  const togglePlay = () => {
    if (state.isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
    dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying });
  };

  const setVolume = (volume) => {
    playerRef.current?.setVolume(volume);
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const seekTo = (time) => {
    playerRef.current?.seekTo(time);
  };

  useEffect(() => {
    if (
      state.currentIndex >= 0 &&
      state.queue[state.currentIndex] &&
      playerRef.current &&
      typeof playerRef.current.loadVideoById === 'function'
    ) {
      const currentSong = state.queue[state.currentIndex];
      playerRef.current.loadVideoById(currentSong.id);
      if (state.isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [state.currentIndex, state.queue]);

  // Sync isPlaying state with the YouTube player
  useEffect(() => {
    if (playerRef.current) {
      if (state.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [state.isPlaying]);

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