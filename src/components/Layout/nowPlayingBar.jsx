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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-50 shadow-2xl">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5"></div>
      
      {currentSong && (
        <YouTubePlayer
          videoId={currentSong.id}
          onReady={handlePlayerReady}
          onStateChange={handlePlayerStateChange}
        />
      )}
      
      <div className="relative flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="relative group">
            {isPlaceholder ? (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 shadow-lg backdrop-blur-sm">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-2v13" />
                  <circle cx="6" cy="18" r="3" fill="currentColor" />
                  <circle cx="18" cy="16" r="3" fill="currentColor" />
                </svg>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className={`font-semibold text-lg truncate ${isPlaceholder ? 'text-gray-400' : 'text-white'} mb-1 max-w-xs`}>
              {song.title}
            </h3>
            <p className={`text-sm truncate ${isPlaceholder ? 'text-gray-600' : 'text-gray-300'} max-w-xs`}>
              {song.artist}
            </p>
          </div>
        </div>

        {/* Playback Controls & Progress - Center Section */}
        <div className="flex flex-col items-center flex-2 max-w-2xl px-8">
          {/* Control Buttons */}
          <div className="flex items-center space-x-6 mb-3">
            <button
              onClick={playPrevious}
              className={`group rounded-full p-3 transition-all duration-300 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/10 hover:scale-110 active:scale-95'
              } text-gray-300 hover:text-white focus:outline-none`}
              aria-label="Previous"
              disabled={isPlaceholder}
            >
              <svg className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className={`group relative rounded-full p-4 transition-all duration-300 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed bg-gray-600' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl'
              } text-white focus:outline-none`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isPlaceholder}
            >
              {/* Glow effect */}
              {!isPlaceholder && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
              )}
              
              <div className="relative">
                {isPlaying ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21 5,3" fill="currentColor" />
                  </svg>
                )}
              </div>
            </button>

            <button
              onClick={playNext}
              className={`group rounded-full p-3 transition-all duration-300 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/10 hover:scale-110 active:scale-95'
              } text-gray-300 hover:text-white focus:outline-none`}
              aria-label="Next"
              disabled={isPlaceholder}
            >
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4 w-full max-w-xl">
            <span className="text-xs text-gray-400 font-medium w-12 text-right">
              {isPlaceholder ? '0:00' : formatTime(currentTime)}
            </span>
            
            <div className="relative flex-1 group">
              <input
                type="range"
                min="0"
                max={isPlaceholder ? 1 : duration}
                value={isPlaceholder ? 0 : currentTime}
                onChange={isPlaceholder ? undefined : (e) => seekTo(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                disabled={isPlaceholder}
                style={{
                  background: isPlaceholder 
                    ? 'rgba(255,255,255,0.2)' 
                    : `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              {/* Custom progress track */}
              <div className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transform -translate-y-1/2 transition-all duration-300 group-hover:h-3"
                   style={{ width: `${isPlaceholder ? 0 : (currentTime / duration) * 100}%` }}>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 font-medium w-12">
              {isPlaceholder ? '0:00' : formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center flex-1 justify-end">
          <div className="flex items-center space-x-3 bg-white/8 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10 hover:bg-white/12 transition-all duration-300">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 50)}
              className="transition-all duration-300 hover:scale-110 active:scale-95 text-gray-300 hover:text-white focus:outline-none"
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {volume === 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H2v-6h3.586l5.707-5.707A1 1 0 0 1 13 4v16a1 1 0 0 1-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                ) : volume < 30 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
                ) : volume < 70 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                )}
              </svg>
            </button>
            
            <div className="relative group flex-1">
              <div 
                className="w-24 h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newVolume = Math.round((x / rect.width) * 100);
                  setVolume(Math.max(0, Math.min(100, newVolume)));
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-200 group-hover:from-purple-400 group-hover:to-pink-400"
                  style={{ width: `${volume}%` }}
                />
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            <span className="text-xs text-gray-400 font-medium w-8 text-center tabular-nums">
              {volume}
            </span>
          </div>
        </div>
      </div>


    </div>
  );
}
