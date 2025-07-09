// Mobile utility functions for better mobile music player experience

/**
 * Detect if the current device is mobile
 */
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isSmallScreen && isTouchDevice);
};

/**
 * Check if the device is iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if the device is Android
 */
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Mobile-specific user interaction manager
 */
class MobileUserInteractionManager {
  constructor() {
    this.hasUserInteracted = false;
    this.listeners = new Set();
    this.interactionEvents = ['touchstart', 'touchend', 'click', 'keydown'];
    this.boundHandler = this.handleUserInteraction.bind(this);
    
    this.init();
  }

  init() {
    // Only track on mobile devices
    if (!isMobileDevice()) {
      this.hasUserInteracted = true;
      return;
    }

    this.interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, this.boundHandler, { 
        once: true, 
        passive: true,
        capture: true 
      });
    });

    // iOS-specific: Listen for device orientation changes as user interaction
    if (isIOS()) {
      window.addEventListener('deviceorientation', this.boundHandler, { once: true });
    }
  }

  handleUserInteraction(event) {
    console.log('Mobile user interaction detected:', event.type);
    this.hasUserInteracted = true;
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in user interaction callback:', error);
      }
    });

    // Clean up remaining event listeners
    this.cleanup();
  }

  cleanup() {
    this.interactionEvents.forEach(eventType => {
      document.removeEventListener(eventType, this.boundHandler, { capture: true });
    });
    
    if (isIOS()) {
      window.removeEventListener('deviceorientation', this.boundHandler);
    }
  }

  /**
   * Add a callback to be executed when user interaction is detected
   */
  onUserInteraction(callback) {
    if (this.hasUserInteracted) {
      // If user has already interacted, call immediately
      callback();
    } else {
      this.listeners.add(callback);
    }

    // Return a cleanup function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Check if user has interacted
   */
  getHasUserInteracted() {
    return this.hasUserInteracted;
  }

  /**
   * Manually mark user as interacted (for testing or edge cases)
   */
  markUserInteracted() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      this.listeners.forEach(callback => callback());
      this.cleanup();
    }
  }
}

// Singleton instance
export const userInteractionManager = new MobileUserInteractionManager();

/**
 * Prepare audio context for mobile playback
 * This should be called after user interaction on mobile devices
 */
export const prepareAudioContextForMobile = () => {
  return new Promise((resolve) => {
    if (!isMobileDevice()) {
      resolve();
      return;
    }

    const userInteractionCallback = () => {
      // Create a silent audio context to unlock audio on mobile
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('Audio context resumed for mobile');
            resolve();
          }).catch((error) => {
            console.warn('Failed to resume audio context:', error);
            resolve(); // Continue anyway
          });
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Failed to create audio context:', error);
        resolve(); // Continue anyway
      }
    };

    if (userInteractionManager.getHasUserInteracted()) {
      userInteractionCallback();
    } else {
      const cleanup = userInteractionManager.onUserInteraction(userInteractionCallback);
      // Cleanup after 10 seconds if no interaction
      setTimeout(() => {
        cleanup();
        resolve();
      }, 10000);
    }
  });
};

/**
 * Mobile-friendly seek time formatter
 */
export const formatTimeForMobile = (seconds, showHours = false) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Prevent mobile browser zoom on double tap
 */
export const preventMobileZoom = (element) => {
  if (!element || !isMobileDevice()) return;

  let lastTouchEnd = 0;
  
  element.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
};

/**
 * Vibration feedback for mobile interactions (if supported)
 */
export const provideTactileFeedback = (pattern = [50]) => {
  if (navigator.vibrate && isMobileDevice()) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Ignore vibration errors
    }
  }
};

export default {
  isMobileDevice,
  isIOS,
  isAndroid,
  userInteractionManager,
  prepareAudioContextForMobile,
  formatTimeForMobile,
  preventMobileZoom,
  provideTactileFeedback,
}; 