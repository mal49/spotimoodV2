#!/usr/bin/env node

/**
 * Test script for multi-source music search
 * Run with: node test-multi-source.js
 */

const API_BASE_URL = 'http://localhost:3001';

async function testMultiSourceSearch() {
  console.log('🎵 Testing Multi-Source Music Search\n');

  const testQueries = [
    'rock music',
    'jazz classics',
    'pop hits 2024',
    'electronic dance'
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);
    
    try {
      // Test auto source selection
      const response = await fetch(
        `${API_BASE_URL}/api/search-music-multi?query=${encodeURIComponent(query)}&source=auto&maxResults=5`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Found ${data.videos.length} results`);
        console.log(`📡 Source used: ${data.source}`);
        console.log(`📊 Available sources:`, data.availableSources);
        
        if (data.videos.length > 0) {
          const firstResult = data.videos[0];
          console.log(`🎵 First result: ${firstResult.title} by ${firstResult.channelTitle}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.error} (${errorData.code})`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Testing specific sources...');

  // Test YouTube specifically
  try {
    const youtubeResponse = await fetch(
      `${API_BASE_URL}/api/search-music-multi?query=rock&source=youtube&maxResults=3`
    );
    if (youtubeResponse.ok) {
      const data = await youtubeResponse.json();
      console.log(`✅ YouTube search: ${data.videos.length} results`);
    }
  } catch (error) {
    console.log(`❌ YouTube test failed: ${error.message}`);
  }

  // Test Spotify specifically
  try {
    const spotifyResponse = await fetch(
      `${API_BASE_URL}/api/search-music-multi?query=rock&source=spotify&maxResults=3`
    );
    if (spotifyResponse.ok) {
      const data = await spotifyResponse.json();
      console.log(`✅ Spotify search: ${data.videos.length} results`);
    }
  } catch (error) {
    console.log(`❌ Spotify test failed: ${error.message}`);
  }

  // Test Last.fm specifically
  try {
    const lastfmResponse = await fetch(
      `${API_BASE_URL}/api/search-music-multi?query=rock&source=lastfm&maxResults=3`
    );
    if (lastfmResponse.ok) {
      const data = await lastfmResponse.json();
      console.log(`✅ Last.fm search: ${data.videos.length} results`);
    }
  } catch (error) {
    console.log(`❌ Last.fm test failed: ${error.message}`);
  }

  console.log('\n✨ Multi-source test completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search-music-multi?query=test&maxResults=1`);
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Multi-Source Music Search Test\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server not running. Please start the server first:');
    console.log('   cd server && npm start');
    process.exit(1);
  }

  console.log('✅ Server is running, starting tests...\n');
  await testMultiSourceSearch();
}

main().catch(console.error); 