# Blog System — File Placement Guide

## Drop these files into your frontend repo

```
src/pages/blog/
  _blogData.js           ← post registry (metadata)
  _BlogLayout.jsx        ← shared layout shell
  BlogHub.jsx            ← /blog listing page

src/pages/blog/posts/
  HowToWinHackathon.jsx  ← /blog/how-to-win-a-hackathon
  HackathonStrategy.jsx  ← /blog/hackathon-strategy-guide
  WinningPitch.jsx       ← /blog/how-to-win-startup-pitch-competition
  TopColleges.jsx        ← /blog/best-colleges-for-inter-college-competitions-india
  BestCollegeEvents.jsx  ← /blog/best-college-events-india-2025
```

---

## Add these routes to App.jsx

```jsx
// At top — add these imports
import BlogHub from './pages/blog/BlogHub';
import HowToWinHackathon from './pages/blog/posts/HowToWinHackathon';
import HackathonStrategy from './pages/blog/posts/HackathonStrategy';
import WinningPitch from './pages/blog/posts/WinningPitch';
import TopColleges from './pages/blog/posts/TopColleges';
import BestCollegeEvents from './pages/blog/posts/BestCollegeEvents';

// Inside your <Routes> block — add these routes
<Route path="/blog" element={<BlogHub />} />
<Route path="/blog/how-to-win-a-hackathon" element={<HowToWinHackathon />} />
<Route path="/blog/hackathon-strategy-guide" element={<HackathonStrategy />} />
<Route path="/blog/how-to-win-startup-pitch-competition" element={<WinningPitch />} />
<Route path="/blog/best-colleges-for-inter-college-competitions-india" element={<TopColleges />} />
<Route path="/blog/best-college-events-india-2025" element={<BestCollegeEvents />} />
```

---

## Add "Blog" to your main nav

In your Navbar/Header component, add a link:
```jsx
<Link to="/blog">Blog</Link>
```

---

## Add blog posts to your sitemap backend

In `festnest-backend/routes/sitemap.js`, add these static blog URLs
to the static routes array alongside /terms, /privacy, /explore etc:

```js
const staticRoutes = [
  '/',
  '/explore',
  '/terms',
  '/privacy',
  '/blog',
  '/blog/how-to-win-a-hackathon',
  '/blog/hackathon-strategy-guide',
  '/blog/how-to-win-startup-pitch-competition',
  '/blog/best-colleges-for-inter-college-competitions-india',
  '/blog/best-college-events-india-2025',
];
```

---

## Add inline CSS for prose-custom class

In your global CSS (index.css or App.css), add:

```css
.prose-custom p {
  color: #4B5563;
  line-height: 1.75;
  margin-bottom: 1rem;
}

.prose-custom h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

.prose-custom h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose-custom ul {
  margin-bottom: 1rem;
}

.prose-custom strong {
  color: #1F2937;
  font-weight: 600;
}
```

---

## SEO summary — new indexable URLs added

| URL | Target keywords |
|-----|----------------|
| /blog | blog, hackathon tips, college events guide |
| /blog/how-to-win-a-hackathon | how to win hackathon, hackathon tips India |
| /blog/hackathon-strategy-guide | hackathon strategy, 24 hour hackathon tips |
| /blog/how-to-win-startup-pitch-competition | startup pitch competition, business competition tips India |
| /blog/best-colleges-for-inter-college-competitions-india | best colleges inter college competitions India |
| /blog/best-college-events-india-2025 | best college events India 2025, top college fests |

Each post has unique h1, unique meta description, canonical link,
proper heading hierarchy (h1 > h2 > h3), keyword-dense copy,
internal links to /category/ and /explore pages, and a Seo component.
