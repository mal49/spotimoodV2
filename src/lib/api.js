import config from './config.js';

// YouTube Music Search
export const searchYouTubeMusic = async (query, maxResults = 6) => {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/api/search-music?query=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.videos || [];
    }
    
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
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
