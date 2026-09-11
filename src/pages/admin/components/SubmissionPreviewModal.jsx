// src/pages/admin/components/SubmissionPreviewModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  User,
  Phone,
  Mail,
  FileText,
  Building,
} from 'lucide-react';

export default function SubmissionPreviewModal({
  sub,
  onClose,
  onApprove,
  onReject,
  actionLoading,
  isSuperAdmin,
}) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [markFeatured, setMarkFeatured] = useState(false);

  if (!sub) return null;

  const entryLabel = sub.isPaid
    ? `₹${sub.entryFee} Entry`
    : sub.hasPrize
    ? 'Prize Pool'
    : 'Free Entry';

  const entryBadgeStyle = sub.isPaid
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : sub.hasPrize
    ? 'bg-indigo-50 text-primary border-indigo-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const handleApprove = () => {
    onApprove(sub._id, { isFeatured: markFeatured });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(sub._id, rejectReason.trim());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          className="relative w-full max-w-2xl bg-white rounded-2xl border border-border shadow-2xl overflow-hidden z-10 max-h-[92dvh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative h-48 sm:h-56 bg-surface-3 flex items-center justify-center overflow-hidden flex-shrink-0">
            {sub.bannerImage?.url ? (
              <img
                src={sub.bannerImage.url}
                alt={sub.eventName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/90 to-purple-900/90 flex flex-col items-center justify-center text-white/40">
                <FileText size={48} strokeWidth={1.5} />
                <span className="text-[12px] font-semibold mt-2">No banner provided</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Status & Category Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                {sub.eventType || 'Event'}
              </span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border backdrop-blur-md ${entryBadgeStyle}`}>
                {entryLabel}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            {/* Title on Banner */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="font-heading font-black text-[22px] sm:text-[26px] text-white leading-tight drop-shadow-md">
                {sub.eventName}
              </h2>
              <p className="text-white/80 text-[13px] font-medium drop-shadow-sm mt-0.5">
                {sub.college} • {sub.city}
              </p>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-text-3 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Calendar size={13} className="text-primary" /> Start Date
                </div>
                <div className="font-bold text-text-1 text-[13px]">{sub.startDate || 'TBA'}</div>
                {sub.endDate && <div className="text-[11px] text-text-3">to {sub.endDate}</div>}
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-text-3 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <MapPin size={13} className="text-primary" /> Venue
                </div>
                <div className="font-bold text-text-1 text-[13px] truncate">{sub.venue || 'Campus'}</div>
                <div className="text-[11px] text-text-3">{sub.mode || 'In-Person'}</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-text-3 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Users size={13} className="text-primary" /> Team Size
                </div>
                <div className="font-bold text-text-1 text-[13px]">{sub.teamSize || 'Open'}</div>
                <div className="text-[11px] text-text-3">per registration</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-1.5 text-text-3 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Trophy size={13} className="text-primary" /> Prize Pool
                </div>
                <div className="font-bold text-text-1 text-[13px] truncate">
                  {sub.totalPrize ? `₹${sub.totalPrize}` : sub.hasPrize ? 'Available' : 'None'}
                </div>
                <div className="text-[11px] text-text-3">{sub.prizeDetails || 'Winnings'}</div>
              </div>
            </div>

            {/* Description */}
            {sub.about && (
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-4 mb-2">
                  Event Description
                </h4>
                <div className="p-4 rounded-xl border border-border bg-surface-1 text-[13px] text-text-2 leading-relaxed whitespace-pre-line">
                  {sub.about}
                </div>
              </div>
            )}

            {/* Prizes breakdown if available */}
            {(sub.prize1 || sub.prize2 || sub.prize3) && (
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-4 mb-2">
                  Prizes Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {sub.prize1 && (
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 text-center">
                      <div className="text-[11px] font-bold text-amber-800">1st Place</div>
                      <div className="font-bold text-[14px] text-text-1">₹{sub.prize1}</div>
                    </div>
                  )}
                  {sub.prize2 && (
                    <div className="p-2.5 rounded-lg border border-border bg-surface-2 text-center">
                      <div className="text-[11px] font-bold text-text-3">2nd Place</div>
                      <div className="font-bold text-[14px] text-text-1">₹{sub.prize2}</div>
                    </div>
                  )}
                  {sub.prize3 && (
                    <div className="p-2.5 rounded-lg border border-border bg-surface-2 text-center">
                      <div className="text-[11px] font-bold text-text-3">3rd Place</div>
                      <div className="font-bold text-[14px] text-text-1">₹{sub.prize3}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registration URL & External Link */}
            {sub.registrationUrl && (
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-4 mb-1.5">
                  Registration URL
                </h4>
                <a
                  href={sub.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline break-all"
                >
                  <ExternalLink size={14} />
                  <span>{sub.registrationUrl}</span>
                </a>
              </div>
            )}

            {/* Submitter & POC Details */}
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-1.5">
                  Submitted By
                </h4>
                <div className="flex items-center gap-2 font-semibold text-text-1">
                  <User size={14} className="text-text-3" />
                  <span>{sub.submittedBy?.name || '—'}</span>
                </div>
                <div className="text-[12px] text-text-3 flex items-center gap-2 mt-1">
                  <Mail size={13} className="text-text-4" />
                  <span>{sub.submittedBy?.email || '—'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-1.5">
                  Point of Contact
                </h4>
                <div className="font-semibold text-text-1">
                  {sub.pocName || 'Same as submitter'}
                </div>
                {(sub.pocEmail || sub.pocPhone) && (
                  <div className="text-[12px] text-text-3 space-y-0.5 mt-1">
                    {sub.pocEmail && <div>Email: {sub.pocEmail}</div>}
                    {sub.pocPhone && <div>Phone: {sub.pocPhone}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="p-4 sm:p-5 bg-surface-2 border-t border-border flex-shrink-0">
            {sub.status === 'pending' ? (
              rejectMode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-rose-600">Enter Rejection Reason:</span>
                    <button
                      type="button"
                      onClick={() => setRejectMode(false)}
                      className="text-[12px] text-text-3 hover:text-text-1"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Explain why this submission cannot be approved (guidelines violation, missing details, etc.)..."
                    rows={2}
                    className="w-full text-[13px] p-2.5 border border-border rounded-xl bg-white focus:border-rose-500 outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectMode(false)}
                      className="px-4 py-2 text-[13px] font-semibold text-text-2 bg-white border border-border rounded-lg hover:bg-surface-3"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!rejectReason.trim() || actionLoading === sub._id + '-reject'}
                      onClick={handleReject}
                      className="px-4 py-2 text-[13px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {actionLoading === sub._id + '-reject' && (
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                        </svg>
                      )}
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Super Admin Feature Option */}
                  {isSuperAdmin && (
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] font-semibold text-[#B45309] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <input
                        type="checkbox"
                        checked={markFeatured}
                        onChange={e => setMarkFeatured(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <Star size={13} className="text-amber-600" />
                      <span>Publish as Featured</span>
                    </label>
                  )}

                  <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setRejectMode(true)}
                      className="px-4 py-2 text-[13px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                      className="px-4 py-2 text-[13px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === sub._id + '-approve'}
                      onClick={handleApprove}
                      className="px-5 py-2 text-[13px] font-bold bg-[#16A34A] hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      className="px-5 py-2 text-[13px] font-bold bg-[#16A34A] hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === sub._id + '-approve' ? (
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-3">
                  This submission is already <strong className="capitalize">{sub.status}</strong>.
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[13px] font-semibold bg-white border border-border text-text-2 rounded-lg hover:bg-surface-3 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

