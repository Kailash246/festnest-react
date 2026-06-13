import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { events as eventsApi } from '../services/api';
import FeaturedEventCard from '../components/FeaturedEventCard';
import { normaliseEvents } from '../services/normalise';
import ImageCropper from '../components/ImageCropper';
import {
  Code2, Music4, Wrench, Trophy, Mic, Zap,
  ClipboardList, MapPin, Phone, Image, FileText,
  Building2, Globe, Layers,
  CalendarDays, Star, AlertTriangle, CheckCircle2, ScrollText, PartyPopper, Clock,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────── */
const EVENT_TYPES = [
  { Icon: Code2,  name: 'Hackathon',     color: 'bg1' },
  { Icon: Music4, name: 'Cultural Fest', color: 'bg5' },
  { Icon: Wrench, name: 'Workshop',      color: 'bg3' },
  { Icon: Trophy, name: 'Competition',   color: 'bg7' },
  { Icon: Mic,    name: 'Tech Talk',     color: 'bg8' },
  { Icon: Zap,    name: 'Sports',        color: 'bg4' },
];

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
const inputBase = `w-full px-4 py-[11px] border-[1.5px] rounded-md font-body text-[14px] text-text-1 bg-white placeholder:text-text-4
  focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all duration-150 outline-none`;

function Field({ label, required, hint, error, prefix, children }) {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-1 text-[13px] font-semibold text-text-1 mb-1.5">
          {label}
          {required && <span className="text-red text-[14px] leading-none">*</span>}
        </label>
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

function Input({ label, required, hint, error, prefix, className = '', ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error} prefix={prefix}>
      <input className={`${inputBase} ${prefix ? 'pl-8' : ''} ${error ? 'border-red focus:border-red focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]' : 'border-[#CBCBC6]'} ${className}`} {...props} />
    </Field>
  );
}

function Textarea({ label, required, hint, error, ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <textarea className={`${inputBase} resize-none min-h-[110px] ${error ? 'border-red' : 'border-[#CBCBC6]'}`} {...props} />
    </Field>
  );
}

function Select({ label, required, hint, error, children, ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
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
          <div className="font-display font-bold text-[14px] text-text-1 tracking-snug">{title}</div>
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
function UploadZone({ label, hint, accept, Icon: UpIcon, file, onFile, onRemove }) {
  const ref = useRef();
  return (
    <div>
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
            className="flex flex-col items-center gap-2.5 border-2 border-dashed border-[#CBCBC6] rounded-md py-7 px-4 cursor-pointer
              hover:border-primary hover:bg-primary-xlight transition-all duration-150 group">
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
    </div>
  );
}

/* ─── Navigation buttons ─────────────────────────────── */
function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, submitting, nextLabel }) {
  return (
    <div className="flex gap-3 pt-2">
      {step > 1 && (
        <button onClick={onBack}
          className="flex items-center gap-2 px-5 py-[13px] border-[1.5px] border-[#CBCBC6] rounded-md
            text-[14px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all duration-150">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
      )}
      {step < totalSteps ? (
        <motion.button whileTap={{ scale: 0.98 }} onClick={onNext}
          className="flex-1 py-[13px] bg-primary text-white rounded-md text-[14px] font-bold
            flex items-center justify-center gap-2 hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.30)] transition-all duration-150">
          {nextLabel || 'Continue'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
        </motion.button>
      ) : (
        <motion.button whileTap={{ scale: 0.98 }} onClick={onSubmit} disabled={submitting}
          className="flex-1 py-[13px] bg-[#16A34A] text-white rounded-md text-[14px] font-bold
            flex items-center justify-center gap-2 hover:bg-[#15803D] hover:shadow-[0_4px_14px_rgba(22,163,74,0.30)]
            transition-all duration-150 disabled:opacity-60">
          {submitting
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg> Submit Event for Review</>
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
  const { showToast, requireAuth, isLoggedIn } = useApp();

  const [step,      setStep]      = useState(1);
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [hasPrize,  setHasPrize]  = useState(false);
  const [errors,    setErrors]    = useState({});
  const [draftBanner, setDraftBanner] = useState(null); // detected draft waiting for resume/discard
  const [draftSaved,  setDraftSaved]  = useState(false); // transient "Draft saved" indicator
  const draftAutoRef    = useRef(null); // debounce timer
  const draftIndicRef   = useRef(null); // indicator hide timer
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
    const d = retrieveDraft();
    if (d) setDraftBanner(d);
  }, []);

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
    clearTimeout(draftAutoRef.current);
    draftAutoRef.current = setTimeout(() => {
      persistDraft(step, f);
      setDraftSaved(true);
      clearTimeout(draftIndicRef.current);
      draftIndicRef.current = setTimeout(() => setDraftSaved(false), 2000);
    }, 800);
    return () => clearTimeout(draftAutoRef.current);
  }, [f, step]);

  // When posterFile changes, create a stable preview URL
  useEffect(() => {
    if (!posterFile) { setPosterPreview(null); return; }
    const url = URL.createObjectURL(posterFile);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  const upd = (k, v) => { setF(prev => ({ ...prev, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  /* ── Validation per step ── */
  // Returns the errors object (empty == valid). Keys are inserted top-to-bottom
  // so the first key is always the topmost field on screen.
  const validate = (s) => {
    const errs = {};
    if (s === 1) {
      if (!f.category)           errs.category    = 'Please select a category';
      if (!f.title.trim())       errs.title       = 'Event title is required';
      if (!f.description.trim()) errs.description = 'Description is required';
    }
    if (s === 2) {
      if (!f.startDate)          errs.startDate = 'Start date is required';
      if (!f.college.trim())     errs.college   = 'College / Organization is required';
    }
    if (s === 4) {
      if (!f.pocName.trim())     errs.pocName = 'Contact name is required';
      if (!f.phone.trim())       errs.phone   = 'Phone number is required';
      if (!f.email.trim())       errs.email   = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = 'Invalid email address';
    }
    setErrors(errs);
    return errs;
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
      showToast('Please fill in the required fields', 'error');
      scrollToFirstError(errs);
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ── Submit ── */
  const submit = async () => {
    const errs = validate(step);
    if (Object.keys(errs).length) {
      showToast('Please fill in all required fields', 'error');
      scrollToFirstError(errs);
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
      fd.append('entryFee',        f.regFee);
      fd.append('isPaid',          f.regFee && f.regFee !== 'Free' ? 'true' : 'false');
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

      await eventsApi.host(fd);
      purgeDraft();
      setDone(true);
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
        <h2 className="font-display font-bold text-[26px] md:text-[30px] text-text-1 tracking-tight mb-3">
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
          <button onClick={() => { purgeDraft(); setDone(false); setStep(1); setHasPrize(false); setF({ title:'',description:'',category:'',mode:'Offline',startDate:'',endDate:'',college:'',cityState:'',venue:'',prize1:'',prize2:'',prize3:'',totalPrize:'',regFee:'',regLink:'',perks:'',eligibility:'',rules:'',pocName:'',phone:'',email:'',website:'' }); setPosterFile(null); setBrochureFile(null); }}
            className="px-8 py-3.5 border-[1.5px] border-[#CBCBC6] rounded-md text-[14px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all">
            Post Another Event
          </button>
        </div>
      </motion.div>
    </motion.div>
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
        <h1 className="font-display font-bold text-[22px] md:text-[26px] text-white tracking-tight leading-tight mb-1">
          Post Your Event
        </h1>
        <p className="text-white/75 text-[14px]">
          Reach <span className="text-white font-bold">48,000+</span> students across India.
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

      <div className="px-4 pt-6 pb-24 md:px-6 md:pt-10
                      lg:max-w-[1100px] lg:mx-auto lg:px-8
                      lg:grid lg:grid-cols-[3fr_1fr] lg:gap-8 lg:items-start">

        {/* ── Form column ── */}
        <div className="max-w-[680px] mx-auto w-full lg:max-w-none lg:mx-0">
          <HeaderBanner />
          <StepBar current={step} />

          {/* ── Draft restore banner ── */}
          <AnimatePresence>
            {draftBanner && (
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

          <AnimatePresence mode="wait">

          {/* ════════════ STEP 1: BASIC INFO ════════════ */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
              className="space-y-4">

              <SectionCard icon={<ClipboardList size={16} strokeWidth={1.8} className="text-primary" />} title="Basic Information" sub="Tell us about your event">

                {/* Category tiles */}
                <div id="host-category" style={{ scrollMarginTop: '90px' }}>
                  <label className="flex items-center gap-1 text-[13px] font-semibold text-text-1 mb-2">
                    Category <span className="text-red text-[14px] leading-none">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TYPES.map(({ Icon: ETypeIcon, name, color }) => (
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
                          {name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.category && <p className="text-[12px] text-red mt-1">{errors.category}</p>}
                </div>

                <Input id="host-title" label="Event Title" required placeholder="e.g. TechFest 2025"
                  value={f.title} onChange={e => upd('title', e.target.value)} error={errors.title} />

                <Textarea id="host-description" label="Description" required
                  placeholder="Describe your event — what will participants do, learn, or win?"
                  rows={4} value={f.description} onChange={e => upd('description', e.target.value)}
                  error={errors.description} />

                {/* Mode */}
                <div>
                  <label className="block text-[13px] font-semibold text-text-1 mb-2">Mode</label>
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

              {draftSaved && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-4 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Draft autosaved
                </div>
              )}
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
                    value={f.startDate} onChange={e => upd('startDate', e.target.value)}
                    error={errors.startDate} />
                  <Input label="End Date" type="date"
                    value={f.endDate} onChange={e => upd('endDate', e.target.value)} />
                </div>

                <Input id="host-college" label="College / Organization" required
                  placeholder="e.g. IIT Bombay"
                  value={f.college} onChange={e => upd('college', e.target.value)}
                  error={errors.college} />

                <Input label="City / State"
                  placeholder="e.g. Mumbai, MH"
                  value={f.cityState} onChange={e => upd('cityState', e.target.value)} />

                <Input label="Venue"
                  placeholder="e.g. Main Auditorium"
                  value={f.venue} onChange={e => upd('venue', e.target.value)} />
              </SectionCard>

              {draftSaved && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-4 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Draft autosaved
                </div>
              )}
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
                  <span className="text-[14px] font-medium text-text-1">Has a Prize Pool?</span>
                  <button
                    type="button"
                    onClick={() => setHasPrize(p => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                      ${hasPrize ? 'bg-primary' : 'bg-[#D1D5DB]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                      ${hasPrize ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {hasPrize && (
                  <Input label="Total Prize Amount (₹)" placeholder="e.g. 2,00,000"
                    value={f.totalPrize} onChange={e => upd('totalPrize', e.target.value)} />
                )}

                <div className="h-px bg-[#F1F0ED]" />

                <Input label="Registration Fee"
                  placeholder="e.g. 200/team or Free"
                  value={f.regFee} onChange={e => upd('regFee', e.target.value)} />

                <Input label="Registration Link" type="url"
                  placeholder="https://forms.gle/..."
                  value={f.regLink} onChange={e => upd('regLink', e.target.value)} />

                <Textarea label="Other Perks"
                  placeholder="Internship offers, goodies, certificates, swag..."
                  rows={3} value={f.perks} onChange={e => upd('perks', e.target.value)} />
              </SectionCard>

              <SectionCard icon={<ScrollText size={16} strokeWidth={1.8} className="text-primary" />} title="Rules and Eligibility" sub="Optional but recommended">
                <Textarea label="Eligibility"
                  placeholder="Who can participate? Year, branch, college restrictions..."
                  rows={3} value={f.eligibility} onChange={e => upd('eligibility', e.target.value)} />

                <Textarea label="Rules"
                  placeholder="Important rules, dos and don'ts..."
                  rows={3} value={f.rules} onChange={e => upd('rules', e.target.value)} />
              </SectionCard>

              {draftSaved && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-4 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Draft autosaved
                </div>
              )}
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
                  value={f.pocName} onChange={e => upd('pocName', e.target.value)}
                  error={errors.pocName} />

                <div className="grid grid-cols-2 gap-3">
                  <Input id="host-phone" label="Phone" required type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={f.phone} onChange={e => upd('phone', e.target.value)}
                    error={errors.phone} />
                  <Input id="host-email" label="Email" required type="email"
                    placeholder="poc@college.edu"
                    value={f.email} onChange={e => upd('email', e.target.value)}
                    error={errors.email} />
                </div>

                <Input label="Website" type="url"
                  placeholder="https://yourfest.edu"
                  value={f.website} onChange={e => upd('website', e.target.value)}
                  hint="Optional — your event website or social page" />
              </SectionCard>

              {draftSaved && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-4 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Draft autosaved
                </div>
              )}
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
                  label="Poster"
                  hint="PNG, JPG, WebP — opens cropper · 16:9 output"
                  accept="image/png,image/jpeg,image/webp"
                  Icon={Image}
                  file={posterFile}
                  onFile={raw => setCropperFile(raw)}
                  onRemove={() => { setPosterFile(null); setCropperFile(null); }}
                />

                {/* Poster 16:9 preview (stable URL from state, no per-render createObjectURL) */}
                <AnimatePresence>
                  {posterPreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div className="relative rounded-lg overflow-hidden border border-border" style={{ paddingTop: '56.25%' }}>
                        <img src={posterPreview} alt="poster preview"
                          className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 rounded text-[10px] text-white font-semibold">
                          16:9 · {posterFile?.name}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <UploadZone
                  label="Brochure (PDF)"
                  hint="PDF only — Max 20MB"
                  accept="application/pdf"
                  Icon={FileText}
                  file={brochureFile}
                  onFile={setBrochureFile}
                  onRemove={() => setBrochureFile(null)}
                />
              </SectionCard>

              {/* Pre-submit checklist */}
              <div className="bg-white border border-[#E4E4E0] rounded-lg p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
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
              </div>

              {/* Event summary card */}
              <div className="bg-primary-light border border-[#C7D2FE] rounded-lg p-5">
                <div className="text-[11px] font-bold tracking-wider uppercase text-primary mb-3">Submitting</div>
                <div className="flex items-center gap-3">
                  {(() => { const T = EVENT_TYPES.find(t => t.name === f.category); const EIcon = T?.Icon || PartyPopper; return (
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${T?.color || 'bg1'}`}>
                    <EIcon size={24} strokeWidth={1.8} />
                  </div>); })()}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[15px] text-text-1 truncate">{f.title || 'Your Event'}</div>
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

              {draftSaved && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-4 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Draft autosaved
                </div>
              )}
              <NavButtons step={step} totalSteps={5} onBack={goBack} onSubmit={submit} submitting={submitting} />
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
                <div key={i} className="bg-white border border-[#E4E4E0] rounded-[18px] overflow-hidden animate-pulse">
                  <div className="h-[140px] bg-surface-3" />
                  <div className="p-4 space-y-2">
                    <div className="h-2.5 w-16 bg-surface-3 rounded-full" />
                    <div className="h-4 w-3/4 bg-surface-3 rounded-full" />
                    <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
                    <div className="h-9 bg-surface-3 rounded-[10px] mt-2" />
                  </div>
                </div>
              ))}
            </>
          ) : featuredEvents.length === 0 ? (
            <div className="bg-surface border border-border rounded-[18px] p-5 text-center">
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
