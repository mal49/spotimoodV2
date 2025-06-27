import React, { useState } from 'react';
import { Volume2, Volume1, Volume, VolumeX } from 'lucide-react';

export default function VolumeControl({ 
  volume = 50, 
  onVolumeChange = () => {}, 
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    onVolumeChange(newVolume);
  };

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 50);
  };

  const getVolumeIcon = () => {
    if (volume === 0) {
      return <VolumeX className={`${currentSize.icon} transition-all duration-300 ${isHovered ? 'drop-shadow-sm' : ''}`} />;
    } else if (volume < 30) {
      return <Volume className={`${currentSize.icon} transition-all duration-300 ${isHovered ? 'drop-shadow-sm' : ''}`} />;
    } else if (volume < 70) {
      return <Volume1 className={`${currentSize.icon} transition-all duration-300 ${isHovered ? 'drop-shadow-sm' : ''}`} />;
    } else {
      return <Volume2 className={`${currentSize.icon} transition-all duration-300 ${isHovered ? 'drop-shadow-sm' : ''}`} />;
    }
  };

  const sizeClasses = {
    small: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      slider: 'w-16 h-1',
      text: 'text-xs w-6'
    },
    default: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      slider: 'w-24 h-1',
      text: 'text-xs w-8'
    },
    large: {
      container: 'px-6 py-3',
      icon: 'w-6 h-6',
      slider: 'w-32 h-1.5',
      text: 'text-sm w-10'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div 
      className={`flex items-center space-x-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 ${currentSize.container} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Volume Icon */}
      <button
        onClick={toggleMute}
        className={`transition-all duration-300 hover:scale-110 active:scale-95 ${
          volume === 0 ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
        } focus:outline-none group`}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      {/* Volume Slider */}
      <div className="relative group flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className={`${currentSize.slider} bg-white/30 rounded-full appearance-none cursor-pointer slider-volume transition-all duration-300 ${
            isHovered || isDragging ? 'h-1.5' : ''
          }`}
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${volume}%, rgba(255,255,255,0.3) ${volume}%, rgba(255,255,255,0.3) 100%)`
          }}
        />
        
        {/* Custom progress track */}
        <div 
          className={`absolute top-1/2 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transform -translate-y-1/2 transition-all duration-300 ${
            isHovered || isDragging ? currentSize.slider.replace('h-1', 'h-1.5') : currentSize.slider
          }`}
          style={{ width: `${volume}%` }}
        >
        </div>

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm border border-white/20 transition-all duration-200">
            {volume}%
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900/90"></div>
          </div>
        )}
      </div>

      {/* Volume Percentage */}
      <span className={`${currentSize.text} text-gray-400 font-medium text-center transition-colors duration-300 ${
        isHovered ? 'text-gray-300' : ''
      }`}>
        {volume}
      </span>

      {/* Visual feedback bars */}
      <div className="flex items-center space-x-0.5">
        {[...Array(4)].map((_, index) => {
          const threshold = (index + 1) * 25;
          const isActive = volume >= threshold;
          return (
            <div
              key={index}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isActive 
                  ? `bg-gradient-to-t from-purple-500 to-pink-500 ${
                      index === 0 ? 'h-2' : index === 1 ? 'h-3' : index === 2 ? 'h-4' : 'h-5'
                    }` 
                  : `bg-white/20 ${
                      index === 0 ? 'h-2' : index === 1 ? 'h-3' : index === 2 ? 'h-4' : 'h-5'
                    }`
              } ${isHovered && isActive ? 'shadow-sm' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// Example usage:
// <VolumeControl 
//   volume={volume} 
//   onVolumeChange={setVolume} 
//   size="default"
//   className="my-custom-class"
// />
