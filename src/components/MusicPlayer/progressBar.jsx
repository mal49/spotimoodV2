import React, { useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';

export default function ProgressBar({ 
  className = '',
  size = 'default', // 'small', 'default', 'large'
  showTime = true,
  showHoverPreview = true
}) {
  const {
    currentTime,
    duration,
    currentSong,
    seekTo,
  } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const progressRef = useRef(null);

  const isDisabled = !currentSong || duration === 0;
  const progress = isDisabled ? 0 : (currentTime / duration) * 100;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (isDisabled) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percentage / 100) * duration;
    
    seekTo(newTime);
  };

  const handleMouseMove = (e) => {
    if (!showHoverPreview || isDisabled) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percentage / 100) * duration;
    
    setHoverTime(time);
  };

  const sizeClasses = {
    small: {
      height: 'h-1',
      hoverHeight: 'group-hover:h-1.5',
      timeText: 'text-xs',
      timeWidth: 'w-8',
    },
    default: {
      height: 'h-1.5',
      hoverHeight: 'group-hover:h-2',
      timeText: 'text-xs',
      timeWidth: 'w-10',
    },
    large: {
      height: 'h-2',
      hoverHeight: 'group-hover:h-2.5',
      timeText: 'text-sm',
      timeWidth: 'w-12',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Current Time */}
      {showTime && (
        <span className={`${currentSize.timeText} text-gray-400 font-medium ${currentSize.timeWidth} text-right tabular-nums`}>
          {formatTime(currentTime)}
        </span>
      )}

      {/* Progress Bar Container */}
      <div 
        ref={progressRef}
        className="relative flex-1 group cursor-pointer"
        onClick={handleSeek}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Background Track */}
        <div className={`${currentSize.height} ${currentSize.hoverHeight} bg-white/20 rounded-full transition-all duration-300 relative overflow-hidden`}>
          {/* Progress Fill */}
          <div 
            className={`${currentSize.height} ${currentSize.hoverHeight} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 absolute top-0 left-0 group-hover:from-purple-400 group-hover:to-pink-400 ${
              isDragging ? 'from-purple-400 to-pink-400' : ''
            }`}
            style={{ width: `${progress}%` }}
          />
          
          {/* Hover Preview */}
          {showHoverPreview && isHovering && !isDisabled && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-80 pointer-events-none transition-opacity duration-200"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            />
          )}
          
          {/* Current Position Indicator */}
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-300 ${
              isHovering || isDragging ? 'opacity-100 scale-110' : 'opacity-0 scale-75'
            } pointer-events-none`}
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Hidden Range Input for Better Accessibility */}
        <input
          type="range"
          min="0"
          max={duration || 1}
          value={currentTime}
          onChange={(e) => !isDisabled && seekTo(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isDisabled}
          aria-label="Seek"
        />

        {/* Hover Time Tooltip */}
        {showHoverPreview && isHovering && !isDisabled && (
          <div 
            className="absolute -top-10 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm border border-white/20 pointer-events-none transition-all duration-200"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900/90"></div>
          </div>
        )}
      </div>

      {/* Duration */}
      {showTime && (
        <span className={`${currentSize.timeText} text-gray-400 font-medium ${currentSize.timeWidth} tabular-nums`}>
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}

// Example usage:
// <ProgressBar 
//   size="default"
//   showTime={true}
//   showHoverPreview={true}
//   className="my-custom-class"
// />
