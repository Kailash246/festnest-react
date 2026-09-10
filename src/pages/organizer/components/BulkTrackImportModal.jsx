// src/pages/organizer/components/BulkTrackImportModal.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  CheckSquare,
  Square,
  RotateCcw,
  IndianRupee,
  Trophy,
  Clock,
  Search,
} from 'lucide-react';
import { events as eventsApi, ai as aiApi } from '../../../services/api';

function AiFilledBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-light px-1.5 py-0.5 rounded border border-[#C7D2FE] select-none flex-shrink-0">
      <Sparkles size={10} className="text-primary" />
      AI filled
    </span>
  );
}

function AmberNullHint({ text = 'Not in poster — optional' }) {
  return (
    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded select-none flex-shrink-0">
      {text}
    </span>
  );
}

export default function BulkTrackImportModal({
  isOpen,
  onClose,
  eventKey,
  eventName,
  showToast,
  onTracksCreated,
}) {
  const [step, setStep] = useState('upload'); // 'upload' | 'processing' | 'review' | 'progress'
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation progress state
  const [creationStatuses, setCreationStatuses] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [creationDone, setCreationDone] = useState(false);

  const fileInputRef = useRef(null);

  const resetAll = () => {
    setStep('upload');
    setDragOver(false);
    setFileName('');
    setPageCount(0);
    setUploadError('');
    setTracks([]);
    setSearchQuery('');
    setCreationStatuses({});
    setIsCreating(false);
    setCreationDone(false);
  };

  const handleClose = () => {
    if (isCreating) {
      if (!window.confirm('Track creation is currently in progress. Are you sure you want to close?')) {
        return;
      }
    }
    resetAll();
    onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (file.type !== 'application/pdf' && ext !== 'pdf') {
      setUploadError('Please upload a valid PDF file.');
      return;
    }

    setFileName(file.name);
    setUploadError('');
    setStep('processing');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', 'sub-event-bulk');

    try {
      const res = await aiApi.parseEventPoster(formData);
      if (!res || !res.success) {
        throw new Error(res?.message || "Couldn't extract competition tracks from PDF");
      }

      const pages = res.pageCount || 1;
      setPageCount(pages);

      const rawTracks = Array.isArray(res.data) ? res.data : [];
      if (rawTracks.length === 0) {
        throw new Error('No competition tracks could be identified in this PDF.');
      }

      const initialTracks = rawTracks.map((t, idx) => {
        const id = `track_${idx}_${Date.now()}`;
        const aiFilled = new Set();
        if (t.trackName) aiFilled.add('name');
        if (t.registrationFee) aiFilled.add('registrationFee');
        if (t.prizeDetails) aiFilled.add('prizeDetails');
        if (t.venuePlatform) aiFilled.add('venue');
        if (t.teamSize) aiFilled.add('teamSize');
        if (t.eligibility) aiFilled.add('eligibility');
        if (t.durationRounds) aiFilled.add('duration');
        if (t.registrationLink) aiFilled.add('registrationLink');
        if (t.description) aiFilled.add('description');
        if (t.rulesGuidelines) aiFilled.add('rules');

        return {
          id,
          index: idx,
          selected: true,
          isExpanded: false,
          aiFilledFields: aiFilled,
          formData: {
            name: (t.trackName || '').slice(0, 120),
            registrationFee: t.registrationFee || '',
            prizeDetails: t.prizeDetails || '',
            venue: t.venuePlatform || '',
            teamSize: t.teamSize || '',
            eligibility: t.eligibility || '',
            duration: t.durationRounds || '',
            registrationLink: t.registrationLink || '',
            description: (t.description || '').slice(0, 2000),
            rules: (t.rulesGuidelines || '').slice(0, 1500),
          },
        };
      });

      setTracks(initialTracks);
      setStep('review');
      showToast?.(`Extracted ${initialTracks.length} competition tracks from brochure ✓`, 'success');
    } catch (err) {
      console.error('[AI Bulk Parse Error]:', err);
      setStep('upload');
      setUploadError(err.message || "Couldn't read PDF. Make sure it contains readable text or images.");
    }
  };

  const toggleTrackSelect = (id) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const toggleTrackExpand = (id) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExpanded: !t.isExpanded } : t))
    );
  };

  const selectAll = () => {
    setTracks((prev) => prev.map((t) => ({ ...t, selected: true })));
  };

  const deselectAll = () => {
    setTracks((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  const expandAll = () => {
    setTracks((prev) => prev.map((t) => ({ ...t, isExpanded: true })));
  };

  const collapseAll = () => {
    setTracks((prev) => prev.map((t) => ({ ...t, isExpanded: false })));
  };

  const updateTrackField = (trackId, key, value) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== trackId) return t;
        const nextAi = new Set(t.aiFilledFields);
        nextAi.delete(key);
        return {
          ...t,
          aiFilledFields: nextAi,
          formData: { ...t.formData, [key]: value },
        };
      })
    );
  };

  const selectedTracks = tracks.filter((t) => t.selected);
  const selectedCount = selectedTracks.length;
  const totalCount = tracks.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  const visibleTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.formData.name || '').toLowerCase().includes(q) ||
      (t.formData.prizeDetails || '').toLowerCase().includes(q) ||
      (t.formData.description || '').toLowerCase().includes(q)
    );
  });

  const handleStartCreation = async (tracksToProcess = selectedTracks) => {
    if (tracksToProcess.length === 0) {
      showToast?.('Please select at least one track to import', 'error');
      return;
    }

    const missingName = tracksToProcess.find((t) => !t.formData.name.trim());
    if (missingName) {
      setTracks((prev) =>
        prev.map((t) => (t.id === missingName.id ? { ...t, isExpanded: true } : t))
      );
      showToast?.(`Track #${missingName.index + 1} is missing a name. Please enter a track name.`, 'error');
      return;
    }

    setStep('progress');
    setIsCreating(true);
    setCreationDone(false);

    const initialStatuses = { ...creationStatuses };
    tracksToProcess.forEach((t) => {
      initialStatuses[t.id] = { status: 'pending' };
    });
    setCreationStatuses(initialStatuses);

    let successCount = 0;
    let failedCount = 0;

    for (const track of tracksToProcess) {
      setCreationStatuses((prev) => ({
        ...prev,
        [track.id]: { status: 'processing' },
      }));

      try {
        await eventsApi.addCompetition(eventKey, track.formData);
        setCreationStatuses((prev) => ({
          ...prev,
          [track.id]: { status: 'success' },
        }));
        successCount++;
        onTracksCreated?.();
      } catch (err) {
        console.error(`Error creating track "${track.formData.name}":`, err);
        setCreationStatuses((prev) => ({
          ...prev,
          [track.id]: {
            status: 'failed',
            error: err.message || 'Failed to create track',
          },
        }));
        failedCount++;
      }
    }

    setIsCreating(false);
    setCreationDone(true);
    onTracksCreated?.();

    if (failedCount === 0) {
      showToast?.(`All ${successCount} tracks created successfully! ✓`, 'success');
    } else {
      showToast?.(`${successCount} created, ${failedCount} failed`, 'warning');
    }
  };

  const handleRetryFailed = () => {
    const failedTracks = tracks.filter(
      (t) => creationStatuses[t.id]?.status === 'failed'
    );
    if (failedTracks.length > 0) {
      handleStartCreation(failedTracks);
    }
  };

  if (!isOpen) return null;

  const totalSuccess = Object.values(creationStatuses).filter(
    (s) => s.status === 'success'
  ).length;
  const totalFailed = Object.values(creationStatuses).filter(
    (s) => s.status === 'failed'
  ).length;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[85] flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 md:items-center md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-4xl md:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-import-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-1 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                <Sparkles size={16} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <h3
                  id="bulk-import-title"
                  className="font-heading text-[16px] font-bold text-text-1 truncate"
                >
                  {step === 'upload' && 'Import Competition Tracks from Poster'}
                  {step === 'processing' && 'Extracting Competition Tracks...'}
                  {step === 'review' && 'Review Extracted Competition Tracks'}
                  {step === 'progress' && 'Creating Competition Tracks...'}
                </h3>
                <p className="text-[11px] text-text-3 truncate mt-0.5">
                  {step === 'review'
                    ? `${tracks.length} tracks detected · ${pageCount} pages analyzed from "${fileName}"`
                    : `Inside ${eventName}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              aria-label="Close modal"
              className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-3 hover:text-text-1 hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          {/* 1. UPLOAD STEP */}
          {step === 'upload' && (
            <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="text-center max-w-lg mx-auto">
                <h4 className="font-heading text-[18px] font-bold text-text-1">
                  Upload Event Brochure or Multi-Track Poster
                </h4>
                <p className="text-[13px] text-text-3 mt-1.5">
                  FestNest AI will scan your festival brochure or multi-track poster, detect all competitions, and prepare them for batch creation.
                </p>
              </div>

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

              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary bg-primary-xlight/80'
                    : 'border-[#CBD5E1] hover:border-primary hover:bg-[#F8FAFC] bg-surface-1/40'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-3 shadow-xs">
                  <UploadCloud size={28} strokeWidth={2} />
                </div>
                <div className="text-[15px] font-bold text-text-1 hover:text-primary transition-colors">
                  Upload poster or brochure PDF
                </div>
                <p className="text-[12px] text-text-3 mt-1 max-w-sm">
                  Drag and drop your event booklet, flyer, or brochure here, or{' '}
                  <span className="text-primary font-semibold underline">browse files</span>
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-text-3 bg-white px-3 py-1 rounded-full border border-border shadow-2xs">
                  <span>Up to 25 pages</span>
                  <span>·</span>
                  <span>PDF only</span>
                  <span>·</span>
                  <span>Max 30 MB</span>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-rose-900">{uploadError}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Ensure your PDF is readable and under 25 pages.
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <div className="flex items-center gap-2 text-[12px] font-bold text-text-1 mb-1.5">
                  <Sparkles size={14} className="text-primary" /> How it works
                </div>
                <ul className="text-[11px] text-text-3 space-y-1 list-disc list-inside">
                  <li>AI extracts track name, fees, prizes, team size, venue, and rules for each competition.</li>
                  <li>Review the collapsed list, deselect any tracks you don't need, and edit details if desired.</li>
                  <li>Tracks are created one by one with live progress and automatic retry for failed tracks.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. PROCESSING STATE */}
          {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary animate-pulse">
                <RefreshCw size={28} className="animate-spin text-primary" />
              </div>
              <div>
                <h4 className="font-heading text-[17px] font-bold text-text-1">
                  Scanning brochure & extracting tracks...
                </h4>
                <p className="text-[12px] text-text-3 mt-1 max-w-sm">
                  {fileName} · Gemini vision is analyzing all pages. This usually takes 15–30 seconds for multi-page brochures.
                </p>
              </div>
            </div>
          )}

          {/* 3. REVIEW STEP */}
          {step === 'review' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Review Toolbar */}
              <div className="px-6 py-3 border-b border-border bg-surface-1 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={allSelected ? deselectAll : selectAll}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-1 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-2"
                  >
                    {allSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} className="text-text-3" />
                    )}
                    <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
                  </button>

                  <span className="text-[12px] font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
                    {selectedCount} of {totalCount} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-text-4" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tracks..."
                      className="pl-8 pr-3 py-1 text-[12px] rounded-lg border border-border bg-white outline-none focus:border-primary w-36 sm:w-48"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={collapseAll}
                    className="text-[11px] font-semibold text-text-3 hover:text-text-1 px-2 py-1 rounded hover:bg-surface-2 hidden sm:inline-block"
                  >
                    Collapse all
                  </button>
                  <button
                    type="button"
                    onClick={expandAll}
                    className="text-[11px] font-semibold text-text-3 hover:text-text-1 px-2 py-1 rounded hover:bg-surface-2 hidden sm:inline-block"
                  >
                    Expand all
                  </button>
                </div>
              </div>

              {/* Scrollable Tracks List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {visibleTracks.length === 0 ? (
                  <div className="text-center py-10 text-text-3 text-[13px]">
                    No tracks match your search query.
                  </div>
                ) : (
                  visibleTracks.map((track) => {
                    const isExpanded = track.isExpanded;
                    const isChecked = track.selected;
                    const hasName = Boolean(track.formData.name.trim());

                    return (
                      <div
                        key={track.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isChecked
                            ? 'border-[#C7D2FE] bg-white shadow-xs'
                            : 'border-border bg-surface-1/60 opacity-70'
                        }`}
                      >
                        {/* Collapsed Header Row */}
                        <div
                          onClick={() => toggleTrackExpand(track.id)}
                          className="flex items-center justify-between gap-3 p-3.5 cursor-pointer hover:bg-surface-1/40 select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackSelect(track.id);
                              }}
                              className="text-primary hover:opacity-80 transition-opacity flex-shrink-0"
                              aria-label={isChecked ? 'Deselect track' : 'Select track'}
                            >
                              {isChecked ? (
                                <CheckSquare size={17} className="text-primary" />
                              ) : (
                                <Square size={17} className="text-text-3" />
                              )}
                            </button>

                            <span className="font-mono text-[11px] font-bold text-text-4 w-5 flex-shrink-0">
                              #{track.index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[13px] font-bold truncate ${
                                    hasName ? 'text-text-1' : 'text-rose-600 italic'
                                  }`}
                                >
                                  {hasName ? track.formData.name : 'Missing Track Name (Click to edit)'}
                                </span>

                                {track.formData.prizeDetails && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium truncate max-w-[200px]">
                                    <Trophy size={10} className="text-amber-500 flex-shrink-0" />
                                    <span className="truncate">{track.formData.prizeDetails}</span>
                                  </span>
                                )}

                                {track.formData.registrationFee && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-text-3 bg-surface-2 border border-border px-2 py-0.5 rounded-full truncate max-w-[140px]">
                                    <IndianRupee size={10} className="text-text-4 flex-shrink-0" />
                                    <span className="truncate">{track.formData.registrationFee}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-[11px] font-semibold text-primary/80 hidden sm:inline">
                              {isExpanded ? 'Collapse' : 'Edit details'}
                            </span>
                            <div className="w-6 h-6 rounded-md bg-surface-2 flex items-center justify-center text-text-3">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Full 10-Field Form */}
                        {isExpanded && (
                          <div className="border-t border-border bg-[#FAFAFA] p-4 sm:p-5 space-y-3.5">
                            {/* Track Name */}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="block text-[12px] font-semibold text-text-1">
                                  Competition Track Name <span className="text-red-500">*</span>
                                </label>
                                {track.aiFilledFields.has('name') ? (
                                  <AiFilledBadge />
                                ) : !track.formData.name ? (
                                  <AmberNullHint text="Required" />
                                ) : null}
                              </div>
                              <input
                                required
                                value={track.formData.name}
                                onChange={(e) =>
                                  updateTrackField(track.id, 'name', e.target.value)
                                }
                                maxLength={120}
                                placeholder="e.g., CodeSprint, RoboWars"
                                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                              />
                            </div>

                            {/* Fee & Prizes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Registration Fee
                                  </label>
                                  {track.aiFilledFields.has('registrationFee') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.registrationFee ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.registrationFee}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'registrationFee', e.target.value)
                                  }
                                  placeholder="e.g. Free, ₹200 / team"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Prize Details
                                  </label>
                                  {track.aiFilledFields.has('prizeDetails') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.prizeDetails ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.prizeDetails}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'prizeDetails', e.target.value)
                                  }
                                  placeholder="e.g. ₹25,000 + Goodies"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>
                            </div>

                            {/* Venue & Team Size */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Venue / Platform
                                  </label>
                                  {track.aiFilledFields.has('venue') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.venue ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.venue}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'venue', e.target.value)
                                  }
                                  placeholder="e.g. CSE Lab 3, Audi 2"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Team Size
                                  </label>
                                  {track.aiFilledFields.has('teamSize') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.teamSize ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.teamSize}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'teamSize', e.target.value)
                                  }
                                  placeholder="e.g. 1–4 Members"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>
                            </div>

                            {/* Eligibility & Duration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Eligibility
                                  </label>
                                  {track.aiFilledFields.has('eligibility') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.eligibility ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.eligibility}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'eligibility', e.target.value)
                                  }
                                  placeholder="e.g. Open to all UG students"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <label className="block text-[12px] font-semibold text-text-1">
                                    Duration / Rounds
                                  </label>
                                  {track.aiFilledFields.has('duration') ? (
                                    <AiFilledBadge />
                                  ) : !track.formData.duration ? (
                                    <AmberNullHint />
                                  ) : null}
                                </div>
                                <input
                                  value={track.formData.duration}
                                  onChange={(e) =>
                                    updateTrackField(track.id, 'duration', e.target.value)
                                  }
                                  placeholder="e.g. 24 Hours, 3 Rounds"
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                              </div>
                            </div>

                            {/* Registration Link */}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="block text-[12px] font-semibold text-text-1">
                                  Registration Link (if specific)
                                </label>
                                {track.aiFilledFields.has('registrationLink') ? (
                                  <AiFilledBadge />
                                ) : !track.formData.registrationLink ? (
                                  <AmberNullHint />
                                ) : null}
                              </div>
                              <input
                                value={track.formData.registrationLink}
                                onChange={(e) =>
                                  updateTrackField(track.id, 'registrationLink', e.target.value)
                                }
                                placeholder="https://..."
                                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                              />
                            </div>

                            {/* Description */}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="block text-[12px] font-semibold text-text-1">
                                  Description
                                </label>
                                {track.aiFilledFields.has('description') ? (
                                  <AiFilledBadge />
                                ) : !track.formData.description ? (
                                  <AmberNullHint />
                                ) : null}
                              </div>
                              <textarea
                                rows={2}
                                value={track.formData.description}
                                onChange={(e) =>
                                  updateTrackField(track.id, 'description', e.target.value)
                                }
                                maxLength={2000}
                                placeholder="Challenge or objective of this competition..."
                                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                              />
                            </div>

                            {/* Rules & Guidelines */}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="block text-[12px] font-semibold text-text-1">
                                  Rules & Guidelines
                                </label>
                                {track.aiFilledFields.has('rules') ? (
                                  <AiFilledBadge />
                                ) : !track.formData.rules ? (
                                  <AmberNullHint />
                                ) : null}
                              </div>
                              <textarea
                                rows={3}
                                value={track.formData.rules}
                                onChange={(e) =>
                                  updateTrackField(track.id, 'rules', e.target.value)
                                }
                                maxLength={1500}
                                placeholder="Judging criteria, submission formats, constraints..."
                                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Review Step Sticky Footer */}
              <div className="border-t border-border bg-white px-6 py-4 flex items-center justify-between gap-3 flex-shrink-0">
                <div className="text-[12px] text-text-3">
                  <span className="font-bold text-text-1">{selectedCount}</span> of {totalCount} tracks selected for creation
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => handleStartCreation()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-[13px] font-bold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    <span>Create Selected Tracks</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[11px] font-mono">
                      {selectedCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. CREATION & LIVE PROGRESS STEP */}
          {step === 'progress' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Progress Header Status */}
              <div className="px-6 py-4 border-b border-border bg-surface-1 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-text-1">
                    {creationDone
                      ? totalFailed === 0
                        ? 'All Selected Tracks Created!'
                        : 'Batch Creation Completed with Issues'
                      : 'Creating Tracks One by One...'}
                  </span>
                  <span className="font-mono text-[12px] font-bold text-primary">
                    {totalSuccess + totalFailed} / {selectedTracks.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      totalFailed > 0 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{
                      width: `${
                        selectedTracks.length > 0
                          ? Math.round(
                              ((totalSuccess + totalFailed) / selectedTracks.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {/* Summary Banner after completion */}
                {creationDone && (
                  <div className="mt-3">
                    {totalFailed === 0 ? (
                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-[12px] font-semibold flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                        <span>All {totalSuccess} tracks created successfully and added to your event!</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-[12px] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                          <span className="font-semibold">
                            {totalSuccess} created, {totalFailed} failed
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRetryFailed}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex-shrink-0"
                        >
                          <RotateCcw size={12} /> Retry failed ({totalFailed})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Progress List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
                {selectedTracks.map((track) => {
                  const statusInfo = creationStatuses[track.id] || { status: 'pending' };
                  const st = statusInfo.status;

                  return (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                        st === 'success'
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                          : st === 'failed'
                          ? 'border-rose-200 bg-rose-50/50 text-rose-900'
                          : st === 'processing'
                          ? 'border-primary/40 bg-primary-xlight/40 text-text-1'
                          : 'border-border bg-white text-text-3'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-6 flex-shrink-0">
                          {st === 'success' && (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          )}
                          {st === 'failed' && (
                            <AlertCircle size={18} className="text-rose-600" />
                          )}
                          {st === 'processing' && (
                            <RefreshCw size={16} className="animate-spin text-primary" />
                          )}
                          {st === 'pending' && (
                            <Clock size={16} className="text-text-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold">
                            {track.formData.name}
                          </div>
                          {st === 'failed' && statusInfo.error && (
                            <div className="text-[11px] text-rose-700 truncate mt-0.5">
                              {statusInfo.error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-[11px] font-semibold">
                        {st === 'success' && <span className="text-emerald-700">Created ✓</span>}
                        {st === 'failed' && <span className="text-rose-700">Failed</span>}
                        {st === 'processing' && <span className="text-primary">Creating…</span>}
                        {st === 'pending' && <span className="text-text-4">Queued</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Footer */}
              <div className="border-t border-border bg-white px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
                {creationDone ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-primary text-[13px] font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
                  >
                    Done & View Tracks
                  </button>
                ) : (
                  <div className="text-[12px] text-text-3 animate-pulse">
                    Creating tracks sequentially, please wait…
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

