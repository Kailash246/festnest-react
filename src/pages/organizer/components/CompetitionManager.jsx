// src/pages/organizer/components/CompetitionManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Sparkles,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { events as eventsApi, ai as aiApi } from '../../../services/api';
import BulkTrackImportModal from './BulkTrackImportModal';

function AiFilledBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded border border-[#C7D2FE] select-none flex-shrink-0">
      <Sparkles size={10} className="text-primary" />
      AI filled
    </span>
  );
}

function AiTrackAutofillCard({
  state = 'empty',
  pageCount = 0,
  fileName = '',
  errorMessage = '',
  missingSummary = '',
  onUpload,
  onReset,
  onFillManually,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleManualFallback = () => {
    setIsCollapsed(true);
    if (onFillManually) {
      onFillManually();
    }
  };

  return (
    <div className="rounded-xl border border-[#E0E7FF] bg-gradient-to-b from-[#F5F3FF]/70 via-white to-white overflow-hidden shadow-xs transition-all mb-4">
      {/* Header / Toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F5F3FF] to-white border-b border-[#EEF2FF]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Sparkles size={14} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-[13px] text-text-1 truncate">
                Fill this competition with AI
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-light text-primary border border-[#C7D2FE]">
                Autofill
              </span>
            </div>
            <p className="text-[11px] text-text-3 truncate mt-0.5">
              Upload the competition poster or brochure and FestNest will extract the track details.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-[11px] font-semibold text-text-3 hover:text-primary transition-colors py-1 px-1.5 rounded-md hover:bg-surface-2 flex-shrink-0 ml-2"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand AI Autofill' : 'Collapse AI Autofill'}
        >
          <span className="hidden sm:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="p-3.5 space-y-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {/* 1. Empty State */}
          {state === 'empty' && (
            <div
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-4 px-3 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary-xlight'
                  : 'border-[#CBD5E1] hover:border-primary hover:bg-[#F8FAFC] bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-primary mb-1.5">
                <UploadCloud size={18} strokeWidth={2} />
              </div>
              <div className="text-[12px] font-bold text-text-1 hover:text-primary transition-colors">
                Upload poster PDF
              </div>
              <p className="text-[11px] text-text-3 mt-0.5">
                Drag & drop your competition flyer or <span className="text-primary font-semibold underline">browse</span>
              </p>
              <span className="mt-2 inline-flex items-center text-[10px] font-medium text-text-4 bg-surface-2 px-2 py-0.5 rounded border border-border">
                Up to 25 pages · PDF only
              </span>
            </div>
          )}

          {/* 2. Processing State */}
          {state === 'processing' && (
            <div className="flex items-center gap-3 p-3.5 rounded-lg border border-[#C7D2FE] bg-[#F5F3FF]">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <RefreshCw size={16} className="animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-text-1">Reading your competition poster...</span>
                </div>
                <p className="text-[11px] text-text-3 truncate mt-0.5">
                  {fileName} · This usually takes 10–20 seconds.
                </p>
              </div>
            </div>
          )}

          {/* 3. Success State */}
          {state === 'success' && (
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-emerald-900">
                    Competition details filled from your poster — review before creating.
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    {fileName} {pageCount ? `· ${pageCount} page${pageCount !== 1 ? 's' : ''} analyzed` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 underline"
                >
                  <RefreshCw size={11} /> Try another PDF
                </button>
              </div>
            </div>
          )}

          {/* 4. Partial State */}
          {state === 'partial' && (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-amber-900">
                    Competition details filled from your poster — review before creating.
                  </div>
                  {missingSummary && (
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      {missingSummary}
                    </div>
                  )}
                  <div className="text-[10px] text-amber-700/80 mt-0.5">
                    {fileName} {pageCount ? `· ${pageCount} page${pageCount !== 1 ? 's' : ''} analyzed` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                  <RefreshCw size={11} /> Try another PDF
                </button>
              </div>
            </div>
          )}

          {/* 5. Multiple Competitions State */}
          {state === 'multiple' && (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-amber-900">
                    Multiple competitions detected. Please upload a poster for one track at a time.
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    You can create this track first, then add subsequent tracks using their individual flyers.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => {
                    if (onReset) onReset();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                  <RefreshCw size={11} /> Try another PDF
                </button>
                <button
                  type="button"
                  onClick={handleManualFallback}
                  className="text-[11px] font-semibold text-text-3 hover:text-text-1"
                >
                  Fill manually instead
                </button>
              </div>
            </div>
          )}

          {/* 6. Failure State */}
          {state === 'failure' && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/70 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-rose-900">
                    {errorMessage || "Couldn't read PDF"}
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    Make sure your PDF is under 25 pages and contains readable text or images.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-rose-200/60">
                <button
                  type="button"
                  onClick={() => {
                    if (onReset) onReset();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 hover:text-rose-900 underline"
                >
                  <RefreshCw size={11} /> Try another PDF
                </button>
                <button
                  type="button"
                  onClick={handleManualFallback}
                  className="text-[11px] font-semibold text-text-3 hover:text-text-1"
                >
                  Fill manually instead
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // AI Autofill states for Competition Track modal
  const [aiFilledFields, setAiFilledFields] = useState(new Set());
  const [aiState, setAiState] = useState('empty');
  const [aiFileName, setAiFileName] = useState('');
  const [aiPageCount, setAiPageCount] = useState(0);
  const [aiErrorMessage, setAiErrorMessage] = useState('');
  const [aiMissingSummary, setAiMissingSummary] = useState('');

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
    setAiFilledFields(new Set());
    setAiState('empty');
    setAiFileName('');
    setAiPageCount(0);
    setAiErrorMessage('');
    setAiMissingSummary('');
    setEditorOpen(true);
  };

  const handleAiReset = () => {
    setAiState('empty');
    setAiFileName('');
    setAiPageCount(0);
    setAiErrorMessage('');
    setAiMissingSummary('');
  };

  const handleAiFillManually = () => {
    // Keeps existing manually entered form values untouched
  };

  const handleAiUpload = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (file.type !== 'application/pdf' && ext !== 'pdf') {
      setAiState('failure');
      setAiErrorMessage('Please select a valid PDF file.');
      return;
    }

    setAiFileName(file.name);
    setAiState('processing');
    setAiErrorMessage('');
    setAiMissingSummary('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'sub-event');

    try {
      const res = await aiApi.parseEventPoster(formData);

      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Couldn't read competition poster");
      }

      const pages = res.pageCount || 1;
      setAiPageCount(pages);

      // Check if multiple tracks were detected
      if (Array.isArray(res.data) || (Array.isArray(res.data.subEvents) && res.data.subEvents.length > 1)) {
        setAiState('multiple');
        return;
      }

      const raw = res.data;
      const cleanStr = (v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null);

      const rawName = cleanStr(raw.trackName);
      const rawFee = cleanStr(raw.registrationFee);
      const rawPrize = cleanStr(raw.prizeDetails);
      const rawVenue = cleanStr(raw.venuePlatform);
      const rawTeam = cleanStr(raw.teamSize);
      const rawElig = cleanStr(raw.eligibility);
      const rawDuration = cleanStr(raw.durationRounds);
      const rawLink = cleanStr(raw.registrationLink);
      const rawDesc = cleanStr(raw.description);
      const rawRules = cleanStr(raw.rulesGuidelines);

      const newFilled = new Set();
      const updates = {};

      if (rawName) {
        updates.name = rawName.slice(0, 120);
        newFilled.add('name');
      }
      if (rawFee) {
        updates.registrationFee = rawFee;
        newFilled.add('registrationFee');
      }
      if (rawPrize) {
        updates.prizeDetails = rawPrize;
        newFilled.add('prizeDetails');
      }
      if (rawVenue) {
        updates.venue = rawVenue;
        newFilled.add('venue');
      }
      if (rawTeam) {
        updates.teamSize = rawTeam;
        newFilled.add('teamSize');
      }
      if (rawElig) {
        updates.eligibility = rawElig;
        newFilled.add('eligibility');
      }
      if (rawDuration) {
        updates.duration = rawDuration;
        newFilled.add('duration');
      }
      if (rawLink) {
        updates.registrationLink = rawLink;
        newFilled.add('registrationLink');
      }
      if (rawDesc) {
        updates.description = rawDesc.slice(0, 1000);
        newFilled.add('description');
      }
      if (rawRules) {
        updates.rules = rawRules.slice(0, 1500);
        newFilled.add('rules');
      }

      // Non-destructive form update: null/missing fields NEVER overwrite existing manual entries
      setForm((prev) => ({
        ...prev,
        ...updates,
      }));

      setAiFilledFields(newFilled);

      // Determine partial extraction
      const missing = [];
      if (!rawName) missing.push('track name');
      if (!rawFee) missing.push('fee');
      if (!rawPrize) missing.push('prizes');
      if (!rawVenue) missing.push('venue');
      if (!rawLink) missing.push('registration link');

      if (!rawName || (missing.length > 0 && newFilled.size < 5)) {
        setAiMissingSummary(
          !rawName
            ? 'Track name could not be identified from the poster and must be entered manually.'
            : `Some fields (${missing.slice(0, 3).join(', ')}) were missing from the poster. You can enter them manually below.`
        );
        setAiState('partial');
      } else {
        setAiState('success');
      }

      showToast?.('Competition details filled from your poster ✓', 'success');
    } catch (err) {
      console.error('[AI Track Parse Error]:', err);
      setAiState('failure');
      setAiErrorMessage(err.message || "Couldn't read PDF");
    }
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

  const update = (key, value) => {
    if (aiFilledFields.has(key)) {
      setAiFilledFields((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

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

          <button
            type="button"
            onClick={() => setBulkImportOpen(true)}
            className="flex min-h-[96px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C7D2FE] bg-primary-xlight p-3 text-center text-primary transition-all hover:border-primary hover:bg-primary-light"
          >
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-xs">
              <Sparkles size={18} strokeWidth={2.4} className="text-primary" />
            </div>
            <span className="mt-1.5 text-[12px] font-bold">Import tracks from poster</span>
            <span className="text-[10px] text-primary/70">Auto-extract multiple tracks from PDF</span>
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
                {/* Optional Compact AI Autofill Card */}
                {!editingId && (
                  <AiTrackAutofillCard
                    state={aiState}
                    pageCount={aiPageCount}
                    fileName={aiFileName}
                    errorMessage={aiErrorMessage}
                    missingSummary={aiMissingSummary}
                    onUpload={handleAiUpload}
                    onReset={handleAiReset}
                    onFillManually={handleAiFillManually}
                  />
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[12px] font-semibold text-text-1">
                      Competition Track Name <span className="text-red-500">*</span>
                    </label>
                    {aiFilledFields.has('name') && <AiFilledBadge />}
                  </div>
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Registration Fee</label>
                      {aiFilledFields.has('registrationFee') && <AiFilledBadge />}
                    </div>
                    <input
                      value={form.registrationFee}
                      onChange={e => update('registrationFee', e.target.value)}
                      placeholder="e.g. Free, ₹200 / team"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Prize Details</label>
                      {aiFilledFields.has('prizeDetails') && <AiFilledBadge />}
                    </div>
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Venue / Platform</label>
                      {aiFilledFields.has('venue') && <AiFilledBadge />}
                    </div>
                    <input
                      value={form.venue}
                      onChange={e => update('venue', e.target.value)}
                      placeholder="e.g. Audi 2, Google Meet"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Team Size</label>
                      {aiFilledFields.has('teamSize') && <AiFilledBadge />}
                    </div>
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Eligibility</label>
                      {aiFilledFields.has('eligibility') && <AiFilledBadge />}
                    </div>
                    <input
                      value={form.eligibility}
                      onChange={e => update('eligibility', e.target.value)}
                      placeholder="e.g. Open to all UG students"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="block text-[12px] font-semibold text-text-1">Duration / Rounds</label>
                      {aiFilledFields.has('duration') && <AiFilledBadge />}
                    </div>
                    <input
                      value={form.duration}
                      onChange={e => update('duration', e.target.value)}
                      placeholder="e.g. 24 Hours, 3 Rounds"
                      className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[12px] font-semibold text-text-1">Registration Link (if specific)</label>
                    {aiFilledFields.has('registrationLink') && <AiFilledBadge />}
                  </div>
                  <input
                    value={form.registrationLink}
                    onChange={e => update('registrationLink', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[12px] font-semibold text-text-1">Description</label>
                    {aiFilledFields.has('description') && <AiFilledBadge />}
                  </div>
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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[12px] font-semibold text-text-1">Rules & Guidelines</label>
                    {aiFilledFields.has('rules') && <AiFilledBadge />}
                  </div>
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

      {/* Bulk Track Import Modal */}
      <BulkTrackImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        eventKey={eventKey}
        eventName={eventName}
        showToast={showToast}
        onTracksCreated={() => {
          loadCompetitions();
          onCompetitionsChanged?.();
        }}
      />
    </div>
  );
}

