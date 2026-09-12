// src/pages/admin/tabs/EventsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Search, Plus, Star, Eye, Trash2,
  RefreshCw, Power, ExternalLink, MapPin, Calendar,
  BarChart2, Filter, AlertTriangle, ShieldAlert,
  MoreVertical, X, Users, Globe, Building
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import useLongWait from '../../../hooks/useLongWait';
import LongWaitNotice from '../../../components/loading/LongWaitNotice';
import ProgressiveSection from '../../../components/loading/ProgressiveSection';

const CATEGORIES = [
  'All Categories', 'Tech', 'Cultural', 'Sports', 'Business', 'Workshop', 'Gaming', 'Arts', 'Academic', 'Music'
];

const getEventGradient = (str = '') => {
  const gradients = [
    'from-blue-600 via-indigo-600 to-purple-600',
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-blue-500 via-teal-500 to-emerald-600',
    'from-violet-600 via-indigo-500 to-blue-600',
    'from-fuchsia-600 via-rose-500 to-amber-500',
    'from-cyan-600 via-blue-600 to-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return gradients[Math.abs(hash) % gradients.length];
};

const EventsTableSkeleton = () => (
  <tbody className="divide-y divide-neutral-100 text-xs">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <tr key={i} className="hover:bg-neutral-50/70 transition-colors">
        <td className="py-3.5 px-4 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-36 rounded" />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4">
          <div className="skeleton h-5 w-16 rounded-md" />
        </td>
        <td className="py-3.5 px-4">
          <div className="skeleton h-3.5 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded mt-1.5" />
        </td>
        <td className="py-3.5 px-4">
          <div className="skeleton h-3.5 w-20 rounded" />
        </td>
        <td className="py-3.5 px-4 text-center">
          <div className="skeleton h-4 w-12 mx-auto rounded" />
        </td>
        <td className="py-3.5 px-4 text-center">
          <div className="skeleton h-5 w-14 mx-auto rounded-md" />
        </td>
        <td className="py-3.5 px-4 text-right w-[110px] min-w-[110px]">
          <div className="flex items-center justify-end gap-1.5">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton w-7 h-7 rounded-lg" />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

const EventsMobileSkeleton = () => (
  <div className="space-y-2.5">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-neutral-100/90 p-3 shadow-xs flex items-center justify-between gap-2.5">
        <div className="skeleton w-11 h-11 rounded-2xl shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full shrink-0" />
        <div className="skeleton h-4 w-7 rounded shrink-0" />
        <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
      </div>
    ))}
  </div>
);

export default function EventsTab({ showToast, onOpenCreate }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLongWait = useLongWait(loading);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionId, setActionId] = useState('');
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);

  // Mobile-specific interactions
  const [selectedMobileEvent, setSelectedMobileEvent] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const loadEvents = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (search.trim()) params.search = search.trim();
    if (categoryFilter !== 'All Categories') params.category = categoryFilter;
    if (activeFilter === 'active') params.isActive = true;
    if (activeFilter === 'inactive') params.isActive = false;

    admin.listEvents(params)
      .then(r => setItems(r.data.events || []))
      .catch(e => showToast?.(e.message || 'Failed to fetch events', 'error'))
      .finally(() => setLoading(false));
  }, [search, categoryFilter, activeFilter, showToast]);

  useEffect(() => {
    const t = setTimeout(loadEvents, 250);
    return () => clearTimeout(t);
  }, [loadEvents]);

  // Lock body scroll when mobile details sheet is open
  useEffect(() => {
    if (selectedMobileEvent) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedMobileEvent(null);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [selectedMobileEvent]);

  const toggleDeactivate = async (ev) => {
    const isDeactivating = ev.isActive;
    setActionId(ev._id + '-toggle');
    try {
      if (isDeactivating) {
        await admin.deleteEvent(ev._id);
        showToast?.(`"${ev.name || ev.eventName || 'Event'}" deactivated`, 'info');
      } else {
        await admin.restoreEvent(ev._id);
        showToast?.(`"${ev.name || ev.eventName || 'Event'}" restored and live`, 'success');
      }
      setSelectedMobileEvent(prev => prev?._id === ev._id ? { ...prev, isActive: !isDeactivating } : prev);
      loadEvents();
    } catch (e) {
      showToast?.(e.message || 'Action failed', 'error');
    } finally {
      setActionId('');
    }
  };

  const handleToggleFeature = async (ev) => {
    setActionId(ev._id + '-feat');
    try {
      const nextFeatured = !ev.isFeatured;
      await admin.featureEvent(ev._id, nextFeatured);
      showToast?.(
        nextFeatured
          ? `"${ev.name || ev.eventName || 'Event'}" marked as Featured`
          : `"${ev.name || ev.eventName || 'Event'}" removed from Featured`,
        'success'
      );
      setSelectedMobileEvent(prev => prev?._id === ev._id ? { ...prev, isFeatured: nextFeatured } : prev);
      loadEvents();
    } catch (e) {
      showToast?.(e.message || 'Failed to toggle featured status', 'error');
    } finally {
      setActionId('');
    }
  };

  const handleHardDelete = async () => {
    if (!deleteConfirmEvent) return;
    setActionId(deleteConfirmEvent._id + '-delete');
    try {
      await admin.hardDeleteEvent(deleteConfirmEvent._id);
      showToast?.(`"${deleteConfirmEvent.name || deleteConfirmEvent.eventName || 'Event'}" permanently deleted`, 'info');
      setSelectedMobileEvent(prev => prev?._id === deleteConfirmEvent._id ? null : prev);
      setDeleteConfirmEvent(null);
      loadEvents();
    } catch (e) {
      showToast?.(e.message || 'Deletion failed', 'error');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={!!deleteConfirmEvent}
        title="Permanently Delete Event?"
        message={`Are you sure you want to completely erase "${deleteConfirmEvent?.name || deleteConfirmEvent?.eventName || 'this event'}"? All registrations, analytics, and associated records will be permanently destroyed. This cannot be undone.`}
        confirmText="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleHardDelete}
        onCancel={() => setDeleteConfirmEvent(null)}
      />

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search live events..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Active status filter */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeFilter === f.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Live Event CTA */}
        <button
          onClick={onOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Live Event</span>
        </button>
      </div>

      <LongWaitNotice isLongWait={isLongWait} />

      {/* ── DESKTOP TABLE VIEW (>= md) ── UNCHANGED DESKTOP PRESENTATION */}
      <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4 min-w-[200px]">Event</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">College & Location</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Registrations</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right w-[110px] min-w-[110px] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <EventsTableSkeleton />
            ) : items.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 text-xs">
                    <CalendarDays className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="font-semibold text-neutral-700">No events found</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Try adjusting your search criteria or publish a new event.</p>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-neutral-100 text-xs">
                {items.map(ev => {
                  const isActing = actionId.startsWith(ev._id);
                  const eventTitle = ev.name || ev.eventName || ev.title || 'Untitled Event';
                  return (
                    <tr
                      key={ev._id}
                      className={`hover:bg-neutral-50/70 transition-colors group ${!ev.isActive ? 'opacity-60 bg-neutral-50/40' : ''}`}
                    >
                      {/* Name & Emoji */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-base flex-shrink-0">
                            {ev.emoji || '🎯'}
                          </span>
                          <div className="min-w-0 max-w-[220px]">
                            <span className="font-bold text-neutral-900 block truncate" title={eventTitle}>
                              {eventTitle}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono block truncate">
                              /{ev.slug || ev._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {ev.category || 'General'}
                        </span>
                      </td>

                      {/* College & Location */}
                      <td className="py-3 px-4">
                        <div className="max-w-[180px]">
                          <span className="font-medium text-neutral-800 block truncate">{ev.college}</span>
                          <span className="text-[11px] text-neutral-400 block truncate">{ev.city}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {ev.date?.start || ev.startDate || '—'}
                      </td>

                      {/* Stats */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-neutral-800 tabular-nums">
                          {ev.stats?.registrationCount ?? 0}
                        </span>
                        <span className="text-[10px] text-neutral-400 ml-1">
                          ({ev.stats?.viewCount ?? 0} views)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {ev.isActive ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600">
                              Inactive
                            </span>
                          )}
                          {ev.isFeatured && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {ev.featuredOrder ? `#${ev.featuredOrder}` : 'Featured'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap w-[110px] min-w-[110px]">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Live */}
                          <button
                            type="button"
                            onClick={() => navigate(`/event/${ev.slug}`)}
                            title="View public event page"
                            aria-label="View public event page"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Feature toggle (Superadmin) */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleFeature(ev)}
                              disabled={isActing}
                              title={ev.isFeatured ? "Unfeature" : "Mark as Featured"}
                              aria-label={ev.isFeatured ? "Unfeature" : "Mark as Featured"}
                              className={`w-7 h-7 inline-flex items-center justify-center rounded-lg transition ${
                                ev.isFeatured
                                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                  : 'text-neutral-400 hover:text-amber-600 hover:bg-neutral-100'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${ev.isFeatured ? 'fill-amber-500' : ''}`} />
                            </button>
                          )}

                          {/* Deactivate / Restore */}
                          <button
                            type="button"
                            onClick={() => toggleDeactivate(ev)}
                            disabled={isActing}
                            title={ev.isActive ? "Deactivate event" : "Restore event"}
                            aria-label={ev.isActive ? "Deactivate event" : "Restore event"}
                            className={`w-7 h-7 inline-flex items-center justify-center rounded-lg transition ${
                              ev.isActive
                                ? 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Permanent Delete (Superadmin) */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmEvent(ev)}
                              disabled={isActing}
                              title="Permanently Delete Event"
                              aria-label="Permanently Delete Event"
                              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* ── MOBILE UNIFIED CARD LIST VIEW (< md) ── MATCHING USER REFERENCE DESIGN */}
      <div className="block md:hidden">
        {loading ? (
          <EventsMobileSkeleton />
        ) : items.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
            <CalendarDays className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700 text-sm">No events found</p>
            <p className="text-xs text-neutral-400 mt-0.5">Try adjusting your search criteria or publish a new event.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(ev => {
              const isActing = actionId.startsWith(ev._id);
              const eventTitle = ev.name || ev.eventName || ev.title || 'Untitled Event';
              const eventSubtitle = ev.tagline || ev.theme || ev.college || ev.category || 'Live Event';
              const viewsCount = ev.stats?.viewCount ?? 0;
              const regsCount = ev.stats?.registrationCount ?? 0;

              return (
                <div
                  key={ev._id}
                  className={`bg-white rounded-2xl border border-neutral-100/90 p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5 relative ${
                    !ev.isActive ? 'opacity-75 bg-neutral-50/60' : ''
                  }`}
                >
                  {/* Left: Branded Squircle Icon Avatar */}
                  <div
                    onClick={() => setSelectedMobileEvent(ev)}
                    className="w-11 h-11 rounded-2xl bg-[#f4f6fb] border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer select-none"
                  >
                    <span className={`font-black text-xl bg-gradient-to-br ${getEventGradient(eventTitle)} bg-clip-text text-transparent`}>
                      {eventTitle.trim().charAt(0).toUpperCase() || 'E'}
                    </span>
                  </div>

                  {/* Middle Left: Event Title & Subtitle */}
                  <div
                    onClick={() => setSelectedMobileEvent(ev)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900 text-[14px] leading-tight truncate" title={eventTitle}>
                        {eventTitle}
                      </span>
                      {ev.isFeatured && (
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 font-normal mt-0.5 truncate">
                      {eventSubtitle}
                    </div>
                  </div>

                  {/* Middle Right: Active / Inactive Pill Badge */}
                  <div className="shrink-0">
                    {ev.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eafaf1] text-[#1e834b] border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Middle Far Right: Views - Registrations (e.g. 1-1) */}
                  <div
                    className="text-xs font-semibold text-neutral-600 tabular-nums shrink-0 px-1 select-none"
                    title={`${viewsCount} Views • ${regsCount} Registrations`}
                    aria-label={`${viewsCount} Views, ${regsCount} Registrations`}
                  >
                    {viewsCount}-{regsCount}
                  </div>

                  {/* Right: 3-Dot Actions Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenuId(openActionMenuId === ev._id ? null : ev._id);
                      }}
                      aria-label={`Actions for ${eventTitle}`}
                      className="w-9 h-9 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-500 flex items-center justify-center transition active:bg-neutral-100 shadow-2xs"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {openActionMenuId === ev._id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(null);
                            }}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-40"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Event Details */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuId(null);
                                setSelectedMobileEvent(ev);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-400" />
                              <span>View Event Details</span>
                            </button>

                            {/* View Live */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuId(null);
                                navigate(`/event/${ev.slug}`);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                              <span>View Live Page</span>
                            </button>

                            {/* Feature toggle (Superadmin) */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  handleToggleFeature(ev);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition"
                              >
                                <Star className={`w-3.5 h-3.5 ${ev.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                                <span>{ev.isFeatured ? 'Remove Featured' : 'Mark as Featured'}</span>
                              </button>
                            )}

                            {/* Deactivate / Restore */}
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => {
                                setOpenActionMenuId(null);
                                toggleDeactivate(ev);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition"
                            >
                              <Power className={`w-3.5 h-3.5 ${ev.isActive ? 'text-neutral-400' : 'text-emerald-600'}`} />
                              <span>{ev.isActive ? 'Deactivate Event' : 'Restore Event'}</span>
                            </button>

                            {/* Permanent Delete (Superadmin) */}
                            {isSuperAdmin && (
                              <div className="border-t border-neutral-100 mt-1 pt-1">
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setDeleteConfirmEvent(ev);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Permanently</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MOBILE EVENT DETAILS BOTTOM SHEET / MODAL ── */}
      <AnimatePresence>
        {selectedMobileEvent && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMobileEvent(null)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Content Drawer / Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Drawer Handle (mobile only) */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-10 h-1 rounded-full bg-neutral-200" />
              </div>

              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#f4f6fb] border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className={`font-black text-xl bg-gradient-to-br ${getEventGradient(selectedMobileEvent.name || selectedMobileEvent.eventName || '')} bg-clip-text text-transparent`}>
                      {(selectedMobileEvent.name || selectedMobileEvent.eventName || 'E').trim().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-neutral-900 text-base leading-snug break-words">
                      {selectedMobileEvent.name || selectedMobileEvent.eventName || selectedMobileEvent.title || 'Untitled Event'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate">
                      /{selectedMobileEvent.slug || selectedMobileEvent._id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMobileEvent(null)}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body — scrollable */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                {/* Badges / Pill row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedMobileEvent.category || 'General'}
                  </span>
                  {selectedMobileEvent.isActive ? (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Inactive
                    </span>
                  )}
                  {selectedMobileEvent.isFeatured && (
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{selectedMobileEvent.featuredOrder ? `Featured #${selectedMobileEvent.featuredOrder}` : 'Featured'}</span>
                    </span>
                  )}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-400 block font-medium">Page Views</span>
                    <span className="text-lg font-bold text-neutral-900 block mt-0.5 tabular-nums">
                      {selectedMobileEvent.stats?.viewCount ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-400 block font-medium">Registrations</span>
                    <span className="text-lg font-bold text-neutral-900 block mt-0.5 tabular-nums">
                      {selectedMobileEvent.stats?.registrationCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-3.5 space-y-3">
                  {/* College & Location */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block">College & Location</span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {selectedMobileEvent.college || '—'}
                      </p>
                      {(selectedMobileEvent.city || selectedMobileEvent.venue) && (
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          {[selectedMobileEvent.city, selectedMobileEvent.venue].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-neutral-200/60">
                    <Calendar className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block">Date & Timing</span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {selectedMobileEvent.date?.start || selectedMobileEvent.startDate || 'TBA'}
                        {selectedMobileEvent.date?.end ? ` – ${selectedMobileEvent.date.end}` : ''}
                      </p>
                      {selectedMobileEvent.date?.time && (
                        <p className="text-neutral-500 text-[11px] mt-0.5">{selectedMobileEvent.date.time}</p>
                      )}
                    </div>
                  </div>

                  {/* Hosted By / Organiser */}
                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-neutral-200/60">
                    <Users className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block">Hosted By</span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {selectedMobileEvent.organiser?.name || selectedMobileEvent.hostedBy?.name || 'FestNest Community'}
                      </p>
                      {(selectedMobileEvent.pocEmail || selectedMobileEvent.pocPhone) && (
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          {[selectedMobileEvent.pocEmail, selectedMobileEvent.pocPhone].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Entry Type */}
                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-neutral-200/60">
                    <Globe className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block">Entry & Mode</span>
                      <p className="font-semibold text-neutral-800 mt-0.5 capitalize">
                        {selectedMobileEvent.entryType || selectedMobileEvent.price?.display || 'Free'}
                        {selectedMobileEvent.mode ? ` • ${selectedMobileEvent.mode}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* About / Description snippet if available */}
                {selectedMobileEvent.about && (
                  <div className="space-y-1">
                    <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider block">About Event</span>
                    <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-[11px]">
                      {selectedMobileEvent.about}
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMobileEvent(null);
                      navigate(`/event/${selectedMobileEvent.slug}`);
                    }}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Live Event</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionId.startsWith(selectedMobileEvent._id)}
                    onClick={() => toggleDeactivate(selectedMobileEvent)}
                    className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 border ${
                      selectedMobileEvent.isActive
                        ? 'bg-white hover:bg-amber-50 text-neutral-700 border-neutral-200 hover:border-amber-200 hover:text-amber-700'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedMobileEvent.isActive ? 'Deactivate' : 'Restore'}</span>
                  </button>
                </div>

                {isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionId.startsWith(selectedMobileEvent._id)}
                      onClick={() => handleToggleFeature(selectedMobileEvent)}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 border ${
                        selectedMobileEvent.isFeatured
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedMobileEvent.isFeatured ? 'fill-amber-500' : ''}`} />
                      <span>{selectedMobileEvent.isFeatured ? 'Unfeature' : 'Feature'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionId.startsWith(selectedMobileEvent._id)}
                      onClick={() => {
                        const ev = selectedMobileEvent;
                        setSelectedMobileEvent(null);
                        setDeleteConfirmEvent(ev);
                      }}
                      className="py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 rounded-xl font-semibold text-xs border border-rose-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
