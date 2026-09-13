// src/context/ActivityTrackerContext.jsx
import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from './AppContext';
import { activity, setSessionId, getSessionId } from '../services/api';

const ActivityTrackerContext = createContext(null);

export function ActivityTrackerProvider({ children }) {
  const { isLoggedIn } = useApp();
  const location = useLocation();
  const [sessionId, setSessionIdState] = useState(() => getSessionId());

  const sessionStartedRef = useRef(false);
  const lastPageRef = useRef(null);
  const currentPathRef = useRef(location.pathname + location.search);

  // Keep current route ref synced for steady heartbeat pings
  useEffect(() => {
    currentPathRef.current = location.pathname + location.search;
  }, [location.pathname, location.search]);

  // 1. Session start on login or initial app load (when logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      if (sessionStartedRef.current) {
        sessionStartedRef.current = false;
        const currentSid = getSessionId();
        if (currentSid) {
          activity.endSession({ sessionId: currentSid }).catch(() => {});
        }
        setSessionId(null);
        setSessionIdState(null);
        lastPageRef.current = null;
      }
      return;
    }

    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const currentPath = location.pathname + location.search;
    const initialSid = getSessionId();

    activity.startSession({
      sessionId: initialSid || undefined,
      currentPage: currentPath,
      title: typeof document !== 'undefined' ? document.title : '',
    })
      .then((res) => {
        const sid = res?.data?.sessionId || res?.data?.session?.sessionId;
        if (sid) {
          setSessionId(sid);
          setSessionIdState(sid);
        }
      })
      .catch((err) => {
        sessionStartedRef.current = false; // Reset so retry can succeed on next navigation
        console.debug('[ActivityTracker] Failed to start session:', err?.message);
      });
  }, [isLoggedIn, location.pathname, location.search]);

  // 2. Heartbeat every 30s, only while document.visibilityState === 'visible'
  useEffect(() => {
    if (!isLoggedIn) return;

    const heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      activity.heartbeat({
        currentPage: currentPathRef.current,
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [isLoggedIn]);

  // 3. Page view on every React Router location change, calculating durationOnPage on previous page
  useEffect(() => {
    if (!isLoggedIn) {
      lastPageRef.current = {
        path: location.pathname + location.search,
        title: typeof document !== 'undefined' ? document.title : '',
        timestamp: Date.now(),
      };
      return;
    }

    const currentPath = location.pathname + location.search;
    const now = Date.now();
    const prev = lastPageRef.current;

    let durationOnPage = 0;
    if (prev && prev.path !== currentPath) {
      durationOnPage = Math.max(0, Math.round((now - prev.timestamp) / 1000));
    }

    activity.pageView({
      path: currentPath,
      title: typeof document !== 'undefined' ? document.title : '',
      durationOnPage,
      metadata: {
        previousPath: prev?.path || null,
      },
    }).catch((err) => {
      console.debug('[ActivityTracker] Page view error:', err?.message);
    });

    lastPageRef.current = {
      path: currentPath,
      title: typeof document !== 'undefined' ? document.title : '',
      timestamp: now,
    };
  }, [isLoggedIn, location.pathname, location.search]);

  // 4. On beforeunload or pagehide, flush beacon to end session and send final page duration
  useEffect(() => {
    if (!isLoggedIn) return;

    let flushed = false;
    const handleFlush = () => {
      if (flushed) return;
      flushed = true;

      const now = Date.now();
      const prev = lastPageRef.current;
      const currentPath = currentPathRef.current;
      const durationOnPage = prev ? Math.max(0, Math.round((now - prev.timestamp) / 1000)) : 0;

      activity.flushBeacon('/activity/session/end', {
        sessionId: getSessionId(),
        durationOnPage,
        currentPage: currentPath,
      });
    };

    window.addEventListener('beforeunload', handleFlush);
    window.addEventListener('pagehide', handleFlush);

    return () => {
      window.removeEventListener('beforeunload', handleFlush);
      window.removeEventListener('pagehide', handleFlush);
    };
  }, [isLoggedIn]);

  // 5. Expose trackAction(action, metadata) for frontend actions
  const trackAction = useCallback((action, metadata = {}) => {
    if (!isLoggedIn) return Promise.resolve();

    return activity.track({
      action,
      type: metadata?.type || 'action',
      page: {
        path: currentPathRef.current,
        title: typeof document !== 'undefined' ? document.title : '',
      },
      metadata,
    }).catch((err) => {
      console.debug('[ActivityTracker] trackAction error:', err?.message);
    });
  }, [isLoggedIn]);

  const contextValue = {
    sessionId,
    trackAction,
    isTracking: isLoggedIn,
  };

  return (
    <ActivityTrackerContext.Provider value={contextValue}>
      {children}
    </ActivityTrackerContext.Provider>
  );
}

export const useActivityTracker = () => {
  const ctx = useContext(ActivityTrackerContext);
  if (!ctx) {
    return {
      sessionId: null,
      trackAction: () => Promise.resolve(),
      isTracking: false,
    };
  }
  return ctx;
};

export default ActivityTrackerContext;
