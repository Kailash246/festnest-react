// src/pages/admin/tabs/FeedbackTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Bug, Palette, Lightbulb, Compass, HelpCircle,
  Search, Star, Trash2, ExternalLink, User, Mail, Calendar,
  Globe, X, RefreshCw, AlertCircle, Sparkles, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { admin } from '../../../services/api';

const CATEGORY_META = {
  all:             { label: 'All Feedback',    Icon: MessageSquare, badge: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  bug:             { label: 'Bugs',            Icon: Bug,           badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  ui_ux:           { label: 'UI / UX',         Icon: Palette,       badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  feature_request: { label: 'Feature Ideas',   Icon: Lightbulb,     badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  event_discovery: { label: 'Event Discovery', Icon: Compass,       badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  suggestion:      { label: 'Suggestions',     Icon: MessageSquare, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  other:           { label: 'Other',           Icon: HelpCircle,    badge: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const RATING_EMOJIS = {
  1: { emoji: '😞', label: 'Very poor' },
  2: { emoji: '😕', label: 'Poor' },
  3: { emoji: '😐', label: 'Okay' },
  4: { emoji: '🙂', label: 'Good' },
  5: { emoji: '😍', label: 'Excellent' },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export default function FeedbackTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFeedback = useCallback(async (page = pagination.page, cat = categoryFilter, q = search, s = sort) => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.feedback({
        category: cat === 'all' ? undefined : cat,
        q: q.trim() || undefined,
        sort: s,
        page,
        limit: 15,
      });
      setItems(res.data.feedback || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
      if (res.data.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      setError(err.message || 'Failed to load feedback');
      showToast?.(err.message || 'Failed to load feedback', 'error');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, sort, pagination.page, showToast]);

  useEffect(() => {
    fetchFeedback(1, categoryFilter, search, sort);
  }, [categoryFilter, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeedback(1, categoryFilter, search, sort);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchFeedback(newPage, categoryFilter, search, sort);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;
    setDeletingId(id);
    try {
      await admin.deleteFeedback(id);
      showToast?.('Feedback deleted', 'success');
      if (selectedItem?._id === id) setSelectedItem(null);
      fetchFeedback(pagination.page, categoryFilter, search, sort);
    } catch (err) {
      showToast?.(err.message || 'Failed to delete feedback', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics overview
  const totalCount = counts.all ?? pagination.total ?? 0;
  const bugCount = counts.bug ?? 0;
  const featureCount = counts.feature_request ?? 0;
  const uiuxCount = counts.ui_ux ?? 0;

  return (
    <div className="space-y-5">
      {/* ── Metric Snapshot Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Feedback</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-neutral-900 mt-2">{totalCount}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Across all categories</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Bug Reports</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-neutral-900 mt-2">{bugCount}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Technical & functional</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Feature Ideas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-neutral-900 mt-2">{featureCount}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">User suggestions</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">UI / UX Notes</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-neutral-900 mt-2">{uiuxCount}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Design & usability</div>
        </div>
      </div>

      {/* ── Controls & Filter Bar ── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {Object.entries(CATEGORY_META).map(([id, meta]) => {
            const Icon = meta.Icon;
            const count = counts[id] ?? (id === 'all' ? counts.all : 0);
            const active = categoryFilter === id;
            return (
              <button
                key={id}
                onClick={() => setCategoryFilter(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
                {typeof count === 'number' && (
                  <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Sort, and Refresh Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-neutral-100">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search feedback, email, page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50
                         placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchFeedback(1, categoryFilter, '', sort); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-700
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>

            <button
              onClick={() => fetchFeedback(pagination.page, categoryFilter, search, sort)}
              disabled={loading}
              title="Refresh list"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback List Container ── */}
      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-200/80 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-neutral-200 rounded-md" />
                <div className="h-4 w-16 bg-neutral-200 rounded-md" />
              </div>
              <div className="h-4 w-full bg-neutral-200 rounded-md" />
              <div className="h-4 w-2/3 bg-neutral-200 rounded-md" />
              <div className="h-3 w-40 bg-neutral-200 rounded-md pt-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-neutral-900">Failed to load user feedback</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">{error}</p>
          <button
            onClick={() => fetchFeedback(pagination.page, categoryFilter, search, sort)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-neutral-900 text-base">No feedback found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {search || categoryFilter !== 'all'
              ? 'No feedback matches your current search or category filter. Try clearing filters.'
              : 'Users haven’t submitted any feedback yet. Feedback submitted via the floating button or feedback page will show up here.'}
          </p>
          {(search || categoryFilter !== 'all') && (
            <button
              onClick={() => { setCategoryFilter('all'); setSearch(''); }}
              className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((fb) => {
            const meta = CATEGORY_META[fb.category] || CATEGORY_META.other;
            const CategoryIcon = meta.Icon;
            const ratingInfo = fb.rating ? RATING_EMOJIS[fb.rating] : null;

            return (
              <motion.div
                key={fb._id}
                onClick={() => setSelectedItem(fb)}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 hover:shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Category Badge, Rating, Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${meta.badge}`}>
                      <CategoryIcon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>

                    {ratingInfo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium">
                        <span>{ratingInfo.emoji}</span>
                        <span className="font-bold">{fb.rating}/5</span>
                      </span>
                    )}

                    {fb.page && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-50 text-neutral-500 border border-neutral-200/60 text-[11px] font-mono">
                        <Globe className="w-3 h-3 text-neutral-400" />
                        {fb.page}
                      </span>
                    )}
                  </div>

                  {/* Right: Timestamp & delete action */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-neutral-400 whitespace-nowrap" title={formatDate(fb.createdAt)}>
                      {timeAgo(fb.createdAt)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(fb._id, e)}
                      disabled={deletingId === fb._id}
                      title="Delete entry"
                      className="p-1 rounded-lg text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message preview */}
                <p className="mt-3 text-[13px] text-neutral-800 leading-relaxed font-sans line-clamp-3">
                  {fb.message}
                </p>

                {/* Footer metadata */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-3">
                    {fb.userId ? (
                      <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {fb.userId.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{fb.userId.name}</span>
                        {fb.userId.college && (
                          <span className="text-neutral-400 text-[11px]">({fb.userId.college})</span>
                        )}
                      </div>
                    ) : fb.email ? (
                      <div className="flex items-center gap-1 text-neutral-600">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{fb.email}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Anonymous student</span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-primary group-hover:underline">
                    View details &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs text-neutral-500">
            Showing page <span className="font-semibold text-neutral-800">{pagination.page}</span> of <span className="font-semibold text-neutral-800">{pagination.pages}</span> ({pagination.total} total)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Feedback Detail Modal ── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  {(() => {
                    const meta = CATEGORY_META[selectedItem.category] || CATEGORY_META.other;
                    const Icon = meta.Icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>
                    );
                  })()}
                  {selectedItem.rating && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium">
                      <span>{RATING_EMOJIS[selectedItem.rating]?.emoji}</span>
                      <span className="font-bold">{selectedItem.rating}/5</span>
                      <span className="text-neutral-400 text-[10px]">({RATING_EMOJIS[selectedItem.rating]?.label})</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Feedback Message</h4>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedItem.message}
                  </div>
                </div>

                {/* Submitter Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl border border-neutral-200/80 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Submitter</span>
                    {selectedItem.userId ? (
                      <div>
                        <div className="text-xs font-semibold text-neutral-900">{selectedItem.userId.name}</div>
                        <div className="text-[11px] text-neutral-500">{selectedItem.userId.email}</div>
                        {selectedItem.userId.college && (
                          <div className="text-[10px] text-neutral-400 mt-0.5">{selectedItem.userId.college}</div>
                        )}
                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-primary-light text-primary border border-primary/20">
                          {selectedItem.userId.role}
                        </span>
                      </div>
                    ) : selectedItem.email ? (
                      <div>
                        <div className="text-xs font-semibold text-neutral-800">{selectedItem.email}</div>
                        <span className="text-[10px] text-neutral-400">Unregistered / Logged out</span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">Anonymous (No email provided)</div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200/80 bg-white space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Submitted At</span>
                      <div className="text-xs text-neutral-800 font-medium">{formatDate(selectedItem.createdAt)}</div>
                    </div>
                    {selectedItem.page && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Source Page</span>
                        <div className="text-xs text-neutral-800 font-mono break-all">{selectedItem.page}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debug info */}
                {selectedItem.userAgent && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">User Agent (Diagnostic)</span>
                    <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-mono break-all">
                      {selectedItem.userAgent}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(selectedItem._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Entry
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

