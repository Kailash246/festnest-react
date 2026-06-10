# FestNest — React Frontend

> Vite + React 18 + Tailwind CSS + Framer Motion + React Router v6
> ✓ builds in production with zero errors

---

## Quick Start

```bash
unzip FestNest-React.zip
cd festnest-react
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build → dist/
```

> Always use `npm run dev` or Live Server — never open `index.html` as `file://`

---

## Project Structure

```
festnest-react/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js          ← design tokens (colors, fonts, spacing, shadows)
├── postcss.config.js
├── README.md
├── SUPPORT_README.md
└── src/
    ├── main.jsx
    ├── App.jsx                 ← root layout + 12 routes
    ├── index.css               ← global CSS, feed-grid breakpoints, resets
    ├── data/events.js          ← all event data + categories (edit to add events)
    ├── context/AppContext.jsx  ← global state: saved, auth, toasts, filters
    ├── components/
    │   ├── EventCard.jsx       ← event card (Home, Explore, Saved)
    │   ├── Topnav.jsx
    │   ├── Sidebar.jsx         ← desktop sidebar
    │   ├── BottomNav.jsx       ← mobile bottom tab bar
    │   ├── MobileDrawer.jsx    ← hamburger slide-in menu
    │   ├── AuthOverlay.jsx     ← 7-step auth modal
    │   └── ToastContainer.jsx
    └── pages/
        ├── Home.jsx            ← / — full filter system
        ├── Explore.jsx         ← /explore
        ├── EventDetails.jsx    ← /event/:id  (auth required)
        ├── Saved.jsx           ← /saved      (auth required)
        ├── Profile.jsx         ← /profile    (auth required)
        ├── Notifications.jsx   ← /notifications
        ├── MyCollege.jsx       ← /college
        ├── HostEvent.jsx       ← /host
        ├── Leaderboard.jsx     ← /leaderboard (hidden from nav, file intact)
        ├── About.jsx           ← /about
        └── Support.jsx         ← /support
```

---

## All Routes

| URL | Page | Auth Required |
|-----|------|---------------|
| `/` | Home feed + filters | No |
| `/explore` | Explore events | No |
| `/event/:id` | Event detail | **Yes** |
| `/saved` | Saved events | **Yes** |
| `/profile` | User profile | **Yes** |
| `/notifications` | Notifications | No |
| `/college` | My College | No |
| `/host` | Host an Event | No |
| `/about` | About FestNest | No |
| `/support` | Help & Support | No |
| `/leaderboard` | Leaderboard | No (hidden from nav) |

---

## Filter System (Home page)

The Home page has a **3-layer filter system** that all combine:

### Layer 1 — Search bar
Type anything → filters by event name, college name, city, or category in real time.
- Clear button (✕ circle) appears when text is typed
- Suggestion dropdown shows recent searches on focus

### Layer 2 — Chip filters (quick single-select)
```
⭐ All Events | 📅 This Week | 💻 Hackathon | 🎭 Cultural Fest
🛠️ Workshop | 🆓 Free Entry | 🏆 Prize Pool
```
- Click a chip to activate. Click same chip again to deactivate (toggle).
- Active chip = solid indigo filled. Inactive = white pill with border.
- **This Week** = shows events with `deadlineDays <= 7`
- **Free Entry** = `entryType === 'free'`
- **Prize Pool** = `entryType === 'prize'`
- All others match by `category`

### Layer 3 — Filter Sheet (advanced)
Opens via the **Filter** button in the search bar (shows red badge count when active).

| Section | Options |
|---------|---------|
| Category | Hackathon, Cultural Fest, Workshop, Competition, Tech Talk, Sports |
| Entry Type | All, Free, Paid, Prize Pool |
| City | All Cities, Mumbai, Delhi, Bangalore, Tiruchirappalli, Pilani, Vellore |
| Sort By | Latest, Oldest, Most Registered, Deadline Soon |

- **Reset All** button clears all sheet filters
- **Show Events** applies and closes the sheet
- Active filters show as removable pills below the chip row
- Filter button shows a red count badge when sheet filters are active

### Sort dropdown
Click **Latest ↓** next to "For You" heading to sort:
- Latest (soonest deadline first — default)
- Oldest (furthest deadline first)
- Most Registered (highest registration count first)
- Deadline Soon (same as Latest)

### How all layers combine
All 3 layers apply simultaneously using AND logic:
```
search  AND  chipFilter  AND  sheetCategory  AND  sheetEntry  AND  sheetCity
```
Then the result is sorted. If zero results → "No events found" empty state with "Clear All Filters" button.

---

## Feed Grid Layout

Single CSS class `feed-grid` handles all breakpoints — mobile-first:

```css
/* Mobile default — 1 column */
.feed-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 32px;
}

/* Desktop 900px+ — 3 columns */
@media (min-width: 900px) {
  .feed-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    padding: 0 24px 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Ultra-wide 1600px+ — 4 columns */
@media (min-width: 1600px) {
  .feed-grid { grid-template-columns: repeat(4, 1fr); }
}
```

> ⚠️ Never add Tailwind `grid` or `grid-cols-*` to the feed container div.
> Always use just: `className="feed-grid"`

---

## Add or Change Events

**File:** `src/data/events.js`

```js
export const EVENTS = {
  myevent: {
    id: 'myevent',
    emoji: '🚀',
    bg: 'bg1',               // bg1–bg8 (pastel backgrounds)
    category: 'Hackathon',
    entryType: 'free',        // 'free' | 'paid' | 'prize'
    name: 'My Event 2025',
    orgName: 'My College Events Cell',
    orgLogo: '🏛️',
    orgLocation: 'Mumbai, Maharashtra',
    orgSub: 'My College · 10 past events',
    college: 'My College',
    city: 'Mumbai',
    startDate: '10 Jun 2025',
    time: '9:00 AM onwards',
    venue: 'Main Hall, My College',
    teamSize: '2–4 members',
    badgeText: 'Free Entry',
    badgeClass: 'badge-free',  // 'badge-free' | 'badge-paid' | 'badge-prize'
    price: 'Free',
    priceNote: 'to register',
    registrationCount: 500,
    viewCount: 800,
    deadlineDays: 7,
    tags: ['1 Day', 'On-Site', 'Certificate'],
    about: 'Full description here...',
    highlights: ['🏆 Prize', '📜 Certificate', '🍕 Lunch'],
    registrationUrl: 'https://forms.google.com/...',
  },
};
```

To add a new city to the filter, edit `CITIES` array in `src/pages/Home.jsx`:
```js
const CITIES = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'YourCity'];
```

---

## Auth System

**Protected routes:** `/event/:id`, `/saved`, `/profile`

How it works:
1. Click protected link → `requireAuth()` checks login state
2. Not logged in → `AuthOverlay` (7-step modal) opens
3. Completes signup → `login()` sets `isLoggedIn = true`
4. Proceeds to the page

Make any page protected:
```jsx
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function MyPage() {
  const { requireAuth, isLoggedIn } = useApp();
  useEffect(() => { if (!isLoggedIn) requireAuth(); }, []);
  // ...
}
```

---

## Global State — AppContext

```jsx
import { useApp } from '../context/AppContext';
const { showToast, toggleSave, isLoggedIn, requireAuth } = useApp();
```

| Value | Type | Purpose |
|-------|------|---------|
| `isLoggedIn` | boolean | Auth status |
| `login()` | fn | Mark logged in |
| `logout()` | fn | Clear auth + saved |
| `requireAuth()` | fn | Gate check — opens auth if needed |
| `savedEvents` | Set | Saved event IDs |
| `savedCount` | number | savedEvents.size |
| `savedList` | array | Full saved event objects |
| `toggleSave(id)` | fn | Add/remove saved (auth-gated) |
| `showToast(msg, type)` | fn | `'success'` \| `'error'` \| `'info'` |
| `drawerOpen` | boolean | Mobile drawer state |
| `setDrawerOpen(v)` | fn | Open/close drawer |

---

## Design Tokens

### Colors (Tailwind classes)
```
text-primary / bg-primary / border-primary
text-primary-dark / bg-primary-dark
text-primary-light / bg-primary-light
bg-primary-xlight
text-text-1  text-text-2  text-text-3  text-text-4
bg-surface   bg-surface-2  bg-surface-3
border-border  border-border-strong
text-red / bg-red-bg / border-red-border
text-green / bg-green-bg / border-green-border
text-amber / bg-amber-bg / border-amber-border
```

### Spacing (4px base)
```
p-1=4  p-2=8  p-3=12  p-4=16  p-5=20  p-6=24  p-8=32  p-10=40  p-12=48
```

### Border Radius
```
rounded-xs=4  rounded-sm=6  rounded-md=10  rounded-lg=16  rounded-xl=22
```

### Shadows
```
shadow-1  shadow-2  shadow-3  shadow-indigo
```

### Fonts
```
font-display = Syne      (headings, titles, logo)
font-body    = DM Sans   (body text, buttons, inputs)
```

---

## Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Mobile | `< 900px` | 1-col feed, bottom nav, hamburger |
| Desktop | `≥ 900px` | sidebar + 3-col feed, no bottom nav |
| Ultra-wide | `≥ 1600px` | sidebar + 4-col feed |

---

## Restore Leaderboard

Uncomment in 3 files:

**`src/components/Topnav.jsx`**
```jsx
// { label: 'Rankings', href: '/leaderboard' },  ← uncomment
```

**`src/components/Sidebar.jsx`**
```jsx
{/* <SidebarBtn href="/leaderboard" ... label="Leaderboard" ... /> */}
// ↑ uncomment the SidebarBtn line
```

**`src/components/MobileDrawer.jsx`**
```jsx
{/* <DrawerBtn onClick={() => go('/leaderboard')} ... label="Leaderboard" /> */}
// ↑ uncomment the DrawerBtn line
```

---

## Deploy

```bash
npm run build     # output: dist/
```

Upload `dist/` to Vercel / Netlify / GitHub Pages.

For Netlify React Router fix, create `public/_redirects`:
```
/* /index.html 200
```

---

*FestNest v1.0 · Vite + React 18 + Tailwind · 🇮🇳*
