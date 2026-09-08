// src/pages/admin/tabs/AmbassadorsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Search, CheckCircle2, XCircle, Clock, Eye,
  Building, MapPin, Mail, Phone, Calendar, ArrowRight,
  ShieldCheck, AlertCircle, RefreshCw, Sparkles, User, ExternalLink,
  ChevronRight, Filter, Plus, Edit3
} from 'lucide-react';
import { admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_CONFIG = {
  applied:   { label: 'Applied', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  screening: { label: 'Screening', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sparkles },
  approved:  { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected:  { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

const TIER_COLORS = {
  Bronze:      'bg-amber-50 text-amber-800 border-amber-200',
  Silver:      'bg-slate-100 text-slate-700 border-slate-300',
  Gold:        'bg-yellow-50 text-yellow-800 border-yellow-300',
  'City Lead': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
};

export default function AmbassadorsTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  // Modals & drawers
  const [selectedCA, setSelectedCA] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmApproveCA, setConfirmApproveCA] = useState(null);
  const [rejectingCA, setRejectingCA] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Manual adjustment state inside drawer
  const [adjusting, setAdjusting] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    organizersOnboarded: 0,
    eventsSourced: 0,
    referralSignups: 0,
    reason: '',
  });

  const loadAmbassadors = useCallback(() => {
    setLoading(true);
    admin.ambassadors({ status: statusFilter, q: search.trim(), sort, limit: 100 })
      .then((res) => {
        setItems(res.data.ambassadors || []);
        if (res.data.counts) setCounts(res.data.counts);
      })
      .catch((e) => showToast?.(e.message || 'Failed to fetch ambassadors', 'error'))
      .finally(() => setLoading(false));
  }, [statusFilter, search, sort, showToast]);

  useEffect(() => {
    const t = setTimeout(loadAmbassadors, 250);
    return () => clearTimeout(t);
  }, [loadAmbassadors]);

  const openDetail = async (ca) => {
    setSelectedCA(ca);
    setDetailLoading(true);
    setAdjusting(false);
    try {
      const res = await admin.getAmbassador(ca._id);
      setSelectedCA({ ...res.data.ambassador, computedStats: res.data.stats });
      setAdjustForm({
        organizersOnboarded: res.data.ambassador.adjustments?.organizersOnboarded || 0,
        eventsSourced: res.data.ambassador.adjustments?.eventsSourced || 0,
        referralSignups: res.data.ambassador.adjustments?.referralSignups || 0,
        reason: '',
      });
    } catch (e) {
      showToast?.(e.message || 'Failed to load details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirmApproveCA) return;
    const caId = confirmApproveCA._id;
    setActionLoading(true);
    try {
      const res = await admin.approveAmbassador(caId);
      showToast?.(`Approved ${confirmApproveCA.name}! Official ID: ${res.data.ambassador.caId}`, 'success');
      showToast?.(`Approved ${confirmApproveCA.name}! Official ID: ${res.data?.ambassador?.caId || res.data?.caId || 'Assigned'}`, 'success');
      setConfirmApproveCA(null);
      if (selectedCA?._id === caId) {
        setSelectedCA(res.data.ambassador);
      }
      loadAmbassadors();
    } catch (e) {
      showToast?.(e.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingCA) return;
    if (!rejectReason.trim()) {
      showToast?.('Please specify a rejection reason', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await admin.rejectAmbassador(rejectingCA._id, rejectReason.trim());
      showToast?.('Application rejected', 'info');
      setRejectingCA(null);
      setRejectReason('');
      if (selectedCA?._id === rejectingCA._id) {
        setSelectedCA((prev) => ({ ...prev, status: 'rejected', rejectionReason: rejectReason.trim() }));
      }
      loadAmbassadors();
    } catch (e) {
      showToast?.(e.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedCA) return;
    setActionLoading(true);
    try {
      const res = await admin.updateAmbassadorStatus(selectedCA._id, {
        status: newStatus,
        notes: `Status changed to ${newStatus} by admin`,
      });
      showToast?.(`Status changed to ${newStatus}`, 'success');
      setSelectedCA(res.data.ambassador);
      loadAmbassadors();
    } catch (e) {
      showToast?.(e.message || 'Status change failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustForm.reason.trim()) {
      showToast?.('An audit reason is required for manual metric adjustment', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await admin.adjustAmbassadorStats(selectedCA._id, adjustForm);
      showToast?.('Ambassador metrics adjusted with audit record', 'success');
      setSelectedCA({ ...res.data.ambassador, computedStats: res.data.stats });
      setAdjusting(false);
      loadAmbassadors();
    } catch (e) {
      showToast?.(e.message || 'Adjustment failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500">Total Applications</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{counts.all}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm">
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <Clock size={13} />
            Pending Review
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{counts.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Approved CAs
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{counts.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm">
          <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <XCircle size={13} />
            Rejected
          </span>
          <div className="text-2xl font-bold text-rose-900 mt-1">{counts.rejected}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg overflow-x-auto text-xs font-semibold text-neutral-600">
          {[
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'all', label: 'All', count: counts.all },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-900 shadow-sm font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70 bg-neutral-200/80 px-1.5 py-0.2 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, college, city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Ambassadors Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-indigo-600" />
            Loading ambassador records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            No campus ambassador applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50/80 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">College &amp; City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tier / ID</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {items.map((ca) => {
                  const statusConf = STATUS_CONFIG[ca.status] || STATUS_CONFIG.applied;
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr key={ca._id} className="hover:bg-neutral-50/60 transition group">
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900">{ca.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{ca.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800">{ca.college}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          <span>{ca.city}</span>
                          <span className="opacity-60">· {ca.course}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.color}`}
                        >
                          <StatusIcon size={11} />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {ca.status === 'approved' ? (
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                TIER_COLORS[ca.tier] || TIER_COLORS.Bronze
                              }`}
                            >
                              {ca.tier}
                            </span>
                            <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                              {ca.caId}
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-neutral-500 whitespace-nowrap">
                        {new Date(ca.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetail(ca)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition"
                          >
                            Review
                          </button>
                          {ca.status !== 'approved' && (
                            <button
                              onClick={() => setConfirmApproveCA(ca)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
                            >
                              Approve
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
        )}
      </div>

      {/* Review Drawer / Modal */}
      <AnimatePresence>
        {selectedCA && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCA(null)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">{selectedCA.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        STATUS_CONFIG[selectedCA.status]?.color
                      }`}
                    >
                      {STATUS_CONFIG[selectedCA.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {selectedCA.college} · {selectedCA.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCA(null)}
                  className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-700">
                {/* Contact & College Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Email</span>
                    <div className="font-mono text-neutral-900 mt-0.5">{selectedCA.email}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Phone</span>
                    <div className="font-mono text-neutral-900 mt-0.5">{selectedCA.phone}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Course &amp; Year</span>
                    <div className="text-neutral-900 mt-0.5">{selectedCA.course} ({selectedCA.year || 'N/A'})</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">Social / Handle</span>
                    <div className="text-neutral-900 mt-0.5">{selectedCA.instagram || 'None provided'}</div>
                  </div>
                </div>

                {/* Essay / Reason */}
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                    Why they want to be a FestNest CA
                  </h4>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-neutral-800 leading-relaxed italic">
                    "{selectedCA.why}"
                  </div>
                </div>

                {/* If Approved: Credentials & Derived Platform Stats */}
                {selectedCA.status === 'approved' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                      Credentials &amp; Impact Stats
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-400 font-semibold block">CA ID</span>
                        <span className="font-mono font-bold text-indigo-600 text-sm">
                          {selectedCA.caId}
                        </span>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-400 font-semibold block">REFERRAL CODE</span>
                        <span className="font-mono font-bold text-neutral-800 text-sm">
                          {selectedCA.referralCode}
                        </span>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-400 font-semibold block">TIER</span>
                        <span className="font-bold text-amber-700 text-sm">{selectedCA.tier}</span>
                      </div>
                    </div>

                    {/* Derived Real Stats */}
                    {selectedCA.computedStats && (
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                        <div className="font-semibold text-emerald-900 text-xs flex items-center justify-between">
                          <span>Verified Platform Impact</span>
                          <span className="font-mono text-[10px] text-emerald-700 font-bold">LIVE METRICS</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                          <div>
                            <div className="font-bold text-lg text-emerald-950 font-mono">
                              {selectedCA.computedStats.organizersOnboarded}
                            </div>
                            <div className="text-[10px] text-emerald-700">Organizers</div>
                          </div>
                          <div>
                            <div className="font-bold text-lg text-emerald-950 font-mono">
                              {selectedCA.computedStats.eventsSourced}
                            </div>
                            <div className="text-[10px] text-emerald-700">Events Sourced</div>
                          </div>
                          <div>
                            <div className="font-bold text-lg text-emerald-950 font-mono">
                              {selectedCA.computedStats.referralSignups}
                            </div>
                            <div className="text-[10px] text-emerald-700">Student Signups</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Adjustment Accordion */}
                    <div className="border border-neutral-200 rounded-xl p-3">
                      <button
                        onClick={() => setAdjusting(!adjusting)}
                        className="w-full flex items-center justify-between text-left font-semibold text-neutral-700"
                      >
                        <span className="flex items-center gap-1.5">
                          <Edit3 size={13} />
                          <span>Audit-Tracked Metric Adjustments</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">{adjusting ? 'Hide' : 'Configure'}</span>
                      </button>

                      {adjusting && (
                        <form onSubmit={handleSaveAdjustment} className="mt-3 space-y-3 pt-3 border-t border-neutral-100">
                          <p className="text-[11px] text-neutral-500">
                            Adjustments add on top of verified platform metrics. All adjustments require an audit note.
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-neutral-500">Organizers +</label>
                              <input
                                type="number"
                                value={adjustForm.organizersOnboarded}
                                onChange={(e) =>
                                  setAdjustForm({ ...adjustForm, organizersOnboarded: Number(e.target.value) })
                                }
                                className="w-full mt-1 p-1.5 rounded border border-neutral-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-neutral-500">Events +</label>
                              <input
                                type="number"
                                value={adjustForm.eventsSourced}
                                onChange={(e) =>
                                  setAdjustForm({ ...adjustForm, eventsSourced: Number(e.target.value) })
                                }
                                className="w-full mt-1 p-1.5 rounded border border-neutral-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-neutral-500">Signups +</label>
                              <input
                                type="number"
                                value={adjustForm.referralSignups}
                                onChange={(e) =>
                                  setAdjustForm({ ...adjustForm, referralSignups: Number(e.target.value) })
                                }
                                className="w-full mt-1 p-1.5 rounded border border-neutral-200 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-neutral-500">Mandatory Audit Reason *</label>
                            <input
                              required
                              type="text"
                              value={adjustForm.reason}
                              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                              placeholder="e.g. Sourced 2 offline campus fests directly verified with club president"
                              className="w-full mt-1 p-1.5 rounded border border-neutral-200 text-xs"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-2 bg-neutral-900 text-white font-semibold rounded-lg text-xs hover:bg-neutral-800 transition"
                          >
                            Save Adjustments with Audit Log
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit History Log */}
                {selectedCA.auditLog && selectedCA.auditLog.length > 0 && (
                  <div>
                    <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-2">
                      Application History &amp; Audit Trail
                    </h4>
                    <div className="space-y-2 border-l-2 border-neutral-200 pl-3">
                      {selectedCA.auditLog.map((log, idx) => (
                        <div key={idx} className="relative pb-2">
                          <div className="font-semibold text-neutral-800 capitalize flex items-center gap-1.5">
                            <span>{log.action}</span>
                            <span className="text-[10px] font-normal text-neutral-400">by {log.byName || 'System'}</span>
                          </div>
                          {log.notes && (
                            <p className="text-[11px] text-neutral-600 mt-0.5">{log.notes}</p>
                          )}
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            {new Date(log.date).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2">
                {selectedCA.status === 'applied' && (
                  <button
                    onClick={() => handleStatusChange('screening')}
                    disabled={actionLoading}
                    className="px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold rounded-lg text-xs transition"
                  >
                    Move to Screening
                  </button>
                )}

                {selectedCA.status !== 'approved' && (
                  <button
                    onClick={() => setConfirmApproveCA(selectedCA)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition ml-auto"
                  >
                    Approve Application
                  </button>
                )}

                {selectedCA.status !== 'rejected' && (
                  <button
                    onClick={() => setRejectingCA(selectedCA)}
                    disabled={actionLoading}
                    className="px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold rounded-lg text-xs transition"
                  >
                    Reject
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog: Approve */}
      <ConfirmDialog
        isOpen={!!confirmApproveCA}
        title={`Approve ${confirmApproveCA?.name}?`}
        message={`This will approve ${confirmApproveCA?.name} as an official Campus Ambassador for ${confirmApproveCA?.college}. The system will generate their official ID, referral code, and 2-year validity.`}
        confirmText="Confirm Approval"
        confirmVariant="primary"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setConfirmApproveCA(null)}
      />

      {/* Modal: Reject with Reason */}
      {rejectingCA && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              Reject Application for {rejectingCA.name}
            </h3>
            <p className="text-xs text-neutral-500">
              Please specify a reason. This will be recorded in the audit log and visible on the applicant's status screen.
            </p>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete application or not currently enrolled at selected college"
              className="w-full p-2.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => { setRejectingCA(null); setRejectReason(''); }}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

