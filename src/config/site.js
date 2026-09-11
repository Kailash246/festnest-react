// src/config/site.js
// Centralized public site URL configuration and sanitization helpers.
// Ensures user-facing links, QR codes, and sharing never use Vercel or Render deployment URLs.

export function getPublicSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const hostname = window.location.hostname || '';
    // Allow localhost/127.0.0.1 in local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return window.location.origin;
    }
    // Prevent temporary preview/deployment domains from leaking into share URLs
    if (hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com')) {
      return 'https://festnest.in';
    }
    return window.location.origin;
  }
  return import.meta.env.VITE_PUBLIC_SITE_URL || 'https://festnest.in';
}

export const PUBLIC_SITE_URL = getPublicSiteUrl();

/**
 * Builds a clean, canonical referral URL for a given ambassador code.
 * @param {string} referralCode - The ambassador's unique code.
 * @param {string} [targetPath=''] - Optional landing path, e.g. '/host' or '/explore'.
 * @returns {string} Fully qualified canonical URL.
 */
export function getReferralUrl(referralCode, targetPath = '') {
  if (!referralCode) return getPublicSiteUrl();
  const base = getPublicSiteUrl().replace(/\/+$/, '');
  const cleanPath = targetPath ? `/${targetPath.replace(/^\/+/, '')}` : '';
  return `${base}${cleanPath}?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * Sanitizes any raw URL returned by the backend to ensure it never points to a deployment domain.
 * @param {string} rawUrl - URL that may contain vercel.app or onrender.com.
 * @param {string} referralCode - Fallback referral code.
 * @returns {string} Clean URL.
 */
export function sanitizeShareUrl(rawUrl, referralCode = '') {
  if (!rawUrl) return getReferralUrl(referralCode);
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname.endsWith('.onrender.com')) {
      const base = getPublicSiteUrl().replace(/\/+$/, '');
      return `${base}${parsed.pathname === '/' ? '' : parsed.pathname}${parsed.search}`;
    }
    return rawUrl;
  } catch {
    return getReferralUrl(referralCode);
  }
}
