// src/pages/admin/tabs/SubmissionsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, CheckCircle2, XCircle, Eye,
  Star, Trophy, MapPin, Calendar, Users, ExternalLink,
  Clock, AlertCircle, Sparkles, Filter, ChevronDown
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { admin } from '../../../services/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

export default function SubmissionsTab({ showToast, onPreviewSubmission }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [markAsFeatured, setMarkAsFeatured] = useState(false);

  const loadSubmissions = useCallback((status = filter) => {
    setLoading(true);
    admin.submissions({ status, limit: 50 })
      .then(r => setItems(r.data.submissions || []))
      .catch(e => showToast?.(e.message || 'Failed to fetch submissions', 'error'))
      .finally(() => setLoading(false));
  }, [filter, showToast]);

  useEffect(() => {
    loadSubmissions(filter);
  }, [filter, loadSubmissions]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await admin.approveSubmission(id, { isFeatured: markAsFeatured });
      showToast?.(`Event approved and published${markAsFeatured ? ' as Featured' : ''}!`, 'success');
      setMarkAsFeatured(false);
      loadSubmissions(filter);
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      showToast?.(e.message || 'Approval failed', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      showToast?.('Please provide a reason for rejecting this submission', 'error');
      return;
    }
    setActionLoading(id + '-reject');
    try {
      await admin.rejectSubmission(id, rejectReason.trim());
      showToast?.('Submission rejected', 'info');
      setRejectReason('');
      setRejectingId(null);
      loadSubmissions(filter);
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      showToast?.(e.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const filteredItems = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.eventName?.toLowerCase().includes(q) ||
      item.college?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.submittedBy?.name?.toLowerCase().includes(q) ||
      item.submittedBy?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Submissions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setExpandedId(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search event, college, user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading submissions...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <ClipboardList className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No {filter !== 'all' ? filter : ''} submissions found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search criteria.' : `There are currently no events with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const isExpanded = expandedId === item._id;
            const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConf.icon;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-sm overflow-hidden transition-all"
              >
                {/* Main Card Summary */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.bannerImage?.url ? (
                        <img src={item.bannerImage.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ClipboardList className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-neutral-900 truncate">{item.eventName}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${statusConf.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                        {item.eventType && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600 uppercase tracking-wider">
                            {item.eventType}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {item.college}{item.city ? `, ${item.city}` : ''}
                        </span>
                        {item.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            {item.startDate}
                          </span>
                        )}
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-500 font-medium">
                          By: {item.submittedBy?.name || 'User'}
                        </span>
                      </div>

                      {/* Chips */}
                      <div className="flex items-center gap-2 mt-2">
                        {item.isPaid && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            ₹{item.entryFee} Entry
                          </span>
                        )}
                        {item.hasPrize && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            Prize Pool
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right quick actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewSubmission?.(item);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-500" />
                      Preview
                    </button>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details & Review Actions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 space-y-4"
                    >
                      {/* Description */}
                      {item.about && (
                        <div>
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                            Event Description
                          </h5>
                          <p className="text-xs text-neutral-700 leading-relaxed bg-white p-3 rounded-xl border border-neutral-200/60">
                            {item.about}
                          </p>
                        </div>
                      )}

                      {/* Logistics details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                          <span className="text-neutral-400 text-[11px] block">Venue</span>
                          <span className="font-semibold text-neutral-800">{item.venue || 'Campus Venue'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                          <span className="text-neutral-400 text-[11px] block">Team Size</span>
                          <span className="font-semibold text-neutral-800">{item.teamSize || 'Solo / Open'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                          <span className="text-neutral-400 text-[11px] block">Submitter Email</span>
                          <span className="font-semibold text-neutral-800 truncate block">{item.submittedBy?.email || '—'}</span>
                        </div>
                      </div>

                      {/* Registration URL */}
                      {item.registrationUrl && (
                        <div className="flex items-center gap-2 text-xs bg-white p-2.5 rounded-xl border border-neutral-200/60">
                          <span className="text-neutral-400 font-medium">External Registration Link:</span>
                          <a
                            href={item.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 truncate"
                          >
                            {item.registrationUrl}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      )}

                      {/* Actions for Pending Submissions */}
                      {item.status === 'pending' && (
                        <div className="pt-2 border-t border-neutral-200/80 space-y-3">
                          {isSuperAdmin && (
                            <label className="flex items-center gap-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl cursor-pointer">
                              <input
                                type="checkbox"
                                checked={markAsFeatured}
                                onChange={e => setMarkAsFeatured(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-neutral-300 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                Feature this event immediately on homepage & feeds upon approval
                              </span>
                            </label>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(item._id)}
                              disabled={actionLoading === item._id + '-approve'}
                              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {actionLoading === item._id + '-approve' ? (
                                <span>Publishing...</span>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve & Publish Live</span>
                                </>
                              )}
                            </button>

                            {rejectingId === item._id ? (
                              <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2">
                                <input
                                  type="text"
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                  placeholder="Reason for rejection (sent to organizer)..."
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-xl outline-none focus:ring-2 focus:ring-rose-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleReject(item._id)}
                                  disabled={actionLoading === item._id + '-reject'}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition flex items-center justify-center gap-1"
                                >
                                  Confirm Rejection
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 rounded-xl transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRejectingId(item._id)}
                                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject Submission
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

