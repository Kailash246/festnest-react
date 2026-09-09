// src/pages/organizer/tabs/EventsTab.jsx
import React, { useState, useMemo } from 'react';
import { SHOW_ENGAGEMENT_ANALYTICS } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Layers,
  Copy,
  PenSquare,
  ChevronDown,
  Info,
  Tag,
  IndianRupee,
} from 'lucide-react';

const STATUS_CONFIG = {
  all:      { label: 'All Events',   icon: Filter,       cls: 'bg-surface-2 text-text-2 border-border' },
  approved: { label: 'Live',         icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:  { label: 'Under Review', icon: Clock,        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejected: { label: 'Rejected',     icon: XCircle,      cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function EventsTab({
  events = [],
  navigate,
  onInspectEvent,
  onOpenCompetitions,
  showToast,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'oldest' | 'views' | 'regs'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(events.map(e => e.eventType || 'Other'));
    return ['all', ...Array.from(set)];
  }, [events]);

  // Counts by status
  const counts = useMemo(() => ({
    all:      events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending:  events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  }), [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events
      .filter(ev => {
        if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && (ev.eventType || 'Other') !== categoryFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const nameMatch = ev.eventName?.toLowerCase().includes(q);
          const collegeMatch = ev.college?.toLowerCase().includes(q);
          const cityMatch = ev.city?.toLowerCase().includes(q);
          const typeMatch = ev.eventType?.toLowerCase().includes(q);
          if (!nameMatch && !collegeMatch && !cityMatch && !typeMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sortBy === 'views') {
          const vA = a.linkedEvent?.stats?.viewCount || 0;
          const vB = b.linkedEvent?.stats?.viewCount || 0;
          return vB - vA;
        }
        if (sortBy === 'regs') {
          const rA = a.linkedEvent?.stats?.registrationCount || a.registrationCount || 0;
          const rB = b.linkedEvent?.stats?.registrationCount || b.registrationCount || 0;
          return rB - rA;
        }
        return 0;
      });
  }, [events, statusFilter, categoryFilter, search, sortBy]);

  const copyLink = async (url) => {
    if (!url || url === '#') {
      showToast?.('No registration link provided', 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast?.('Link copied to clipboard!', 'success');
    } catch {
      showToast?.('Failed to copy link', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Control Header: Search, Filters & View Toggle ── */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event name, college, or city…"
              className="w-full pl-9 pr-4 py-2 bg-surface-1 border border-border rounded-xl text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-4"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-4 hover:text-text-2 bg-surface-2 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Controls: Sort & View Mode Switch */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort events"
              className="px-3 py-2 bg-surface-1 border border-border rounded-xl text-[12px] font-semibold text-text-2 outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              {SHOW_ENGAGEMENT_ANALYTICS && (
                <>
                  <option value="views">Most Views</option>
                  <option value="regs">Most Registrations</option>
                </>
              )}
            </select>

            {/* View switcher */}
            <div className="flex items-center p-0.5 bg-surface-1 border border-border rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-2xs' : 'text-text-4 hover:text-text-2'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-primary shadow-2xs' : 'text-text-4 hover:text-text-2'
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/70">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'approved', 'pending', 'rejected'].map(st => {
              const cfg = STATUS_CONFIG[st];
              const Icon = cfg.icon;
              const isActive = statusFilter === st;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-text-2 border-border hover:border-primary/40'
                  }`}
                >
                  <Icon size={12} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{cfg.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-3'
                    }`}
                  >
                    {counts[st]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-text-4 font-medium hidden sm:inline">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-[12px] font-medium text-text-2 outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Events Listing: Empty State / Grid / Table ── */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-border shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h3 className="font-heading font-bold text-[16px] text-text-1">No matching events found</h3>
          <p className="text-[13px] text-text-3 mt-1 max-w-sm mx-auto leading-relaxed">
            {search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try resetting your search or filter options to see all hosted events.'
              : 'You have not submitted any events yet. Get started by posting your first event.'}
          </p>
          {(search || statusFilter !== 'all' || categoryFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text-1 rounded-xl text-[12px] font-bold transition-all"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => navigate('/host')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Post Your First Event
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(ev => {
            const statusCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;
            const views = ev.linkedEvent?.stats?.viewCount || 0;
            const regs = ev.linkedEvent?.stats?.registrationCount || ev.registrationCount || 0;

            return (
              <div
                key={ev._id}
                className="bg-white border border-border hover:border-primary/40 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusCfg.cls}`}>
                      <StatusIcon size={11} strokeWidth={2.2} />
                      {statusCfg.label}
                    </span>
                    <span className="font-mono text-[11px] text-text-4 font-medium">
                      {new Date(ev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Banner & Title */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {ev.bannerImage?.url ? (
                      <img
                        src={ev.bannerImage.url}
                        alt={ev.eventName}
                        className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary-light text-primary font-bold text-[18px] flex items-center justify-center flex-shrink-0 border border-primary/20">
                        {ev.eventName?.[0]?.toUpperCase() || 'E'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => onInspectEvent(ev)}
                        className="font-heading font-bold text-[15px] text-text-1 leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2"
                      >
                        {ev.eventName}
                      </h4>
                      <p className="text-[12px] text-text-3 truncate mt-0.5">{ev.college}</p>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-1 p-3 rounded-xl border border-border mb-4">
                    <div className="flex items-center gap-1.5 text-text-3 truncate">
                      <Calendar size={12} className="text-text-4 flex-shrink-0" />
                      <span className="truncate">{ev.startDate || 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-3 truncate">
                      <MapPin size={12} className="text-text-4 flex-shrink-0" />
                      <span className="truncate">{ev.city || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-3 truncate">
                      <Tag size={12} className="text-text-4 flex-shrink-0" />
                      <span className="truncate font-semibold text-primary">{ev.eventType || 'Event'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-3 truncate">
                      <IndianRupee size={12} className="text-text-4 flex-shrink-0" />
                      <span className="truncate">{ev.isPaid ? `₹${ev.entryFee}` : 'Free Entry'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metrics & Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  {SHOW_ENGAGEMENT_ANALYTICS ? (
                    <div className="flex items-center gap-3 text-[11px] text-text-3 font-mono">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye size={12} className="text-text-4" /> {views}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-text-1" title="Registrations">
                        <Users size={12} className="text-text-4" /> {regs}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-4 font-mono">
                      {ev.city || ev.mode || 'Campus'}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {ev.status === 'approved' && linkedId && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/event/${linkedId}`)}
                          className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="View live page"
                        >
                          <ExternalLink size={11} />
                          Live
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCompetitions(ev)}
                          className="px-2.5 py-1 rounded-lg bg-primary-light text-primary hover:bg-primary-light/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Manage sub-events"
                        >
                          <Layers size={11} />
                          Tracks
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onInspectEvent(ev)}
                      className="px-2.5 py-1 rounded-lg border border-border text-text-2 hover:border-primary/40 hover:text-text-1 text-[11px] font-semibold transition-colors"
                    >
                      Details
                    </button>

                    {ev.registrationUrl && (
                      <button
                        type="button"
                        onClick={() => copyLink(ev.registrationUrl)}
                        className="p-1 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                        title="Copy link"
                      >
                        <Copy size={13} />
                      </button>
                    )}

                    {ev.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => navigate('/host')}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <PenSquare size={11} />
                        Resubmit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-surface-1 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-4 select-none">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Date</th>
                  {SHOW_ENGAGEMENT_ANALYTICS && (
                    <>
                      <th className="py-3.5 px-3">Views</th>
                      <th className="py-3.5 px-3">Regs</th>
                    </>
                  )}
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map(ev => {
                  const statusCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;
                  const views = ev.linkedEvent?.stats?.viewCount || 0;
                  const regs = ev.linkedEvent?.stats?.registrationCount || ev.registrationCount || 0;

                  return (
                    <tr key={ev._id} className="hover:bg-surface-1/70 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onInspectEvent(ev)}
                          className="flex items-center gap-2.5 cursor-pointer max-w-[240px]"
                        >
                          {ev.bannerImage?.url ? (
                            <img
                              src={ev.bannerImage.url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                              {ev.eventName?.[0] || 'E'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-text-1 truncate hover:text-primary transition-colors">
                              {ev.eventName}
                            </div>
                            <div className="text-[11px] text-text-4 truncate">{ev.college}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}>
                          <StatusIcon size={10} strokeWidth={2.2} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-2 font-medium whitespace-nowrap">
                        {ev.eventType || 'Event'}
                      </td>
                      <td className="py-3 px-3 font-mono text-text-3 whitespace-nowrap">
                        {ev.startDate || 'TBA'}
                      </td>
                      {SHOW_ENGAGEMENT_ANALYTICS && (
                        <>
                          <td className="py-3 px-3 font-mono text-text-3 whitespace-nowrap">
                            {views}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-text-1 whitespace-nowrap">
                            {regs}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {ev.status === 'approved' && linkedId && (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/event/${linkedId}`)}
                                className="p-1.5 rounded-lg text-text-3 hover:text-primary hover:bg-surface-2 transition-colors"
                                title="View live page"
                              >
                                <ExternalLink size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenCompetitions(ev)}
                                className="px-2 py-1 rounded-md bg-primary-light text-primary text-[11px] font-semibold hover:bg-primary-light/80 transition-colors flex items-center gap-1"
                                title="Manage tracks"
                              >
                                <Layers size={11} /> Tracks
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => onInspectEvent(ev)}
                            className="px-2 py-1 rounded-md border border-border text-text-2 hover:text-text-1 text-[11px] font-semibold transition-colors"
                          >
                            Details
                          </button>
                          {ev.registrationUrl && (
                            <button
                              type="button"
                              onClick={() => copyLink(ev.registrationUrl)}
                              className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                              title="Copy URL"
                            >
                              <Copy size={13} />
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

