import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlaylistManager() {
    const [playlists, setPlaylists] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({
        title: '',
        description: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/playlists');
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPlaylist),
            });

            if (response.ok) {
                const createdPlaylist = await response.json();
                setPlaylists([...playlists, createdPlaylist]);
                setIsCreating(false);
                setNewPlaylist({ title: '', description: '' });
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary-purple text-black px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
                >
                    Create New Playlist
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-purple text-black px-4 py-2 rounded hover:bg-opacity-90"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className="bg-dark-card p-4 rounded-lg hover:bg-dark-hover transition-colors cursor-pointer"
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-white font-bold mb-2">{playlist.title}</h3>
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
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 