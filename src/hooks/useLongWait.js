import { useState, useEffect } from 'react';

/**
 * Hook that sets a flag if loading exceeds `delayMs` (default 5000ms).
 * Intended for honest cold-start messaging on Render free tier.
 * Immediately clears as soon as `loading` is false.
 */
export function useLongWait(loading, delayMs = 5000) {
  const [isLongWait, setIsLongWait] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsLongWait(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLongWait(true);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [loading, delayMs]);

  return isLongWait;
}

export default useLongWait;

