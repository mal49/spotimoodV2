import React, {useState, useEffect, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCarousel from '../UI/SectionCarousel.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2, Sparkles, User } from 'lucide-react';

export default function HomePage() {
    const { setGeneratedPlaylist, userHasStoredMood } = useApp();
    const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [moodInput, setMoodInput] = useState('');
    const [isLoadingMoodPlaylist, setIsLoadingMoodPlaylist] = useState(false);
    const [moodPlaylistError, setMoodPlaylistError] = useState(null);
    
    // States for album and playlist data
    const [albumCard, setAlbumCard] = useState([]);
    const [playlistCard, setPlaylistCard] = useState([]);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

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

    // Function to search YouTube for songs
    const searchYouTubeMusic = async (query, maxResults = 6) => {
        try {
            const response = await fetch(`http://localhost:3001/api/search-music?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                return data.videos.slice(0, maxResults);
            }
            return [];
        } catch (error) {
            console.error('Error searching YouTube:', error);
            return [];
        }
    };

    // Load albums with real data
    const loadAlbumsWithRealData = useCallback(async () => {
        setIsLoadingAlbums(true);
        try {
            const albumQueries = [
                'best pop songs 2024',
                'top rock classics',
                'greatest hits collection',
                'chill indie music',
                'best rap albums',
                'electronic dance music'
            ];

            const albumsData = await Promise.all(
                albumQueries.map(async (query, index) => {
                    const videos = await searchYouTubeMusic(query, 1);
                    const video = videos[0];
                    
                    if (video) {
                        return {
                            id: index + 1,
                            title: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title,
                            artist: video.channelTitle,
                            imageUrl: video.thumbnail,
                            videoId: video.id,
                            query: query // Store the query for potential expansion
                        };
                    }
                    
                    // Fallback placeholder if no video found
                    return {
                        id: index + 1,
                        title: `Album ${index + 1}`,
                        artist: 'Various Artists',
                        imageUrl: 'https://placehold.co/150x150/282828/FFFFFF?text=Album',
                        videoId: null,
                        query: query
                    };
                })
            );

            setAlbumCard(albumsData);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, []);

    // Load playlists with real data
    const loadPlaylistsWithRealData = useCallback(async () => {
        setIsLoadingPlaylists(true);
        try {
            const playlistQueries = [
                { query: 'daily mix popular songs', title: 'Daily Mix 1', description: 'Popular tracks for you' },
                { query: 'discover weekly new music', title: 'Discover Weekly', description: 'New songs for you' },
                { query: 'workout music high energy', title: 'Workout Jams', description: 'High energy tracks' },
                { query: 'relaxing instrumental music', title: 'Relaxing Instrumentals', description: 'Focus and calm' }
            ];

            const playlistsData = await Promise.all(
                playlistQueries.map(async (playlistInfo, index) => {
                    const videos = await searchYouTubeMusic(playlistInfo.query, 4);
                    
                    // Use the first video's thumbnail, or fallback
                    const imageUrl = videos.length > 0 
                        ? videos[0].thumbnail 
                        : 'https://placehold.co/150x150/AA60C8/FFFFFF?text=Mix';

                    return {
                        id: index + 1,
                        title: playlistInfo.title,
                        description: playlistInfo.description,
                        imageUrl: imageUrl,
                        songs: videos.map(video => ({
                            id: video.id,
                            title: video.title,
                            artist: video.channelTitle,
                            thumbnail: video.thumbnail,
                            videoId: video.id
                        })),
                        query: playlistInfo.query // Store for potential refresh
                    };
                })
            );

            setPlaylistCard(playlistsData);
        } catch (error) {
            console.error('Error loading playlists:', error);
        } finally {
            setIsLoadingPlaylists(false);
        }
    }, []);

    // Load data on component mount
    useEffect(() => {
        loadAlbumsWithRealData();
        loadPlaylistsWithRealData();
    }, [loadAlbumsWithRealData, loadPlaylistsWithRealData]);

    const generatePlaylist = useCallback(async (moodToUse, isAutoGenerated = false) => {
        if(!moodToUse.trim()) {
            setMoodPlaylistError("Please enter your mood to generate playlist.");
            return;
        }

        // Note: Allow playlist generation for both authenticated and guest users
        // Authenticated users get additional benefits like saving playlists

        setIsLoadingMoodPlaylist(true);
        setMoodPlaylistError(null);
        setGeneratedPlaylist(null);

        try {
            const prompt = `Generate a list of 5-7 song recommendations (title and artist) that perfectly match a "${moodToUse}" mood. Provide the output JSON array of objects, each with 'title' and 'artist' keys. Also, provide a mock 'videoId' (a short random string like 'abc123def') for demonstration purposes.`;

            const payload = {
                prompt: prompt,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            console.log('Sending request to server:', JSON.stringify(payload, null, 2));

            const apiUrl = 'http://localhost:3001/api/generate-mood-playlist';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate playlist');
            }

            const playlist = await response.json();
            console.log('Received playlist from server:', playlist);

            if (!playlist || !playlist.songs || !Array.isArray(playlist.songs)) {
                throw new Error('Invalid playlist data received from server');
            }

            setGeneratedPlaylist(playlist);
            navigate('/playlists');
        } catch (error) {
            console.error("Error generating mood playlist:", error);
            setMoodPlaylistError(`Failed to generate playlist: ${error.message}`);
        } finally {
            setIsLoadingMoodPlaylist(false);
        }
    }, [setGeneratedPlaylist, navigate, isAuthenticated]);

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
            <div className="p-6">
                {/* User Profile Section */}
                {isAuthenticated && (
                    <div className="flex items-center space-x-4 mb-6">
                        {/* Profile Picture */}
                        <div className="relative">
                            {getProfilePicture() ? (
                                <img
                                    src={getProfilePicture()}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-purple shadow-lg"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* Fallback avatar with initials */}
                            <div 
                                className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary-purple to-[#C879E6] flex items-center justify-center text-white font-bold text-lg shadow-lg ${getProfilePicture() ? 'hidden' : 'flex'}`}
                            >
                                {getUserInitials()}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-bg"></div>
                        </div>
                        
                        {/* Greeting and Status */}
                        <div className="flex-1">
                            <h2 className='text-3xl font-bold'>{getPersonalizedGreeting()}</h2>
                            <div className="text-sm text-text-medium mt-1">
                                Welcome back! Your playlists and mood history are synced across all your devices.
                            </div>
                        </div>
                    </div>
                )}

                {/* Greeting for non-authenticated users */}
                {!isAuthenticated && (
                    <h2 className='text-3xl font-bold mb-6'>{getPersonalizedGreeting()}</h2>
                )}

                {/* mood-based playlist section (Manual Input) */}
                <div className='mb-8 bg-dark-card p-6 rounded-lg shadow-lg'>
                    <h3 className='text-2xl font-bold mb-4 flex items-center gap-2'>
                        <Sparkles className='w-6 h-6 text-purple-400' />
                        Create a Mood Playlist {!isAuthenticated && '(Guest Mode)'}
                    </h3>
                    <p className='text-text-medium mb-4'>
                        Tell us how you're feeling, and Spotimood will suggest a playlist just for you.
                        {!isAuthenticated && ' Sign in to save and manage your playlists!'}
                    </p>
                    <textarea 
                    className='w-full bg-dark-bg text-text-light rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-purple' 
                    rows='3' 
                    placeholder="e.g., 'feeling melancholic and reflective', 'energetic and ready to dance', 'calm and focused'"
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}>
                    </textarea>
                    {moodPlaylistError && (
                        <p className='text-red-400 text-sm mb-4'>{moodPlaylistError}</p>
                    )}
                    {!isAuthenticated && (
                        <p className='text-yellow-400 text-sm mb-4 flex items-center gap-2'>
                            💡 Tip: <button 
                                onClick={() => navigate('/auth')} 
                                className="underline hover:text-primary-purple transition-colors"
                            >
                                Sign in
                            </button> to save your mood playlists and get personalized recommendations!
                        </p>
                    )}
                    <button
                    onClick={() => generatePlaylist(moodInput, false)}
                    className='bg-primary-purple text-text-light px-6 py-3 rounded-full font-bold text-lg flex items-center justify-center space-x-2 hover:bg-[#C879E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto'
                    disabled={isLoadingMoodPlaylist}
                    >
                        {isLoadingMoodPlaylist ? (
                            <>
                                <Loader2 className='animate-spin h-5 w-5 text-text-light' />
                                <span>Generating...</span>
                            </>
                        ) : 'Generate Mood Playlist'}
                    </button>
                </div>
                
                {/* Recently Played Section */}
                <div className="mb-8">
                    {isLoadingAlbums ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="animate-spin h-8 w-8 text-primary-purple" />
                            <span className="ml-2 text-text-medium">Loading albums...</span>
                        </div>
                    ) : (
                        <SectionCarousel title='Recently Played' items={albumCard} type='album' />
                    )}
                </div>

                {/* Made for You Section */}
                <div className="mb-8">
                    {isLoadingPlaylists ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="animate-spin h-8 w-8 text-primary-purple" />
                            <span className="ml-2 text-text-medium">Loading playlists...</span>
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