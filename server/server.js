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
            'https://spotimood-green.vercel.app/',  // We'll update this after Vercel deployment
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

// Multiple YouTube API keys for rotation
const YOUTUBE_API_KEYS = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY_2,
    process.env.YOUTUBE_API_KEY_3,
    process.env.YOUTUBE_API_KEY_4
].filter(key => key); // Remove any undefined keys

// Debug logging for production
console.log('YouTube API Keys loaded:', {
    totalKeys: YOUTUBE_API_KEYS.length,
    keysPresent: YOUTUBE_API_KEYS.map((key, index) => ({
        index,
        hasKey: !!key,
        keyPrefix: key ? key.substring(0, 10) + '...' : 'missing'
    }))
});

// Remove alternative API keys and integrations
// const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
// const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
// const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY;

// Remove Spotify token management, getSpotifyToken, searchSpotifyMusic, searchLastFmMusic, and any fallback logic to these APIs

let currentKeyIndex = 0;
let keyUsageMap = new Map();

// Initialize key usage tracking with quota costs
YOUTUBE_API_KEYS.forEach((key, index) => {
    keyUsageMap.set(index, {
        quotaExceeded: false,
        resetTime: null,
        dailyQuotaUsed: 0,
        dailyQuotaCost: 0, // Track actual quota units, not just requests
        lastResetDate: new Date().toDateString(),
        requestCount: 0,
        lastUsed: null,
        errors: 0
    });
});

// YouTube API quota costs (per operation)
const YOUTUBE_QUOTA_COSTS = {
    'search.list': 100,
    'videos.list': 1,
    'channels.list': 1,
    'playlists.list': 1,
    'playlistItems.list': 1
};

// Maximum quota per key per day
const MAX_QUOTA_PER_KEY = 10000;
const QUOTA_WARNING_THRESHOLD = 8000; // Start being more conservative at 80%

// Function to get next available API key with smarter selection
const getNextAvailableKey = () => {
    const today = new Date().toDateString();
    
    // Reset daily quotas if needed
    keyUsageMap.forEach((usage, index) => {
        if (usage.lastResetDate !== today) {
            keyUsageMap.set(index, {
                quotaExceeded: false,
                resetTime: null,
                dailyQuotaUsed: 0,
                dailyQuotaCost: 0,
                lastResetDate: today,
                requestCount: 0,
                lastUsed: null,
                errors: 0
            });
        }
    });
    
    // Sort keys by health score (quota remaining, error count, last used)
    const keyHealth = Array.from(keyUsageMap.entries()).map(([index, usage]) => {
        const quotaRemaining = MAX_QUOTA_PER_KEY - usage.dailyQuotaCost;
        const isAvailable = !usage.quotaExceeded || Date.now() >= usage.resetTime;
        const errorRate = usage.requestCount > 0 ? usage.errors / usage.requestCount : 0;
        const timeSinceLastUsed = usage.lastUsed ? Date.now() - usage.lastUsed : Infinity;
        
        // Health score: higher is better
        const healthScore = isAvailable ? 
            (quotaRemaining * 1000) - (errorRate * 10000) + (timeSinceLastUsed / 1000) : 
            -1;
            
        return { index, usage, quotaRemaining, isAvailable, healthScore };
    }).sort((a, b) => b.healthScore - a.healthScore);
    
    // Select the healthiest available key
    const bestKey = keyHealth.find(key => key.isAvailable && key.quotaRemaining > 0);
    
    if (bestKey) {
        currentKeyIndex = bestKey.index;
        return YOUTUBE_API_KEYS[bestKey.index];
    }
    
    // If all keys are exhausted, return the one with the earliest reset time
    const earliestReset = keyHealth.reduce((earliest, current) => 
        (current.usage.resetTime || 0) < (earliest.usage.resetTime || 0) ? current : earliest
    );
    
    currentKeyIndex = earliestReset.index;
    return YOUTUBE_API_KEYS[earliestReset.index];
};

// Function to mark a key as quota exceeded
const markKeyQuotaExceeded = (keyIndex) => {
    const usage = keyUsageMap.get(keyIndex);
    if (usage) {
        usage.quotaExceeded = true;
        usage.resetTime = Date.now() + (24 * 60 * 60 * 1000); // Reset in 24 hours
        usage.errors += 1;
        console.log(`Key ${keyIndex} marked as quota exceeded. Total errors: ${usage.errors}, Quota used: ${usage.dailyQuotaCost}/${MAX_QUOTA_PER_KEY}`);
        keyUsageMap.set(keyIndex, usage);
    }
};

// Function to increment key usage with quota cost tracking
const incrementKeyUsage = (keyIndex, operation = 'unknown', quotaCost = 1) => {
    const usage = keyUsageMap.get(keyIndex);
    if (usage) {
        usage.dailyQuotaUsed += 1;
        usage.dailyQuotaCost += quotaCost;
        usage.requestCount += 1;
        usage.lastUsed = Date.now();
        
        // Check if approaching quota limit
        if (usage.dailyQuotaCost >= QUOTA_WARNING_THRESHOLD && !usage.quotaExceeded) {
            console.warn(`Key ${keyIndex} approaching quota limit: ${usage.dailyQuotaCost}/${MAX_QUOTA_PER_KEY} (${Math.round((usage.dailyQuotaCost/MAX_QUOTA_PER_KEY)*100)}%)`);
        }
        
        // Proactively mark as exceeded if we're very close to the limit
        if (usage.dailyQuotaCost >= MAX_QUOTA_PER_KEY - 100 && !usage.quotaExceeded) {
            console.log(`Proactively marking key ${keyIndex} as quota exceeded to prevent API errors`);
            usage.quotaExceeded = true;
            usage.resetTime = Date.now() + (24 * 60 * 60 * 1000);
        }
        
        console.log(`Key ${keyIndex} used for ${operation}: quota cost +${quotaCost}, total: ${usage.dailyQuotaCost}/${MAX_QUOTA_PER_KEY}`);
        keyUsageMap.set(keyIndex, usage);
    }
};

// Function to record successful request
const recordSuccessfulRequest = (keyIndex, operation) => {
    const quotaCost = YOUTUBE_QUOTA_COSTS[operation] || 1;
    incrementKeyUsage(keyIndex, operation, quotaCost);
};

// Function to record failed request
const recordFailedRequest = (keyIndex, operation, error) => {
    const usage = keyUsageMap.get(keyIndex);
    if (usage) {
        usage.errors += 1;
        usage.requestCount += 1;
        usage.lastUsed = Date.now();
        console.error(`Key ${keyIndex} failed request for ${operation}: ${error.message}`);
        keyUsageMap.set(keyIndex, usage);
    }
};

// Helper function to make YouTube API request with automatic key rotation
const makeYouTubeRequest = async (requestFunction, operation = 'unknown', maxRetries = YOUTUBE_API_KEYS.length) => {
    let lastError = null;
    let attempts = 0;
    
    while (attempts < maxRetries) {
        const startTime = Date.now();
        const selectedKeyIndex = currentKeyIndex;
        
        try {
            const apiKey = getNextAvailableKey();
            const youtube = createYouTubeAPI(apiKey);
            
            console.log(`YouTube API ${operation} request attempt ${attempts + 1}/${maxRetries} using key index ${currentKeyIndex}`);
            
            const result = await requestFunction(youtube);
            
            // Record successful request with proper quota cost tracking
            recordSuccessfulRequest(currentKeyIndex, operation);
            
            const duration = Date.now() - startTime;
            console.log(`YouTube API ${operation} succeeded in ${duration}ms using key ${currentKeyIndex}`);
            
            return result;
        } catch (error) {
            lastError = error;
            attempts++;
            
            const duration = Date.now() - startTime;
            console.error(`YouTube API ${operation} request failed (attempt ${attempts}) in ${duration}ms:`, error.message);
            
            // Record failed request
            recordFailedRequest(selectedKeyIndex, operation, error);
            
            // Handle quota exceeded error
            if (error.response?.status === 403 && 
                error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
                
                console.log(`Quota exceeded for key index ${selectedKeyIndex}, marking as exceeded`);
                markKeyQuotaExceeded(selectedKeyIndex);
                
                // Check if we have any available keys left
                const availableKeys = Array.from(keyUsageMap.values()).filter(usage => 
                    (!usage.quotaExceeded || Date.now() >= usage.resetTime) && 
                    usage.dailyQuotaCost < MAX_QUOTA_PER_KEY - 100
                );
                
                if (availableKeys.length === 0) {
                    console.log('All YouTube API keys have exceeded quota or are near limit');
                    
                    // Find the key with the earliest reset time
                    const earliestReset = Array.from(keyUsageMap.values())
                        .reduce((earliest, current) => 
                            (current.resetTime || Infinity) < (earliest.resetTime || Infinity) ? current : earliest
                        );
                    
                    const timeUntilReset = earliestReset.resetTime ? Math.ceil((earliestReset.resetTime - Date.now()) / 1000) : 24 * 60 * 60;
                    lastError.retryAfter = timeUntilReset;
                    break;
                }
                
                // Add exponential backoff before trying next key
                const backoffTime = exponentialBackoff(attempts - 1);
                if (backoffTime > 0) {
                    console.log(`Applying backoff delay: ${backoffTime}ms before trying next key`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
                
                // Continue to next iteration to try another key
                continue;
            }
            
            // Handle other 403 errors (invalid key, etc.)
            if (error.response?.status === 403) {
                console.error(`Key ${selectedKeyIndex} authentication error:`, error.response?.data?.error);
                recordFailedRequest(selectedKeyIndex, operation, error);
                continue; // Try next key
            }
            
            // For non-quota errors, break the retry loop
            break;
        }
    }
    
    // If we get here, all retries failed
    console.error(`All YouTube API ${operation} attempts failed after ${attempts} tries`);
    throw lastError;
};

// Initialize YouTube API with key rotation
const createYouTubeAPI = (apiKey) => {
    return google.youtube({
        version: 'v3',
        auth: apiKey
    });
};

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

// Enhanced debug endpoint to check API key status and health
app.get('/api/debug/keys', (req, res) => {
    const now = Date.now();
    const today = new Date().toDateString();
    
    // Calculate overall system health
    const availableKeys = Array.from(keyUsageMap.values()).filter(usage => 
        (!usage.quotaExceeded || now >= usage.resetTime) && 
        usage.dailyQuotaCost < MAX_QUOTA_PER_KEY - 100
    );
    
    const totalQuotaUsed = Array.from(keyUsageMap.values())
        .reduce((total, usage) => total + usage.dailyQuotaCost, 0);
    
    const totalQuotaAvailable = YOUTUBE_API_KEYS.length * MAX_QUOTA_PER_KEY;
    
    res.json({
        systemHealth: {
            status: availableKeys.length > 0 ? 'healthy' : 'degraded',
            availableKeys: availableKeys.length,
            totalKeys: YOUTUBE_API_KEYS.length,
            totalQuotaUsed,
            totalQuotaAvailable,
            quotaUtilization: Math.round((totalQuotaUsed / totalQuotaAvailable) * 100),
            timeUntilNextReset: getTimeUntilMidnight()
        },
        currentSettings: {
            currentKeyIndex,
            maxQuotaPerKey: MAX_QUOTA_PER_KEY,
            warningThreshold: QUOTA_WARNING_THRESHOLD,
            quotaCosts: YOUTUBE_QUOTA_COSTS
        },
        keyStatus: Array.from(keyUsageMap.entries()).map(([index, usage]) => {
            const quotaRemaining = MAX_QUOTA_PER_KEY - usage.dailyQuotaCost;
            const isAvailable = (!usage.quotaExceeded || now >= usage.resetTime) && quotaRemaining > 100;
            const errorRate = usage.requestCount > 0 ? Math.round((usage.errors / usage.requestCount) * 100) : 0;
            const timeSinceLastUsed = usage.lastUsed ? Math.round((now - usage.lastUsed) / 1000) : null;
            
            return {
                keyIndex: index,
                hasKey: !!YOUTUBE_API_KEYS[index],
                keyPrefix: YOUTUBE_API_KEYS[index] ? YOUTUBE_API_KEYS[index].substring(0, 10) + '...' : 'missing',
                status: isAvailable ? 'available' : usage.quotaExceeded ? 'quota_exceeded' : 'near_limit',
                health: isAvailable && errorRate < 10 ? 'good' : errorRate > 30 ? 'poor' : 'fair',
                quotaUsed: {
                    requests: usage.dailyQuotaUsed,
                    quotaCost: usage.dailyQuotaCost,
                    remaining: quotaRemaining,
                    percentage: Math.round((usage.dailyQuotaCost / MAX_QUOTA_PER_KEY) * 100)
                },
                performance: {
                    totalRequests: usage.requestCount,
                    errors: usage.errors,
                    errorRate: errorRate,
                    lastUsed: usage.lastUsed ? new Date(usage.lastUsed).toISOString() : null,
                    timeSinceLastUsed: timeSinceLastUsed
                },
                availability: {
                    isAvailable,
                    quotaExceeded: usage.quotaExceeded,
                    resetTime: usage.resetTime ? new Date(usage.resetTime).toISOString() : null,
                    timeUntilReset: usage.resetTime ? Math.max(0, Math.ceil((usage.resetTime - now) / 1000)) : null,
                    lastResetDate: usage.lastResetDate
                }
            };
        }),
        recommendations: generateKeyRecommendations(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            timestamp: new Date().toISOString(),
            serverUptime: Math.round(process.uptime())
        }
    });
});

// Helper function to get time until midnight
function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

// Helper function to generate recommendations based on key status
function generateKeyRecommendations() {
    const recommendations = [];
    const now = Date.now();
    
    const availableKeys = Array.from(keyUsageMap.values()).filter(usage => 
        (!usage.quotaExceeded || now >= usage.resetTime) && 
        usage.dailyQuotaCost < MAX_QUOTA_PER_KEY - 100
    );
    
    const totalQuotaUsed = Array.from(keyUsageMap.values())
        .reduce((total, usage) => total + usage.dailyQuotaCost, 0);
    
    if (availableKeys.length === 0) {
        recommendations.push({
            severity: 'critical',
            message: 'All API keys are exhausted or near quota limit',
            action: 'Add more YouTube API keys or wait for quota reset'
        });
    } else if (availableKeys.length === 1) {
        recommendations.push({
            severity: 'warning',
            message: 'Only one API key remaining',
            action: 'Consider adding more API keys to ensure reliability'
        });
    }
    
    if (totalQuotaUsed > (YOUTUBE_API_KEYS.length * MAX_QUOTA_PER_KEY * 0.8)) {
        recommendations.push({
            severity: 'warning',
            message: 'System using over 80% of total quota',
            action: 'Monitor usage closely and consider adding more keys'
        });
    }
    
    // Check for keys with high error rates
    Array.from(keyUsageMap.entries()).forEach(([index, usage]) => {
        if (usage.requestCount > 10 && usage.errors / usage.requestCount > 0.3) {
            recommendations.push({
                severity: 'warning',
                message: `Key ${index} has high error rate (${Math.round((usage.errors / usage.requestCount) * 100)}%)`,
                action: 'Check key validity and configuration'
            });
        }
    });
    
    if (recommendations.length === 0) {
        recommendations.push({
            severity: 'info',
            message: 'All systems operating normally',
            action: 'Continue monitoring'
        });
    }
    
    return recommendations;
}

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

        const response = await makeYouTubeRequest(async (youtube) => {
            return youtube.search.list(searchParams);
        }, 'search.list');

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
            quotaUsed: keyUsageMap.get(currentKeyIndex).dailyQuotaCost // Include quota cost info for debugging
        });

    } catch (error) {
        console.error('YouTube API Search Error:', error);
        
        // Handle specific YouTube API errors according to documentation
        if (error.response) {
            const { status, data } = error.response;
            
            // Handle quota exceeded error (all keys exhausted)
            if (status === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                return res.status(429).json({
                    error: 'All YouTube API keys have exceeded quota',
                    code: 'QUOTA_EXCEEDED',
                    retryAfter: 24 * 60 * 60
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
        const response = await makeYouTubeRequest(async (youtube) => {
            return youtube.videos.list({
                part: 'snippet,contentDetails,status,statistics',
                id: videoId,
                fields: 'items(id,snippet(title,description,channelTitle,thumbnails/high/url,publishedAt),contentDetails/duration,status(embeddable,privacyStatus),statistics(viewCount,likeCount))'
            });
        }, 'videos.list');

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
            
            // Handle quota exceeded error (all keys exhausted)
            if (status === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                return res.status(429).json({
                    error: 'All YouTube API keys have exceeded quota',
                    code: 'QUOTA_EXCEEDED',
                    retryAfter: 24 * 60 * 60
                });
            }
            
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

// Multi-source music search endpoint
app.get('/api/search-music-multi', async (req, res) => {
    const { query, maxResults = 6, source = 'auto' } = req.query;

    if (!query || query.trim().length === 0) {
        console.error('API Error: Search query is missing or empty');
        return res.status(400).json({
            error: 'Search query is required and cannot be empty',
            code: 'MISSING_QUERY'
        });
    }

    const resultsCount = Math.min(Math.max(parseInt(maxResults) || 6, 1), 50);
    console.log(`Received multi-source search request: query='${query}', maxResults=${resultsCount}, source='${source}'`);

    try {
        let results = [];
        let usedSource = 'none';
        const availableSources = { youtube: true, spotify: false, lastfm: false };

        if (source === 'youtube' || source === 'auto') {
            console.log('Attempting YouTube search...');
            
            // Use the same YouTube search logic from /api/search-music endpoint
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

            const response = await makeYouTubeRequest(async (youtube) => {
                return youtube.search.list(searchParams);
            }, 'search.list');

            // Transform response according to application needs
            results = response.data.items?.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.high?.url || 'https://placehold.co/320x180/AA60C8/FFFFFF?text=No+Image',
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            })) || [];
            
            usedSource = 'youtube';
            console.log(`YouTube search completed. Found ${results.length} results.`);
        } else {
            console.warn(`Unsupported source requested: ${source}. Falling back to YouTube if 'auto' was intended.`);
            // If a specific unsupported source is requested, we might want to return empty or an error
            // For now, if 'auto' was not the source and it's not youtube, we won't search.
            if (source !== 'auto') {
                 return res.status(400).json({
                    error: `Unsupported search source: ${source}. Only 'youtube' or 'auto' are currently supported.`,
                    code: 'UNSUPPORTED_SOURCE'
                });
            }
        }

        res.json({
            results: results,
            source: usedSource,
            totalResults: results.length,
            availableSources: availableSources
        });

    } catch (error) {
        console.error('Error in multi-source search endpoint:', error);
        
        // Handle specific YouTube API errors according to documentation
        if (error.response) {
            const { status, data } = error.response;
            
            // Handle quota exceeded error (all keys exhausted)
            if (status === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                return res.status(429).json({
                    error: 'All YouTube API keys have exceeded quota',
                    code: 'QUOTA_EXCEEDED',
                    retryAfter: 24 * 60 * 60
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
                    const searchResponse = await makeYouTubeRequest(async (youtube) => {
                        return youtube.search.list({
                            part: 'snippet',
                            q: searchQuery,
                            type: 'video',
                            videoCategoryId: '10', // Music category
                            maxResults: 1,
                            order: 'relevance',
                            videoEmbeddable: 'true', // Only embeddable videos
                            fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/high/url))'
                        });
                    }, 'search.list');

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
            
            // Extract mood from the original prompt and generate AI title
            let userMood = 'your mood';
            let playlistTitle = `Mood Playlist - ${new Date().toLocaleDateString()}`;
            let playlistDescription = `Generated playlist based on your mood`;
            
            try {
                // Extract the mood from the prompt with multiple patterns
                let moodMatch = prompt.match(/perfectly match a?\s*["']([^"']+)["']\s*mood/i);
                
                // Fallback patterns for different prompt formats
                if (!moodMatch) {
                    moodMatch = prompt.match(/based on.*["']([^"']+)["']/i) ||
                               prompt.match(/feeling\s+([^"'.!?]+)/i) ||
                               prompt.match(/when.*["']([^"']+)["']/i) ||
                               prompt.match(/["']([^"']{5,50})["'].*mood/i);
                }
                
                // Handle simple mood words (happy, sad, energetic, etc.) from questionnaire
                if (!moodMatch) {
                    const simpleMoods = ['happy', 'sad', 'energetic', 'relaxed', 'angry', 'nostalgic', 'excited', 'calm', 'melancholic', 'joyful'];
                    const simpleMoodPattern = new RegExp(`\\b(${simpleMoods.join('|')})\\b`, 'i');
                    const simpleMoodFound = prompt.match(simpleMoodPattern);
                    if (simpleMoodFound) {
                        moodMatch = [null, simpleMoodFound[1]]; // Format to match expected structure
                    }
                }
                
                if (moodMatch && moodMatch[1]) {
                    userMood = moodMatch[1].trim();
                    console.log('Extracted user mood:', userMood);
                    
                    // Generate creative title using Gemini AI
                    const titlePrompt = `Create a creative, catchy, and poetic playlist title (maximum 5 words) for someone who is "${userMood}". The title should capture the essence of this emotional state and be suitable for a music playlist. Make it evocative and memorable. Just return the title, nothing else.`;
                    
                    const titlePayload = {
                        contents: [{
                            role: "user",
                            parts: [{ text: titlePrompt }]
                        }],
                        generationConfig: {
                            temperature: 0.8,
                            topK: 40,
                            topP: 0.9,
                            maxOutputTokens: 50,
                        }
                    };
                    
                    const titleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(titlePayload)
                    });
                    
                    if (titleResponse.ok) {
                        const titleData = await titleResponse.json();
                        if (titleData.candidates && titleData.candidates[0] && titleData.candidates[0].content) {
                            const generatedTitle = titleData.candidates[0].content.parts[0].text.trim();
                            // Clean up the title (remove quotes if present)
                            playlistTitle = generatedTitle.replace(/['"]/g, '').trim();
                            console.log('Generated AI title:', playlistTitle);
                        }
                    } else {
                        console.warn('Failed to generate AI title, using fallback');
                    }
                    
                    // Generate enhanced description based on mood type
                    if (userMood.length <= 15) {
                        // Simple mood word
                        playlistDescription = `A curated selection for when you're feeling ${userMood}`;
                    } else {
                        // Descriptive mood phrase
                        playlistDescription = `A curated selection for when you're ${userMood}`;
                    }
                } else {
                    console.log('Could not extract mood from prompt, using default title');
                }
            } catch (titleError) {
                console.error('Error generating AI title:', titleError);
                console.log('Using fallback title');
            }

            // Create a properly formatted playlist object
            const playlist = {
                id: Date.now().toString(),
                title: playlistTitle,
                description: playlistDescription,
                songs: songsWithVideoIds,
                createdAt: new Date().toISOString(),
                prompt: userMood // Store the original mood for reference
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
    if (YOUTUBE_API_KEYS.length > 0) {
        console.log('✅ All API keys loaded successfully');
    }
});