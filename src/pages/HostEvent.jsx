import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { events as eventsApi, ai as aiApi } from '../services/api';
import FeaturedEventCard from '../components/FeaturedEventCard';
import Seo from '../components/Seo';
import { normaliseEvents } from '../services/normalise';
import ImageCropper from '../components/ImageCropper';
import AiPosterUploadCard from '../components/AiPosterUploadCard';
import { CATEGORIES } from '../data/categories';
import {
  Code2, Music4, Wrench, Trophy, Mic, Zap,
  ClipboardList, MapPin, Phone, Image, FileText,
  Building2, Globe, Layers, Sparkles,
  CalendarDays, Star, AlertTriangle, CheckCircle2, ScrollText, PartyPopper, Clock,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────── */
// Category tiles are sourced from the shared catalog so the six priority
// categories always lead, in the same order, across the whole platform.
// `name` is the exact backend category value submitted with the event.
const EVENT_TYPES = CATEGORIES.map(c => ({ Icon: c.Icon, name: c.value, label: c.label, color: c.color }));

const MODES = [
  { id: 'Offline', label: 'Offline', Icon: Building2, desc: 'In-person venue' },
  { id: 'Online',  label: 'Online',  Icon: Globe,     desc: 'Fully virtual'   },
  { id: 'Hybrid',  label: 'Hybrid',  Icon: Layers,    desc: 'Both formats'    },
];

const STEPS = [
  { n: 1, label: 'Basic Info',   Icon: ClipboardList },
  { n: 2, label: 'Date & Venue', Icon: MapPin },
  { n: 3, label: 'Prizes',       Icon: Trophy },
  { n: 4, label: 'Contact',      Icon: Phone },
  { n: 5, label: 'Media',        Icon: Image },
];

/* ─── Reusable field components ─────────────────────── */
const inputBase = `w-full px-4 py-[11px] border-[1.5px] rounded-md font-sans text-[14px] text-text-1 bg-white placeholder:text-text-4
  focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all duration-150 outline-none`;

function AiFilledBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded border border-[#C7D2FE] select-none">
      <Sparkles size={11} className="text-primary" />
      AI filled
    </span>
  );
}

function Field({ label, required, hint, error, prefix, badge, children }) {
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="flex items-center gap-1 text-[13px] font-semibold text-text-1">
            {label}
            {required && <span className="text-red text-[14px] leading-none">*</span>}
          </label>
          {badge}
        </div>
      )}
      <div className={prefix ? 'relative' : ''}>
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 text-[14px] font-medium select-none pointer-events-none">
            {prefix}
          </span>
        )}
        {children}
      </div>
      {hint  && !error && <p className="text-[12px] text-text-3 mt-1">{hint}</p>}
      {error && <p className="text-[12px] text-red mt-1 flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>}
    </div>
  );
}

function Input({ label, required, hint, error, prefix, badge, className = '', ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error} prefix={prefix} badge={badge}>
      <input className={`${inputBase} ${prefix ? 'pl-8' : ''} ${error ? 'border-red focus:border-red focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]' : 'border-[#CBCBC6]'} ${className}`} {...props} />
    </Field>
  );
}

function Textarea({ label, required, hint, error, badge, className = '', ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error} badge={badge}>
      <textarea
        className={`${inputBase} resize-y overflow-x-hidden min-h-[110px] ${error ? 'border-red focus:border-red focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]' : 'border-[#CBCBC6]'} ${className}`}
        {...props}
      />
    </Field>
  );
}

function Select({ label, required, hint, error, badge, children, ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error} badge={badge}>
      <select className={`${inputBase} cursor-pointer ${error ? 'border-red' : 'border-[#CBCBC6]'}`} {...props}>
        {children}
      </select>
    </Field>
  );
}

/* ─── Section card wrapper ───────────────────────────── */
function SectionCard({ icon, title, sub, children }) {
  return (
    <div className="bg-white border border-[#E4E4E0] rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F0ED] bg-[#FAFAF9]">
        <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center text-base flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-heading font-bold text-[14px] text-text-1 tracking-snug">{title}</div>
          {sub && <div className="text-[12px] text-text-3 mt-0.5">{sub}</div>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

/* ─── Step indicator ─────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done   = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all duration-200 flex-shrink-0
                ${done   ? 'border-primary bg-primary text-white shadow-[0_0_0_3px_rgba(79,70,229,0.15)]'
                : active ? 'border-primary text-primary bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.12)]'
                         : 'border-[#E4E4E0] text-text-4 bg-white'}`}>
                {done
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <s.Icon size={14} strokeWidth={2} />}
              </div>
              <span className={`text-[10px] font-semibold mt-1 hidden md:block whitespace-nowrap
                ${active ? 'text-primary' : done ? 'text-primary/70' : 'text-text-4'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 md:mb-5 transition-all duration-300
                ${s.n < current ? 'bg-primary' : 'bg-[#E4E4E0]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── File upload zone ───────────────────────────────── */
function UploadZone({ id, label, hint, accept, Icon: UpIcon, file, onFile, onRemove, error }) {
  const ref = useRef();
  return (
    <div id={id} style={{ scrollMarginTop: '90px' }}>
      {label && <label className="block text-[13px] font-semibold text-text-1 mb-1.5">{label}</label>}
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div key="filled"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="flex items-center gap-3 px-4 py-3 bg-green-bg border border-green-border rounded-md">
            <div className="w-8 h-8 rounded-md bg-[#BBF7D0] flex items-center justify-center flex-shrink-0">
              <UpIcon size={16} strokeWidth={1.8} className="text-[#16A34A]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#16A34A] truncate">{file.name}</div>
              <div className="text-[11px] text-[#16A34A]/70">{(file.size / 1024).toFixed(0)} KB</div>
            </div>
            <button onClick={onRemove}
              className="w-7 h-7 rounded-full bg-[#BBF7D0] flex items-center justify-center text-[#16A34A] hover:bg-red-bg hover:text-red transition-all flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </motion.div>
        ) : (
          <motion.label key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`flex flex-col items-center gap-2.5 border-2 border-dashed rounded-md py-7 px-4 cursor-pointer
              transition-all duration-150 group
              ${error ? 'border-red bg-red-bg/40' : 'border-[#CBCBC6] hover:border-primary hover:bg-primary-xlight'}`}>
            <div className="w-11 h-11 rounded-lg bg-surface-3 group-hover:bg-primary-light flex items-center justify-center transition-all">
              <UpIcon size={22} strokeWidth={1.8} className="text-text-3 group-hover:text-primary" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-text-2 group-hover:text-primary transition-colors">
                Click to upload
              </div>
              <div className="text-[12px] text-text-4 mt-0.5">{hint}</div>
            </div>
            <input ref={ref} type="file" accept={accept} className="hidden"
              onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
          </motion.label>
        )}
      </AnimatePresence>
      {error && <p className="text-[12px] text-red mt-1 flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>}
    </div>
  );
}

/* ─── Navigation buttons ─────────────────────────────── */
function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, submitting, nextLabel, submitAllowed = true, submitLabel = 'Submit Event for Review' }) {
  return (
    <div className="flex gap-3 pt-2">
      {step > 1 && (
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-[13px] border-[1.5px] border-[#CBCBC6] rounded-md
            text-[14px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all duration-150">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
      )}
      {step < totalSteps ? (
        <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onNext}
          className="flex-1 py-[13px] bg-primary text-white rounded-md text-[14px] font-bold
            flex items-center justify-center gap-2 hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.30)] transition-all duration-150">
          {nextLabel || 'Continue'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
        </motion.button>
      ) : (
        <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onSubmit} disabled={submitting}
          aria-disabled={!submitAllowed}
          className={`flex-1 py-[13px] bg-[#16A34A] text-white rounded-md text-[14px] font-bold
            flex items-center justify-center gap-2 hover:bg-[#15803D] hover:shadow-[0_4px_14px_rgba(22,163,74,0.30)]
            transition-all duration-150 disabled:opacity-60
            ${!submitAllowed ? 'opacity-55 cursor-not-allowed hover:bg-[#16A34A] hover:shadow-none' : ''}`}>
          {submitting
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg> {submitLabel}</>
          }
        </motion.button>
      )}
    </div>
  );
}



/* ─── Draft helpers (localStorage, 60-min TTL) ──────────────
   Schema v1: { v, savedAt, step, f }
   Version tag prevents old/incompatible drafts from loading.
─────────────────────────────────────────────────────────── */
const DRAFT_KEY = 'fn_host_draft';
const DRAFT_TTL = 60 * 60 * 1000; // 60 minutes

function persistDraft(step, f) {
  try {
    const empty = !f.title && !f.description && !f.category && !f.college && !f.startDate;
    if (empty) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, savedAt: Date.now(), step, f }));
  } catch {}
}
function retrieveDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d.v !== 1 || !d.savedAt || Date.now() - d.savedAt > DRAFT_TTL) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return d;
  } catch { return null; }
}
function purgeDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}
function minsLeft(savedAt) {
  return Math.max(0, Math.ceil((savedAt + DRAFT_TTL - Date.now()) / 60000));
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function HostEvent() {
  const navigate   = useNavigate();
  const { id: editEventId } = useParams();
  const isEditMode = Boolean(editEventId);
  const { showToast, requireAuth, isLoggedIn, currentUser } = useApp();

  const [step,      setStep]      = useState(1);
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [editLoading, setEditLoading] = useState(isEditMode);
  const [hasPrize,  setHasPrize]  = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [aiState, setAiState] = useState('empty'); // 'empty' | 'processing' | 'success' | 'partial' | 'failure'
  const [aiPageCount, setAiPageCount] = useState(0);
  const [aiFileName, setAiFileName] = useState('');
  const [aiFileSize, setAiFileSize] = useState(0);
  const [aiErrorMessage, setAiErrorMessage] = useState('');
  const [aiMissingSummary, setAiMissingSummary] = useState('');
  const [aiFilledFields, setAiFilledFields] = useState(new Set());
  const [extractedSubEvents, setExtractedSubEvents] = useState([]);
  const aiAbortRef = useRef(null); // holds active AbortController for AI upload
  const [draftBanner, setDraftBanner] = useState(null); // detected draft waiting for resume/discard
  const draftAutoRef    = useRef(null); // debounce timer
  const [featuredEvents,     setFeaturedEvents]     = useState([]);
  const [featuredLoading,    setFeaturedLoading]    = useState(true);

  useEffect(() => {
    eventsApi.featured()
      .then(r => setFeaturedEvents(normaliseEvents(r.data.events || [])))
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, []);

  // Detect an existing draft on first render
  useEffect(() => {
    if (isEditMode) return;
    const d = retrieveDraft();
    if (d) setDraftBanner(d);
  }, [isEditMode]);

  /* ── Form state ── */
  const [f, setF] = useState({
    // Basic
    title: '', description: '', category: '', mode: 'Offline',
    // Date & venue
    startDate: '', endDate: '', college: '', cityState: '', venue: '',
    // Prizes & registration
    prize1: '', prize2: '', prize3: '', totalPrize: '',
    regFee: '', regLink: '', perks: '',
    // Rules
    eligibility: '', rules: '',
    // Contact
    pocName: '', phone: '', email: '', website: '',
  });
  const [posterFile,    setPosterFile]    = useState(null);
  const [posterPreview, setPosterPreview] = useState(null); // stable object URL for preview
  const [cropperFile,   setCropperFile]   = useState(null); // raw file waiting to be cropped
  const [brochureFile,  setBrochureFile]  = useState(null);

  // Auto-save draft whenever form content or step changes (debounced 800ms)
  useEffect(() => {
    if (isEditMode) return undefined;
    clearTimeout(draftAutoRef.current);
    draftAutoRef.current = setTimeout(() => {
      persistDraft(step, f);
    }, 800);
    return () => clearTimeout(draftAutoRef.current);
  }, [f, step, isEditMode]);

  // Reuse this form for live-event edits. The server remains authoritative:
  // it rechecks ownership and approval before accepting the PATCH.
  useEffect(() => {
    if (!isEditMode) return undefined;
    let cancelled = false;
    eventsApi.get(editEventId)
      .then(response => {
        const event = response.data?.event;
        const ownerId = typeof event?.hostedBy === 'object' ? event.hostedBy?._id : event?.hostedBy;
        const userId = currentUser?._id || currentUser?.id;
        if (!event || !ownerId || !userId || String(ownerId) !== String(userId) || event.isActive === false || event.isApproved === false) {
          throw new Error('You are not allowed to edit this event.');
        }
        if (cancelled) return;
        const asDateInput = value => {
          if (!value) return '';
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
        };
        const price = String(event.price?.display || '');
        const isPaid = event.entryType === 'paid';
        const hasExistingPrize = event.entryType === 'prize' || Boolean(event.totalPrize);
        setF({
          title: event.name || '', description: event.about || '', category: event.category || '', mode: event.mode || 'Offline',
          startDate: asDateInput(event.date?.start), endDate: asDateInput(event.date?.end), college: event.college || '', cityState: event.city || '', venue: event.venue || '',
          prize1: event.prize1 || '', prize2: event.prize2 || '', prize3: event.prize3 || '', totalPrize: event.totalPrize || '',
          regFee: isPaid ? price.replace(/[^0-9.]/g, '') : 'Free', regLink: event.registrationUrl || '', perks: event.perks || '',
          eligibility: event.eligibility || '', rules: event.rules || '', pocName: event.pocName || '', phone: event.pocPhone || '', email: event.pocEmail || '', website: event.website || '',
        });
        setHasPrize(hasExistingPrize);
        setEditLoading(false);
      })
      .catch(error => {
        if (!cancelled) {
          setEditLoading(false);
          showToast(error.message || 'Unable to load this event for editing.', 'error');
          navigate(`/event/${editEventId}`, { replace: true });
        }
      });
    return () => { cancelled = true; };
  }, [isEditMode, editEventId, currentUser, navigate, showToast]);

  // When posterFile changes, create a stable preview URL
  useEffect(() => {
    if (!posterFile) { setPosterPreview(null); return; }
    const url = URL.createObjectURL(posterFile);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  const upd = (k, v) => {
    setF(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
    setAiFilledFields(prev => {
      if (!prev.has(k)) return prev;
      const next = new Set(prev);
      next.delete(k);
      return next;
    });
  };

  // Numeric-only update: strips letters/symbols/commas at the keystroke level,
  // keeping digits and at most one decimal point. Used for the Prize Pool field.
  const updNumeric = (k, raw) => {
    let v = raw.replace(/[^\d.]/g, '');
    const dot = v.indexOf('.');
    if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
    upd(k, v);
  };

  const toggleHasPrize = () => {
    setHasPrize(p => !p);
    setAiFilledFields(prev => {
      if (!prev.has('hasPrize') && !prev.has('totalPrize')) return prev;
      const next = new Set(prev);
      next.delete('hasPrize');
      next.delete('totalPrize');
      return next;
    });
  };

  /* ── AI Autofill handlers ── */
  const handleAiReset = () => {
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
      aiAbortRef.current = null;
    }
    setAiState('empty');
    setAiFileName('');
    setAiFileSize(0);
    setAiPageCount(0);
    setAiErrorMessage('');
    setAiMissingSummary('');
    setAiFilledFields(new Set());
    setExtractedSubEvents([]);
  };

  const handleAiFillManually = () => {
    // Graceful fallback to manual flow; form remains fully accessible
  };

  const handleAiUpload = async (file) => {
    const reqId = `ai_req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    console.log(`[AI Poster Upload][${reqId}] Starting clean upload attempt: file="${file?.name}", size=${file?.size} bytes, time=${new Date().toISOString()}`);

    if (!file) return;

    // 1. Abort any previous in-flight AI extraction request before starting a new one
    if (aiAbortRef.current) {
      console.log(`[AI Poster Upload][${reqId}] Aborting previous in-flight AI extraction request`);
      aiAbortRef.current.abort();
      aiAbortRef.current = null;
    }

    // 2. Explicitly reset ALL state to initial values at the START of each upload attempt
    setAiErrorMessage('');
    setAiMissingSummary('');
    setAiPageCount(0);
    setAiFilledFields(new Set());
    setExtractedSubEvents([]);
    setAiFileName(file.name);
    setAiFileSize(file.size);
    setAiState('processing');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setAiState('failure');
      setAiErrorMessage('Only PDF files are supported. Please upload a PDF poster or brochure.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAiState('failure');
      setAiErrorMessage('File size exceeds the 25 MB limit. Please upload a smaller PDF.');
      return;
    }

    // 3. Create a brand new AbortController for this upload attempt
    const controller = new AbortController();
    aiAbortRef.current = controller;

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await aiApi.parseEventPoster(fd, { signal: controller.signal });

      // If aborted while waiting, discard response
      if (controller.signal.aborted) {
        console.log(`[AI Poster Upload][${reqId}] Request was aborted; discarding response`);
        return;
      }

      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Couldn't read PDF");
      }

      const raw = res.data;
      const pages = res.pageCount || 1;
      setAiPageCount(pages);

      const newFilled = new Set();
      const updates = {};
      const cleanStr = (val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : null);

      // 1. category
      const rawCat = cleanStr(raw.category);
      let categoryNeedsReview = false;
      if (rawCat) {
        const match = EVENT_TYPES.find(t => t.name.toLowerCase() === rawCat.toLowerCase())?.name;
        if (match) {
          updates.category = match;
          newFilled.add('category');
        } else {
          // AI category does not match an existing FestNest category:
          // Leave existing category unchanged and mark for manual review
          categoryNeedsReview = true;
        }
      }

      // 2. eventTitle -> title
      const rawTitle = cleanStr(raw.eventTitle);
      if (rawTitle) {
        updates.title = rawTitle.slice(0, 100);
        newFilled.add('title');
      }

      // 3. description -> description
      const rawDesc = cleanStr(raw.description);
      if (rawDesc) {
        updates.description = rawDesc.slice(0, 5000);
        newFilled.add('description');
      }

      // 4. mode -> mode
      const rawMode = cleanStr(raw.mode);
      if (rawMode) {
        const matchMode = ['Offline', 'Online', 'Hybrid'].find(m => m.toLowerCase() === rawMode.toLowerCase());
        if (matchMode) {
          updates.mode = matchMode;
          newFilled.add('mode');
        }
      }

      // 5. startDate -> startDate
      const rawStart = cleanStr(raw.startDate);
      if (rawStart) {
        const normStart = /^\d{4}-\d{2}-\d{2}$/.test(rawStart) ? rawStart : (!isNaN(new Date(rawStart).getTime()) ? new Date(rawStart).toISOString().slice(0, 10) : null);
        if (normStart) {
          updates.startDate = normStart;
          newFilled.add('startDate');
        }
      }

      // 6. endDate -> endDate
      const rawEnd = cleanStr(raw.endDate);
      if (rawEnd) {
        const normEnd = /^\d{4}-\d{2}-\d{2}$/.test(rawEnd) ? rawEnd : (!isNaN(new Date(rawEnd).getTime()) ? new Date(rawEnd).toISOString().slice(0, 10) : null);
        if (normEnd) {
          updates.endDate = normEnd;
          newFilled.add('endDate');
        }
      }

      // 7. collegeOrganization -> college
      const rawCollege = cleanStr(raw.collegeOrganization);
      if (rawCollege) {
        updates.college = rawCollege.slice(0, 100);
        newFilled.add('college');
      }

      // 8. cityState -> cityState
      const rawCity = cleanStr(raw.cityState);
      if (rawCity) {
        updates.cityState = rawCity.slice(0, 200);
        newFilled.add('cityState');
      }

      // 9. venue -> venue
      const rawVenue = cleanStr(raw.venue);
      if (rawVenue) {
        updates.venue = rawVenue;
        newFilled.add('venue');
      }

      // 10. hasPrizePool & totalPrizeAmount (canonical only, no sub-event calculation)
      const rawHasPrize = typeof raw.hasPrizePool === 'boolean' ? raw.hasPrizePool : null;
      const rawTotalPrize = cleanStr(raw.totalPrizeAmount);

      if (rawHasPrize !== null) {
        setHasPrize(rawHasPrize);
        newFilled.add('hasPrize');
      } else if (rawTotalPrize && parseFloat(rawTotalPrize) > 0) {
        setHasPrize(true);
        newFilled.add('hasPrize');
      }

      if (rawTotalPrize) {
        // Strip ₹, currency codes, commas, and other non-digit characters except single decimal point
        // e.g. "₹5,00,000" -> "500000", "₹5,00,000.50" -> "500000.50"
        let numericPrize = rawTotalPrize
          .replace(/Rs\./gi, '')
          .replace(/₹|INR|,|\s|\/-/gi, '')
          .replace(/[^\d.]/g, '');
        const dot = numericPrize.indexOf('.');
        if (dot !== -1) {
          numericPrize = numericPrize.slice(0, dot + 1) + numericPrize.slice(dot + 1).replace(/\./g, '');
        }
        if (numericPrize && parseFloat(numericPrize) >= 0) {
          updates.totalPrize = numericPrize;
          newFilled.add('totalPrize');
          if (parseFloat(numericPrize) > 0 && rawHasPrize === null) {
            setHasPrize(true);
            newFilled.add('hasPrize');
          }
        }
      }

      // 11. registrationFee -> regFee
      const rawFee = cleanStr(raw.registrationFee);
      if (rawFee) {
        updates.regFee = rawFee;
        newFilled.add('regFee');
      }

      // 12. registrationLink -> regLink
      const rawLink = cleanStr(raw.registrationLink);
      if (rawLink) {
        updates.regLink = rawLink;
        newFilled.add('regLink');
      }

      // 13. otherPerks -> perks
      const rawPerks = cleanStr(raw.otherPerks);
      if (rawPerks) {
        updates.perks = rawPerks;
        newFilled.add('perks');
      }

      // 14. eligibility -> eligibility
      const rawElig = cleanStr(raw.eligibility);
      if (rawElig) {
        updates.eligibility = rawElig;
        newFilled.add('eligibility');
      }

      // 15. rules -> rules
      const rawRules = cleanStr(raw.rules);
      if (rawRules) {
        updates.rules = rawRules;
        newFilled.add('rules');
      }

      // 16. pocName -> pocName
      const rawPoc = cleanStr(raw.pocName);
      if (rawPoc) {
        updates.pocName = rawPoc.slice(0, 100);
        newFilled.add('pocName');
      }

      // 17. phone -> phone
      const rawPhone = cleanStr(raw.phone);
      if (rawPhone) {
        updates.phone = rawPhone;
        newFilled.add('phone');
      }

      // 18. email -> email
      const rawEmail = cleanStr(raw.email);
      if (rawEmail) {
        updates.email = rawEmail;
        newFilled.add('email');
      }

      // 19. website -> website
      const rawWeb = cleanStr(raw.website);
      if (rawWeb) {
        updates.website = rawWeb;
        newFilled.add('website');
      }

      // Sub-events mapping: canonical fields only (no fallback to s.name, s.venue, s.duration, s.rules)
      if (Array.isArray(raw.subEvents) && raw.subEvents.length > 0) {
        const mapped = raw.subEvents.map(s => ({
          name: cleanStr(s.trackName) || '',
          registrationFee: cleanStr(s.registrationFee) || '',
          prizeDetails: cleanStr(s.prizeDetails) || '',
          venue: cleanStr(s.venuePlatform) || '',
          teamSize: cleanStr(s.teamSize) || '',
          eligibility: cleanStr(s.eligibility) || '',
          duration: cleanStr(s.durationRounds) || '',
          registrationLink: cleanStr(s.registrationLink) || '',
          description: cleanStr(s.description) || '',
          rules: cleanStr(s.rulesGuidelines) || '',
        }));
        setExtractedSubEvents(mapped);
      }

      // Merge into form state preserving all non-AI fields
      setF(prev => ({
        ...prev,
        ...updates,
      }));

      setAiFilledFields(newFilled);

      // Determine partial vs full extraction
      const missing = [];
      if (categoryNeedsReview) missing.push('category');
      if (!rawTitle) missing.push('event title');
      if (!rawStart) missing.push('dates');
      if (!rawLink) missing.push('registration link');
      if (!rawPoc || (!rawPhone && !rawEmail)) missing.push('contact info');

      if (categoryNeedsReview || (missing.length > 0 && newFilled.size < 6)) {
        setAiMissingSummary(`We found some details, but ${missing.join(', ')} need manual review. Please check the fields below.`);
        setAiState('partial');
      } else {
        setAiState('success');
      }

      showToast('Event details extracted with AI ✓', 'success');
    } catch (err) {
      // If this request was aborted by a subsequent upload or reset, silently ignore
      if (controller.signal.aborted) {
        console.log(`[AI Poster Upload][${reqId}] Request was aborted; ignoring error`);
        return;
      }
      console.error(`[AI Poster Upload][${reqId}] Error:`, err);
      setAiState('failure');
      if (err.status === 408 || err.isTimeout || err.name === 'AbortError') {
        setAiErrorMessage('This PDF took too long to process. Try a smaller or lower-resolution file, or fill in manually.');
      } else {
        setAiErrorMessage(err.message || "Couldn't read PDF");
      }
    } finally {
      if (aiAbortRef.current === controller) {
        aiAbortRef.current = null;
      }
    }
  };

  /* ── Validation rules ── */
  const PHONE_RE = /^[+\d][\d\s\-().]{5,18}$/;
  const URL_RE   = /^https?:\/\/.+/i;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Whole number with an optional decimal (max 2 places). No commas, symbols, or letters.
  const MONEY_RE = /^\d+(\.\d{1,2})?$/;

  // Which step each field lives on — drives "jump to the first invalid field".
  const FIELD_STEP = {
    category: 1, title: 1, description: 1,
    startDate: 2, college: 2, cityState: 2,
    totalPrize: 3, regFee: 3, regLink: 3,
    pocName: 4, phone: 4, email: 4, website: 4,
    poster: 5, brochure: 5,
    termsAgreement: 5,
  };

  // Pure: compute the errors for a single step. Does not touch state.
  const computeErrors = (s) => {
    const errs = {};
    if (s === 1) {
      if (!f.category)                             errs.category    = 'Please select a category';
      if (!f.title.trim())                         errs.title       = 'Event title is required';
      else if (f.title.trim().length > 100)        errs.title       = 'Event title cannot exceed 100 characters';
      if (!f.description.trim())                   errs.description = 'Description is required';
      else if (f.description.trim().length > 5000) errs.description = 'Description cannot exceed 5000 characters';
    }
    if (s === 2) {
      if (!f.startDate)                            errs.startDate = 'Start date is required';
      if (f.endDate && f.startDate && f.endDate < f.startDate)
        errs.endDate = 'End date cannot be before the start date';
      if (!f.college.trim())                       errs.college   = 'College / Organization is required';
      else if (f.college.trim().length > 100)      errs.college   = 'Organizer name cannot exceed 100 characters';
      if (!f.cityState.trim())                     errs.cityState = 'City / State is required';
      else if (f.cityState.length > 200)           errs.cityState = 'Location cannot exceed 200 characters';
    }
    if (s === 3) {
      if (hasPrize) {
        if (!f.totalPrize.trim())                  errs.totalPrize = 'Prize pool is required when a prize pool is enabled';
        else if (!MONEY_RE.test(f.totalPrize.trim())) errs.totalPrize = 'Prize pool must contain numbers only';
      }
      if (f.regFee.trim() && f.regFee.trim().toLowerCase() !== 'free' && !MONEY_RE.test(f.regFee.trim()))
        errs.regFee = 'Registration fee must be a valid number';
      if (!f.regLink.trim())
        errs.regLink = 'Registration link is required — all attendees will be redirected here to register';
      else if (!URL_RE.test(f.regLink.trim()))
        errs.regLink = 'Please enter a valid URL starting with https://';
    }
    if (s === 4) {
      if (!f.pocName.trim())                       errs.pocName = 'Contact name is required';
      else if (f.pocName.trim().length > 100)      errs.pocName = 'Contact name cannot exceed 100 characters';
      if (!f.phone.trim())                         errs.phone   = 'Phone number is required';
      else if (!PHONE_RE.test(f.phone.trim()))     errs.phone   = 'Enter a valid phone number (e.g. +91 98765 43210)';
      if (!f.email.trim())                         errs.email   = 'Email is required';
      else if (!EMAIL_RE.test(f.email.trim()))     errs.email   = 'Enter a valid email address';
      if (f.website.trim() && !URL_RE.test(f.website.trim()))
        errs.website = 'Enter a valid website URL';
    }
    if (s === 5) {
      const imgTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (posterFile) {
        if (!imgTypes.includes(posterFile.type))   errs.poster = 'Poster must be JPG, PNG, or WEBP';
        else if (posterFile.size > 5 * 1024 * 1024) errs.poster = 'Poster size cannot exceed 5 MB';
      }
      if (brochureFile) {
        if (brochureFile.type !== 'application/pdf') errs.brochure = 'Brochure must be a PDF file';
        else if (brochureFile.size > 10 * 1024 * 1024) errs.brochure = 'Brochure size cannot exceed 10 MB';
      }
      if (!isEditMode && !termsAccepted) errs.termsAgreement = 'Please agree to the Terms of Hosting and Privacy Policy to continue.';
    }
    return errs;
  };

  // Validate a single step, commit its errors to state, return them.
  const validate = (s) => {
    const errs = computeErrors(s);
    setErrors(errs);
    return errs;
  };

  // Validate every step at once (used on final submit).
  const validateAll = () => {
    let all = {};
    for (let s = 1; s <= 5; s++) all = { ...all, ...computeErrors(s) };
    setErrors(all);
    return all;
  };

  // Maps an error key to the DOM id of its field, then scrolls/focuses it.
  const scrollToFirstError = (errs) => {
    const firstKey = Object.keys(errs)[0];
    if (!firstKey) return;
    const el = document.getElementById(`host-${firstKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') setTimeout(() => el.focus({ preventScroll: true }), 300);
    }
  };

  const goNext = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) {
      showToast('Please fix the highlighted fields below', 'error');
      scrollToFirstError(errs);
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ── Submit ── */
  const submit = async () => {
    const errs = validateAll();
    if (Object.keys(errs).length) {
      const firstKey   = Object.keys(errs)[0];
      const targetStep = FIELD_STEP[firstKey] || step;
      showToast('Please fix the highlighted fields below', 'error');
      // If the first error is on an earlier step, navigate there before scrolling.
      if (targetStep !== step) {
        setStep(targetStep);
        setTimeout(() => scrollToFirstError(errs), 350);
      } else {
        scrollToFirstError(errs);
      }
      return;
    }
    if (!requireAuth()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('eventName',       f.title);
      fd.append('college',         f.college);
      fd.append('eventType',       f.category || 'Other');
      fd.append('startDate',       f.startDate);
      fd.append('city',            f.cityState);
      fd.append('venue',           f.venue);
      fd.append('about',           f.description);
      fd.append('registrationUrl', f.regLink);
      const feeTrim = f.regFee.trim();
      const isFree  = !feeTrim || feeTrim.toLowerCase() === 'free';
      fd.append('entryFee',        f.regFee);
      fd.append('isPaid',          isFree ? 'false' : 'true');
      fd.append('hasPrize',        hasPrize ? 'true' : 'false');
      fd.append('totalPrize',      hasPrize ? f.totalPrize : '');
      // prizeDetails = badge summary: "₹X Prize Pool"
      fd.append('prizeDetails', hasPrize && f.totalPrize ? `₹${f.totalPrize} Prize Pool` : '');
      fd.append('eligibility',     f.eligibility);
      fd.append('rules',           f.rules);
      fd.append('pocName',         f.pocName);
      fd.append('pocPhone',        f.phone);
      fd.append('pocEmail',        f.email);
      fd.append('website',         f.website);
      fd.append('perks',           f.perks);
      if (posterFile)   fd.append('bannerImage', posterFile);
      if (brochureFile) fd.append('brochure',    brochureFile);

      if (isEditMode) {
        const response = await eventsApi.update(editEventId, fd);
        showToast('Event updated successfully.', 'success');
        navigate(`/event/${response.data?.event?.slug || editEventId}`, { replace: true });
      } else {
        const storedRef = localStorage.getItem('fn_referral_code');
        if (storedRef && storedRef.trim()) {
          fd.append('referredByCode', storedRef.trim().toUpperCase());
        }

        await eventsApi.host(fd);

        if (storedRef) {
          localStorage.removeItem('fn_referral_code');
        }

        purgeDraft();
        setDone(true);
      }
    } catch (e) {
      showToast(e.message || 'Submission failed — please try again', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16 text-center">
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="w-24 h-24 rounded-full bg-green-bg border-[3px] border-green-border flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(22,163,74,0.08)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="inline-flex items-center gap-1.5 bg-green-bg border border-green-border text-[#16A34A] text-[12px] font-bold px-3 py-1 rounded-md mb-4">
          <CheckCircle2 size={12} strokeWidth={2} /> Submitted successfully
        </div>
        <h2 className="font-heading font-bold text-[26px] md:text-[30px] text-text-1 tracking-tight mb-3">
          Your event is under review!
        </h2>
        <p className="text-[15px] text-text-2 leading-relaxed mb-2 max-w-[400px] mx-auto">
          <span className="font-semibold text-text-1">{f.title}</span> has been submitted.
          Our team will review and publish it within 24 hours.
        </p>
        <p className="text-[13px] text-text-3 mb-8">You'll receive a notification once it goes live.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-primary text-white rounded-md text-[14px] font-bold hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all">
            Back to Home
          </button>
          <button onClick={() => { purgeDraft(); setDone(false); setStep(1); setHasPrize(false); setTermsAccepted(false); setF({ title:'',description:'',category:'',mode:'Offline',startDate:'',endDate:'',college:'',cityState:'',venue:'',prize1:'',prize2:'',prize3:'',totalPrize:'',regFee:'',regLink:'',perks:'',eligibility:'',rules:'',pocName:'',phone:'',email:'',website:'' }); setPosterFile(null); setBrochureFile(null); }}
            className="px-8 py-3.5 border-[1.5px] border-[#CBCBC6] rounded-md text-[14px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all">
            Post Another Event
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (editLoading) return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#F8F8F6]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-[13px] font-medium text-text-3">Loading event details…</p>
      </div>
    </div>
  );

  /* ── Header banner ── */
  const HeaderBanner = () => (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary to-[#7C3AED] px-6 py-6 mb-8">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/08 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/80 text-[13px] font-semibold tracking-wide uppercase">FestNest</span>
        </div>
        <h1 className="font-heading font-bold text-[22px] md:text-[26px] text-white tracking-tight leading-tight mb-1">
          {isEditMode ? 'Edit Event' : 'Post Your Event'}
        </h1>
        <p className="text-white/75 text-[14px]">
          {isEditMode ? 'Update your live event details. Changes are published immediately.' : <>Reach <span className="text-white font-bold">48,000+</span> students across India.</>}
        </p>
      </div>
    </div>
  );

  return (
    <>
    {/* Poster cropper modal — rendered outside the page scroll so it covers everything */}
    {cropperFile && (
      <ImageCropper
        file={cropperFile}
        onApply={croppedFile => {
          setPosterFile(croppedFile);
          setCropperFile(null);
        }}
        onCancel={() => setCropperFile(null)}
      />
    )}

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-[#F8F8F6] min-h-screen w-full overflow-x-hidden">

      <Seo
        title={isEditMode ? 'Edit Event' : 'Post Your Event'}
        description={isEditMode ? 'Update your live FestNest event.' : 'Hosting a hackathon, fest, or workshop? Submit your college event to FestNest and reach 48,000+ students across India for free.'}
        canonical={isEditMode ? `/event/${editEventId}/edit` : '/host'}
      />

      <div className="px-4 pt-6 pb-24 md:px-6 md:pt-10
                      lg:max-w-[1100px] lg:mx-auto lg:px-8
                      lg:grid lg:grid-cols-[3fr_1fr] lg:gap-8 lg:items-start">

        {/* ── Form column ── */}
        <div className="max-w-[680px] mx-auto w-full lg:max-w-none lg:mx-0">
          <HeaderBanner />
          <StepBar current={step} />

          {/* ── Draft restore banner ── */}
          <AnimatePresence>
            {!isEditMode && draftBanner && (
              <motion.div
                key="draft-banner"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-4 py-3.5 mb-5 bg-amber-bg border border-amber-border rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={17} strokeWidth={1.8} className="text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-1 truncate">
                    Unsaved draft{draftBanner.f.title ? ` · "${draftBanner.f.title}"` : ''}
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    Step {draftBanner.step} of 5 · {minsLeft(draftBanner.savedAt)} min remaining
                  </div>
                </div>
                <button
                  onClick={() => {
                    setF(draftBanner.f);
                    setHasPrize(!!draftBanner.f.totalPrize);
                    setStep(draftBanner.step);
                    setDraftBanner(null);
                    showToast('Draft restored ✓', 'success');
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-md text-[12px] font-bold text-primary bg-primary-light border border-[#C7D2FE] hover:bg-primary hover:text-white transition-all duration-fast">
                  Resume →
                </button>
                <button
                  onClick={() => { purgeDraft(); setDraftBanner(null); }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-md text-[12px] font-semibold text-text-3 bg-white border border-border hover:text-red hover:border-red transition-all duration-fast">
                  Discard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Validation summary (current step) ── */}
          {(() => {
            const stepErrors = Object.entries(errors).filter(
              ([k, v]) => v && FIELD_STEP[k] === step
            );
            if (stepErrors.length < 2) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 mb-5 bg-red-bg border border-red-border rounded-lg"
                role="alert" aria-live="assertive">
                <AlertTriangle size={17} strokeWidth={2} className="text-red flex-shrink-0 mt-0.5" />
                <div className="text-[13px] text-red font-semibold">
                  Please fix the {stepErrors.length} highlighted fields below.
                </div>
              </motion.div>
            );
          })()}

          <AnimatePresence mode="wait">

          {/* ════════════ STEP 1: BASIC INFO ════════════ */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              {/* ── Optional Collapsible AI Autofill Section ── */}
              <AiPosterUploadCard
                state={aiState}
                pageCount={aiPageCount}
                fileName={aiFileName}
                fileSize={aiFileSize}
                errorMessage={aiErrorMessage}
                missingSummary={aiMissingSummary}
                onUpload={handleAiUpload}
                onReset={handleAiReset}
                onFillManually={handleAiFillManually}
              />

              <SectionCard icon={<ClipboardList size={16} strokeWidth={1.8} className="text-primary" />} title="Basic Information" sub="Tell us about your event">

                {/* Category tiles */}
                <div id="host-category" style={{ scrollMarginTop: '90px' }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="flex items-center gap-1 text-[13px] font-semibold text-text-1">
                      Category <span className="text-red text-[14px] leading-none">*</span>
                    </label>
                    {aiFilledFields.has('category') && <AiFilledBadge />}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TYPES.map(({ Icon: ETypeIcon, name, label, color }) => (
                      <motion.button key={name} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                        onClick={() => upd('category', name)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-md border-[1.5px] transition-all duration-150
                          ${f.category === name
                            ? 'border-primary bg-primary-light shadow-[0_0_0_3px_rgba(79,70,229,0.10)]'
                            : 'border-[#E4E4E0] bg-white hover:border-primary-mid hover:bg-[#F5F3FF]'}`}>
                        <div className={`w-9 h-9 rounded-md ${color} flex items-center justify-center`}>
                          <ETypeIcon size={18} strokeWidth={1.8} />
                        </div>
                        <span className={`text-[11px] font-semibold leading-snug text-center ${f.category === name ? 'text-primary' : 'text-text-2'}`}>
                          {label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.category && <p className="text-[12px] text-red mt-1">{errors.category}</p>}
                </div>

                <Input id="host-title" label="Event Title" required placeholder="e.g. TechFest 2025"
                  maxLength={100}
                  badge={aiFilledFields.has('title') ? <AiFilledBadge /> : null}
                  value={f.title} onChange={e => upd('title', e.target.value)} error={errors.title}
                  hint={f.title.length > 80 ? `${f.title.length}/100 characters` : undefined} />

                <Textarea id="host-description" label="Description" required
                  placeholder="Describe your event — what will participants do, learn, or win?"
                  badge={aiFilledFields.has('description') ? <AiFilledBadge /> : null}
                  rows={8} maxLength={5000} value={f.description} onChange={e => upd('description', e.target.value)}
                  className="min-h-[240px] md:min-h-[280px] py-4 px-4 leading-7 text-[14px] whitespace-pre-wrap break-words"
                  error={errors.description} />

                {/* Mode */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="block text-[13px] font-semibold text-text-1">Mode</label>
                    {aiFilledFields.has('mode') && <AiFilledBadge />}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {MODES.map(({ id, label, Icon: MIcon, desc }) => {
                      const active = f.mode === id;
                      return (
                        <button key={id} onClick={() => upd('mode', id)}
                          className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-md border-[1.5px]
                                      transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                                      ${active
                                        ? 'border-primary bg-primary-light shadow-[0_0_0_3px_rgba(79,70,229,0.09)]'
                                        : 'border-[#E4E4E0] bg-white hover:border-[#CBCBC6] hover:bg-[#FAFAF9] hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]'}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                           transition-all duration-200
                                           ${active
                                             ? 'bg-primary text-white shadow-[0_3px_10px_rgba(79,70,229,0.32)]'
                                             : 'bg-[#F1F0ED] text-[#8A8A85] group-hover:bg-[#E9E9E5]'}`}>
                            <MIcon size={19} strokeWidth={1.8} />
                          </div>
                          <div className="text-center leading-none">
                            <div className={`text-[13px] font-bold transition-colors duration-150
                                             ${active ? 'text-primary' : 'text-text-1'}`}>
                              {label}
                            </div>
                            <div className={`text-[11px] mt-1 transition-colors duration-150
                                             ${active ? 'text-primary/65' : 'text-text-4'}`}>
                              {desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>

              <NavButtons step={step} totalSteps={5} onNext={goNext} nextLabel="Date & Location →" />
            </motion.div>
          )}

          {/* ════════════ STEP 2: DATE & VENUE ════════════ */}
          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <SectionCard icon={<CalendarDays size={16} strokeWidth={1.8} className="text-primary" />} title="Date and Location" sub="When and where is it happening?">
                <div className="grid grid-cols-2 gap-3">
                  <Input id="host-startDate" label="Start Date" required type="date"
                    badge={aiFilledFields.has('startDate') ? <AiFilledBadge /> : null}
                    value={f.startDate} onChange={e => upd('startDate', e.target.value)}
                    error={errors.startDate} />
                  <Input id="host-endDate" label="End Date" type="date"
                    badge={aiFilledFields.has('endDate') ? <AiFilledBadge /> : null}
                    value={f.endDate} onChange={e => upd('endDate', e.target.value)}
                    error={errors.endDate} />
                </div>

                <Input id="host-college" label="College / Organization" required
                  placeholder="e.g. IIT Bombay"
                  maxLength={100}
                  badge={aiFilledFields.has('college') ? <AiFilledBadge /> : null}
                  value={f.college} onChange={e => upd('college', e.target.value)}
                  error={errors.college} />

                <Input id="host-cityState" label="City / State"
                  placeholder="e.g. Mumbai, MH"
                  maxLength={200}
                  badge={aiFilledFields.has('cityState') ? <AiFilledBadge /> : null}
                  value={f.cityState} onChange={e => upd('cityState', e.target.value)}
                  error={errors.cityState} />

                <Input label="Venue"
                  placeholder="e.g. Main Auditorium"
                  badge={aiFilledFields.has('venue') ? <AiFilledBadge /> : null}
                  value={f.venue} onChange={e => upd('venue', e.target.value)} />
              </SectionCard>

              <NavButtons step={step} totalSteps={5} onBack={goBack} onNext={goNext} nextLabel="Prizes & Registration →" />
            </motion.div>
          )}

          {/* ════════════ STEP 3: PRIZES & REGISTRATION ════════════ */}
          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <SectionCard icon={<Trophy size={16} strokeWidth={1.8} className="text-primary" />} title="Prizes and Registration" sub="Optional — fill what's applicable">
                {/* Prize pool toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-2 rounded-md border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-text-1">Has a Prize Pool?</span>
                    {aiFilledFields.has('hasPrize') && <AiFilledBadge />}
                  </div>
                  <button
                    type="button"
                    onClick={toggleHasPrize}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                      ${hasPrize ? 'bg-primary' : 'bg-[#D1D5DB]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                      ${hasPrize ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {hasPrize && (
                  <Input id="host-totalPrize" label="Total Prize Amount (₹)" required
                    placeholder="e.g. 200000 or 2500.50"
                    inputMode="decimal"
                    hint="Numbers only — no commas or symbols"
                    badge={aiFilledFields.has('totalPrize') ? <AiFilledBadge /> : null}
                    value={f.totalPrize} onChange={e => updNumeric('totalPrize', e.target.value)}
                    error={errors.totalPrize} />
                )}

                <div className="h-px bg-[#F1F0ED]" />

                <Input id="host-regFee" label="Registration Fee"
                  placeholder='e.g. 200 or "Free"'
                  badge={aiFilledFields.has('regFee') ? <AiFilledBadge /> : null}
                  value={f.regFee} onChange={e => upd('regFee', e.target.value)}
                  error={errors.regFee} />

                <Input id="host-regLink" label="Registration Link" type="url" required
                  placeholder="https://forms.gle/..."
                  badge={aiFilledFields.has('regLink') ? <AiFilledBadge /> : null}
                  value={f.regLink} onChange={e => upd('regLink', e.target.value)}
                  error={errors.regLink}
                  hint="Students will be redirected to this link to register. Make sure it's the official registration form." />

                <Textarea label="Other Perks"
                  placeholder="Internship offers, goodies, certificates, swag..."
                  badge={aiFilledFields.has('perks') ? <AiFilledBadge /> : null}
                  rows={3} value={f.perks} onChange={e => upd('perks', e.target.value)} />
              </SectionCard>

              <SectionCard icon={<ScrollText size={16} strokeWidth={1.8} className="text-primary" />} title="Rules and Eligibility" sub="Optional but recommended">
                <Textarea label="Eligibility"
                  placeholder="Who can participate? Year, branch, college restrictions..."
                  badge={aiFilledFields.has('eligibility') ? <AiFilledBadge /> : null}
                  rows={3} value={f.eligibility} onChange={e => upd('eligibility', e.target.value)} />

                <Textarea label="Rules"
                  placeholder="Important rules, dos and don'ts..."
                  badge={aiFilledFields.has('rules') ? <AiFilledBadge /> : null}
                  rows={3} value={f.rules} onChange={e => upd('rules', e.target.value)} />
              </SectionCard>

              <NavButtons step={step} totalSteps={5} onBack={goBack} onNext={goNext} nextLabel="Contact Info →" />
            </motion.div>
          )}

          {/* ════════════ STEP 4: CONTACT ════════════ */}
          {step === 4 && (
            <motion.div key="s4"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <SectionCard icon={<Phone size={16} strokeWidth={1.8} className="text-primary" />} title="Contact Information" sub="Students will reach out to you">
                <Input id="host-pocName" label="POC Name" required
                  placeholder="Contact person name"
                  maxLength={100}
                  badge={aiFilledFields.has('pocName') ? <AiFilledBadge /> : null}
                  value={f.pocName} onChange={e => upd('pocName', e.target.value)}
                  error={errors.pocName} />

                <div className="grid grid-cols-2 gap-3">
                  <Input id="host-phone" label="Phone" required type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    badge={aiFilledFields.has('phone') ? <AiFilledBadge /> : null}
                    value={f.phone} onChange={e => upd('phone', e.target.value)}
                    error={errors.phone} />
                  <Input id="host-email" label="Email" required type="email"
                    placeholder="poc@college.edu"
                    badge={aiFilledFields.has('email') ? <AiFilledBadge /> : null}
                    value={f.email} onChange={e => upd('email', e.target.value)}
                    error={errors.email} />
                </div>

                <Input id="host-website" label="Website" type="url"
                  placeholder="https://yourfest.edu"
                  badge={aiFilledFields.has('website') ? <AiFilledBadge /> : null}
                  value={f.website} onChange={e => upd('website', e.target.value)}
                  error={errors.website}
                  hint="Optional — your event website or social page" />
              </SectionCard>

              <NavButtons step={step} totalSteps={5} onBack={goBack} onNext={goNext} nextLabel="Upload Media →" />
            </motion.div>
          )}

          {/* ════════════ STEP 5: MEDIA + SUBMIT ════════════ */}
          {step === 5 && (
            <motion.div key="s5"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <SectionCard icon={<Image size={16} strokeWidth={1.8} className="text-primary" />} title="Media and Documents" sub="Help your event stand out">
                <UploadZone
                  id="host-poster"
                  label="Poster"
                  hint="PNG, JPG, WebP — Max 5 MB · opens cropper · 16:9 output"
                  accept="image/png,image/jpeg,image/webp"
                  Icon={Image}
                  file={posterFile}
                  error={errors.poster}
                  onFile={raw => {
                    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!allowed.includes(raw.type)) {
                      setErrors(e => ({ ...e, poster: 'Poster must be JPG, PNG, or WEBP' }));
                      return;
                    }
                    if (raw.size > 5 * 1024 * 1024) {
                      setErrors(e => ({ ...e, poster: 'Poster size cannot exceed 5 MB' }));
                      return;
                    }
                    setErrors(e => ({ ...e, poster: '' }));
                    setCropperFile(raw);
                  }}
                  onRemove={() => { setPosterFile(null); setCropperFile(null); setErrors(e => ({ ...e, poster: '' })); }}
                />

                {/* Poster 16:9 preview (stable URL from state, no per-render createObjectURL) */}
                <AnimatePresence>
                  {posterPreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="relative rounded-lg overflow-hidden border border-border" style={{ paddingTop: '56.25%' }}>
                        <img src={posterPreview} alt={f.name ? `${f.name} event poster preview` : 'Event poster preview'}
                          className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 rounded text-[10px] text-white font-semibold">
                          16:9 · {posterFile?.name}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <UploadZone
                  id="host-brochure"
                  label="Brochure (PDF)"
                  hint="PDF only — Max 10 MB"
                  accept="application/pdf"
                  Icon={FileText}
                  file={brochureFile}
                  error={errors.brochure}
                  onFile={raw => {
                    if (raw.type !== 'application/pdf') {
                      setErrors(e => ({ ...e, brochure: 'Brochure must be a PDF file' }));
                      return;
                    }
                    if (raw.size > 10 * 1024 * 1024) {
                      setErrors(e => ({ ...e, brochure: 'Brochure size cannot exceed 10 MB' }));
                      return;
                    }
                    setErrors(e => ({ ...e, brochure: '' }));
                    setBrochureFile(raw);
                  }}
                  onRemove={() => { setBrochureFile(null); setErrors(e => ({ ...e, brochure: '' })); }}
                />
              </SectionCard>

              {/* Pre-submit checklist */}
              {!isEditMode && <div className="bg-white border border-[#E4E4E0] rounded-lg p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-[13px] font-bold text-text-1">Before you submit</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    'Events are reviewed and published within 24 hours',
                    'You\'ll earn +300 FestNest points once approved',
                    'Fake or unverifiable events will be removed',
                    'Make sure all contact details are correct',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5 text-[13px] text-text-2">
                      <div className="w-4 h-4 rounded-full bg-[#F0FDF4] border border-green-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>}

              {/* Event summary card */}
              <div className="bg-primary-light border border-[#C7D2FE] rounded-lg p-5">
                <div className="text-[11px] font-bold tracking-wider uppercase text-primary mb-3">Submitting</div>
                <div className="flex items-center gap-3">
                  {(() => { const T = EVENT_TYPES.find(t => t.name === f.category); const EIcon = T?.Icon || PartyPopper; return (
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${T?.color || 'bg1'}`}>
                    <EIcon size={24} strokeWidth={1.8} />
                  </div>); })()}
                  <div className="flex-1 min-w-0">
                    <div className="font-sans font-bold text-[15px] text-text-1 truncate">{f.title || 'Your Event'}</div>
                    <div className="text-[12px] text-text-3">{f.college || 'Your College'} · {f.cityState || 'Location TBD'}</div>
                    {f.startDate && <div className="text-[12px] text-primary font-medium mt-0.5 flex items-center gap-1"><CalendarDays size={12} strokeWidth={1.8} /> {f.startDate}{f.endDate && ` → ${f.endDate}`}</div>}
                  </div>
                </div>
              </div>

              {!isLoggedIn && (
                <div className="bg-amber-bg border border-amber-border rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle size={20} strokeWidth={1.8} className="text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[13px] font-semibold text-amber mb-0.5">Sign in required</div>
                    <div className="text-[12px] text-text-2">You need to sign in before submitting your event.</div>
                  </div>
                </div>
              )}

              {!isEditMode && <div className={`rounded-md border-[1.5px] px-4 py-3.5 ${errors.termsAgreement ? 'border-red bg-red-bg/40' : 'border-[#E4E4E0] bg-white'}`}>
                <div className="flex items-start gap-3">
                  <input
                    id="host-termsAgreement"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setErrors(current => ({ ...current, termsAgreement: '' }));
                    }}
                    aria-describedby={errors.termsAgreement ? 'host-termsAgreement-error' : undefined}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[#CBCBC6] text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                  <label htmlFor="host-termsAgreement" className="cursor-pointer text-[13px] leading-relaxed text-text-2">
                    I agree to FestNest's{' '}
                    <Link to="/terms" className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm">
                      Terms of Hosting
                    </Link>{' '}and{' '}
                    <Link to="/privacy" className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>
                {errors.termsAgreement && (
                  <p id="host-termsAgreement-error" className="text-[12px] text-red mt-2 flex items-center gap-1" role="alert">
                    <AlertTriangle size={12} strokeWidth={2} className="flex-shrink-0" />
                    {errors.termsAgreement}
                  </p>
                )}
              </div>}
              <NavButtons
                step={step}
                totalSteps={5}
                onBack={goBack}
                onSubmit={submit}
                submitting={submitting}
                submitAllowed={isEditMode || termsAccepted}
                submitLabel={isEditMode ? 'Save Changes' : 'Submit Event for Review'}
              />
            </motion.div>
          )}

          </AnimatePresence>
        </div>

        {/* ── Featured events sidebar — desktop only ── */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 px-0.5">
            Featured on FestNest
          </div>
          {featuredLoading ? (
            <>
              {[0, 1].map(i => (
                <div key={i} className="bg-white border border-[#E4E4E0] rounded-lg overflow-hidden animate-pulse">
                  <div className="h-[140px] bg-surface-3" />
                  <div className="p-4 space-y-2">
                    <div className="h-2.5 w-16 bg-surface-3 rounded-full" />
                    <div className="h-4 w-3/4 bg-surface-3 rounded-full" />
                    <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
                    <div className="h-9 bg-surface-3 rounded-md mt-2" />
                  </div>
                </div>
              ))}
            </>
          ) : featuredEvents.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-5 text-center">
              <div className="flex justify-center mb-2"><Star size={28} strokeWidth={1.5} className="text-amber-400" /></div>
              <div className="text-[12px] font-semibold text-text-2 mb-0.5">No featured events yet</div>
              <div className="text-[11px] text-text-3">Check back soon!</div>
            </div>
          ) : (
            featuredEvents.slice(0, 2).map(ev => (
              <FeaturedEventCard key={ev.id} event={ev} className="w-full" />
            ))
          )}
        </div>
      </div>
    </motion.div>
    </>
  );
}
