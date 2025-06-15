const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();
// const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
}));

app.use(express.json());

//API key retrieval
//Securely loaded from the .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Initialize YouTube API
const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
});

// Search for music videos with pagination
app.get('/api/search-music', async (req, res) => {
    const { query, pageToken } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            q: query,
            type: ['video'],
            videoCategoryId: '10', // Music category
            maxResults: 10,
            pageToken: pageToken || undefined
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle
        }));

        res.json({
            videos,
            nextPageToken: response.data.nextPageToken,
            prevPageToken: response.data.prevPageToken,
            totalResults: response.data.pageInfo.totalResults
        });
    } catch (error) {
        console.error('YouTube API Error:', error);
        res.status(500).json({ 
            error: 'Error searching YouTube',
            details: error.message
        });
    }
});

// Get video details
app.get('/api/video/:videoId', async (req, res) => {
    const { videoId } = req.params;

    try {
        const response = await youtube.videos.list({
            part: ['snippet', 'contentDetails', 'status'],
            id: [videoId]
        });

        if (!response.data.items.length) {
            console.log(`Video not found: ${videoId}`);
            return res.status(404).json({ error: 'Video not found' });
        }

        const video = response.data.items[0];
        
        // Check if video is playable
        if (video.status.embeddable === false) {
            console.log(`Video ${videoId} is not embeddable`);
            return res.status(403).json({ 
                error: 'Video cannot be embedded',
                details: 'This video is not available for embedding'
            });
        }

        // Check if video is restricted
        if (video.status.privacyStatus !== 'public') {
            console.log(`Video ${videoId} is not public`);
            return res.status(403).json({ 
                error: 'Video is not public',
                details: 'This video is not publicly available'
            });
        }

        console.log(`Successfully fetched video details for: ${videoId}`);
        
        res.json({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            duration: video.contentDetails.duration,
            channelTitle: video.snippet.channelTitle,
            isEmbeddable: video.status.embeddable,
            privacyStatus: video.status.privacyStatus
        });
    } catch (error) {
        console.error('YouTube API Error:', error);
        
        // Check for specific YouTube API errors
        if (error.response) {
            console.error('YouTube API Response:', error.response.data);
            return res.status(error.response.status).json({ 
                error: 'YouTube API Error',
                details: error.response.data
            });
        }
        
        res.status(500).json({ 
            error: 'Error fetching video details',
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
            
            // Create a properly formatted playlist object
            const playlist = {
                id: Date.now().toString(),
                title: `Mood Playlist - ${new Date().toLocaleDateString()}`,
                description: `Generated playlist based on your mood`,
                songs: songs.map(song => ({
                    id: song.videoId || `song_${Math.random().toString(36).substr(2, 9)}`,
                    title: song.title,
                    artist: song.artist,
                    album: "Mood Playlist",
                    duration: "N/A",
                    thumbnail: song.thumbnail || 'https://placehold.co/60x60/AA60C8/FFFFFF?text=Art'
                })),
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
});