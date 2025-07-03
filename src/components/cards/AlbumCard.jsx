import React from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import config from '../../lib/config.js';

export default function AlbumCard({ imageUrl, title, artist, videoId, query }) {
    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();

    const handlePlayAlbum = async () => {
        if (videoId) {
            // If we have a specific video, play it
            const song = {
                id: videoId,
                title: title,
                artist: artist,
                thumbnail: imageUrl
            };
            setQueue([song]);
            setCurrentIndex(0);
            setPlaying(true);
        } else if (query) {
            // If we have a query, search for more songs and create a playlist
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/search-music?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    const songs = data.videos.slice(0, 10).map(video => ({
                        id: video.id,
                        title: video.title,
                        artist: video.channelTitle,
                        thumbnail: video.thumbnail
                    }));
                    
                    if (songs.length > 0) {
                        setQueue(songs);
                        setCurrentIndex(0);
                        setPlaying(true);
                    }
                }
            } catch (error) {
                console.error('Error loading album songs:', error);
            }
        }
    };

    return(
        <div className='bg-dark-card rounded-lg p-3 sm:p-4 transition-all duration-300 hover:bg-dark-hover group relative cursor-pointer' onClick={handlePlayAlbum}>
            {/* Album/Item image */}
            <div className="relative">
                <img 
                    src={imageUrl}
                    alt={title}
                    className='w-full h-auto rounded-md shadow-lg mb-3 sm:mb-4'
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/282828/FFFFFF?text=No+Image'; }}
                />
                
                {/* Play button overlay - always visible on mobile, hover on desktop */}
                <button 
                    className='absolute bottom-2 right-2 bg-primary-purple text-black p-2 sm:p-3 rounded-full shadow-lg 
                               sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-4 sm:group-hover:translate-y-0 
                               opacity-100 translate-y-0 transition-all duration-300 
                               hover:bg-[#C879E6] active:scale-95'
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAlbum();
                    }}
                >
                    <Play className='w-4 h-4 sm:w-5 sm:h-5' fill='currentColor' />
                </button>
            </div>

            {/* Title */}
            <h4 className='font-bold text-text-light text-base sm:text-lg truncate'>{title}</h4>
            {/* Artist */}
            <p className='text-text-medium text-xs sm:text-sm truncate'>{artist}</p>
        </div>
    );
}   