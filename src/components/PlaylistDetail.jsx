import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylist } from '../context/PlaylistContext';
import { Edit, Trash2, Play, Shuffle, Music } from 'lucide-react';
import config from '../lib/config.js';

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();
    const { 
        currentPlaylist, 
        isLoading, 
        error, 
        fetchPlaylistById, 
        updatePlaylist, 
        deletePlaylist,
        addSongToPlaylist
    } = usePlaylist();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    
    // Track if we've loaded this playlist to prevent unnecessary reloads
    const loadedPlaylistRef = useRef(null);

    useEffect(() => {
        if (playlistId && playlistId !== loadedPlaylistRef.current) {
            console.log('PlaylistDetail: Loading playlist for first time:', playlistId);
            fetchPlaylistById(playlistId);
            loadedPlaylistRef.current = playlistId;
        } else if (playlistId === loadedPlaylistRef.current) {
            console.log('PlaylistDetail: Playlist already loaded, skipping reload');
        }
    }, [playlistId]); // Removed fetchPlaylistById from dependencies

    useEffect(() => {
        if (currentPlaylist) {
            setEditedTitle(currentPlaylist.name || currentPlaylist.title || '');
            setEditedDescription(currentPlaylist.description || '');
        }
    }, [currentPlaylist]);

    const handleUpdatePlaylist = async () => {
        const result = await updatePlaylist(playlistId, {
            name: editedTitle,
            description: editedDescription,
        });

        if (result) {
            setIsEditing(false);
        }
    };

    const handleDeletePlaylist = async () => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            const result = await deletePlaylist(playlistId);
            if (result) {
                navigate('/playlists');
            }
        }
    };

    const handlePlayAll = () => {
        if (!currentPlaylist?.songs?.length) return;
        
        const playableSongs = currentPlaylist.songs.map(song => ({
            id: song.youtube_id || song.id,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail_url || song.thumbnail,
            videoId: song.youtube_id
        }));
        
        setQueue(playableSongs);
        setCurrentIndex(0);
        setPlaying(true);
    };

    const handlePlaySong = (song, index) => {
        const playableSongs = currentPlaylist.songs.slice(index).map(s => ({
            id: s.youtube_id || s.id,
            title: s.title,
            artist: s.artist,
            thumbnail: s.thumbnail_url || s.thumbnail,
            videoId: s.youtube_id
        }));
        
        setQueue(playableSongs);
        setCurrentIndex(0);
        setPlaying(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-purple"></div>
                <span className="ml-4 text-text-medium">Loading playlist...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error: {error}
                <br />
                <button 
                    onClick={() => navigate('/playlists')}
                    className="mt-4 text-primary-purple underline"
                >
                    Back to Playlists
                </button>
            </div>
        );
    }

    if (!currentPlaylist) {
        return (
            <div className="text-center text-gray-400 p-4">
                <p>Playlist not found</p>
                <button 
                    onClick={() => navigate('/playlists')}
                    className="mt-4 text-primary-purple underline"
                >
                    Back to Playlists
                </button>
            </div>
        );
    }

    // Debug log to see the structure
    console.log('Current playlist:', currentPlaylist);
    console.log('Songs:', currentPlaylist.songs);

    const handleRefreshPlaylist = async () => {
        console.log('Manually refreshing playlist...');
        await fetchPlaylistById(playlistId);
    };

    const handleRegenerateSongs = async () => {
        if (!currentPlaylist?.mood_based) return;
        
        setIsRegenerating(true);
        try {
            // Call the mood generation API to get new songs
            const prompt = `Generate a list of 5-7 song recommendations (title and artist) that match the mood of this playlist: "${currentPlaylist.name}". Provide the output JSON array of objects, each with 'title' and 'artist' keys.`;
            
            const payload = {
                prompt: prompt,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            console.log('Regenerating songs for playlist...');
            const response = await fetch(`${config.API_BASE_URL}/api/generate-mood-playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to generate new songs');
            }

            const result = await response.json();
            console.log('Generated new songs:', result);

            if (result.songs && Array.isArray(result.songs)) {
                // Add each generated song to the playlist
                for (const [index, song] of result.songs.entries()) {
                    try {
                        const fallbackVideoId = song.videoId || `regenerated_song_${Date.now()}_${index}`;
                        
                        const songData = {
                            youtube_id: fallbackVideoId,
                            title: song.title,
                            artist: song.artist,
                            duration: song.duration || 'N/A',
                            thumbnail: song.thumbnail || 'https://placehold.co/60x60/AA60C8/FFFFFF?text=♪',
                            channelTitle: song.artist
                        };
                        
                        await addSongToPlaylist(currentPlaylist.id, songData);
                    } catch (songError) {
                        console.error(`Failed to add regenerated song ${song.title}:`, songError);
                    }
                }
                
                // Refresh the playlist to show new songs
                await fetchPlaylistById(playlistId);
            }
        } catch (error) {
            console.error('Error regenerating songs:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/playlists')}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Playlists
                </button>
                <button
                    onClick={handleRefreshPlaylist}
                    className="text-primary-purple hover:text-purple-400 text-sm underline"
                >
                    Refresh Playlist
                </button>
            </div>

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <h3 className="text-red-400 font-bold mb-2">Debug Info:</h3>
                    <p className="text-sm text-red-300">Playlist ID: {playlistId}</p>
                    <p className="text-sm text-red-300">Songs count: {currentPlaylist?.songs?.length || 0}</p>
                    <p className="text-sm text-red-300">Playlist name: {currentPlaylist?.name || currentPlaylist?.title}</p>
                    <p className="text-sm text-red-300">Is mood-based: {currentPlaylist?.mood_based ? 'Yes' : 'No'}</p>
                    {currentPlaylist?.songs?.length > 0 && (
                        <details className="mt-2">
                            <summary className="text-red-300 cursor-pointer">View song data</summary>
                            <pre className="text-xs text-red-200 mt-2 overflow-auto max-h-32">
                                {JSON.stringify(currentPlaylist.songs, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {isEditing ? (
                <div className="mb-8">
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-dark-card text-white text-2xl font-bold mb-4 p-2 rounded"
                        placeholder="Playlist name"
                    />
                    <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full bg-dark-card text-gray-400 p-2 rounded"
                        rows="3"
                        placeholder="Playlist description"
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdatePlaylist}
                            className="bg-primary-purple text-white px-4 py-2 rounded hover:bg-opacity-90"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {currentPlaylist.name || currentPlaylist.title}
                            </h1>
                            <p className="text-gray-400">{currentPlaylist.description}</p>
                            <p className="text-gray-500 text-sm mt-2">
                                {currentPlaylist.songs?.length || 0} songs
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-white"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDeletePlaylist}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-4 mb-8">
                <button 
                    onClick={handlePlayAll}
                    disabled={!currentPlaylist?.songs?.length}
                    className="bg-primary-purple text-white px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play className="w-6 h-6" fill="currentColor" />
                    <span>Play All</span>
                </button>
                <button 
                    disabled={!currentPlaylist?.songs?.length}
                    className='bg-primary-purple text-white px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:scale-105 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    <Shuffle className='w-6 h-6' />
                    <span>Shuffle</span>
                </button>
            </div>

            <div className='bg-dark-card rounded-lg p-4'>
                <div className='grid grid-cols-[auto,3fr,2fr,2fr,1fr] gap-4 text-text-medium text-sm font-semibold border-b border-dark-hover pb-2 mb-4'>
                    <div>#</div>
                    <div>TITLE</div>
                    <div>ARTIST</div>
                    <div>ALBUM</div>
                    <div className='text-right'>DURATION</div>
                </div>

                {!currentPlaylist?.songs?.length ? (
                    <div className="text-center py-12 text-gray-400">
                        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No songs in this playlist</p>
                        <p className="text-sm mb-4">Add some songs to get started!</p>
                        {currentPlaylist?.mood_based && (
                            <button
                                onClick={handleRegenerateSongs}
                                disabled={isRegenerating}
                                className="bg-primary-purple text-white px-6 py-2 rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegenerating ? 'Generating...' : 'Re-generate Songs'}
                            </button>
                        )}
                    </div>
                ) : (
                    currentPlaylist.songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            onClick={() => handlePlaySong(song, index)}
                            className="grid grid-cols-[auto,3fr,2fr,2fr,1fr] gap-4 items-center p-3 hover:bg-dark-hover transition-colors cursor-pointer rounded-md group"
                        >
                            <div className="text-text-medium text-sm group-hover:text-white">
                                {index + 1}
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 flex-shrink-0">
                                    <img
                                        src={song.thumbnail_url || song.thumbnail || 'https://placehold.co/40x40/AA60C8/FFFFFF?text=♪'}
                                        alt={song.title}
                                        className="w-full h-full object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/40x40/AA60C8/FFFFFF?text=♪';
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-medium truncate group-hover:text-primary-purple">
                                        {song.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="text-text-medium text-sm truncate group-hover:text-white">
                                {song.artist}
                            </div>
                            <div className="text-text-medium text-sm truncate group-hover:text-white">
                                {song.album || 'Unknown Album'}
                            </div>
                            <div className="text-text-medium text-sm text-right group-hover:text-white">
                                {song.duration || 'N/A'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 