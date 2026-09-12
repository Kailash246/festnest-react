// src/pages/admin/tabs/EventsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Search, Plus, Star, Eye, Trash2,
  RefreshCw, Power, ExternalLink, MapPin, Calendar,
  BarChart2, Filter, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  'All Categories', 'Tech', 'Cultural', 'Sports', 'Business', 'Workshop', 'Gaming', 'Arts', 'Academic', 'Music'
];

export default function EventsTab({ showToast, onOpenCreate }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [actionId, setActionId] = useState('');
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);

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

  const toggleDeactivate = async (ev) => {
    const isDeactivating = ev.isActive;
    setActionId(ev._id + '-toggle');
    try {
      if (isDeactivating) {
        await admin.deleteEvent(ev._id);
        showToast?.(`"${ev.name}" deactivated`, 'info');
      } else {
        await admin.restoreEvent(ev._id);
        showToast?.(`"${ev.name}" restored and live`, 'success');
      }
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
      await admin.featureEvent(ev._id, !ev.isFeatured);
      showToast?.(
        !ev.isFeatured ? `"${ev.name}" marked as Featured` : `"${ev.name}" removed from Featured`,
        'success'
      );
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
      showToast?.(`"${deleteConfirmEvent.name}" permanently deleted`, 'info');
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
        message={`Are you sure you want to completely erase "${deleteConfirmEvent?.name}"? All registrations, analytics, and associated records will be permanently destroyed. This cannot be undone.`}
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

      {/* Events Table / Responsive Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading events directory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <CalendarDays className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No events found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or publish a new event.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">College & Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Registrations</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {items.map(ev => {
                  const isActing = actionId.startsWith(ev._id);
                  return (
                    <tr
                      key={ev._id}
                      className={`hover:bg-neutral-50/70 transition-colors ${!ev.isActive ? 'opacity-60 bg-neutral-50/40' : ''}`}
                    >
                      {/* Name & Emoji */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-base flex-shrink-0">
                            {ev.emoji || '🎯'}
                          </span>
                          <div className="min-w-0 max-w-[220px]">
                            <span className="font-bold text-neutral-900 block truncate" title={ev.name}>
                              {ev.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono block truncate">
                              /{ev.slug}
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Live */}
                          <button
                            type="button"
                            onClick={() => navigate(`/event/${ev.slug}`)}
                            title="View public event page"
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 transition"
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
                              className={`p-1.5 rounded-lg transition ${
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
                            className={`p-1.5 rounded-lg transition ${
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
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

