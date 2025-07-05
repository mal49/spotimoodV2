const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable gzip compression for better performance as recommended by YouTube API docs
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://spotimood-alpha.vercel.app/',  // We'll update this after Vercel deployment
            process.env.FRONTEND_URL, // Alternative domain
            /\.vercel\.app$/  // Allow any Vercel subdomain
          ] 
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Add gzip compression middleware
app.use((req, res, next) => {
    res.setHeader('Accept-Encoding', 'gzip');
    next();
});

//API key retrieval
//Securely loaded from the .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Initialize YouTube API with proper configuration
const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
});

// Rate limiting for YouTube API (quota management)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 50; // More conservative limit

// Global quota tracking
let globalQuotaState = {
    quotaExceeded: false,
    resetTime: null,
    dailyQuotaUsed: 0,
    lastResetDate: new Date().toDateString()
};

// Exponential backoff utility
const exponentialBackoff = (attempt) => {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
};

// Check if we need to reset daily quota
const checkDailyQuotaReset = () => {
    const today = new Date().toDateString();
    if (globalQuotaState.lastResetDate !== today) {
        globalQuotaState = {
            quotaExceeded: false,
            resetTime: null,
            dailyQuotaUsed: 0,
            lastResetDate: today
        };
        console.log('Daily quota reset');
    }
};

const checkRateLimit = (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    // Check daily quota first
    checkDailyQuotaReset();
    
    if (globalQuotaState.quotaExceeded && now < globalQuotaState.resetTime) {
        return res.status(429).json({
            error: 'YouTube API quota exceeded',
            code: 'QUOTA_EXCEEDED',
            retryAfter: Math.ceil((globalQuotaState.resetTime - now) / 1000)
        });
    }
    
    if (!rateLimitMap.has(clientId)) {
        rateLimitMap.set(clientId, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
        rateLimitMap.set(clientId, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    if (clientData.requests >= MAX_REQUESTS_PER_MINUTE) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMITED',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
    }
    
    clientData.requests++;
    next();
};

// Apply rate limiting to YouTube API endpoints
app.use('/api/search-music', checkRateLimit);
app.use('/api/video/:videoId', checkRateLimit);

// Enhanced YouTube search endpoint with proper error handling
app.get('/api/search-music', async (req, res) => {
    const { query, pageToken, maxResults = 10 } = req.query;
    
    // Validate required parameters as per YouTube API docs
    if (!query || query.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Search query is required and cannot be empty',
            code: 'MISSING_QUERY'
        });
    }

    // Validate maxResults parameter
    const resultsCount = Math.min(Math.max(parseInt(maxResults) || 10, 1), 50);

    try {
        // Use proper YouTube Data API v3 parameters according to documentation
        const searchParams = {
            part: 'snippet',
            q: query.trim(),
            type: 'video',
            videoCategoryId: '10', // Music category
            maxResults: resultsCount,
            order: 'relevance',
            safeSearch: 'none',
            videoEmbeddable: 'true', // Only get embeddable videos
            fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/high/url,publishedAt)),nextPageToken,prevPageToken,pageInfo/totalResults'
        };

        if (pageToken) {
            searchParams.pageToken = pageToken;
        }

        const response = await youtube.search.list(searchParams);

        // Increment quota usage
        globalQuotaState.dailyQuotaUsed += 1;
        
        // Transform response according to application needs
        const videos = response.data.items?.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.high?.url || 'https://placehold.co/320x180/AA60C8/FFFFFF?text=No+Image',
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        })) || [];

        res.json({
            videos,
            nextPageToken: response.data.nextPageToken,
            prevPageToken: response.data.prevPageToken,
            totalResults: response.data.pageInfo?.totalResults || 0,
            resultsPerPage: resultsCount,
            quotaUsed: globalQuotaState.dailyQuotaUsed // Include quota info for debugging
        });

    } catch (error) {
        console.error('YouTube API Search Error:', error);
        
        // Handle specific YouTube API errors according to documentation
        if (error.response) {
            const { status, data } = error.response;
            
            // Handle quota exceeded error
            if (status === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                // Mark quota as exceeded globally
                globalQuotaState.quotaExceeded = true;
                globalQuotaState.resetTime = Date.now() + (24 * 60 * 60 * 1000); // Reset in 24 hours
                
                console.error('YouTube API quota exceeded. Quota will reset in 24 hours.');
                
                return res.status(429).json({
                    error: 'YouTube API quota exceeded',
                    code: 'QUOTA_EXCEEDED',
                    retryAfter: 86400, // 24 hours
                    quotaUsed: globalQuotaState.dailyQuotaUsed
                });
            }
            
            // Handle invalid API key
            if (status === 400 && data.error?.errors?.[0]?.reason === 'keyInvalid') {
                return res.status(401).json({
                    error: 'Invalid YouTube API key',
                    code: 'INVALID_API_KEY'
                });
            }
            
            return res.status(status).json({
                error: 'YouTube API Error',
                code: data.error?.errors?.[0]?.reason || 'API_ERROR',
                details: data.error?.message || 'Unknown error'
            });
        }
        
        res.status(500).json({ 
            error: 'Error searching YouTube',
            code: 'INTERNAL_ERROR',
            details: error.message
        });
    }
});

// Enhanced video details endpoint with better validation and error handling
app.get('/api/video/:videoId', async (req, res) => {
    const { videoId } = req.params;

    // Validate video ID format
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).json({ 
            error: 'Invalid video ID format',
            code: 'INVALID_VIDEO_ID'
        });
    }

    try {
        const response = await youtube.videos.list({
            part: 'snippet,contentDetails,status,statistics',
            id: videoId,
            fields: 'items(id,snippet(title,description,channelTitle,thumbnails/high/url,publishedAt),contentDetails/duration,status(embeddable,privacyStatus),statistics(viewCount,likeCount))'
        });

        if (!response.data.items || response.data.items.length === 0) {
            console.log(`Video not found: ${videoId}`);
            return res.status(404).json({ 
                error: 'Video not found',
                code: 'VIDEO_NOT_FOUND'
            });
        }

        const video = response.data.items[0];
        
        // Check if video is embeddable
        if (video.status?.embeddable === false) {
            console.log(`Video ${videoId} is not embeddable`);
            return res.status(403).json({ 
                error: 'Video cannot be embedded',
                code: 'NOT_EMBEDDABLE',
                details: 'This video is not available for embedding'
            });
        }

        // Check if video is public
        if (video.status?.privacyStatus !== 'public') {
            console.log(`Video ${videoId} is not public: ${video.status?.privacyStatus}`);
            return res.status(403).json({ 
                error: 'Video is not public',
                code: 'NOT_PUBLIC',
                details: `Video privacy status: ${video.status?.privacyStatus}`
            });
        }

        console.log(`Successfully fetched video details for: ${videoId}`);
        
        res.json({
            id: video.id,
            title: video.snippet?.title || 'Unknown Title',
            description: video.snippet?.description || '',
            thumbnail: video.snippet?.thumbnails?.high?.url || 'https://placehold.co/320x180/AA60C8/FFFFFF?text=No+Image',
            duration: video.contentDetails?.duration || 'PT0S',
            channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
            publishedAt: video.snippet?.publishedAt,
            viewCount: video.statistics?.viewCount || '0',
            likeCount: video.statistics?.likeCount || '0',
            isEmbeddable: video.status?.embeddable !== false,
            privacyStatus: video.status?.privacyStatus || 'unknown'
        });

    } catch (error) {
        console.error('YouTube API Video Details Error:', error);
        
        // Handle specific YouTube API errors
        if (error.response) {
            const { status, data } = error.response;
            console.error('YouTube API Response:', data);
            
            return res.status(status).json({ 
                error: 'YouTube API Error',
                code: data.error?.errors?.[0]?.reason || 'API_ERROR',
                details: data.error?.message || 'Unknown error'
            });
        }
        
        res.status(500).json({ 
            error: 'Error fetching video details',
            code: 'INTERNAL_ERROR',
            details: error.message
        });
    }
});

// In-memory playlist storage
const playlists = [];

app.post('/api/generate-mood-playlist', async (req, res) => {
    if(!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in .env file.');
        return res.status(500).json({error: 'Server configuration error: API key missing.'});
    }

    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    let prompt;
    let generationConfig;

    // Handle both formats: direct prompt or contents array
    if (req.body.prompt) {
        prompt = req.body.prompt;
        generationConfig = req.body.generationConfig;
    } else if (req.body.contents && Array.isArray(req.body.contents) && req.body.contents.length > 0) {
        prompt = req.body.contents[0]?.parts?.[0]?.text;
        generationConfig = req.body.generationConfig;
    }

    if (!prompt) {
        console.error('No prompt found in request:', req.body);
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const payload = {
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: generationConfig || {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        console.log('Sending payload to Gemini API:', JSON.stringify(payload, null, 2));

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await geminiResponse.json();
        console.log('Gemini API response:', JSON.stringify(responseData, null, 2));

        if (!geminiResponse.ok) {
            console.error('Error from Gemini API:', responseData);
            return res.status(geminiResponse.status).json({
                error: 'Error from Gemini API',
                details: responseData
            });
        }

        const jsonText = responseData.candidates[0].content.parts[0].text;
        console.log('Received text from API:', jsonText);

        // Remove code block markers if present
        let jsonArrayText = jsonText.trim();
        if (jsonArrayText.startsWith('```')) {
            jsonArrayText = jsonArrayText.replace(/```(json)?/g, '').trim();
        }
        // Find the first [ and last ] to extract the array
        const firstBracket = jsonArrayText.indexOf('[');
        const lastBracket = jsonArrayText.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonArrayText = jsonArrayText.substring(firstBracket, lastBracket + 1);
        }

        try {
            const songs = JSON.parse(jsonArrayText);
            
            // Search YouTube for each song to get actual video IDs with improved error handling
            const songsWithVideoIds = await Promise.all(songs.map(async (song, index) => {
                try {
                    const searchQuery = `${song.title} ${song.artist}`.trim();
                    
                    // Improved YouTube search with better parameters
                    const searchResponse = await youtube.search.list({
                        part: 'snippet',
                        q: searchQuery,
                        type: 'video',
                        videoCategoryId: '10', // Music category
                        maxResults: 1,
                        order: 'relevance',
                        videoEmbeddable: 'true', // Only embeddable videos
                        fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/high/url))'
                    });

                    const videoData = searchResponse.data.items && searchResponse.data.items.length > 0 
                        ? searchResponse.data.items[0] 
                        : null;
                    
                    const videoId = videoData?.id?.videoId || null;
                    const thumbnail = videoData?.snippet?.thumbnails?.high?.url || 'https://placehold.co/60x60/AA60C8/FFFFFF?text=Art';

                    // Add small delay between requests to respect API limits
                    if (index > 0) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    return {
                        id: videoId ? `https://www.youtube.com/watch?v=${videoId}` : `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: song.title,
                        artist: song.artist,
                        album: "Mood Playlist",
                        duration: "N/A",
                        thumbnail: thumbnail,
                        videoId: videoId
                    };
                } catch (searchError) {
                    console.error(`Error searching for song "${song.title}" by "${song.artist}":`, searchError);
                    
                    // Log quota errors specifically
                    if (searchError.response?.status === 403) {
                        console.warn('YouTube API quota exceeded during playlist generation');
                    }
                    
                    return {
                        id: `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: song.title,
                        artist: song.artist,
                        album: "Mood Playlist",
                        duration: "N/A",
                        thumbnail: 'https://placehold.co/60x60/AA60C8/FFFFFF?text=Art',
                        videoId: null
                    };
                }
            }));
            
            // Create a properly formatted playlist object
            const playlist = {
                id: Date.now().toString(),
                title: `Mood Playlist - ${new Date().toLocaleDateString()}`,
                description: `Generated playlist based on your mood`,
                songs: songsWithVideoIds,
                createdAt: new Date().toISOString()
            };

            playlists.push(playlist); // Save to in-memory storage
            console.log('Current playlists array:', playlists);

            res.json(playlist);
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError, jsonArrayText);
            throw new Error('Failed to parse playlist data from API response');
        }
    } catch (error) {
        console.error('Error in /api/generate-mood-playlist:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
    const { title, description, songs } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Playlist title is required' });
    }

    try {
        const newPlaylist = {
            id: Date.now().toString(),
            title,
            description: description || '',
            songs: songs || [],
            createdAt: new Date().toISOString()
        };
        playlists.push(newPlaylist);
        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ 
            error: 'Error creating playlist',
            details: error.message
        });
    }
});

// Get all playlists
app.get('/api/playlists', async (req, res) => {
    try {
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ 
            error: 'Error fetching playlists',
            details: error.message
        });
    }
});

// Get a specific playlist
app.get('/api/playlists/:playlistId', async (req, res) => {
    const { playlistId } = req.params;
    try {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.json(playlist);
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ 
            error: 'Error fetching playlist',
            details: error.message
        });
    }
});

// Update a playlist
app.put('/api/playlists/:playlistId', async (req, res) => {
    const { playlistId } = req.params;
    const { title, description, songs } = req.body;
    try {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        if (title) playlist.title = title;
        if (description) playlist.description = description;
        if (songs) playlist.songs = songs;
        res.json(playlist);
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ 
            error: 'Error updating playlist',
            details: error.message
        });
    }
});

// Delete a playlist
app.delete('/api/playlists/:playlistId', async (req, res) => {
    const { playlistId } = req.params;
    try {
        const index = playlists.findIndex(p => p.id === playlistId);
        if (index === -1) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        playlists.splice(index, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ 
            error: 'Error deleting playlist',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend proxy server running on http://localhost:${PORT}`);
    console.log('Ensure your react app is configured to fetch from this address.');
    
    // Check API key status
    if (!GEMINI_API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY is not set in .env file');
    }
    if (!YOUTUBE_API_KEY) {
        console.warn('⚠️  YOUTUBE_API_KEY is not set in .env file');
    }
    if (GEMINI_API_KEY && YOUTUBE_API_KEY) {
        console.log('✅ All API keys loaded successfully');
    }
});