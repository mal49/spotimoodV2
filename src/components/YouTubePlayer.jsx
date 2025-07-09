import React, { useEffect, useRef, useState, useCallback } from 'react';
import config from '../lib/config';

const YouTubePlayer = ({ videoId, onReady, onStateChange }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const loadTimeoutRef = useRef(null);

  // Check if YouTube API is already loaded
  const checkApiReady = useCallback(() => {
    return !!(window.YT && window.YT.Player && typeof window.YT.Player === 'function');
  }, []);

  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Check if the API is already loaded
    if (checkApiReady()) {
      setIsApiReady(true);
      setHasError(false);
      return;
    }

    // Prevent loading multiple scripts
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      // Script is already loading, wait for it
      const checkInterval = setInterval(() => {
        if (checkApiReady()) {
          clearInterval(checkInterval);
          setIsApiReady(true);
          setHasError(false);
        }
      }, 100);

      // Timeout after 10 seconds
      loadTimeoutRef.current = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('YouTube API failed to load within timeout period');
        setHasError(true);
        setErrorMessage('YouTube API loading timeout');
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    }

    // Load the YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = config.youtube.iframeApiUrl;
    tag.async = true;
    tag.onerror = () => {
      console.error('Failed to load YouTube API script');
      setHasError(true);
      setErrorMessage('Failed to load YouTube API');
    };
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    // Global callback for when API is ready
    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
      setHasError(false);
      setErrorMessage('');
      
      // Call original callback if it existed
      if (originalCallback && typeof originalCallback === 'function') {
        originalCallback();
      }
    };

    // Timeout fallback
    loadTimeoutRef.current = setTimeout(() => {
      if (!checkApiReady()) {
        console.error('YouTube API failed to load within timeout period');
        setHasError(true);
        setErrorMessage('YouTube API loading timeout');
      }
    }, 10000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      // Clean up player on unmount
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying YouTube player on unmount:', error);
        }
      }
    };
  }, [checkApiReady]);

  const createPlayer = useCallback(() => {
    if (!isApiReady || !videoId || !containerRef.current || hasError) return;

    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error('Invalid YouTube video ID format:', videoId);
      setHasError(true);
      setErrorMessage('Invalid video ID format');
      return;
    }

    // Destroy existing player before creating new one
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying existing player:', error);
      }
      playerRef.current = null;
    }

    setIsPlayerReady(false);
    setHasError(false);
    setErrorMessage('');

    // Initialize the player with improved configuration
    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          showinfo: 0,
          playsinline: 1,
          origin: config.youtube.embedOrigin,
        },
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            setHasError(false);
            setErrorMessage('');
            retryCountRef.current = 0;
            
            if (onReady && typeof onReady === 'function') {
              try {
                onReady(event.target);
              } catch (error) {
                console.error('Error in onReady callback:', error);
              }
            }
          },
          onStateChange: (event) => {
            if (onStateChange && typeof onStateChange === 'function') {
              try {
                onStateChange(event);
              } catch (error) {
                console.error('Error in onStateChange callback:', error);
              }
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event);
            setIsPlayerReady(false);
            
            // Handle specific error types according to YouTube API documentation
            const errorCode = event.data;
            let errorMsg = 'Unknown error';
            let shouldRetry = false;

            switch (errorCode) {
              case 2:
                errorMsg = 'Invalid video ID or video contains invalid parameters';
                shouldRetry = false;
                break;
              case 5:
                errorMsg = 'HTML5 player error - video cannot be played';
                shouldRetry = true;
                break;
              case 100:
                errorMsg = 'Video not found or has been removed';
                shouldRetry = false;
                break;
              case 101:
              case 150:
                errorMsg = 'Video owner does not allow embedding';
                shouldRetry = false;
                break;
              default:
                errorMsg = `YouTube player error (code: ${errorCode})`;
                shouldRetry = true;
            }

            console.error('YouTube Error Details:', errorMsg);
            setErrorMessage(errorMsg);
            
            // Retry logic for recoverable errors
            if (shouldRetry && retryCountRef.current < maxRetries) {
              retryCountRef.current += 1;
              console.log(`Retrying player creation (attempt ${retryCountRef.current}/${maxRetries})`);
              
              // Exponential backoff: 1s, 2s, 4s
              const retryDelay = Math.pow(2, retryCountRef.current - 1) * 1000;
              setTimeout(() => {
                createPlayer();
              }, retryDelay);
            } else {
              setHasError(true);
              console.error('Max retries reached or unrecoverable error, player failed to initialize');
            }
          },
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setIsPlayerReady(false);
      setHasError(true);
      setErrorMessage('Failed to create player instance');
      
      // Retry logic for player creation errors
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const retryDelay = Math.pow(2, retryCountRef.current - 1) * 1000;
        setTimeout(() => {
          createPlayer();
        }, retryDelay);
      }
    }
  }, [isApiReady, videoId, hasError, onReady, onStateChange]);

  // Create player when API is ready and video ID changes
  useEffect(() => {
    if (isApiReady && videoId) {
      createPlayer();
    }
  }, [isApiReady, videoId, createPlayer]);

  // Render player container and error message if any
  return (
    <div>
      <div ref={containerRef} />
      {hasError && errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </div>
  );
};

export default YouTubePlayer; 