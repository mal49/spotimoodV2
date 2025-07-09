import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1 
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function PlaybackControl({ 
  size = 'default', // 'small', 'default', 'large'
  className = '',
  showShuffle = true,
  showRepeat = true 
}) {
  const {
    isPlaying,
    isShuffle,
    repeatMode,
    currentSong,
    togglePlay,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    isMobile,
  } = usePlayer();

  const isDisabled = !currentSong;

  const handleRepeatClick = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return <Repeat1 className={`${sizeClasses[size].icon} transition-all duration-300`} />;
    }
    return <Repeat className={`${sizeClasses[size].icon} transition-all duration-300`} />;
  };

  const sizeClasses = {
    small: {
      container: 'space-x-2',
      icon: 'w-4 h-4',
      mainButton: 'p-2',
      sideButton: 'p-1.5',
    },
    default: {
      container: 'space-x-4',
      icon: 'w-5 h-5',
      mainButton: 'p-3',
      sideButton: 'p-2',
    },
    large: {
      container: 'space-x-6',
      icon: 'w-6 h-6',
      mainButton: 'p-4',
      sideButton: 'p-3',
    },
  };

  // Mobile-specific size adjustments
  const mobileClasses = isMobile ? {
    container: 'space-x-6',
    icon: size === 'small' ? 'w-5 h-5' : size === 'large' ? 'w-7 h-7' : 'w-6 h-6',
    mainButton: size === 'small' ? 'p-3' : size === 'large' ? 'p-5' : 'p-4',
    sideButton: size === 'small' ? 'p-2.5' : size === 'large' ? 'p-3.5' : 'p-3',
  } : sizeClasses[size];

  const buttonBaseClasses = "rounded-full transition-all duration-300 focus:outline-none touch-target";
  const mobileButtonClasses = isMobile ? "active:scale-95" : "hover:scale-110 active:scale-95";
  const tapHighlightStyle = { WebkitTapHighlightColor: 'transparent' };

  return (
    <div className={`flex items-center justify-center ${mobileClasses.container} ${className}`}>
      {/* Shuffle Button */}
      {showShuffle && (
        <button
          onClick={toggleShuffle}
          className={`${mobileClasses.sideButton} ${buttonBaseClasses} ${mobileButtonClasses} ${
            isDisabled 
              ? 'opacity-40 cursor-not-allowed' 
              : isShuffle 
                ? 'text-purple-400 hover:text-purple-300 bg-purple-500/20 hover:bg-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          style={tapHighlightStyle}
          disabled={isDisabled}
          aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
        >
          <Shuffle className={`${mobileClasses.icon} transition-all duration-300 ${
            isShuffle ? 'drop-shadow-sm' : ''
          }`} />
        </button>
      )}

      {/* Previous Button */}
      <button
        onClick={playPrevious}
        className={`${mobileClasses.sideButton} ${buttonBaseClasses} ${mobileButtonClasses} ${
          isDisabled 
            ? 'opacity-40 cursor-not-allowed text-gray-500' 
            : 'text-gray-300 hover:text-white hover:bg-white/10'
        }`}
        style={tapHighlightStyle}
        disabled={isDisabled}
        aria-label="Previous track"
      >
        <SkipBack className={`${mobileClasses.icon} transition-transform group-hover:-translate-x-0.5`} />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`${mobileClasses.mainButton} ${buttonBaseClasses} ${mobileButtonClasses} relative ${
          isDisabled 
            ? 'opacity-40 cursor-not-allowed bg-gray-600' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
        } text-white`}
        style={tapHighlightStyle}
        disabled={isDisabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {/* Glow effect */}
        {!isDisabled && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 blur-lg ${
            isMobile ? 'active:opacity-30' : 'group-hover:opacity-30'
          }`}></div>
        )}
        
        <div className="relative">
          {isPlaying ? (
            <Pause className={`${mobileClasses.icon} transition-all duration-300`} />
          ) : (
            <Play className={`${mobileClasses.icon} translate-x-0.5 transition-all duration-300`} />
          )}
        </div>
      </button>

      {/* Next Button */}
      <button
        onClick={playNext}
        className={`${mobileClasses.sideButton} ${buttonBaseClasses} ${mobileButtonClasses} ${
          isDisabled 
            ? 'opacity-40 cursor-not-allowed text-gray-500' 
            : 'text-gray-300 hover:text-white hover:bg-white/10'
        }`}
        style={tapHighlightStyle}
        disabled={isDisabled}
        aria-label="Next track"
      >
        <SkipForward className={`${mobileClasses.icon} transition-transform group-hover:translate-x-0.5`} />
      </button>

      {/* Repeat Button */}
      {showRepeat && (
        <button
          onClick={handleRepeatClick}
          className={`${mobileClasses.sideButton} ${buttonBaseClasses} ${mobileButtonClasses} ${
            isDisabled 
              ? 'opacity-40 cursor-not-allowed' 
              : repeatMode !== 'none'
                ? 'text-purple-400 hover:text-purple-300 bg-purple-500/20 hover:bg-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          style={tapHighlightStyle}
          disabled={isDisabled}
          aria-label={`Repeat: ${repeatMode}`}
        >
          {getRepeatIcon()}
        </button>
      )}
    </div>
  );
}

// Example usage:
// <PlaybackControl 
//   size="default"
//   showShuffle={true}
//   showRepeat={true}
//   className="my-custom-class"
// />
