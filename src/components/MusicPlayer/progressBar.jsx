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
    isMobile,
  } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const progressRef = useRef(null);

  const isDisabled = !currentSong || duration === 0;
  const progress = isDisabled ? 0 : (currentTime / duration) * 100;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return (percentage / 100) * duration;
  };

  const handleSeek = (e) => {
    if (isDisabled) return;
    const newTime = getTimeFromPosition(e.clientX);
    seekTo(newTime);
  };

  const handleMouseMove = (e) => {
    if (!showHoverPreview || isDisabled || isMobile) return;
    const time = getTimeFromPosition(e.clientX);
    setHoverTime(time);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (isDisabled) return;
    setIsTouching(true);
    setIsDragging(true);
    e.preventDefault(); // Prevent scrolling
  };

  const handleTouchMove = (e) => {
    if (isDisabled || !isTouching) return;
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const time = getTimeFromPosition(touch.clientX);
    setHoverTime(time);
  };

  const handleTouchEnd = (e) => {
    if (isDisabled || !isTouching) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const newTime = getTimeFromPosition(touch.clientX);
    seekTo(newTime);
    
    setIsTouching(false);
    setIsDragging(false);
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e) => {
    if (isDisabled || isMobile) return;
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  const sizeClasses = {
    small: {
      container: 'h-1',
      thumb: 'w-3 h-3',
      track: 'h-0.5',
    },
    default: {
      container: 'h-1.5',
      thumb: 'w-4 h-4',
      track: 'h-1',
    },
    large: {
      container: 'h-2',
      thumb: 'w-5 h-5',
      track: 'h-1.5',
    },
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showTime && (
        <span className="text-xs text-gray-400 font-mono tabular-nums min-w-[40px]">
          {formatTime(currentTime)}
        </span>
      )}
      
      <div
        ref={progressRef}
        className={`relative flex-1 ${sizeClasses[size].container} group cursor-pointer ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none' // Prevent scrolling during touch interactions
        }}
        aria-label="Seek slider"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={isDisabled ? -1 : 0}
      >
        {/* Track Background */}
        <div className={`absolute inset-0 bg-white/20 rounded-full ${sizeClasses[size].track}`} />
        
        {/* Progress Fill */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-200 ${sizeClasses[size].track}`}
          style={{ width: `${progress}%` }}
        />
        
        {/* Hover/Touch Preview */}
        {(isHovering || isTouching) && showHoverPreview && !isDisabled && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-full transition-opacity duration-200"
            style={{ left: `${Math.max(0, Math.min(100, (hoverTime / duration) * 100))}%` }}
          />
        )}
        
        {/* Interactive Thumb */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses[size].thumb} bg-white rounded-full shadow-lg transition-all duration-200 ${
            isDisabled 
              ? 'opacity-0' 
              : (isHovering || isDragging || isTouching)
                ? 'opacity-100 scale-110' 
                : 'opacity-0 group-hover:opacity-100'
          } ${isMobile ? 'opacity-100' : ''}`} // Always visible on mobile
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Touch target for mobile - larger invisible area */}
        {isMobile && (
          <div className="absolute inset-0 -mt-2 -mb-2" />
        )}
      </div>
      
      {showTime && (
        <span className="text-xs text-gray-400 font-mono tabular-nums min-w-[40px]">
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
