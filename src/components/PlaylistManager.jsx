import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlaylist } from '../context/PlaylistContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { Trash2, Play, Save, X, Sparkles } from 'lucide-react';

export default function PlaylistManager() {
    const {
        playlists,
        isCreating,
        isLoading,
        error,
        fetchPlaylists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        setCreating
    } = usePlaylist();
    
    const { generatedPlaylist, setGeneratedPlaylist } = useApp();
    const { isAuthenticated } = useAuth();
    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();
    
    const [newPlaylist, setNewPlaylist] = useState({
        title: '',
        description: ''
    });
    const [isSavingGenerated, setIsSavingGenerated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchPlaylists();
    }, [location.pathname, fetchPlaylists]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        const result = await createPlaylist(newPlaylist);
        if (result) {
            setCreating(false);
            setNewPlaylist({ title: '', description: '' });
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        await deletePlaylist(playlistId);
    };

    const handlePlayGeneratedPlaylist = () => {
        if (!generatedPlaylist?.songs?.length) return;
        
        setQueue(generatedPlaylist.songs);
        setCurrentIndex(0);
        setPlaying(true);
    };

    const handleSaveGeneratedPlaylist = async () => {
        if (!generatedPlaylist || !isAuthenticated) return;
        
        setIsSavingGenerated(true);
        try {
            // First create the playlist
            const result = await createPlaylist({
                name: generatedPlaylist.title,
                description: generatedPlaylist.description,
                mood_based: true
            });
            
            if (result && generatedPlaylist.songs?.length > 0) {
                // Add each song to the playlist
                for (const song of generatedPlaylist.songs) {
                    if (song.videoId) {
                        try {
                            const songData = {
                                youtube_id: song.videoId,
                                title: song.title,
                                artist: song.artist,
                                duration: song.duration || 'N/A',
                                thumbnail: song.thumbnail,
                                channelTitle: song.artist
                            };
                            
                            // Use the addSongToPlaylist function from context
                            await addSongToPlaylist(result.id, songData);
                        } catch (songError) {
                            console.warn(`Failed to add song ${song.title} to playlist:`, songError);
                        }
                    }
                }
                
                // Clear the generated playlist since it's now saved
                setGeneratedPlaylist(null);
                
                // Refresh the playlists to show the newly saved one
                fetchPlaylists();
            }
        } catch (error) {
            console.error('Error saving generated playlist:', error);
        } finally {
            setIsSavingGenerated(false);
        }
    };

    const handleDismissGeneratedPlaylist = () => {
        setGeneratedPlaylist(null);
    };

    return (
        <div className="p-6">
            {/* Generated Playlist Section */}
            {generatedPlaylist && (
                <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-purple rounded-full">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {generatedPlaylist.title}
                                </h2>
                                <p className="text-purple-200 text-sm">{generatedPlaylist.description}</p>
                                <p className="text-purple-300 text-sm mt-1">
                                    {generatedPlaylist.songs?.length || 0} songs • Generated from your mood
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismissGeneratedPlaylist}
                            className="text-gray-400 hover:text-white p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                        <button 
                            onClick={handlePlayGeneratedPlaylist}
                            className="bg-primary-purple text-white px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:bg-purple-600 transition-colors"
                        >
                            <Play className="w-5 h-5" fill="currentColor" />
                            <span>Play</span>
                        </button>
                        
                        {isAuthenticated && (
                            generatedPlaylist.isSaved ? (
                                <div className="flex items-center space-x-2 text-green-400">
                                    <Save className="w-5 h-5" />
                                    <span className="font-semibold">Saved to Library</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSaveGeneratedPlaylist}
                                    disabled={isSavingGenerated}
                                    className="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{isSavingGenerated ? 'Saving...' : 'Save to Library'}</span>
                                </button>
                            )
                        )}
                        
                        {!isAuthenticated && (
                            <p className="text-yellow-300 text-sm flex items-center gap-2">
                                💡 <button 
                                    onClick={() => navigate('/auth')} 
                                    className="underline hover:text-primary-purple transition-colors"
                                >
                                    Sign in
                                </button> to save this playlist!
                            </p>
                        )}
                    </div>
                    
                    {/* Generated Playlist Songs Preview */}
                    <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">Songs in this playlist:</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {generatedPlaylist.songs?.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="flex items-center space-x-3 p-2 rounded hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-purple-300 text-sm w-6">{index + 1}</span>
                                    <div className="w-10 h-10 flex-shrink-0">
                                        <img
                                            src={song.thumbnail}
                                            alt={song.title}
                                            className="w-full h-full object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/40x40/AA60C8/FFFFFF?text=♪';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium text-sm truncate">{song.title}</h4>
                                        <p className="text-purple-200 text-xs truncate">{song.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Regular Playlists Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Your Library</h1>
                <button
                    onClick={() => setCreating(true)}
                    className="bg-primary-purple text-black px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
                    disabled={isLoading}
                >
                    Create New Playlist
                </button>
            </div>

            {error && (
                <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Create New Playlist Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-dark-card p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Playlist</h2>
                        <form onSubmit={handleCreatePlaylist}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newPlaylist.title}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                                    className="w-full p-2 rounded bg-dark-hover text-white border border-gray-600"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={newPlaylist.description}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                                    className="w-full p-2 rounded bg-dark-hover text-white border border-gray-600"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-purple text-black px-4 py-2 rounded hover:bg-opacity-90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Saved Playlists Grid */}
            {playlists.length === 0 && !isLoading && !generatedPlaylist ? (
                <div className="text-center text-gray-400 py-12">
                    <p className="text-lg mb-4">No playlists yet</p>
                    <p className="text-sm">Create your first playlist or generate one from your mood!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-primary-purple text-white px-6 py-2 rounded-full hover:bg-purple-600 transition-colors"
                    >
                        Generate Mood Playlist
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="bg-dark-card p-4 rounded-lg hover:bg-dark-hover transition-colors cursor-pointer"
                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-bold mb-2">{playlist.name || playlist.title}</h3>
                                    <p className="text-gray-400 text-sm">{playlist.description}</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        {playlist.songs?.length || 0} songs
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePlaylist(playlist.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 