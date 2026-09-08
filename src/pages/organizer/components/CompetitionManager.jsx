// src/pages/organizer/components/CompetitionManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Plus,
  X,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { events as eventsApi } from '../../../services/api';

const EMPTY_COMPETITION = {
  name: '',
  description: '',
  eligibility: '',
  registrationFee: '',
  prizeDetails: '',
  venue: '',
  teamSize: '',
  format: '',
  duration: '',
  rules: '',
  registrationLink: '',
};

export default function CompetitionManager({
  eventKey,
  eventName,
  showToast,
  onCompetitionsChanged,
}) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_COMPETITION);
  const [saving, setSaving] = useState(false);

  const loadCompetitions = useCallback(async () => {
    if (!eventKey) return;
    setLoading(true);
    try {
      const response = await eventsApi.get(eventKey);
      setCompetitions(response.data?.event?.competitions || []);
    } catch (error) {
      showToast?.(error.message || 'Could not load competitions', 'error');
    } finally {
      setLoading(false);
    }
  }, [eventKey, showToast]);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  const openEditor = (competition = null) => {
    setEditingId(competition?._id || null);
    setForm(competition ? { ...EMPTY_COMPETITION, ...competition } : { ...EMPTY_COMPETITION });
    setEditorOpen(true);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast?.('Competition name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await eventsApi.updateCompetition(eventKey, editingId, form);
      } else {
        await eventsApi.addCompetition(eventKey, form);
      }
      setEditorOpen(false);
      await loadCompetitions();
      onCompetitionsChanged?.();
      showToast?.(editingId ? 'Competition updated successfully' : 'Competition added successfully', 'success');
    } catch (error) {
      showToast?.(error.message || 'Could not save competition', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm('Are you sure you want to delete this competition? This action cannot be undone.')) return;
    try {
      await eventsApi.deleteCompetition(eventKey, id);
      setCompetitions(current => current.filter(item => item._id !== id));
      onCompetitionsChanged?.();
      showToast?.('Competition deleted', 'success');
    } catch (error) {
      showToast?.(error.message || 'Could not delete competition', 'error');
    }
  };

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  return (
    <div className="border-t border-border pt-4 mt-2">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-light flex items-center justify-center text-primary">
            <Layers size={14} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[12px] font-bold text-text-1">Sub-Events & Competitions</div>
            <div className="text-[11px] text-text-3">Manage specific tracks inside {eventName}</div>
          </div>
        </div>
        <span className="font-mono text-[11px] font-semibold text-text-3 bg-surface-2 px-2 py-0.5 rounded-full border border-border">
          {competitions.length} track{competitions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="h-20 rounded-xl bg-surface-2 animate-pulse" />
          <div className="h-20 rounded-xl bg-surface-2 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {competitions.map((competition, index) => (
            <div
              key={competition._id || index}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-3.5 shadow-sm hover:border-primary/30 transition-all"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light font-mono text-[12px] font-bold text-primary">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-text-1">
                  {competition.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-text-3">
                  <span className="inline-flex items-center gap-1">
                    <IndianRupee size={11} className="text-text-4" />
                    {competition.registrationFee || 'Free'}
                  </span>
                  {competition.prizeDetails && (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                      <Trophy size={11} className="text-amber-500" />
                      {competition.prizeDetails}
                    </span>
                  )}
                  {competition.venue && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} className="text-text-4" />
                      {competition.venue}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-3 pt-1 border-t border-surface-2">
                  <button
                    type="button"
                    onClick={() => openEditor(competition)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(competition._id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                  {competition.registrationLink && (
                    <a
                      href={competition.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-text-4 hover:text-text-2"
                    >
                      <ExternalLink size={10} /> Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => openEditor()}
            className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-primary-xlight p-3 text-center text-primary transition-all hover:border-primary hover:bg-primary-light"
          >
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-xs">
              <Plus size={18} strokeWidth={2.4} />
            </div>
            <span className="mt-1.5 text-[12px] font-bold">Add Sub-Event / Track</span>
            <span className="text-[10px] text-primary/70">Create a sub-competition card</span>
          </button>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 md:items-center md:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditorOpen(false)}
          >
            <motion.form
              onSubmit={save}
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[620px] md:rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="competition-form-title"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-1">
                <div>
                  <h3 id="competition-form-title" className="font-heading text-[17px] font-bold text-text-1">
                    {editingId ? 'Edit Competition' : 'Add Competition Track'}
                  </h3>
                  <p className="text-[12px] text-text-3 mt-0.5">Inside {eventName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  aria-label="Close competition form"
                  className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-3 hover:text-text-1 hover:border-primary/40 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-6 py-5">
                <div>
                  <label className="block text-[12px] font-semibold text-text-1 mb-1">
                    Competition Track Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    maxLength={120}
                    placeholder="e.g., CodeSprint Hackathon, Battle of Bands"
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Registration Fee</label>
                    <input
                      value={form.registrationFee}
                      onChange={e => update('registrationFee', e.target.value)}
                      placeholder="e.g. Free, ₹200 / team"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Prize Details</label>
                    <input
                      value={form.prizeDetails}
                      onChange={e => update('prizeDetails', e.target.value)}
                      placeholder="e.g. ₹25,000 + Goodies"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Venue / Platform</label>
                    <input
                      value={form.venue}
                      onChange={e => update('venue', e.target.value)}
                      placeholder="e.g. Audi 2, Google Meet"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Team Size</label>
                    <input
                      value={form.teamSize}
                      onChange={e => update('teamSize', e.target.value)}
                      placeholder="e.g. 1–4 Members"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Eligibility</label>
                    <input
                      value={form.eligibility}
                      onChange={e => update('eligibility', e.target.value)}
                      placeholder="e.g. Open to all UG students"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-1 mb-1">Duration / Rounds</label>
                    <input
                      value={form.duration}
                      onChange={e => update('duration', e.target.value)}
                      placeholder="e.g. 24 Hours, 3 Rounds"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-1 mb-1">Registration Link (if specific)</label>
                  <input
                    value={form.registrationLink}
                    onChange={e => update('registrationLink', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-1 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    maxLength={1000}
                    placeholder="Brief overview of what participants will do..."
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-text-1 mb-1">Rules & Guidelines</label>
                  <textarea
                    rows={4}
                    value={form.rules}
                    onChange={e => update('rules', e.target.value)}
                    maxLength={1500}
                    placeholder="Enter submission rules, scoring criteria, code of conduct..."
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-border bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-60"
                >
                  {saving ? 'Saving track…' : editingId ? 'Update Track' : 'Create Track'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

