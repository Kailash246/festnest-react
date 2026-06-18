// src/utils/sanitize.js — DOMPurify wrapper for XSS protection
import DOMPurify from 'dompurify';

// Strip all HTML tags and return plain text (defense-in-depth; React already escapes by default)
export function sanitizeText(dirty) {
  if (!dirty && dirty !== 0) return dirty;
  return DOMPurify.sanitize(String(dirty), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Allow a safe subset of HTML for rich-text fields (safe for dangerouslySetInnerHTML)
export function sanitizeHtml(dirty) {
  if (!dirty) return dirty;
  return DOMPurify.sanitize(String(dirty), {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS:  ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR:  ['onerror', 'onclick', 'onload', 'onmouseover', 'style'],
  });
}
