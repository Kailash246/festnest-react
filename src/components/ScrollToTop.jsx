import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const FEED_PATHS = new Set(['/', '/home', '/explore']);
const EVENT_RE   = /^\/event\//;

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevRef = useRef(pathname);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = pathname;
    // Feed pages manage their own scroll restoration on back-nav from an event page.
    if (EVENT_RE.test(prev) && FEED_PATHS.has(pathname)) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
