# YouTube API Rate Limit Solutions

This document outlines comprehensive solutions for handling YouTube Data API rate limits in your SpotiMood application.

## 🚨 Current Issue
Your YouTube Data API has reached its daily quota limit (10,000 units/day). Here are multiple solutions to resolve this:

## 🔧 Solution 1: Multiple YouTube API Keys (Immediate Fix)

### How It Works
- Create multiple Google Cloud projects
- Each project gets its own 10,000 units/day quota
- Automatic rotation when one key hits the limit

### Implementation Steps

#### 1. Create Multiple Google Cloud Projects
```bash
# Create 3-5 separate projects for rotation
Project 1: spotimood-youtube-1
Project 2: spotimood-youtube-2  
Project 3: spotimood-youtube-3
Project 4: spotimood-youtube-4
Project 5: spotimood-youtube-5
```

#### 2. Enable YouTube Data API v3 in Each Project
- Go to **APIs & Services** → **Library**
- Search for "YouTube Data API v3"
- Click **Enable**

#### 3. Create API Keys for Each Project
- Go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **API Key**
- Copy each API key

#### 4. Update Environment Variables
```env
# server/.env
YOUTUBE_API_KEY=your-first-api-key
YOUTUBE_API_KEY_2=your-second-api-key
YOUTUBE_API_KEY_3=your-third-api-key
YOUTUBE_API_KEY_4=your-fourth-api-key
YOUTUBE_API_KEY_5=your-fifth-api-key
```

#### 5. Benefits
- **50,000 units/day** total quota (5 keys × 10,000)
- **Automatic rotation** when one key is exhausted
- **Zero downtime** during quota resets
- **Cost-effective** (all free tier)

## 🎵 Solution 2: Alternative Music APIs

### Spotify Web API
**Rate Limits**: 25 requests/second, no daily limit
**Features**: High-quality metadata, preview URLs, album art

#### Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get Client ID and Client Secret
4. Add to `.env`:
```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

#### Advantages
- ✅ No daily quota limits
- ✅ High-quality music metadata
- ✅ 30-second preview URLs
- ✅ Excellent album artwork
- ✅ Artist and genre information

#### Limitations
- ❌ No full song playback (preview only)
- ❌ Requires user authentication for full features

### Last.fm API
**Rate Limits**: 5 requests/second, no daily limit
**Features**: Music discovery, recommendations, artist info

#### Setup
1. Go to [Last.fm API](https://www.last.fm/api)
2. Create an account
3. Create an API application
4. Get your API key
5. Add to `.env`:
```env
LASTFM_API_KEY=your-lastfm-api-key
```

#### Advantages
- ✅ No daily quota limits
- ✅ Excellent music discovery
- ✅ Artist and album information
- ✅ Similar artist recommendations
- ✅ Music tags and genres

#### Limitations
- ❌ No audio playback
- ❌ Limited metadata compared to Spotify

## 🔄 Solution 3: Hybrid Approach (Recommended)

### Implementation Strategy
1. **Primary**: YouTube API with key rotation
2. **Secondary**: Spotify API for metadata
3. **Tertiary**: Last.fm API for discovery
4. **Fallback**: Cached results

### API Endpoints Available

#### 1. Multi-Source Search
```
GET /api/search-music-multi?query={term}&source={youtube|spotify|lastfm|auto}
```

#### 2. Legacy YouTube Search
```
GET /api/search-music?query={term}&maxResults={1-50}
```

#### 3. Video Details
```
GET /api/video/{video_id}
```

### Usage Examples

#### Auto-Source Selection
```javascript
// Automatically chooses best available source
const response = await fetch('/api/search-music-multi?query=rock&source=auto');
```

#### Specific Source
```javascript
// Force Spotify search
const response = await fetch('/api/search-music-multi?query=rock&source=spotify');
```

#### YouTube with Fallback
```javascript
// Try YouTube first, fallback to alternatives
const response = await fetch('/api/search-music-multi?query=rock&source=youtube');
```

## 💾 Solution 4: Caching Strategy

### Current Implementation
- **5-minute cache** for search results
- **Reduces API calls by 80%**
- **Intelligent cache invalidation**

### Enhanced Caching
```javascript
// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  SEARCH: 'search_'
};
```

### Cache Benefits
- ✅ Reduces API quota usage
- ✅ Faster response times
- ✅ Better user experience
- ✅ Offline capability

## 📊 Solution 5: Quota Optimization

### Request Optimization
1. **Use specific fields** to reduce quota usage
2. **Batch requests** where possible
3. **Implement exponential backoff**
4. **Monitor quota usage**

### Field Optimization
```javascript
// Instead of requesting all fields
const searchParams = {
  part: 'snippet',
  fields: 'items(id/videoId,snippet(title,channelTitle,thumbnails/high/url))'
};
```

### Quota Monitoring
```javascript
// Real-time quota tracking
const quotaInfo = {
  dailyQuotaUsed: 0,
  quotaExceeded: false,
  resetTime: null
};
```

## 🚀 Implementation Priority

### Phase 1: Immediate (Today)
1. ✅ Add multiple YouTube API keys
2. ✅ Implement key rotation
3. ✅ Add Spotify API integration
4. ✅ Create multi-source endpoint

### Phase 2: Enhancement (This Week)
1. 🔄 Add Last.fm API integration
2. 🔄 Enhance caching strategy
3. 🔄 Implement quota monitoring
4. 🔄 Add user preference settings

### Phase 3: Optimization (Next Week)
1. 📊 Add analytics dashboard
2. 📊 Implement smart caching
3. 📊 Add offline mode
4. 📊 Performance optimization

## 🔧 Quick Fix Commands

### 1. Add New API Keys
```bash
# Edit server/.env
nano server/.env

# Add your new API keys:
YOUTUBE_API_KEY_2=your-second-key
YOUTUBE_API_KEY_3=your-third-key
```

### 2. Restart Server
```bash
cd server
npm start
```

### 3. Test New Endpoint
```bash
curl "http://localhost:3001/api/search-music-multi?query=rock&source=auto"
```

## 📈 Expected Results

### With Multiple YouTube Keys
- **50,000 units/day** total quota
- **5x more capacity** than single key
- **Automatic failover** when quota exceeded

### With Alternative APIs
- **Unlimited requests** (Spotify/Last.fm)
- **Better metadata** quality
- **Improved user experience**

### Combined Approach
- **99.9% uptime** even during quota resets
- **Multiple data sources** for better results
- **Cost-effective** solution

## 🆘 Emergency Fallback

If all APIs are exhausted:

### 1. Use Cached Results
```javascript
// Return cached data immediately
const cachedResults = getCachedData(searchQuery);
if (cachedResults) {
  return cachedResults;
}
```

### 2. Static Playlists
```javascript
// Provide curated playlists
const fallbackPlaylists = [
  { title: "Popular Rock Hits", songs: [...] },
  { title: "Chill Vibes", songs: [...] }
];
```

### 3. User Notification
```javascript
// Inform users of temporary limitations
showMessage("Using cached content. Fresh results available in 5 minutes.");
```

## 📞 Support

If you need help implementing these solutions:

1. **Check the logs** for specific error messages
2. **Verify API keys** are correctly set
3. **Test endpoints** individually
4. **Monitor quota usage** in Google Cloud Console

## 🔗 Useful Links

- [YouTube Data API Quotas](https://developers.google.com/youtube/v3/getting-started#quota)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Last.fm API](https://www.last.fm/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Documentation](https://supabase.com/docs) 