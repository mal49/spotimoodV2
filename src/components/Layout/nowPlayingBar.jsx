import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import YouTubePlayer from '../YouTubePlayer';
import { 
  Music, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  Volume1, 
  Volume, 
  VolumeX 
} from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50 shadow-2xl">
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
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative group">
            {isPlaceholder ? (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 shadow-lg backdrop-blur-sm">
                <Music className="w-6 h-6 text-white/60" />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className={`font-semibold text-base truncate ${isPlaceholder ? 'text-gray-400' : 'text-white'} max-w-xs`}>
              {song.title}
            </h3>
            <p className={`text-xs truncate ${isPlaceholder ? 'text-gray-600' : 'text-gray-300'} max-w-xs`}>
              {song.artist}
            </p>
          </div>
        </div>

        {/* Playback Controls & Progress - Center Section */}
        <div className="flex flex-col items-center flex-2 max-w-2xl px-6">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={playPrevious}
              className={`group rounded-full p-2 transition-all duration-300 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/10 hover:scale-110 active:scale-95'
              } text-gray-300 hover:text-white focus:outline-none`}
              aria-label="Previous"
              disabled={isPlaceholder}
            >
              <SkipBack className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              onClick={togglePlay}
              className={`group relative rounded-full p-3 transition-all duration-300 ${
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
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 translate-x-0.5" />
                )}
              </div>
            </button>

            <button
              onClick={playNext}
              className={`group rounded-full p-2 transition-all duration-300 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/10 hover:scale-110 active:scale-95'
              } text-gray-300 hover:text-white focus:outline-none`}
              aria-label="Next"
              disabled={isPlaceholder}
            >
              <SkipForward className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-3 w-full max-w-xl">
            <span className="text-xs text-gray-400 font-medium w-10 text-right">
              {isPlaceholder ? '0:00' : formatTime(currentTime)}
            </span>
            
            <div className="relative flex-1 group">
              <input
                type="range"
                min="0"
                max={isPlaceholder ? 1 : duration}
                value={isPlaceholder ? 0 : currentTime}
                onChange={isPlaceholder ? undefined : (e) => seekTo(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                disabled={isPlaceholder}
                style={{
                  background: isPlaceholder 
                    ? 'rgba(255,255,255,0.2)' 
                    : `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              {/* Custom progress track */}
              <div className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transform -translate-y-1/2 transition-all duration-300 group-hover:h-2"
                   style={{ width: `${isPlaceholder ? 0 : (currentTime / duration) * 100}%` }}>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 font-medium w-10">
              {isPlaceholder ? '0:00' : formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center flex-1 justify-end">
          <div className="flex items-center space-x-2 bg-white/8 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/10 hover:bg-white/12 transition-all duration-300">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 50)}
              className="transition-all duration-300 hover:scale-110 active:scale-95 text-gray-300 hover:text-white focus:outline-none"
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 30 ? (
                <Volume className="w-4 h-4" />
              ) : volume < 70 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
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
