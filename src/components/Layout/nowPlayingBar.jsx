import React, { useState, useEffect } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Music, Volume2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { usePlaylist } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import YouTubePlayer from '../YouTubePlayer';
import ProgressBar from '../MusicPlayer/progressBar';

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

  const {
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    fetchPlaylists,
  } = usePlaylist();

  const { isAuthenticated } = useAuth();

  // Check if current song is liked (in Liked Songs playlist)
  const likedSongsPlaylist = playlists.find(playlist => 
    playlist.name === 'Liked Songs' || playlist.title === 'Liked Songs'
  );
  
  const isCurrentSongLiked = React.useMemo(() => {
    if (!currentSong || !likedSongsPlaylist || !likedSongsPlaylist.songs) {
      return false;
    }
    return likedSongsPlaylist.songs.some(song => 
      song.youtube_id === currentSong.id || song.id === currentSong.id
    );
  }, [currentSong, likedSongsPlaylist]);

  const [isLiking, setIsLiking] = React.useState(false);

  const handleLikeToggle = async () => {
    if (!currentSong || !isAuthenticated || isLiking) return;

    setIsLiking(true);
    try {
      let targetPlaylist = likedSongsPlaylist;
      
      // Create "Liked Songs" playlist if it doesn't exist
      if (!targetPlaylist) {
        console.log('Creating Liked Songs playlist...');
        targetPlaylist = await createPlaylist({
          name: 'Liked Songs',
          description: 'Songs you loved',
          is_public: false
        });
        
        if (!targetPlaylist) {
          console.error('Failed to create Liked Songs playlist');
          return;
        }
        
        // Refresh playlists to get the updated list
        await fetchPlaylists();
      }

      if (isCurrentSongLiked) {
        // Remove from liked songs
        console.log('Removing song from Liked Songs...');
        // Find the song in the playlist to get its ID
        const songInPlaylist = targetPlaylist.songs?.find(song => 
          song.youtube_id === currentSong.id || song.id === currentSong.id
        );
        
        if (songInPlaylist) {
          await removeSongFromPlaylist(targetPlaylist.id, songInPlaylist.id);
        }
      } else {
        // Add to liked songs
        console.log('Adding song to Liked Songs...');
        const songData = {
          youtube_id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          duration: currentSong.duration || 'N/A',
          thumbnail: currentSong.thumbnail,
          channelTitle: currentSong.artist
        };
        
        await addSongToPlaylist(targetPlaylist.id, songData);
      }
      
      // Refresh playlists to update the liked status
      await fetchPlaylists();
    } catch (error) {
      console.error('Error toggling like status:', error);
    } finally {
      setIsLiking(false);
    }
  };

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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl px-2 sm:px-4 py-2 z-50 shadow-2xl mobile-player-controls">
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target"
            style={{ WebkitTapHighlightColor: 'transparent' }}
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
      <div className="block sm:hidden mobile-scroll">
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

          {/* Like Button - Mobile */}
          {isAuthenticated && !isPlaceholder && (
            <button
              onClick={handleLikeToggle}
              disabled={isLiking}
              className="touch-target mobile-button flex-shrink-0 p-2 rounded-full transition-all duration-300 focus:outline-none active:scale-95"
              aria-label={isCurrentSongLiked ? 'Remove from liked songs' : 'Add to liked songs'}
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-300 ${
                  isCurrentSongLiked 
                    ? 'text-red-500 fill-red-500 drop-shadow-sm' 
                    : 'text-gray-400 hover:text-red-400'
                } ${isLiking ? 'animate-pulse' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Mobile Controls Row */}
        <div className="flex items-center justify-center space-x-6 py-1">
          {/* Previous Button */}
          <button
            onClick={playPrevious}
            className={`touch-target mobile-button p-2 rounded-full transition-all duration-300 focus:outline-none active:scale-95 ${
              isPlaceholder 
                ? 'opacity-40 cursor-not-allowed text-gray-500' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            disabled={isPlaceholder}
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause Button - Larger for mobile */}
          <button
            onClick={togglePlay}
            className={`touch-target mobile-button p-3 rounded-full transition-all duration-300 focus:outline-none active:scale-95 relative ${
              isPlaceholder 
                ? 'opacity-40 cursor-not-allowed bg-gray-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg'
            } text-white`}
            disabled={isPlaceholder}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {/* Glow effect for mobile */}
            {!isPlaceholder && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 active:opacity-30 blur-lg transition-opacity duration-200"></div>
            )}
            
            <div className="relative">
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 translate-x-0.5" />
              )}
            </div>
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            className={`touch-target mobile-button p-2 rounded-full transition-all duration-300 focus:outline-none active:scale-95 ${
              isPlaceholder 
                ? 'opacity-40 cursor-not-allowed text-gray-500' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            disabled={isPlaceholder}
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Timestamp Display */}
        <div className="mt-2 px-1">
          <ProgressBar
            size="small"
            showTime={true}
            showHoverPreview={false}
            className="w-full"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-7xl mx-auto px-4">
        {/* Left: Song Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative group">
            {isPlaceholder ? (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10">
                <Music className="w-6 h-6 text-white/60" />
              </div>
            ) : (
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover shadow-lg border border-white/20"
              />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className={`font-medium text-sm truncate ${isPlaceholder ? 'text-gray-400' : 'text-white'}`}>
              {song.title}
            </h3>
            <p className={`text-xs truncate ${isPlaceholder ? 'text-gray-600' : 'text-gray-300'}`}>
              {song.artist}
            </p>
          </div>

          {/* Like Button */}
          {isAuthenticated && (
            <button
              onClick={handleLikeToggle}
              disabled={isPlaceholder || isLiking}
              className={`p-2 rounded-full transition-all duration-200 ${
                isPlaceholder || isLiking
                  ? 'opacity-40 cursor-not-allowed' 
                  : isCurrentSongLiked
                  ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-gray-300 hover:text-red-500 hover:bg-white/10'
              }`}
              title={isCurrentSongLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-200 ${
                  isCurrentSongLiked ? 'fill-current' : ''
                } ${isLiking ? 'animate-pulse' : ''}`} 
              />
            </button>
          )}
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
          {/* Control Buttons */}
          <div className="flex items-center space-x-6">
            <button
              onClick={playPrevious}
              className={`p-2 rounded-full transition-all duration-200 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              disabled={isPlaceholder}
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`p-3 rounded-full transition-all duration-200 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed bg-gray-600' 
                  : 'bg-white text-black hover:bg-gray-100 hover:scale-105'
              }`}
              disabled={isPlaceholder}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className={`p-2 rounded-full transition-all duration-200 ${
                isPlaceholder 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              disabled={isPlaceholder}
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-lg">
            <ProgressBar
              size="small"
              showTime={false}
              showHoverPreview={true}
              className="w-full"
            />
          </div>
        </div>

        {/* Right: Volume and Timestamp */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {/* Timestamp */}
          <div className="flex items-center space-x-1 text-xs text-gray-400 min-w-0">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <div className="relative group">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}