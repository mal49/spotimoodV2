import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState({
        videos: [],
        nextPageToken: null,
        prevPageToken: null,
        totalResults: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [playlists, setPlaylists] = useState([]);

    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();

    const query = searchParams.get('q');

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query]);

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

    const performSearch = async (pageToken = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:3001/api/search-music?query=${encodeURIComponent(query)}${pageToken ? `&pageToken=${pageToken}` : ''}`
            );
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextPage = () => {
        if (searchResults.nextPageToken) {
            performSearch(searchResults.nextPageToken);
        }
    };

    const handlePrevPage = () => {
        if (searchResults.prevPageToken) {
            performSearch(searchResults.prevPageToken);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!selectedVideo) return;

        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    songs: [selectedVideo]
                }),
            });

            if (response.ok) {
                setShowPlaylistModal(false);
                setSelectedVideo(null);
            }
        } catch (error) {
            console.error('Error adding song to playlist:', error);
        }
    };

    const handlePlaySong = (video) => {
        const song = {
            id: video.id,
            title: video.title,
            artist: video.channelTitle,
            thumbnail: video.thumbnail
        };
        setQueue([song]);
        setCurrentIndex(0);
        setPlaying(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-purple"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
                Search Results for "{query}"
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.videos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-dark-card p-4 rounded-lg hover:bg-dark-hover transition-colors"
                    >
                        <div className="aspect-video mb-4">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                        <h3 className="text-white font-bold mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{video.channelTitle}</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePlaySong(video)}
                                className="bg-primary-purple text-black px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
                            >
                                Play
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedVideo(video);
                                    setShowPlaylistModal(true);
                                }}
                                className="bg-primary-purple text-black px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
                            >
                                Add to Playlist
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {searchResults.videos.length > 0 && (
                <div className="flex justify-center space-x-4 mt-8">
                    <button
                        onClick={handlePrevPage}
                        disabled={!searchResults.prevPageToken}
                        className={`px-4 py-2 rounded ${
                            searchResults.prevPageToken
                                ? 'bg-primary-purple text-black hover:bg-opacity-90'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={!searchResults.nextPageToken}
                        className={`px-4 py-2 rounded ${
                            searchResults.nextPageToken
                                ? 'bg-primary-purple text-black hover:bg-opacity-90'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {searchResults.videos.length === 0 && !isLoading && (
                <div className="text-center text-gray-400 mt-8">
                    No results found for "{query}"
                </div>
            )}

            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-dark-card p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold text-white mb-4">Add to Playlist</h2>
                        <div className="space-y-2">
                            {playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    className="w-full text-left p-3 rounded hover:bg-dark-hover transition-colors text-white"
                                >
                                    {playlist.title}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowPlaylistModal(false);
                                    setSelectedVideo(null);
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 