// Vercel Edge Middleware — social preview for /event/:slug
// Runs before rewrites. Returns a minimal HTML head for bot crawlers so that
// Telegram, WhatsApp, Facebook, etc. render the actual event banner instead of
// the generic FestNest OG image. All real-user requests pass through unchanged.

const BOT_RE =
  /TelegramBot|WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|Discordbot|Slackbot-LinkExpanding|Googlebot|bingbot|Iframely/i;

const API = 'https://festnest-backend.onrender.com/api/events';
const FALLBACK_IMAGE = 'https://festnest.in/og-image.png';
const SITE = 'https://festnest.in';

// Minimal HTML-entity escaping for attribute values.
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const config = {
  matcher: ['/event/:slug*'],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Non-bot → pass straight through to the SPA rewrite.
  if (!BOT_RE.test(ua)) return;

  const { pathname } = new URL(request.url);
  // pathname is /event/<slug>; strip leading /event/
  const slug = pathname.replace(/^\/event\//, '').split('/')[0];

  if (!slug) return; // malformed URL — fall through

  try {
    const res = await fetch(`${API}/${encodeURIComponent(slug)}`, {
      headers: { 'User-Agent': 'FestNest-OGBot/1.0' },
      // Edge fetch timeout not natively configurable; AbortController keeps
      // slow cold-starts from blocking the response indefinitely.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return; // event not found or backend down → fall through

    const json = await res.json();
    if (!json.success || !json.data?.event) return;

    const ev = json.data.event;
    const title = ev.name || 'FestNest Event';
    const rawDesc =
      ev.about?.trim() ||
      `${ev.category} at ${ev.college}, ${ev.city}`;
    const description = rawDesc.slice(0, 160);
    const image = ev.image?.url || FALLBACK_IMAGE;
    const canonical = `${SITE}/event/${slug}`;

    const html = `<!DOCTYPE html><html><head>
<title>${esc(title)} | FestNest</title>
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="FestNest" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head><body></body></html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    // Any error (network, timeout, parse) → fall through to SPA. Never break
    // real users because of a failed OG fetch.
    return;
  }
}
