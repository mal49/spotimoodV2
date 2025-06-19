import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import YouTubePlayer from '../YouTubePlayer';

// Now Playing Bar Component
export default function NowPlayingBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seekTo,
    handlePlayerReady,
    handlePlayerStateChange,
  } = usePlayer();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Placeholder values if no song is playing
  const isPlaceholder = !currentSong;
  const song = currentSong || {
    thumbnail: '',
    title: 'No song playing',
    artist: '—',
    id: '',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-hover px-8 py-4 z-50 shadow-lg">
      {currentSong && (
        <YouTubePlayer
          videoId={currentSong.id}
          onReady={handlePlayerReady}
          onStateChange={handlePlayerStateChange}
        />
      )}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0">
          {isPlaceholder ? (
            <div className="w-14 h-14 rounded flex items-center justify-center bg-gradient-to-br from-primary-purple/80 to-dark-hover/80 shadow">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-2v13" />
                <circle cx="6" cy="18" r="3" fill="currentColor" />
                <circle cx="18" cy="16" r="3" fill="currentColor" />
              </svg>
            </div>
          ) : (
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-14 h-14 rounded object-cover shadow"
            />
          )}
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className={`font-semibold truncate ${isPlaceholder ? 'text-gray-300' : 'text-white'}`}>{song.title}</h3>
            <p className={`text-sm truncate ${isPlaceholder ? 'text-gray-500' : 'text-gray-400'}`}>{song.artist}</p>
          </div>
        </div>

        {/* Playback Controls & Progress */}
        <div className="flex flex-col items-center w-full max-w-xl px-8">
          <div className="flex items-center space-x-6 mb-2">
            <button
              onClick={playPrevious}
              className={`rounded-full p-2 ${isPlaceholder ? 'opacity-40 cursor-not-allowed' : 'hover:bg-dark-hover hover:text-primary-purple'} text-gray-400 focus:outline-none transition`}
              aria-label="Previous"
              disabled={isPlaceholder}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className={`rounded-full p-4 shadow-lg ${isPlaceholder ? 'opacity-40 cursor-not-allowed bg-gray-400' : 'bg-primary-purple hover:bg-primary-purple/90'} text-white focus:outline-none transition-transform duration-150 ${!isPlaceholder && 'hover:scale-110'}`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isPlaceholder}
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21 5,3" fill="currentColor" />
                </svg>
              )}
            </button>
            <button
              onClick={playNext}
              className={`rounded-full p-2 ${isPlaceholder ? 'opacity-40 cursor-not-allowed' : 'hover:bg-dark-hover hover:text-primary-purple'} text-gray-400 focus:outline-none transition`}
              aria-label="Next"
              disabled={isPlaceholder}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">{isPlaceholder ? '0:00' : formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={isPlaceholder ? 1 : duration}
              value={isPlaceholder ? 0 : currentTime}
              onChange={isPlaceholder ? undefined : (e) => seekTo(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-purple"
              disabled={isPlaceholder}
            />
            <span className="text-xs text-gray-400 w-10">{isPlaceholder ? '0:00' : formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 w-48 justify-end">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-28 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-purple"
          />
        </div>
      </div>
    </div>
  );
}
