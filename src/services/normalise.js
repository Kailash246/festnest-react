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

  // Already normalised (has flat fields) — but re-apply to pick up new fields
  const base = ev.startDate !== undefined ? ev : null;

  if (base) {
    // Was previously normalised — just bolt on any missing extended fields
    return {
      ...base,
      brochureUrl: base.brochureUrl  ?? ev.brochure?.url ?? ev.brochureUrl ?? '',
      prize1:      base.prize1      ?? ev.prize1      ?? '',
      prize2:      base.prize2      ?? ev.prize2      ?? '',
      prize3:      base.prize3      ?? ev.prize3      ?? '',
      totalPrize:  base.totalPrize  ?? ev.totalPrize  ?? '',
      pocName:     base.pocName     ?? ev.pocName     ?? '',
      pocPhone:    base.pocPhone    ?? ev.pocPhone     ?? ev.phone ?? '',
      pocEmail:    base.pocEmail    ?? ev.pocEmail     ?? '',
      website:     base.website     ?? ev.website      ?? '',
      eligibility: base.eligibility ?? ev.eligibility  ?? '',
      rules:       base.rules       ?? ev.rules        ?? '',
      perks:       base.perks       ?? ev.perks        ?? '',
      mode:        base.mode        ?? ev.mode         ?? '',
      endDate:     base.endDate     ?? ev.date?.end    ?? ev.endDate ?? '',
    };
  }

  return {
    // ── Identity ──────────────────────────────────────────────────────
    id:    ev.slug || ev._id,
    slug:  ev.slug || ev._id,
    _id:   ev._id,

    // ── Presentation ──────────────────────────────────────────────────
    name:  ev.name,
    emoji: ev.emoji   || '🎉',
    bg:    ev.bgClass || ev.bg || 'bg1',

    // ── Classification ────────────────────────────────────────────────
    category:  ev.category,
    entryType: ev.entryType,

    // ── Organiser (nested → flat) ──────────────────────────────────────
    orgName:     ev.organiser?.name     || ev.orgName     || '',
    orgLogo:     ev.organiser?.logo     || ev.orgLogo     || '🏛️',
    orgLocation: ev.organiser?.location || ev.orgLocation || '',
    orgSub:      ev.organiser?.sub      || ev.orgSub      || '',

    // ── Venue ──────────────────────────────────────────────────────────
    college:  ev.college,
    city:     ev.city,
    venue:    ev.venue    || '',
    teamSize: ev.teamSize || '',

    // ── Date (nested → flat) ───────────────────────────────────────────
    startDate:    fmtDate(ev.date?.start    || ev.startDate  || ''),
    endDate:      fmtDate(ev.date?.end      || ev.endDate    || ''),
    time:         ev.date?.time        || ev.time       || '',
    deadlineDays: ev.date?.deadlineDays ?? ev.deadlineDays ?? 0,

    // ── Badge (nested → flat) ──────────────────────────────────────────
    badgeText:  ev.badge?.text  || ev.badgeText  || '',
    badgeClass: ev.badge?.class || ev.badgeClass || 'badge-free',

    // ── Price (nested → flat) ──────────────────────────────────────────
    price:     ev.price?.display || ev.price    || 'Free',
    priceNote: ev.price?.note    || ev.priceNote || '',

    // ── Image ──────────────────────────────────────────────────────────
    imageUrl:   ev.image?.url    || ev.imageUrl    || '',
    brochureUrl: ev.brochure?.url || ev.brochureUrl || '',

    // ── Stats (nested → flat) ─────────────────────────────────────────
    registrationCount: ev.stats?.registrationCount ?? ev.registrationCount ?? 0,
    viewCount:         ev.stats?.viewCount         ?? ev.viewCount         ?? 0,

    // ── Content ───────────────────────────────────────────────────────
    tags:            ev.tags            || [],
    highlights:      ev.highlights      || [],
    about:           ev.about           || '',
    registrationUrl: ev.registrationUrl || '#',

    // ── Trending ──────────────────────────────────────────────────────
    trendRank:  ev.trending?.rank  || ev.trendRank  || null,
    trendViews: ev.trending?.views || ev.trendViews || '',
    trendExtra: ev.trending?.extra || ev.trendExtra || '',

    // ── Featured ──────────────────────────────────────────────────────
    isFeatured:    ev.isFeatured    || false,
    featuredOrder: ev.featuredOrder ?? 0,

    // ── Extended (HostEvent form fields) ──────────────────────────────
    prize1:      ev.prize1      || '',
    prize2:      ev.prize2      || '',
    prize3:      ev.prize3      || '',
    totalPrize:  ev.totalPrize  || '',
    pocName:     ev.pocName     || '',
    pocPhone:    ev.pocPhone    || ev.phone        || '',
    pocEmail:    ev.pocEmail    || ev.contactEmail || '',
    website:     ev.website     || '',
    eligibility: ev.eligibility || '',
    rules:       ev.rules       || '',
    perks:       ev.perks       || '',
    mode:        ev.mode        || '',
  };
}

export function normaliseEvents(arr = []) {
  return arr.map(normaliseEvent);
}
