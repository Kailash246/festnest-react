// src/services/api.js
// Real backend client for FestNest
// Set VITE_API_URL=http://localhost:5000/api in your .env

// The backend mounts every route under `/api`. Normalise VITE_API_URL so the
// base always ends in exactly one `/api`, whether the env var includes it or not
// (e.g. "https://host.com" and "https://host.com/api" both resolve correctly).
const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE = RAW_BASE.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

/* ─── Token storage ─────────────────────────────────────── */
export const tokens = {
  getAccess:  () => localStorage.getItem('fn_access'),
  getRefresh: () => localStorage.getItem('fn_refresh'),
  getUser:    () => { try { return JSON.parse(localStorage.getItem('fn_user')); } catch { return null; } },
  set: (access, refresh, user) => {
    if (access)  localStorage.setItem('fn_access',  access);
    if (refresh) localStorage.setItem('fn_refresh', refresh);
    if (user)    localStorage.setItem('fn_user',    JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('fn_access');
    localStorage.removeItem('fn_refresh');
    localStorage.removeItem('fn_user');
  },
  isLoggedIn: () => !!localStorage.getItem('fn_access'),
};

/* ─── Core fetch with auto refresh ──────────────────────── */
let _refreshing = false;
let _queue = [];

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const access = tokens.getAccess();
  if (access) headers['Authorization'] = `Bearer ${access}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    // fetch only rejects on network failure (offline, DNS, CORS, server down)
    throw Object.assign(new Error('Connection error. Check your internet.'), { status: 0, network: true });
  }

  if (res.status === 401 && !options._retry) {
    // Auth endpoints return 401 for wrong credentials / bad input — NOT session
    // expiry. Never attempt token refresh for these paths; throw the server's
    // message as-is so the form can show the correct error.
    if (
      path.includes('/auth/login') ||
      path.includes('/auth/login-otp') ||
      path.includes('/auth/register') ||
      path.includes('/auth/send-otp') ||
      path.includes('/auth/forgot-password') ||
      path.includes('/auth/reset-password')
    ) {
      const json = await res.json().catch(() => ({}));
      throw Object.assign(
        new Error(json.message || 'Incorrect email or password.'),
        { status: 401 }
      );
    }
    if (_refreshing) {
      await new Promise((resolve, reject) => _queue.push({ resolve, reject }));
      return request(path, { ...options, _retry: true });
    }
    _refreshing = true;
    try {
      const rfRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.getRefresh() }),
      });
      if (!rfRes.ok) throw new Error('refresh_failed');
      const { data } = await rfRes.json();
      tokens.set(data.accessToken, data.refreshToken);
      _queue.forEach(p => p.resolve());
    } catch {
      tokens.clear();
      _queue.forEach(p => p.reject());
      window.dispatchEvent(new CustomEvent('festnest:logout'));
      throw Object.assign(new Error('Your session has expired. Please log in again.'), { status: 401 });
    } finally {
      _queue = [];
      _refreshing = false;
    }
    return request(path, { ...options, _retry: true });
  }

  // Some errors (proxy 502/504, rate-limit edge cases) may not return JSON.
  let json;
  try {
    json = await res.json();
  } catch {
    throw Object.assign(new Error(statusFallback(res.status)), { status: res.status });
  }

  if (!json.success) {
    const message = json.message || statusFallback(res.status);
    throw Object.assign(new Error(message), { status: res.status, errors: json.errors });
  }
  return json;
}

/* Human-readable fallback when the server gives us a bare/non-JSON error. */
function statusFallback(status) {
  switch (status) {
    case 400: return 'Please check the information you entered and try again.';
    case 401: return 'Your session has expired. Please log in again.';
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find what you were looking for.";
    case 409: return 'That conflicts with something that already exists.';
    case 413: return 'That file is too large. Please upload a smaller file.';
    case 422: return 'Some of the information you entered is invalid.';
    case 429: return 'Too many attempts. Please wait a few minutes and try again.';
    default:  return status >= 500
      ? 'Something went wrong. Please try again.'
      : 'Request failed. Please try again.';
  }
}

const get   = (path, opts)       => request(path, { method: 'GET', ...opts });
const post  = (path, body, opts) => request(path, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body), ...opts });
const patch = (path, body, opts) => request(path, { method: 'PATCH',  body: JSON.stringify(body), ...opts });
const del   = (path, body, opts) => request(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined, ...opts });

/* ─── Auth ───────────────────────────────────────────────── */
export const auth = {
  sendOtp: (email, purpose = 'verify_email') => post('/auth/send-otp', { email, purpose }),
  register: async (body) => {
    const r = await post('/auth/register', body);
    tokens.set(r.data.accessToken, r.data.refreshToken, r.data.user);
    return r;
  },
  login: async (email, password) => {
    const r = await post('/auth/login', { email, password });
    tokens.set(r.data.accessToken, r.data.refreshToken, r.data.user);
    return r;
  },
  loginOtp: async (email, otp) => {
    const r = await post('/auth/login-otp', { email, otp });
    tokens.set(r.data.accessToken, r.data.refreshToken, r.data.user);
    return r;
  },
  logout: async () => {
    try { await post('/auth/logout', { refreshToken: tokens.getRefresh() }); } catch { /* noop */ }
    tokens.clear();
  },
  forgotPassword: (email)                   => post('/auth/forgot-password', { email }),
  resetPassword:  (email, otp, newPassword) => post('/auth/reset-password', { email, otp, newPassword }),
  me: () => get('/auth/me'),
};

/* ─── Events ─────────────────────────────────────────────── */
export const events = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== ''))).toString();
    return get(`/events${qs ? '?' + qs : ''}`);
  },
  trending:          ()     => get('/events/trending'),
  urgent:            ()     => get('/events/urgent'),
  featured:          ()     => get('/events/featured'),
  saved:             ()     => get('/events/saved'),
  get:               (slug) => get(`/events/${slug}`),
  save:              (slug) => post(`/events/${slug}/save`),
  unsave:            (slug) => del(`/events/${slug}/save`),
  register:          (slug) => post(`/events/${slug}/register`),
  cancelRegistration:(slug) => del(`/events/${slug}/register`),
  host:              (fd)   => post('/events/host', fd),
  stats:             ()    => get('/events/stats'),
};

/* ─── Users ──────────────────────────────────────────────── */
export const users = {
  me:             ()      => get('/users/me'),
  update:         (body)  => patch('/users/me', body),
  updateMe:       (body)  => patch('/users/me', body),
  changePassword: (body)  => patch('/users/me/password', body),
  uploadAvatar:   (file)  => { const fd = new FormData(); fd.append('avatar', file); return post('/users/me/avatar', fd); },
  registrations:  ()      => get('/users/me/registrations'),
  points:         ()      => get('/users/me/points'),
  hosted:         ()      => get('/users/me/hosted'),
};

/* ─── Notifications ──────────────────────────────────────── */
export const notifications = {
  list:       (type)  => get(`/notifications${type && type !== 'all' ? '?type=' + type : ''}`),
  markRead:   (id)    => patch(`/notifications/${id}/read`),
  markAllRead:()      => patch('/notifications/read-all'),
  delete:     (id)    => del(`/notifications/${id}`),
  clearAll:   ()      => del('/notifications'),
};

/* ─── Leaderboard ────────────────────────────────────────── */
export const leaderboard = { get: (period = 'all') => get(`/leaderboard?period=${period}`) };

/* ─── College ────────────────────────────────────────────── */
export const college = {
  list:  (q)    => get(`/college/list${q ? '?q=' + encodeURIComponent(q) : ''}`),
  my:    (name) => get(`/college/my${name ? '?college=' + encodeURIComponent(name) : ''}`),
  setMy: (name) => patch('/college/my', { college: name }),
};

/* ─── Support ────────────────────────────────────────────── */
export const support = {
  faqs:          (cat)     => get(`/support/faqs${cat && cat !== 'all' ? '?category=' + cat : ''}`),
  submitTicket:  (body)    => post('/support/contact', body),
  myTickets:     ()        => get('/support/tickets'),
  reopenTicket:  (id, msg) => patch(`/support/tickets/${id}/reopen`, { message: msg }),
  replyToTicket: (id, msg) => post(`/support/tickets/${id}/reply`,   { message: msg }),
};

/* ─── Query-string builder — strips undefined/null/empty values ── */
const buildQs = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const str = new URLSearchParams(clean).toString();
  return str ? '?' + str : '';
};

/* ─── Admin ──────────────────────────────────────────────── */
export const admin = {
  stats:               ()         => get('/admin/stats'),
  // Submissions
  submissions:         (params={})=> get('/admin/submissions' + buildQs(params)),
  getSubmission:       (id)       => get(`/admin/submissions/${id}`),
  approveSubmission:   (id, body) => post(`/admin/submissions/${id}/approve`, body || {}),
  rejectSubmission:    (id, reason) => post(`/admin/submissions/${id}/reject`, { reason }),
  // Events
  listEvents:          (params={})=> get('/admin/events' + buildQs(params)),
  createEvent:         (body)     => post('/admin/events', body),
  updateEvent:         (id, body) => patch(`/admin/events/${id}`, body),
  deleteEvent:         (id)       => del(`/admin/events/${id}`),
  restoreEvent:        (id)       => patch(`/admin/events/${id}/restore`),
  hardDeleteEvent:     (id)       => del(`/admin/events/${id}/permanent`),
  featureEvent:        (id, isFeatured, featuredOrder) =>
    patch(`/admin/events/${id}/feature`, { isFeatured, ...(typeof featuredOrder === 'number' ? { featuredOrder } : {}) }),
  // Users
  listUsers:           (params={})=> get('/admin/users' + buildQs(params)),
  getUser:             (id)       => get(`/admin/users/${id}`),
  toggleBan:           (id)       => patch(`/admin/users/${id}/ban`),
  setRole:             (id, role) => patch(`/admin/users/${id}/role`, { role }),
  adjustPoints:        (id, points, reason) => patch(`/admin/users/${id}/points`, { points, reason }),
  // Tickets
  tickets:             (params={})=> get('/admin/tickets' + buildQs(params)),
  updateTicket:        (id, body) => patch(`/admin/tickets/${id}`, body),
  // Colleges
  addCollege:          (body)     => post('/admin/colleges', body),
  updateCollege:       (id, body) => patch(`/admin/colleges/${id}`, body),
  deleteCollege:       (id)       => del(`/admin/colleges/${id}`),
  // Broadcast
  notify:              (body)     => post('/admin/notify', body),
};

export default { auth, events, users, notifications, leaderboard, college, support, admin, tokens };
