// src/pages/admin/tabs/BroadcastTab.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, Send, Bell, CheckCircle2, AlertTriangle,
  Smartphone, Sparkles, Radio
} from 'lucide-react';
import { admin } from '../../../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const ICONS = ['📢', '🎉', '🚨', '🏆', '⚡', '🔔', '🪺', '🎓', '✅', '⚠️', '🔥', '💡'];
const BROADCAST_TYPES = [
  { id: 'system', label: 'System Notice', desc: 'Maintenance & platform notices' },
  { id: 'updates', label: 'Updates', desc: 'New features and hackathons' },
  { id: 'deadlines', label: 'Deadlines', desc: 'Urgent registration cutoffs' },
];

export default function BroadcastTab({ showToast }) {
  const [form, setForm] = useState({
    title: '',
    sub: '',
    type: 'system',
    icon: '📢'
  });
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendBroadcast = async () => {
    setShowConfirm(false);
    if (!form.title.trim()) {
      showToast?.('Notification title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await admin.notify({
        title: form.title.trim(),
        sub: form.sub.trim() || undefined,
        type: form.type,
        icon: form.icon,
      });
      const count = res.data?.sent ?? 0;
      setSentCount(count);
      showToast?.(`Broadcast delivered to ${count} active user${count === 1 ? '' : 's'}!`, 'success');
      setForm({ title: '', sub: '', type: 'system', icon: '📢' });
    } catch (e) {
      showToast?.(e.message || 'Failed to dispatch broadcast', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <ConfirmDialog
        isOpen={showConfirm}
        title="Send Broadcast Notification?"
        message={`This will dispatch an instant push and in-app notification to all registered FestNest students and organizers with title "${form.title}". Are you ready to broadcast?`}
        confirmText="Yes, Broadcast Now"
        confirmVariant="primary"
        onConfirm={handleSendBroadcast}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Push Notification Studio</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Send global platform announcements and urgent deadlines to user notification inboxes
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-5">
          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Broadcast Emoji Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`h-11 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    form.icon === ic
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 scale-105'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Notification Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BROADCAST_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.type === t.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100'
                  }`}
                >
                  <span className="block text-xs font-bold text-neutral-900">{t.label}</span>
                  <span className="block text-[10px] text-neutral-500 mt-0.5 leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Notification Headline <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400">{form.title.length}/80</span>
            </div>
            <input
              type="text"
              maxLength={80}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. ⚡ Registrations closing tonight for TechFest!"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Subtitle / Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Message Body / Details
              </label>
              <span className="text-[10px] text-neutral-400">{form.sub.length}/160</span>
            </div>
            <textarea
              rows={2}
              maxLength={160}
              value={form.sub}
              onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}
              placeholder="e.g. Over 500 teams already registered. Tap to secure your spot."
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
            />
          </div>

          {/* Send CTA */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!form.title.trim() || loading}
              onClick={() => setShowConfirm(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                  <span>Broadcasting to users...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast to All Users</span>
                </>
              )}
            </button>
          </div>

          {sentCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Last broadcast successfully delivered to {sentCount} users.</span>
            </div>
          )}
        </div>

        {/* Right: Live Mobile Device Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            Live Device Preview
          </span>

          {/* Mobile phone frame */}
          <div className="w-full max-w-[280px] bg-neutral-900 rounded-[36px] p-3 shadow-2xl border-4 border-neutral-800 relative">
            {/* Notch */}
            <div className="w-24 h-4 bg-neutral-900 rounded-b-xl mx-auto mb-6 flex items-center justify-center">
              <div className="w-10 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Notification Banner */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 mb-16 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <div className="flex items-center gap-1 font-bold text-indigo-600">
                  <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">
                    FN
                  </span>
                  <span>FESTNEST</span>
                </div>
                <span>now</span>
              </div>

              <div className="flex items-start gap-2.5 pt-0.5">
                <span className="text-xl flex-shrink-0 mt-0.5">{form.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 leading-tight">
                    {form.title || 'Notification Headline'}
                  </p>
                  <p className="text-[11px] text-neutral-600 leading-snug mt-0.5 break-words">
                    {form.sub || 'Supporting details and notification subtitle will be shown here.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-28 h-1 bg-neutral-600 rounded-full mx-auto my-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

