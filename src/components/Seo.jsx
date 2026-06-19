// src/components/Seo.jsx
// Per-page <head> manager. Sets title (template "{Page} | FestNest"),
// meta description, canonical, Open Graph / Twitter tags, and optional
// JSON-LD structured data. Static fallbacks live in index.html for crawlers
// that don't execute JS; this layer personalises per route for those that do.
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const SITE_URL = 'https://festnest.in';
export const DEFAULT_DESCRIPTION =
  'Discover and register for hackathons, cultural fests, workshops, and competitions at colleges across India — all in one place.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TITLE = 'FestNest — Discover College Events in India';

const toAbsolute = (path) =>
  !path ? null : path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

export default function Seo({
  title,                         // page name → "{title} | FestNest"
  rawTitle,                      // full title, skips the template
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  canonical,                     // path or absolute URL; defaults to current pathname
  type = 'website',
  jsonLd,                        // object or array of JSON-LD objects
  noindex = false,
}) {
  const { pathname } = useLocation();

  const fullTitle = rawTitle || (title ? `${title} | FestNest` : DEFAULT_TITLE);
  const canonicalUrl = toAbsolute(canonical) || `${SITE_URL}${pathname}`;
  const imageUrl = toAbsolute(image) || DEFAULT_OG_IMAGE;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="FestNest" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
