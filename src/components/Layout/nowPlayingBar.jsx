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

  // Debug logging
  React.useEffect(() => {
    console.log('NowPlaying Bar Values:', {
      currentTime,
      duration,
      isPlaying,
      currentSong: currentSong?.title
    });
  }, [currentTime, duration, isPlaying, currentSong]);

  // Placeholder values if no song is playing
  const isPlaceholder = !currentSong;
  const song = currentSong || {
    thumbnail: '',
    title: 'No song playing',
    artist: '—',
    id: '',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl px-2 sm:px-4 py-2 z-50 shadow-2xl">
      {/* Progress Bar - Acting as Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <div className="relative h-full">
          <div className="absolute inset-0 bg-white/20"></div>
          <input
            type="range"
            min="0"
            max={isPlaceholder ? 1 : duration}
            value={isPlaceholder ? 0 : currentTime}
            onChange={isPlaceholder ? undefined : (e) => seekTo(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isPlaceholder}
          />
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
            style={{ width: `${isPlaceholder ? 0 : (currentTime / duration) * 100}%` }}>
          </div>
        </div>
      </div>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5"></div>
      
      {currentSong && (
        <YouTubePlayer
          key={currentSong.id}
          videoId={currentSong.id}
          onReady={handlePlayerReady}
          onStateChange={handlePlayerStateChange}
        />
      )}
      
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        {/* Main Content Row */}
        <div className="flex items-center space-x-3 mb-2">
          {/* Album Art */}
          <div className="flex-shrink-0">
            {isPlaceholder ? (
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10">
                <Music className="w-6 h-6 text-white/60" />
              </div>
            ) : (
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-md object-cover shadow-lg"
              />
            )}
          </div>
          
          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm truncate ${isPlaceholder ? 'text-gray-400' : 'text-white'}`}>
              {song.title}
            </h3>
            <p className={`text-xs truncate ${isPlaceholder ? 'text-gray-600' : 'text-gray-300'} mt-0.5`}>
              {song.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={togglePlay}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed bg-gray-600' 
                  : 'bg-white/10 hover:bg-white/20 active:scale-95'
              } text-white`}
              disabled={isPlaceholder}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/10 active:scale-95'
              } text-gray-300 hover:text-white`}
              disabled={isPlaceholder}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Timestamp Display */}
        <div className="flex items-center justify-center space-x-2 text-xs">
          <span className={`font-mono tabular-nums transition-all duration-100 ${
            isPlaceholder ? 'text-gray-600' : 'text-gray-300'
          }`}>
            {formatTime(isPlaceholder ? 0 : currentTime)}
          </span>
          <div className={`w-1 h-1 rounded-full ${
            isPlaceholder ? 'bg-gray-600' : 'bg-gray-400'
          }`}></div>
          <span className={`font-mono tabular-nums ${
            isPlaceholder ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {formatTime(isPlaceholder ? 0 : duration)}
          </span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
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

          {/* Playback Controls - Center Section */}
          <div className="flex flex-col items-center justify-center flex-2 max-w-2xl px-6">
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

            {/* Timestamp Display */}
            <div className="flex items-center space-x-2 text-xs">
              <span className={`font-mono tabular-nums transition-all duration-100 ${
                isPlaceholder ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {formatTime(isPlaceholder ? 0 : currentTime)}
              </span>
              <div className={`w-1 h-1 rounded-full ${
                isPlaceholder ? 'bg-gray-600' : 'bg-gray-400'
              }`}></div>
              <span className={`font-mono tabular-nums ${
                isPlaceholder ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {formatTime(isPlaceholder ? 0 : duration)}
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
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transform -translate-y-1/2 transition-all duration-300 group-hover:h-1.5"
                     style={{ width: `${volume}%` }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
