import React from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import config from '../../lib/config.js';

export default function PlaylistCard({imageUrl, title, description, songs, query}) {
    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();

    const handlePlayPlaylist = async () => {
        if (songs && songs.length > 0) {
            // If we have songs in the playlist, play them
            const playlistSongs = songs.map(song => ({
                id: song.videoId || song.id,
                title: song.title,
                artist: song.artist,
                thumbnail: song.thumbnail || imageUrl
            }));
            
            setQueue(playlistSongs);
            setCurrentIndex(0);
            setPlaying(true);
        } else if (query) {
            // If we have a query, search for songs and create a playlist
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/search-music?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    const playlistSongs = data.videos.slice(0, 10).map(video => ({
                        id: video.id,
                        title: video.title,
                        artist: video.channelTitle,
                        thumbnail: video.thumbnail
                    }));
                    
                    if (playlistSongs.length > 0) {
                        setQueue(playlistSongs);
                        setCurrentIndex(0);
                        setPlaying(true);
                    }
                }
            } catch (error) {
                console.error('Error loading playlist songs:', error);
            }
        }
    };

    return(
        <div className='bg-dark-card rounded-lg p-3 sm:p-4 transition-all duration-300 hover:bg-dark-hover group relative cursor-pointer' onClick={handlePlayPlaylist}>
            <div className="relative">
                <img 
                    src={imageUrl} 
                    alt={title}
                    className='w-full h-auto rounded-md shadow-lg mb-3 sm:mb-4' 
                    onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/AA60C8/FFFFFF?text=No+Image';}}
                />

                {/* Play button overlay - always visible on mobile, hover on desktop */}
                <button 
                    className='absolute bottom-2 right-2 bg-primary-purple text-black p-2 sm:p-3 rounded-full shadow-lg 
                               sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 
                               opacity-100 translate-y-0 transition-all duration-300 
                               hover:bg-[#C879E6] active:scale-95'
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPlaylist();
                    }}
                >
                    <Play className='w-4 h-4 sm:w-5 sm:h-5' fill='currentColor' />
                </button>
            </div>

            {/* title */}
            <h4 className='font-bold text-text-light text-base sm:text-lg truncate'>{title}</h4>
            {/* description */}
            <p className='text-text-medium text-xs sm:text-sm truncate'>{description}</p>
        </div>
    );   
}