import React from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

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
                const response = await fetch(`http://localhost:3001/api/search-music?query=${encodeURIComponent(query)}`);
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
        <div className='bg-dark-card rounded-lg p-4 transition-all duration-300 hover:bg-dark-hover group relative cursor-pointer' onClick={handlePlayPlaylist}>
            <img 
            src={imageUrl} 
            alt={title}
            className='w-full h-auto rounded-md shadow-lg mb-4' 
            onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/AA60C8/FFFFFF?text=No+Image';}}
            />
            {/* title */}
            <h4 className='font-bold text-text-light text-lg truncate'>{title}</h4>
            {/* description */}
            <p className='text-text-medium text-sm truncate'>{description}</p>

            <button 
                className='absolute bottom-20 right-6 bg-primary-purple text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300'
                onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist();
                }}
            >
                <Play className='w-5 h-5' fill='currentColor' />
            </button>
        </div>
    );   
}