import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling data at regular intervals
 * 
 * @param {Function} callback - Function to call on each poll
 * @param {number} interval - Polling interval in milliseconds (default: 5000ms = 5 seconds)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 */
export function usePolling(callback, interval = 5000, enabled = true) {
  const savedCallback = useRef();
  const timeoutId = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    function tick() {
      savedCallback.current();
    }

    function scheduleTick() {
      timeoutId.current = setTimeout(() => {
        tick();
        scheduleTick();
      }, interval);
    }

    // Run immediately on mount
    tick();
    
    // Then schedule subsequent polls
    scheduleTick();

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [interval, enabled]);
}

export default usePolling;
