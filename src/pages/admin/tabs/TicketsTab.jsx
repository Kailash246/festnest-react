// src/pages/admin/tabs/TicketsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Search, CheckCircle2, Clock, AlertCircle,
  ChevronDown, Send, MessageSquare, User, Mail, Calendar,
  ArrowRight
} from 'lucide-react';
import { admin } from '../../../services/api';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function TicketsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionId, setActionId] = useState('');

  const loadTickets = useCallback((status = filter) => {
    setLoading(true);
    admin.tickets({ status, limit: 50 })
      .then(r => setItems(r.data.tickets || []))
      .catch(e => showToast?.(e.message || 'Failed to fetch tickets', 'error'))
      .finally(() => setLoading(false));
  }, [filter, showToast]);

  useEffect(() => {
    loadTickets(filter);
  }, [filter, loadTickets]);

  useEffect(() => {
    setAdminNote('');
  }, [selectedTicketId]);

  const updateTicketStatus = async (id, status) => {
    if (status === 'resolved' && !adminNote.trim()) {
      showToast?.('A response message is required to resolve a ticket', 'error');
      return;
    }
    setActionId(id + status);
    try {
      await admin.updateTicket(id, { status, adminNote: adminNote.trim() });
      showToast?.(`Ticket #${id.slice(-6).toUpperCase()} marked as ${status.replace('_', ' ')}`, 'success');
      setAdminNote('');
      loadTickets(filter);
      setSelectedTicketId(null);
    } catch (e) {
      showToast?.(e.message || 'Failed to update ticket status', 'error');
    } finally {
      setActionId('');
    }
  };

  const filteredItems = items.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.message?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      (t.user?.name && t.user.name.toLowerCase().includes(q)) ||
      t._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setSelectedTicketId(null); }}
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

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets by subject, user, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
      </div>

      {/* Tickets Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading support tickets...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No {filter.replace('_', ' ')} tickets</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search criteria.' : `Inbox zero for "${filter.replace('_', ' ')}" tickets!`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(t => {
            const isExpanded = selectedTicketId === t._id;
            const statusConf = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;

            return (
              <div
                key={t._id}
                className="bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-sm overflow-hidden transition-all"
              >
                {/* Header */}
                <div
                  onClick={() => setSelectedTicketId(isExpanded ? null : t._id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center flex-shrink-0 text-neutral-600">
                      <Ticket className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-neutral-400">
                          #{t._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                        {t.user?.role && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {t.user.role === 'organizer' ? 'Organizer' : t.user.role === 'admin' ? 'Admin' : 'Student'}
                          </span>
                        )}
                        {!t.user && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            Guest
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 mt-1 truncate">
                        {t.subject}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                        <span className="font-medium text-neutral-700">{t.user?.name || t.name}</span>
                        <span>·</span>
                        <span className="text-neutral-400">{t.email}</span>
                        {t.createdAt && (
                          <>
                            <span>·</span>
                            <span className="text-neutral-400">
                              {new Date(t.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      {isExpanded ? 'Hide' : 'View Thread'}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                {/* Expanded Thread and Response */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 space-y-4"
                    >
                      {/* User's original message */}
                      <div>
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          User Inquiry
                        </div>
                        <div className="text-xs text-neutral-700 bg-white p-3.5 rounded-xl border border-neutral-200/80 leading-relaxed">
                          {t.message}
                        </div>
                      </div>

                      {/* Reply Thread */}
                      {t.replies?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                            Admin Replies ({t.replies.length})
                          </div>
                          <div className="space-y-2">
                            {t.replies.map((reply, idx) => (
                              <div
                                key={idx}
                                className="bg-indigo-50/80 border border-indigo-100 p-3.5 rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] text-indigo-900 font-bold">
                                  <span>{reply.name || 'FestNest Support'}</span>
                                  <span className="text-neutral-400 font-normal">
                                    {new Date(reply.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-indigo-950 leading-relaxed">{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Response Composer */}
                      <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-bold text-neutral-600 uppercase tracking-wider">
                            Compose Response / Resolution Note
                          </label>
                          {t.status !== 'resolved' && (
                            <span className="text-rose-600 font-semibold">* required to resolve</span>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Write your reply or resolution note to the user..."
                          className="w-full text-xs p-3 bg-white border border-neutral-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {t.status !== 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => updateTicketStatus(t._id, 'in_progress')}
                              disabled={actionId === t._id + 'in_progress'}
                              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-xl transition"
                            >
                              Mark In Progress
                            </button>
                          )}

                          {t.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => updateTicketStatus(t._id, 'resolved')}
                              disabled={actionId === t._id + 'resolved'}
                              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resolve & Send Response
                            </button>
                          )}

                          {t.status !== 'open' && (
                            <button
                              type="button"
                              onClick={() => updateTicketStatus(t._id, 'open')}
                              disabled={actionId === t._id + 'open'}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                            >
                              Reopen Ticket
                            </button>
                          )}
                        </div>
                      </div>
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

