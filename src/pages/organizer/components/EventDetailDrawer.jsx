// src/pages/organizer/components/EventDetailDrawer.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Trophy,
  User,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  PenSquare,
  ShieldAlert,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Under Review',
    icon: Clock,
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    bannerCls: 'bg-amber-50 border-amber-200 text-amber-900',
    desc: 'FestNest curators review submitted events within 24 hours.',
  },
  approved: {
    label: 'Live & Active',
    icon: CheckCircle2,
    badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bannerCls: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    desc: 'This event is published and discoverable by students across India.',
  },
  rejected: {
    label: 'Not Approved',
    icon: XCircle,
    badgeCls: 'bg-rose-50 text-rose-800 border-rose-200',
    bannerCls: 'bg-rose-50 border-rose-200 text-rose-900',
    desc: 'Please check your guidelines or contact support to resubmit.',
  },
};

export default function EventDetailDrawer({
  event: ev,
  isOpen,
  onClose,
  navigate,
  showToast,
  onOpenCompetitions,
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = e => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!ev) return null;

  const status = STATUS_CONFIG[ev.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const copyRegistrationLink = async () => {
    const link = ev.registrationUrl || '';
    if (!link || link === '#') {
      showToast?.('No registration link provided for this event', 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      showToast?.('Registration link copied to clipboard!', 'success');
    } catch {
      showToast?.('Failed to copy link', 'error');
    }
  };

  const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-border"
            >
              {/* Drawer Topbar */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-1">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border flex items-center justify-between bg-surface-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.badgeCls}`}
                  >
                    <StatusIcon size={12} strokeWidth={2.2} />
                    {status.label}
                  </span>
                  <span className="font-mono text-[11px] text-text-4 truncate">
                    ID: {ev._id.slice(-6)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-3 hover:text-text-1 hover:border-primary/40 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
                {/* Banner & Header */}
                <div>
                  {ev.bannerImage?.url ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-border mb-4 bg-surface-2">
                      <img
                        src={ev.bannerImage.url}
                        alt={ev.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <h2 className="font-heading text-[20px] sm:text-[22px] font-bold text-text-1 leading-snug">
                    {ev.eventName}
                  </h2>
                  <p className="text-[13px] text-text-3 mt-1">{ev.college}</p>
                </div>

                {/* Status Notice */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${status.bannerCls}`}>
                  <StatusIcon size={18} className="flex-shrink-0 mt-0.5" />
                  <div className="text-[12px] leading-relaxed">
                    <div className="font-bold">{status.label}</div>
                    <div className="opacity-80 mt-0.5">{status.desc}</div>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2.5">
                    Event Overview
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 bg-surface-1 p-3.5 rounded-xl border border-border">
                    <div className="flex items-center gap-2 text-[12px]">
                      <Calendar size={13} className="text-text-4 flex-shrink-0" />
                      <span className="text-text-3">Date:</span>
                      <span className="font-mono font-medium text-text-1 truncate">{ev.startDate || 'TBA'}</span>
                    </div>
                    {ev.endDate && (
                      <div className="flex items-center gap-2 text-[12px]">
                        <Calendar size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">End:</span>
                        <span className="font-mono font-medium text-text-1 truncate">{ev.endDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[12px]">
                      <MapPin size={13} className="text-text-4 flex-shrink-0" />
                      <span className="text-text-3">City:</span>
                      <span className="font-medium text-text-1 truncate">{ev.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <MapPin size={13} className="text-text-4 flex-shrink-0" />
                      <span className="text-text-3">Mode:</span>
                      <span className="font-medium text-text-1 truncate">{ev.mode || 'Offline'}</span>
                    </div>
                    {ev.venue && (
                      <div className="col-span-2 flex items-center gap-2 text-[12px]">
                        <MapPin size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">Venue:</span>
                        <span className="font-medium text-text-1 truncate">{ev.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[12px]">
                      <IndianRupee size={13} className="text-text-4 flex-shrink-0" />
                      <span className="text-text-3">Entry:</span>
                      <span className="font-medium text-text-1 truncate">{ev.isPaid ? `₹${ev.entryFee}` : 'Free'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <Users size={13} className="text-text-4 flex-shrink-0" />
                      <span className="text-text-3">Team:</span>
                      <span className="font-medium text-text-1 truncate">{ev.teamSize || 'Any'}</span>
                    </div>
                  </div>
                </div>

                {/* Prize Breakdown */}
                {(ev.totalPrize || ev.prize1 || ev.prize2 || ev.prize3) && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2.5">
                      Prize Pool
                    </div>
                    {ev.totalPrize && (
                      <div className="mb-2 text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-lg inline-flex items-center gap-2">
                        <Trophy size={14} className="text-amber-500" />
                        Total Pool: ₹{ev.totalPrize}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '1st Prize', val: ev.prize1, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                        { label: '2nd Prize', val: ev.prize2, color: 'text-slate-700 bg-slate-50 border-slate-200' },
                        { label: '3rd Prize', val: ev.prize3, color: 'text-orange-700 bg-orange-50 border-orange-200' },
                      ].map(({ label, val, color }) =>
                        val ? (
                          <div key={label} className={`border rounded-xl p-2.5 text-center ${color}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
                            <div className="font-mono font-bold text-[13px] mt-0.5">₹{val}</div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* About */}
                {ev.about && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2">
                      Description
                    </div>
                    <div className="text-[13px] text-text-2 leading-relaxed bg-surface-1 p-3.5 rounded-xl border border-border whitespace-pre-line">
                      {ev.about}
                    </div>
                  </div>
                )}

                {/* Eligibility & Rules */}
                {(ev.eligibility || ev.rules) && (
                  <div className="space-y-3">
                    {ev.eligibility && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-1.5">
                          Eligibility
                        </div>
                        <div className="text-[12px] text-text-2 leading-relaxed bg-surface-1 p-3 rounded-lg border border-border">
                          {ev.eligibility}
                        </div>
                      </div>
                    )}
                    {ev.rules && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-1.5">
                          Rules & Guidelines
                        </div>
                        <div className="text-[12px] text-text-2 leading-relaxed bg-surface-1 p-3 rounded-lg border border-border whitespace-pre-line">
                          {ev.rules}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact & POC */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2.5">
                    Point of Contact
                  </div>
                  <div className="space-y-2 bg-surface-1 p-3.5 rounded-xl border border-border">
                    {ev.pocName && (
                      <div className="flex items-center gap-2.5 text-[12px]">
                        <User size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">POC:</span>
                        <span className="font-medium text-text-1">{ev.pocName}</span>
                      </div>
                    )}
                    {ev.pocEmail && (
                      <div className="flex items-center gap-2.5 text-[12px]">
                        <Mail size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">Email:</span>
                        <a href={`mailto:${ev.pocEmail}`} className="font-medium text-primary hover:underline">
                          {ev.pocEmail}
                        </a>
                      </div>
                    )}
                    {ev.pocPhone && (
                      <div className="flex items-center gap-2.5 text-[12px]">
                        <Phone size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">Phone:</span>
                        <a href={`tel:${ev.pocPhone}`} className="font-mono font-medium text-primary hover:underline">
                          {ev.pocPhone}
                        </a>
                      </div>
                    )}
                    {ev.website && (
                      <div className="flex items-center gap-2.5 text-[12px]">
                        <Globe size={13} className="text-text-4 flex-shrink-0" />
                        <span className="text-text-3">Website:</span>
                        <a
                          href={ev.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate"
                        >
                          {ev.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-border bg-white flex flex-wrap gap-2.5">
                {ev.status === 'approved' && linkedId && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/event/${linkedId}`);
                    }}
                    className="flex-1 py-2.5 px-3 bg-primary text-white rounded-xl text-[12px] font-bold shadow-xs hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    View Live Page
                  </button>
                )}

                {ev.status === 'approved' && linkedId && onOpenCompetitions && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCompetitions(ev);
                    }}
                    className="py-2.5 px-3 bg-surface-2 border border-border text-text-1 hover:border-primary/40 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Layers size={13} />
                    Manage Tracks
                  </button>
                )}

                <button
                  type="button"
                  onClick={copyRegistrationLink}
                  className="py-2.5 px-3 border border-border rounded-xl text-[12px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy size={13} />
                  Copy URL
                </button>

                {ev.status === 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/host');
                    }}
                    className="flex-1 py-2.5 px-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[12px] font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PenSquare size={13} />
                    Resubmit Event
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

