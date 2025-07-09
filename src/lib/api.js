import config from './config.js';

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  SEARCH: 'search_'
};

// Rate limiting state
let rateLimitState = {
  isRateLimited: false,
  resetTime: null,
  retryCount: 0
};

// Exponential backoff utility
const exponentialBackoff = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
};

// Cache management utilities
const getCacheKey = (type, query = '') => {
  return `${type}_${query}`.toLowerCase();
};

const getCachedData = (cacheKey) => {
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for ${cacheKey}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (cacheKey, data) => {
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  console.log(`Cached data for ${cacheKey}`);
};

// Fallback data for when API quota is exceeded
const getFallbackAlbums = () => [
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
];

const getFallbackPlaylists = () => [
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
];

// Enhanced YouTube Music Search with caching and rate limiting
export const searchYouTubeMusic = async (query, maxResults = 6, useCache = true) => {
  const cacheKey = getCacheKey(CACHE_KEYS.SEARCH, `${query}_${maxResults}`);
  
  // Check cache first
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Check if we're rate limited
  if (rateLimitState.isRateLimited && Date.now() < rateLimitState.resetTime) {
    console.warn('Rate limited, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `${config.API_BASE_URL}/api/search-music?query=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const videos = data.videos || [];
      
      // Reset rate limit state on success
      rateLimitState = { isRateLimited: false, resetTime: null, retryCount: 0 };
      
      // Cache the results
      if (useCache) {
        setCachedData(cacheKey, videos);
      }
      
      return videos;
    }
    
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 3600;
      rateLimitState = {
        isRateLimited: true,
        resetTime: Date.now() + (retryAfter * 1000),
        retryCount: rateLimitState.retryCount + 1
      };
      
      console.warn(`Rate limited, retry after ${retryAfter} seconds`);
      throw new Error('RATE_LIMITED');
    }
    
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.error('Error searching YouTube:', error);
    
    // If rate limited, return cached data or empty array
    if (error.message === 'RATE_LIMITED') {
      const cached = getCachedData(cacheKey);
      return cached || [];
    }
    
    // For other errors, try to return cached data
    const cached = getCachedData(cacheKey);
    return cached || [];
  }
};

// Multi-source music search with automatic fallback
export const searchMusicMultiSource = async (query, maxResults = 6, source = 'auto', useCache = true) => {
  const cacheKey = getCacheKey(CACHE_KEYS.SEARCH, `${query}_${maxResults}_${source}`);
  
  // Check cache first
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetch(
      `${config.API_BASE_URL}/api/search-music-multi?query=${encodeURIComponent(query)}&maxResults=${maxResults}&source=${source}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const results = data.videos || [];
      
      // Cache the results
      if (useCache) {
        setCachedData(cacheKey, results);
      }
      
      return {
        results,
        source: data.source,
        totalResults: data.totalResults,
        availableSources: data.availableSources
      };
    }
    
    // Handle specific error cases
    if (response.status === 429) {
      console.warn('All music APIs rate limited');
      const cached = getCachedData(cacheKey);
      return {
        results: cached || [],
        source: 'cached',
        totalResults: cached?.length || 0,
        availableSources: { youtube: false, spotify: false, lastfm: false }
      };
    }
    
    if (response.status === 404) {
      console.warn('No music found for query:', query);
      return {
        results: [],
        source: 'none',
        totalResults: 0,
        availableSources: { youtube: false, spotify: false, lastfm: false }
      };
    }
    
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.error('Error in multi-source search:', error);
    
    // Return cached data if available
    const cached = getCachedData(cacheKey);
    return {
      results: cached || [],
      source: 'cached',
      totalResults: cached?.length || 0,
      availableSources: { youtube: false, spotify: false, lastfm: false }
    };
  }
};

// Legacy function for backward compatibility
export const searchMusic = async (query, maxResults = 6, useCache = true) => {
  const result = await searchMusicMultiSource(query, maxResults, 'auto', useCache);
  return result.results;
};

// Enhanced Album Loading with caching
export const loadAlbumsWithCaching = async () => {
  const cacheKey = getCacheKey(CACHE_KEYS.ALBUMS);
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const albumQueries = [
      'best pop songs 2024',
      'top rock classics',
      'greatest hits collection',
      'chill indie music',
      'best rap albums',
      'electronic dance music'
    ];

    // Reduce concurrent API calls by using Promise.allSettled
    // and adding delays between requests
    const albumsData = [];
    
    for (let i = 0; i < albumQueries.length; i++) {
      const query = albumQueries[i];
      
      try {
        // Add delay between requests to avoid hitting rate limits
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const videos = await searchYouTubeMusic(query, 1, true);
        const video = videos[0];
        
        if (video) {
          albumsData.push({
            id: i + 1,
            title: video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title,
            artist: video.channelTitle,
            imageUrl: video.thumbnail,
            videoId: video.id,
            query: query
          });
        } else {
          // Use fallback data
          const fallback = getFallbackAlbums()[i % getFallbackAlbums().length];
          albumsData.push({
            ...fallback,
            id: i + 1,
            query: query
          });
        }
      } catch (error) {
        console.error(`Error loading album ${i + 1}:`, error);
        // Use fallback data
        const fallback = getFallbackAlbums()[i % getFallbackAlbums().length];
        albumsData.push({
          ...fallback,
          id: i + 1,
          query: query
        });
      }
    }

    // Cache the results
    setCachedData(cacheKey, albumsData);
    return albumsData;
    
  } catch (error) {
    console.error('Error loading albums:', error);
    // Return fallback data
    return getFallbackAlbums();
  }
};

// Enhanced Playlist Loading with caching
export const loadPlaylistsWithCaching = async () => {
  const cacheKey = getCacheKey(CACHE_KEYS.PLAYLISTS);
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const playlistQueries = [
      { query: 'daily mix popular songs', title: 'Daily Mix 1', description: 'Popular tracks for you' },
      { query: 'discover weekly new music', title: 'Discover Weekly', description: 'New songs for you' },
      { query: 'workout music high energy', title: 'Workout Jams', description: 'High energy tracks' },
      { query: 'relaxing instrumental music', title: 'Relaxing Instrumentals', description: 'Focus and calm' }
    ];

    const playlistsData = [];
    
    for (let i = 0; i < playlistQueries.length; i++) {
      const playlistInfo = playlistQueries[i];
      
      try {
        // Add delay between requests
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Reduce maxResults to minimize API calls
        const videos = await searchYouTubeMusic(playlistInfo.query, 2, true);
        
        const imageUrl = videos.length > 0 
          ? videos[0].thumbnail 
          : 'https://placehold.co/150x150/AA60C8/FFFFFF?text=Mix';

        playlistsData.push({
          id: i + 1,
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
          query: playlistInfo.query
        });
      } catch (error) {
        console.error(`Error loading playlist ${i + 1}:`, error);
        // Use fallback data
        const fallback = getFallbackPlaylists()[i % getFallbackPlaylists().length];
        playlistsData.push({
          ...fallback,
          id: i + 1,
          title: playlistInfo.title,
          description: playlistInfo.description
        });
      }
    }

    // Cache the results
    setCachedData(cacheKey, playlistsData);
    return playlistsData;
    
  } catch (error) {
    console.error('Error loading playlists:', error);
    // Return fallback data
    return getFallbackPlaylists();
  }
};

// Generate Mood Playlist
export const generateMoodPlaylist = async (mood) => {
  const payload = {
    prompt: `Generate a list of 5-7 song recommendations (title and artist) that perfectly match a "${mood}" mood. Provide the output JSON array of objects, each with 'title' and 'artist' keys. Also, provide a mock 'videoId' (a short random string like 'abc123def') for demonstration purposes.`,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(`${config.API_BASE_URL}/api/generate-mood-playlist`, {
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

  return await response.json();
};

// Cache management functions
export const clearApiCache = () => {
  apiCache.clear();
  console.log('API cache cleared');
};

export const getCacheStats = () => {
  return {
    size: apiCache.size,
    keys: Array.from(apiCache.keys()),
    rateLimitState: rateLimitState
  };
};
