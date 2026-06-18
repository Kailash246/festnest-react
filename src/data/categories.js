// src/data/categories.js
// Single source of truth for event-category ordering, labels, and icons.
//
// `value` is the EXACT backend category string — never rename these, the API
// filters by exact match. Ordering is priority-first: the six priority
// categories lead (in the order below), then all remaining existing
// categories. Add new categories at the end of the list to keep them after the
// priority block.
import {
  PartyPopper, Code2, BriefcaseBusiness, Rocket, Music4, Trophy, Wrench, Mic,
} from 'lucide-react';

export const CATEGORIES = [
  // ── Priority categories (shown first, in this order) ──
  { value: 'Mega Fest',     label: 'Mega Fest',  Icon: PartyPopper,       color: 'bg2', tint: 'text-amber-600 bg-amber-50',     priority: true },
  { value: 'Hackathon',     label: 'Hackathons', Icon: Code2,             color: 'bg1', tint: 'text-indigo-600 bg-indigo-50',   priority: true },
  { value: 'Management',    label: 'Management', Icon: BriefcaseBusiness, color: 'bg8', tint: 'text-blue-600 bg-blue-50',       priority: true },
  { value: 'Startup',       label: 'Startup',    Icon: Rocket,            color: 'bg7', tint: 'text-orange-600 bg-orange-50',   priority: true },
  { value: 'Cultural Fest', label: 'Cultural',   Icon: Music4,            color: 'bg5', tint: 'text-fuchsia-600 bg-fuchsia-50', priority: true },
  { value: 'Sports',        label: 'Sports',     Icon: Trophy,            color: 'bg4', tint: 'text-green-600 bg-green-50',      priority: true },
  // ── Remaining existing categories ──
  { value: 'Workshop',      label: 'Workshop',    Icon: Wrench, color: 'bg3', tint: 'text-teal-600 bg-teal-50' },
  { value: 'Competition',   label: 'Competition', Icon: Trophy, color: 'bg7', tint: 'text-amber-600 bg-amber-50' },
  { value: 'Tech Talk',     label: 'Tech Talk',   Icon: Mic,    color: 'bg8', tint: 'text-blue-600 bg-blue-50' },
];

/** The six priority categories, already in display order. */
export const PRIORITY_CATEGORIES = CATEGORIES.filter(c => c.priority);

/** Priority category value-strings, in order. */
export const PRIORITY_CATEGORY_VALUES = PRIORITY_CATEGORIES.map(c => c.value);

/** Lookup a category descriptor by its backend value. */
export const CATEGORY_BY_VALUE = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

/** Canonical rank for ordering — lower = earlier. Unknown values sort last. */
const RANK = new Map(CATEGORIES.map((c, i) => [c.value, i]));

/**
 * Order an arbitrary list of category value-strings into the canonical
 * priority-first order. Unknown values keep their relative (alphabetical) order
 * at the end, so categories not in the catalog are never dropped.
 */
export function orderCategoryValues(values = []) {
  return [...values].sort((a, b) => {
    const ra = RANK.has(a) ? RANK.get(a) : Number.MAX_SAFE_INTEGER;
    const rb = RANK.has(b) ? RANK.get(b) : Number.MAX_SAFE_INTEGER;
    return ra === rb ? String(a).localeCompare(String(b)) : ra - rb;
  });
}
