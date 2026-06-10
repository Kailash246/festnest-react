# FestNest — Support Page Integration Guide

## What was added

A new **Help & Support / Contact page** at `/support` with:
- 3-tab layout: **Contact Us** · **FAQs** · **Send Message**
- All 4 FestNest email channels with copy-to-clipboard
- 8 animated FAQ accordions with live search
- Full contact form with topic chips, validation, and success state
- Support hours card, response time indicators
- Connected from: Sidebar, Mobile Drawer, and About page

---

## Files to add / change

### 1. NEW FILE — create this file

```
src/pages/Support.jsx
```

Copy the full `Support.jsx` file from the zip into `src/pages/`.  
That's the only new file. Everything else is edits to existing files.

---

### 2. EDIT: `src/App.jsx`

**Add the import** (after the `About` import on ~line 18):
```jsx
import Support from './pages/Support';
```

**Add the route** (after the `/about` route, ~line 59):
```jsx
<Route path="/support" element={<Support />} />
```

---

### 3. EDIT: `src/components/Sidebar.jsx`

Find the **FestNest section** at the bottom (~line 122). Replace:
```jsx
<SidebarBtn onClick={() => showToast('Help Center coming soon…', 'info')} icon={<HelpIcon />} label="Help & Support" />
```
With:
```jsx
<SidebarBtn href="/support" icon={<HelpIcon />} label="Help & Support" isActive={path === '/support'} />
```

---

### 4. EDIT: `src/components/MobileDrawer.jsx`

Find the **FestNest section** inside the drawer body. Replace:
```jsx
<DrawerBtn onClick={() => {}} icon={<span>❓</span>} label="Help & Support" />
```
With:
```jsx
<DrawerBtn onClick={() => go('/support')} icon={<span>❓</span>} label="Help & Support" />
```

---

### 5. EDIT: `src/pages/About.jsx`

**Add `useNavigate` import** at the top:
```jsx
import { useNavigate } from 'react-router-dom';
```

**Add `navigate`** inside the component:
```jsx
const navigate = useNavigate();
```

**Update the LINKS array** — replace the Email entry with a Support entry:
```jsx
const LINKS = [
  { icon:'🌐', label:'Website',      sub:'festnest.in',                         action: null },
  { icon:'📸', label:'Instagram',    sub:'@festnest_india',                     action: null },
  { icon:'🐦', label:'Twitter / X',  sub:'@festnest',                           action: null },
  { icon:'💬', label:'Help & Support', sub:'Get help, report bugs, contact us', action: 'support' },
];
```

**Update the click handler** in the links map:
```jsx
onClick={() => action === 'support' ? navigate('/support') : showToast(`Opening ${label}…`, 'info')}
```

---

## Email addresses used in the page

| Email | Purpose | Shown in |
|---|---|---|
| `support@festnest.in` | General support, bugs, account issues | Contact tab, form note, FAQ answers |
| `contact@festnest.in` | General enquiries | Contact tab |
| `partners@festnest.in` | Sponsorships, collaborations, B2B | Contact tab |
| `noreply@festnest.in` | OTP, receipts, notifications (do not reply) | Contact tab (muted/greyed) |

All emails have a **copy-to-clipboard** button and a direct `mailto:` link.  
To update any email address, edit the `CONTACT_CHANNELS` array at the top of `Support.jsx`.

---

## Route summary

| URL | Page | Auth required? |
|---|---|---|
| `/support` | Help & Support | No — open to all |

---

## How to test locally

```bash
npm run dev
# Navigate to http://localhost:5173/support
```

Test all three tabs:
1. **Contact Us** — tap Copy on each email, check toast appears
2. **FAQs** — type in the search box, expand accordion items
3. **Send Message** — try submitting with empty fields (validation), then with valid data (success screen)
