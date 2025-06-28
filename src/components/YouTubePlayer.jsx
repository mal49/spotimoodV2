import React, { useEffect, useRef, useState } from 'react';

const YouTubePlayer = ({ videoId, onReady, onStateChange }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    // Check if the API is already loaded
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    // Load the YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      console.error('Failed to load YouTube API script');
      setHasError(true);
    };
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize the player when the API is ready
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
      setHasError(false);
    };

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying YouTube player:', error);
        }
      }
    };
  }, []);

  const createPlayer = () => {
    if (!isApiReady || !videoId || !containerRef.current || hasError) return;

    // Destroy existing player before creating new one
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying existing player:', error);
      }
    }

    setIsPlayerReady(false);

    // Initialize the player with better error handling
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
          origin: window.location.origin,
          // Use youtube-nocookie to reduce CORS issues
          host: 'https://www.youtube-nocookie.com',
          // Additional parameters for better compatibility
          iv_load_policy: 3,
          cc_load_policy: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            setHasError(false);
            retryCountRef.current = 0;
            if (onReady) {
              try {
                onReady(event.target);
              } catch (error) {
                console.error('Error in onReady callback:', error);
              }
            }
          },
          onStateChange: (event) => {
            if (onStateChange) {
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
            
            // Retry logic for recoverable errors
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current += 1;
              console.log(`Retrying player creation (attempt ${retryCountRef.current}/${maxRetries})`);
              setTimeout(() => {
                createPlayer();
              }, 1000 * retryCountRef.current); // Exponential backoff
            } else {
              setHasError(true);
              console.error('Max retries reached, player failed to initialize');
            }
          },
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setIsPlayerReady(false);
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          createPlayer();
        }, 1000 * retryCountRef.current);
      } else {
        setHasError(true);
      }
    }
  };

  useEffect(() => {
    createPlayer();

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying player in cleanup:', error);
        }
      }
    };
  }, [isApiReady, videoId, onReady, onStateChange]);

  // Reset error state when videoId changes
  useEffect(() => {
    if (hasError) {
      setHasError(false);
      retryCountRef.current = 0;
    }
  }, [videoId]);

  return (
    <div className="youtube-player-container">
      <div ref={containerRef} className="hidden" />
      {hasError && (
        <div className="hidden">
          {/* Error state - could add user-visible error handling here if needed */}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer; 