import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useSearch } from '../context/SearchContext';
import { usePlaylist } from '../context/PlaylistContext';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const [retryCountdown, setRetryCountdown] = useState(0);
    
    const {
        searchResults,
        isLoading,
        error,
        errorCode,
        retryAfter,
        showPlaylistModal,
        selectedVideo,
        searchYouTube,
        openPlaylistModal,
        closePlaylistModal,
        getErrorMessage,
        canRetry
    } = useSearch();
    
    const { playlists, updatePlaylist } = usePlaylist();
    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();

    const query = searchParams.get('q');

    // Handle retry countdown for rate limiting
    useEffect(() => {
        if (errorCode === 'RATE_LIMIT_EXCEEDED' && retryAfter) {
            const updateCountdown = () => {
                const remaining = Math.ceil((retryAfter - Date.now()) / 1000);
                if (remaining > 0) {
                    setRetryCountdown(remaining);
                    setTimeout(updateCountdown, 1000);
                } else {
                    setRetryCountdown(0);
                }
            };
            updateCountdown();
        } else {
            setRetryCountdown(0);
        }
    }, [errorCode, retryAfter]);

    useEffect(() => {
        if (query && query.trim()) {
            searchYouTube(query.trim());
        }
    }, [query, searchYouTube]);

    const handleAddToPlaylist = async (playlistId) => {
        if (!selectedVideo) return;

        const result = await updatePlaylist(playlistId, {
            songs: [selectedVideo]
        });

        if (result) {
            closePlaylistModal();
        }
    };

    const handlePlaySong = (video) => {
        const song = {
            id: video.id,
            title: video.title,
            artist: video.channelTitle,
            thumbnail: video.thumbnail,
            videoId: video.id
        };
        setQueue([song]);
        setCurrentIndex(0);
        setPlaying(true);
    };

    const handleRetrySearch = () => {
        if (query && canRetry()) {
            searchYouTube(query.trim());
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-purple"></div>
                <p className="text-gray-600 text-sm">Searching YouTube...</p>
            </div>
        );
    }

    // Error state with improved handling
    if (error) {
        const errorMessage = getErrorMessage();
        
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 p-6">
                <div className="text-center space-y-3">
                    {/* Error icon */}
                    <div className="w-16 h-16 mx-auto mb-4">
                        {errorCode === 'NETWORK_ERROR' ? (
                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                        ) : errorCode === 'QUOTA_EXCEEDED' || errorCode === 'RATE_LIMIT_EXCEEDED' ? (
                            <svg className="w-full h-full text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        ) : (
                            <svg className="w-full h-full text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    
                    {/* Error message */}
                    <h3 className="text-lg font-semibold text-gray-900">
                        {errorCode === 'NETWORK_ERROR' ? 'Connection Error' :
                         errorCode === 'QUOTA_EXCEEDED' ? 'Search Limit Reached' :
                         errorCode === 'RATE_LIMIT_EXCEEDED' ? 'Too Many Requests' :
                         'Search Error'}
                    </h3>
                    
                    <p className="text-gray-600 max-w-md">
                        {errorMessage}
                    </p>
                    
                    {/* Countdown for rate limiting */}
                    {retryCountdown > 0 && (
                        <p className="text-sm text-gray-500">
                            You can try again in {retryCountdown} seconds
                        </p>
                    )}
                </div>
                
                {/* Retry button */}
                {canRetry() && retryCountdown === 0 && (
                    <button
                        onClick={handleRetrySearch}
                        className="px-6 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Try Again</span>
                    </button>
                )}
            </div>
        );
    }

    // No results state
    if (!searchResults.videos || searchResults.videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-16 h-16 text-gray-400">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">No Results Found</h3>
                    <p className="text-gray-600">
                        {query ? `No videos found for "${query}"` : 'Try searching for something else'}
                    </p>
                </div>
            </div>
        );
    }

    // Results display
    return (
        <div className="space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Search Results {query && `for "${query}"`}
                </h2>
                {searchResults.pagination?.totalResults && (
                    <span className="text-sm text-gray-500">
                        {searchResults.pagination.totalResults.toLocaleString()} results
                    </span>
                )}
            </div>

            {/* Video results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.videos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-100">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/320x180/AA60C8/FFFFFF?text=No+Image';
                                }}
                            />
                            
                            {/* Play button overlay */}
                            <button
                                onClick={() => handlePlaySong(video)}
                                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center group"
                            >
                                <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                                    <svg className="w-6 h-6 text-primary-purple" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {/* Video info */}
                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2" title={video.title}>
                                {video.title}
                            </h3>
                            <p className="text-sm text-gray-600" title={video.channelTitle}>
                                {video.channelTitle}
                            </p>
                            
                            {/* Action buttons */}
                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={() => handlePlaySong(video)}
                                    className="flex-1 px-3 py-2 bg-primary-purple text-white text-sm rounded-md hover:bg-purple-700 transition-colors duration-200"
                                >
                                    Play
                                </button>
                                <button
                                    onClick={() => openPlaylistModal(video)}
                                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Add to Playlist
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Playlist modal */}
            {showPlaylistModal && selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Add to Playlist</h3>
                            <button
                                onClick={closePlaylistModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                            Adding "{selectedVideo.title}" to playlist
                        </p>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="font-medium">{playlist.title}</div>
                                    <div className="text-sm text-gray-500">
                                        {playlist.songs?.length || 0} songs
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {playlists.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                No playlists available. Create a playlist first.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 