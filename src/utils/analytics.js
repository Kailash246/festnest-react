const GA_MEASUREMENT_ID = 'G-69EVCQM4ET';

/**
 * Send a page_view event to GA4.
 * Called on every React Router navigation so the SPA behaves like a multi-page site.
 * Safe to call when gtag hasn't loaded yet — the no-op guard prevents errors.
 */
export function trackPageView(path) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    send_to: GA_MEASUREMENT_ID,
  });
}
