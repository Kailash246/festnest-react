// src/services/normalise.js
// Maps MongoDB/API event shape → flat shape expected by all components.

function fmtDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // not parseable — return as-is
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function normaliseEvent(ev) {
  if (!ev) return null;

  const rawEventDate = ev.rawEventDate || ev.eventDate || ev.date?.eventDate || ev.date?.start || ev.startDate || '';
  const rawRegistrationDeadline = ev.rawRegistrationDeadline || ev.registrationDeadline || ev.date?.registrationDeadline || ev.date?.end || ev.endDate || rawEventDate;

  const eventDate = fmtDate(rawEventDate);
  const registrationDeadline = fmtDate(rawRegistrationDeadline);

  // Safely extract price as a display string
  const rawPriceDisplay = typeof ev.price === 'object' && ev.price !== null
    ? ev.price.display
    : (typeof ev.price === 'string' || typeof ev.price === 'number' ? String(ev.price) : '');
  const price = rawPriceDisplay || (ev.entryFee ? (String(ev.entryFee).toLowerCase() === 'free' ? 'Free' : `₹${ev.entryFee}`) : 'Free');

  const priceNote = typeof ev.price === 'object' && ev.price !== null
    ? (ev.price.note || '')
    : (ev.priceNote || '');

  // Safely extract image URL
  const imageUrl = (typeof ev.image === 'object' && ev.image !== null ? ev.image.url : '') || ev.imageUrl || ev.bannerImage?.url || '';

  // Safely extract brochure URL
  const brochureUrl = (typeof ev.brochure === 'object' && ev.brochure !== null ? ev.brochure.url : '') || ev.brochureUrl || '';

  // Safely extract organizer
  const orgName = ev.orgName || (typeof ev.organiser === 'object' && ev.organiser !== null ? ev.organiser.name : '') || ev.college || '';
  const orgLogo = ev.orgLogo || (typeof ev.organiser === 'object' && ev.organiser !== null ? ev.organiser.logo : '') || '🏛️';
  const orgLocation = ev.orgLocation || (typeof ev.organiser === 'object' && ev.organiser !== null ? ev.organiser.location : '') || ev.city || '';
  const orgSub = ev.orgSub || (typeof ev.organiser === 'object' && ev.organiser !== null ? ev.organiser.sub : '') || '';

  return {
    // ── Identity ──────────────────────────────────────────────────────
    id:    ev.id   || ev.slug || (ev._id ? String(ev._id) : ''),
    slug:  ev.slug || ev.id   || (ev._id ? String(ev._id) : ''),
    _id:   ev._id || ev.id,

    // ── Presentation ──────────────────────────────────────────────────
    name:  ev.name || ev.title || '',
    emoji: ev.emoji   || '🎉',
    bg:    ev.bgClass || ev.bg || 'bg1',

    // ── Classification ────────────────────────────────────────────────
    category:  ev.category || ev.eventType || '',
    entryType: ev.entryType || (ev.isPaid ? 'paid' : ev.hasPrize ? 'prize' : 'free'),

    // ── Organiser (nested → flat) ──────────────────────────────────────
    orgName,
    orgLogo,
    orgLocation,
    orgSub,

    // ── Venue ──────────────────────────────────────────────────────────
    college:  ev.college || '',
    city:     ev.city || '',
    venue:    ev.venue || '',
    teamSize: ev.teamSize || '',

    // ── Date (nested → flat) ───────────────────────────────────────────
    eventDate:            eventDate,
    registrationDeadline: registrationDeadline,
    rawEventDate:         rawEventDate,
    rawRegistrationDeadline: rawRegistrationDeadline,
    startDate:            eventDate,
    endDate:              registrationDeadline,
    time:                 ev.date?.time || ev.time || '',
    deadlineDays:         typeof ev.date?.deadlineDays === 'number' ? ev.date.deadlineDays : (typeof ev.deadlineDays === 'number' ? ev.deadlineDays : 0),
    endingSoonDays:       ev.endingSoonDays,

    // ── Badge (nested → flat) ──────────────────────────────────────────
    badgeText:  (typeof ev.badge === 'object' && ev.badge !== null ? ev.badge.text : '') || ev.badgeText || '',
    badgeClass: (typeof ev.badge === 'object' && ev.badge !== null ? ev.badge.class : '') || ev.badgeClass || 'badge-free',

    // ── Price (nested → flat) ──────────────────────────────────────────
    price,
    priceNote,

    // ── Image ──────────────────────────────────────────────────────────
    imageUrl,
    brochureUrl,

    // ── Stats (nested → flat) ─────────────────────────────────────────
    registrationCount: ev.stats?.registrationCount ?? ev.registrationCount ?? 0,
    viewCount:         ev.stats?.viewCount         ?? ev.viewCount         ?? 0,

    // ── Content ───────────────────────────────────────────────────────
    tags:            Array.isArray(ev.tags) ? ev.tags : [],
    highlights:      Array.isArray(ev.highlights) ? ev.highlights : [],
    about:           ev.about || ev.description || '',
    registrationUrl: ev.registrationUrl || '#',

    // ── Trending ──────────────────────────────────────────────────────
    trendRank:  ev.trending?.rank  ?? ev.trendRank  ?? null,
    trendViews: ev.trending?.views ?? ev.trendViews ?? '',
    trendExtra: ev.trending?.extra ?? ev.trendExtra ?? '',

    // ── Featured ──────────────────────────────────────────────────────
    isFeatured:    ev.isFeatured    || false,
    featuredOrder: ev.featuredOrder ?? 0,

    // ── Extended (HostEvent form fields) ──────────────────────────────
    prize1:      ev.prize1      || '',
    prize2:      ev.prize2      || '',
    prize3:      ev.prize3      || '',
    totalPrize:  ev.totalPrize  || '',
    prizeDetails: ev.prizeDetails || '',
    pocName:     ev.pocName     || '',
    pocPhone:    ev.pocPhone    || ev.phone        || '',
    pocEmail:    ev.pocEmail    || ev.contactEmail || ev.email || '',
    website:     ev.website     || '',
    eligibility: ev.eligibility || '',
    rules:       ev.rules       || '',
    perks:       ev.perks       ?? ev.additionalPerks ?? ev.otherPerks ?? '',
    mode:        ev.mode        || 'Offline',
    competitions: Array.isArray(ev.competitions) ? ev.competitions : [],
    hostedBy:     ev.hostedBy   || '',
    isActive:     ev.isActive !== false,
    isApproved:   ev.isApproved !== false,
  };
}

export function normaliseEvents(arr = []) {
  return Array.isArray(arr) ? arr.map(normaliseEvent).filter(Boolean) : [];
}
