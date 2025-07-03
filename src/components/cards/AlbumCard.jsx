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
        <div className='bg-dark-card rounded-lg p-4 transition-all duration-300 hover:bg-dark-hover group relative cursor-pointer' onClick={handlePlayAlbum}>
            {/* Album/Item image */}
            <img 
            src={imageUrl}
            alt={title}
            className='w-full h-auto rounded-md shadow-lg mb-4'
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/282828/FFFFFF?text=No+Image'; }}
            />
            {/* Title */}
            <h4 className='font-bold text-text-light text-lg truncate'>{title}</h4>
            {/* Artist */}
            <p className='text-text-medium text-sm truncate'>{artist}</p>

            {/* Play button overlay hover */}
            {/* Positioned absolutely, initially transparent and slides up, visible on group hover */}
            <button 
                className='absolute bottom-20 right-6 bg-primary-purple text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300'
                onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAlbum();
                }}
            >
                <Play className='w-5 h-5' fill='currentColor' />
            </button>
        </div>
    );
}   