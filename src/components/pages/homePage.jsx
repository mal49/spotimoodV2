import React, {useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCarousel from '../UI/SectionCarousel.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePlaylist } from '../../context/PlaylistContext.jsx';
import { supabase } from '../../lib/supabase.js';
import { Loader2, Sparkles, User, AlertTriangle, Clock } from 'lucide-react';
import { searchYouTubeMusic, generateMoodPlaylist, loadAlbumsWithCaching, loadPlaylistsWithCaching } from '../../lib/api.js';

export default function HomePage() {
    const { setGeneratedPlaylist, userHasStoredMood } = useApp();
    const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
    const { createPlaylist, addSongToPlaylist, fetchPlaylists } = usePlaylist();
    const navigate = useNavigate();
    const [moodInput, setMoodInput] = useState('');
    const [isLoadingMoodPlaylist, setIsLoadingMoodPlaylist] = useState(false);
    const [moodPlaylistError, setMoodPlaylistError] = useState(null);
    
    // States for album and playlist data
    const [albumCard, setAlbumCard] = useState([]);
    const [playlistCard, setPlaylistCard] = useState([]);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
    
    // Rate limiting and error states
    const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
    const [rateLimitError, setRateLimitError] = useState(null);
    const [lastApiCallTime, setLastApiCallTime] = useState(null);
    
    // Track if data has been loaded to prevent unnecessary reloads
    const hasLoadedDataRef = useRef(false);

    // Helper function to get personalized greeting
    const getPersonalizedGreeting = useCallback(() => {
        const hour = new Date().getHours();
        let timeGreeting;
        
        if (hour < 12) {
            timeGreeting = 'Good morning';
        } else if (hour < 17) {
            timeGreeting = 'Good afternoon';
        } else {
            timeGreeting = 'Good evening';
        }

        if (!isAuthenticated) {
            return `${timeGreeting}!`;
        }

        // Get user's display name from profile, metadata, or email
        const displayName = profile?.display_name || 
                           profile?.full_name || 
                           user?.user_metadata?.display_name || 
                           user?.user_metadata?.full_name ||
                           user?.email?.split('@')[0] || 
                           'there';

        return `${timeGreeting}, ${displayName}!`;
    }, [isAuthenticated, user, profile]);

    // Helper function to get user's profile picture with fallbacks
    const getProfilePicture = useCallback(() => {
        if (!isAuthenticated) return null;
        
        // Try multiple sources for profile picture
        return profile?.avatar_url || 
               user?.user_metadata?.avatar_url || 
               user?.user_metadata?.picture || 
               null;
    }, [isAuthenticated, user, profile]);

    // Helper function to get user's initials for fallback avatar
    const getUserInitials = useCallback(() => {
        if (!isAuthenticated) return 'U';
        
        const displayName = profile?.display_name || 
                           profile?.full_name || 
                           user?.user_metadata?.display_name || 
                           user?.user_metadata?.full_name ||
                           user?.email?.split('@')[0] || 
                           'User';
        
        return displayName
            .split(' ')
            .map(name => name.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }, [isAuthenticated, user, profile]);

    // Load albums with caching and better error handling
    const loadAlbumsWithRealData = useCallback(async () => {
        setIsLoadingAlbums(true);
        setRateLimitError(null);
        
        try {
            const albumsData = await loadAlbumsWithCaching();
            setAlbumCard(albumsData);
            setLastApiCallTime(Date.now());
        } catch (error) {
            console.error('Error loading albums:', error);
            
            // Handle rate limiting errors
            if (error.message === 'RATE_LIMITED') {
                setRateLimitError('Rate limit reached. Please wait a moment before refreshing.');
            } else if (error.message === 'QUOTA_EXCEEDED') {
                setApiQuotaExceeded(true);
                setRateLimitError('Daily API limit reached. Content will refresh tomorrow.');
            }
            
            // Set fallback data in case of error
            setAlbumCard([
                {
                    id: 1,
                    title: 'Today\'s Top Hits',
                    artist: 'Various Artists',
                    imageUrl: 'https://placehold.co/150x150/282828/FFFFFF?text=Top+Hits',
                    videoId: null,
                    query: 'top hits 2024'
                },
                {
                    id: 2,
                    title: 'Rock Classics',
                    artist: 'Various Artists',
                    imageUrl: 'https://placehold.co/150x150/282828/FFFFFF?text=Rock',
                    videoId: null,
                    query: 'rock classics'
                },
                {
                    id: 3,
                    title: 'Chill Vibes',
                    artist: 'Various Artists',
                    imageUrl: 'https://placehold.co/150x150/282828/FFFFFF?text=Chill',
                    videoId: null,
                    query: 'chill music'
                }
            ]);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, []);

    // Load playlists with caching and better error handling
    const loadPlaylistsWithRealData = useCallback(async () => {
        setIsLoadingPlaylists(true);
        
        try {
            const playlistsData = await loadPlaylistsWithCaching();
            setPlaylistCard(playlistsData);
            setLastApiCallTime(Date.now());
        } catch (error) {
            console.error('Error loading playlists:', error);
            
            // Handle rate limiting errors
            if (error.message === 'RATE_LIMITED') {
                setRateLimitError('Rate limit reached. Please wait a moment before refreshing.');
            } else if (error.message === 'QUOTA_EXCEEDED') {
                setApiQuotaExceeded(true);
                setRateLimitError('Daily API limit reached. Content will refresh tomorrow.');
            }
            
            // Set fallback data in case of error
            setPlaylistCard([
                {
                    id: 1,
                    title: 'Daily Mix',
                    description: 'Your daily music mix',
                    imageUrl: 'https://placehold.co/150x150/AA60C8/FFFFFF?text=Daily+Mix',
                    songs: [],
                    query: 'daily mix'
                },
                {
                    id: 2,
                    title: 'Discover Weekly',
                    description: 'Fresh music for you',
                    imageUrl: 'https://placehold.co/150x150/AA60C8/FFFFFF?text=Discover',
                    songs: [],
                    query: 'discover weekly'
                }
            ]);
        } finally {
            setIsLoadingPlaylists(false);
        }
    }, []);

    // Load data on component mount - ONLY ONCE per session
    useEffect(() => {
        if (!hasLoadedDataRef.current) {
            console.log('HomePage: Loading data for first time...');
            loadAlbumsWithRealData();
            loadPlaylistsWithRealData();
            hasLoadedDataRef.current = true;
        } else {
            console.log('HomePage: Data already loaded, skipping reload');
        }
    }, []); // Empty dependency array - only run on mount

    const generatePlaylist = useCallback(async (moodToUse, isAutoGenerated = false) => {
        if(!moodToUse.trim()) {
            setMoodPlaylistError("Please enter your mood to generate playlist.");
            return;
        }

        setIsLoadingMoodPlaylist(true);
        setMoodPlaylistError(null);
        setGeneratedPlaylist(null);

        try {
            const playlist = await generateMoodPlaylist(moodToUse);
            console.log('Received playlist from server:', playlist);

            if (!playlist || !playlist.songs || !Array.isArray(playlist.songs)) {
                throw new Error('Invalid playlist data received from server');
            }

            // Store in app context for immediate display
            setGeneratedPlaylist(playlist);

            // If user is authenticated, automatically save to database
            if (isAuthenticated && user) {
                try {
                    console.log('Saving generated playlist to database...');
                    
                    // Create the playlist in the database
                    const savedPlaylist = await createPlaylist({
                        name: playlist.title,
                        description: playlist.description,
                        mood_based: true
                    });

                    if (savedPlaylist && playlist.songs?.length > 0) {
                        console.log('Adding songs to saved playlist:', playlist.songs);
                        
                        // Add each song to the playlist
                        for (const [index, song] of playlist.songs.entries()) {
                            try {
                                // Create a fallback video ID if none exists
                                const fallbackVideoId = song.videoId || `generated_song_${Date.now()}_${index}`;
                                
                                const songData = {
                                    youtube_id: fallbackVideoId,
                                    title: song.title,
                                    artist: song.artist,
                                    duration: song.duration || 'N/A',
                                    thumbnail: song.thumbnail || 'https://placehold.co/60x60/AA60C8/FFFFFF?text=♪',
                                    channelTitle: song.artist
                                };
                                
                                console.log(`Adding song ${index + 1}:`, songData);
                                const result = await addSongToPlaylist(savedPlaylist.id, songData);
                                console.log(`Song ${index + 1} add result:`, result);
                            } catch (songError) {
                                console.error(`Failed to add song ${song.title} to database:`, songError);
                            }
                        }
                        
                        console.log('Finished adding all songs to playlist');

                        // Save to generated_playlists table for tracking AI-generated playlists
                        try {
                            const { error: generatedError } = await supabase
                                .from('generated_playlists')
                                .insert([{
                                    user_id: user.id,
                                    playlist_id: savedPlaylist.id,
                                    mood_prompt: moodToUse,
                                    ai_response: {
                                        originalPlaylist: playlist,
                                        prompt: playlist.prompt,
                                        generatedAt: new Date().toISOString()
                                    }
                                }]);

                            if (generatedError) {
                                console.warn('Failed to save to generated_playlists table:', generatedError);
                            } else {
                                console.log('Successfully saved playlist to database and generated_playlists table');
                            }
                        } catch (trackingError) {
                            console.warn('Error saving to generated_playlists tracking table:', trackingError);
                        }

                        // Update the generated playlist with the saved playlist ID
                        setGeneratedPlaylist({
                            ...playlist,
                            savedPlaylistId: savedPlaylist.id,
                            isSaved: true
                        });

                        // Refresh playlists to show the newly saved one
                        fetchPlaylists();
                    }
                } catch (saveError) {
                    console.warn('Failed to save generated playlist to database:', saveError);
                    // Still show the playlist even if saving failed
                }
            }

            navigate('/playlists');
        } catch (error) {
            console.error('Error generating playlist:', error);
            setMoodPlaylistError(error.message);
        } finally {
            setIsLoadingMoodPlaylist(false);
        }
    }, [setGeneratedPlaylist, navigate, isAuthenticated, user, createPlaylist, addSongToPlaylist, fetchPlaylists]);

    useEffect(() => {
        if(userHasStoredMood) {
            const storedMood = localStorage.getItem('userMood');
            if(storedMood) {
                console.log("Stored mood:", storedMood);
            }
        }
    }, [userHasStoredMood]);

    // Show loading state while auth is being determined
    if (authLoading) {
        return (
            <div className="min-h-screen bg-dark-bg text-text-light flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary-purple mx-auto mb-4" />
                    <p className="text-text-medium">Loading your personalized experience...</p>
                </div>
            </div>
        );
    }

    return(
        <div className="min-h-screen bg-dark-bg text-text-light">
            <div className="p-4 sm:p-6">
                {/* Rate Limiting Notification */}
                {rateLimitError && (
                    <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                        apiQuotaExceeded 
                            ? 'bg-red-900/20 border-red-500 text-red-100' 
                            : 'bg-yellow-900/20 border-yellow-500 text-yellow-100'
                    }`}>
                        <div className="flex items-center space-x-2">
                            {apiQuotaExceeded ? (
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            ) : (
                                <Clock className="h-5 w-5 text-yellow-400" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {apiQuotaExceeded ? 'API Quota Exceeded' : 'Rate Limit Reached'}
                                </p>
                                <p className="text-sm mt-1">{rateLimitError}</p>
                                {lastApiCallTime && (
                                    <p className="text-xs mt-1 opacity-75">
                                        Last updated: {new Date(lastApiCallTime).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* User Profile Section */}
                {isAuthenticated && (
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                        {/* Profile Picture */}
                        <div className="relative">
                            {getProfilePicture() ? (
                                <img
                                    src={getProfilePicture()}
                                    alt="Profile"
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary-purple shadow-lg"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* Fallback avatar with initials */}
                            <div 
                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-purple to-[#C879E6] flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg ${getProfilePicture() ? 'hidden' : 'flex'}`}
                            >
                                {getUserInitials()}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-dark-bg"></div>
                        </div>
                        
                        {/* Greeting and Status */}
                        <div className="flex-1 min-w-0">
                            <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold truncate'>{getPersonalizedGreeting()}</h2>
                            <div className="text-xs sm:text-sm text-text-medium mt-1 line-clamp-2">
                                Welcome back! Your playlists and mood history are synced across all your devices.
                            </div>
                        </div>
                    </div>
                )}

                {/* Greeting for non-authenticated users */}
                {!isAuthenticated && (
                    <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6'>{getPersonalizedGreeting()}</h2>
                )}

                {/* mood-based playlist section (Manual Input) */}
                <div className='mb-6 sm:mb-8 bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg'>
                    <h3 className='text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2'>
                        <Sparkles className='w-5 h-5 sm:w-6 sm:h-6 text-purple-400' />
                        Create a Mood Playlist {!isAuthenticated && '(Guest Mode)'}
                    </h3>
                    <p className='text-text-medium mb-3 sm:mb-4 text-sm sm:text-base'>
                        Tell us how you're feeling, and Spotimood will suggest a playlist just for you.
                        {isAuthenticated 
                            ? ' Your generated playlist will be automatically saved to your library!' 
                            : ' Sign in to save and manage your playlists!'
                        }
                    </p>
                    <textarea 
                    className='w-full bg-dark-bg text-text-light rounded-md p-3 mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-primary-purple text-sm sm:text-base' 
                    rows='3' 
                    placeholder="e.g., 'feeling melancholic and reflective', 'energetic and ready to dance', 'calm and focused'"
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}>
                    </textarea>
                    {moodPlaylistError && (
                        <p className='text-red-400 text-xs sm:text-sm mb-3 sm:mb-4'>{moodPlaylistError}</p>
                    )}
                    {!isAuthenticated ? (
                        <p className='text-yellow-400 text-xs sm:text-sm mb-3 sm:mb-4 flex flex-wrap items-center gap-1 sm:gap-2'>
                            💡 Tip: <button 
                                onClick={() => navigate('/auth')} 
                                className="underline hover:text-primary-purple transition-colors"
                            >
                                Sign in
                            </button> to save your mood playlists and get personalized recommendations!
                        </p>
                    ) : (
                        <p className='text-green-400 text-xs sm:text-sm mb-3 sm:mb-4 flex flex-wrap items-center gap-1 sm:gap-2'>
                            ✨ Your generated playlist will be automatically saved to your library and synchronized across all your devices!
                        </p>
                    )}
                    <button
                    onClick={() => generatePlaylist(moodInput, false)}
                    className='bg-primary-purple text-text-light px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center space-x-2 hover:bg-[#C879E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto'
                    disabled={isLoadingMoodPlaylist}
                    >
                        {isLoadingMoodPlaylist ? (
                            <>
                                <Loader2 className='animate-spin h-4 w-4 sm:h-5 sm:w-5 text-text-light' />
                                <span>Generating...</span>
                            </>
                        ) : 'Generate Mood Playlist'}
                    </button>
                </div>
                
                {/* Recently Played Section */}
                <div className="mb-6 sm:mb-8">
                    {isLoadingAlbums ? (
                        <div className="flex justify-center items-center h-24 sm:h-32">
                            <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-primary-purple" />
                            <span className="ml-2 text-text-medium text-sm sm:text-base">Loading albums...</span>
                        </div>
                    ) : (
                        <SectionCarousel title='Recently Played' items={albumCard} type='album' />
                    )}
                </div>

                {/* Made for You Section */}
                <div className="mb-6 sm:mb-8">
                    {isLoadingPlaylists ? (
                        <div className="flex justify-center items-center h-24 sm:h-32">
                            <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-primary-purple" />
                            <span className="ml-2 text-text-medium text-sm sm:text-base">Loading playlists...</span>
                        </div>
                    ) : (
                        <SectionCarousel 
                            title={isAuthenticated ? 'Made for You' : 'Discover Music'} 
                            items={playlistCard} 
                            type='playlist' 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}