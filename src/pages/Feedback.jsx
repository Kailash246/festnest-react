import { useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { feedback } from '../services/api';
import {
  Bug, Palette, Lightbulb, Compass, MessageSquare,
  HelpCircle, Send, CheckCircle2, ArrowLeft, Sparkles, Star,
} from 'lucide-react';

/* ─── Category config ───────────────────────────────── */
const CATEGORIES = [
  { id: 'bug',             label: 'Bug',             Icon: Bug,           color: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',     active: 'border-red-400 bg-red-100 text-red-800 ring-2 ring-red-300' },
  { id: 'ui_ux',           label: 'UI / UX',         Icon: Palette,       color: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100', active: 'border-violet-400 bg-violet-100 text-violet-800 ring-2 ring-violet-300' },
  { id: 'feature_request', label: 'Feature idea',    Icon: Lightbulb,     color: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',   active: 'border-amber-400 bg-amber-100 text-amber-800 ring-2 ring-amber-300' },
  { id: 'event_discovery', label: 'Event discovery',  Icon: Compass,       color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',       active: 'border-blue-400 bg-blue-100 text-blue-800 ring-2 ring-blue-300' },
  { id: 'suggestion',      label: 'Suggestion',      Icon: MessageSquare, color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'border-emerald-400 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' },
  { id: 'other',           label: 'Other',           Icon: HelpCircle,    color: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100',       active: 'border-gray-400 bg-gray-100 text-gray-800 ring-2 ring-gray-300' },
];

/* ─── Rating config ─────────────────────────────────── */
const RATINGS = [
  { value: 1, label: 'Very poor' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

/* ─── Simple fade-in animation ──────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

export default function Feedback() {
  const location  = useLocation();
  const { showToast } = useApp();

  const [category, setCategory] = useState('');
  const [message,  setMessage]  = useState('');
  const [email,    setEmail]    = useState('');
  const [rating,      setRating]      = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const messageRef = useRef(null);

  /* ── Client-side validation ─── */
  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Please select a category';
    if (!message.trim() || message.trim().length < 10)
      errs.message = 'Please share a bit more detail (at least 10 characters)';
    if (message.trim().length > 2000)
      errs.message = 'Feedback must not exceed 2000 characters';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = 'Please enter a valid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await feedback.submit({
        category,
        message: message.trim(),
        email:   email.trim() || undefined,
        rating:  rating || undefined,
        page:    location.pathname,
      });
      setSuccess(true);
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset for another submission ─── */
  const handleAnother = () => {
    setCategory('');
    setMessage('');
    setEmail('');
    setRating(null);
    setHoverRating(null);
    setErrors({});
    setSuccess(false);
  };

  /* ── Success state ─── */
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          {...fadeUp}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </motion.div>

          <h2 className="font-heading text-2xl font-bold text-text-1 mb-3">
            Thank you for helping us build FestNest.
          </h2>
          <p className="text-text-3 text-[15px] leading-relaxed mb-8">
            Your feedback has been received and will be reviewed by our team.
            Every response genuinely helps us improve.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleAnother}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                         bg-primary text-white font-medium text-sm
                         hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Sparkles className="w-4 h-4" />
              Submit more feedback
            </button>
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                         border border-border text-text-2 font-medium text-sm
                         hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Form ─── */
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Header ── */}
      <motion.div {...fadeUp} className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-1">
            Help us improve FestNest
          </h1>
        </div>
        <p className="text-text-3 text-[15px] sm:text-base leading-relaxed max-w-xl">
          We're still early, and you're helping shape what FestNest becomes.
          Tell us what's broken, confusing, missing, or what you'd love to see next.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Category ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="mb-8">
          <label className="block font-heading text-base sm:text-lg font-semibold text-text-1 mb-3">
            What can we improve?
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ id, label, Icon, color, active }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setCategory(id); setErrors(prev => ({ ...prev, category: '' })); }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium
                           transition-all duration-150 cursor-pointer focus:outline-none
                           ${category === id ? active : color}`}
                aria-pressed={category === id}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {errors.category && (
              <motion.p
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-xs mt-2"
                role="alert"
              >
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Message ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mb-6">
          <label htmlFor="fb-message" className="block font-heading text-base sm:text-lg font-semibold text-text-1 mb-2">
            Tell us what you think
          </label>
          <p className="text-text-4 text-xs mb-2">
            Describe anything that felt confusing, broken, difficult, or missing…
          </p>
          <textarea
            ref={messageRef}
            id="fb-message"
            value={message}
            onChange={(e) => { setMessage(e.target.value); setErrors(prev => ({ ...prev, message: '' })); }}
            rows={5}
            maxLength={2000}
            placeholder="I noticed that…"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-text-1
                       placeholder:text-text-4 resize-y min-h-[120px]
                       focus:outline-none focus:ring-2 transition-all
                       ${errors.message
                         ? 'border-red-300 focus:ring-red-200'
                         : 'border-border focus:ring-primary/20 focus:border-primary/40'}`}
            aria-describedby="fb-message-counter"
            aria-invalid={!!errors.message}
          />
          <div className="flex justify-between items-center mt-1.5">
            <AnimatePresence>
              {errors.message && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-500 text-xs"
                  role="alert"
                >
                  {errors.message}
                </motion.p>
              )}
            </AnimatePresence>
            <p id="fb-message-counter" className="text-text-4 text-xs ml-auto tabular-nums">
              {message.length}/2000
            </p>
          </div>
        </motion.div>

        {/* ── Email ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="mb-6">
          <label htmlFor="fb-email" className="block font-heading text-sm font-semibold text-text-2 mb-1.5">
            Want a reply?
          </label>
          <input
            id="fb-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
            placeholder="your@email.com (optional)"
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-1
                       placeholder:text-text-4 focus:outline-none focus:ring-2 transition-all
                       ${errors.email
                         ? 'border-red-300 focus:ring-red-200'
                         : 'border-border focus:ring-primary/20 focus:border-primary/40'}`}
            aria-invalid={!!errors.email}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-red-500 text-xs mt-1"
                role="alert"
              >
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Rating ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between max-w-sm sm:max-w-md mb-2.5">
            <label className="block font-heading text-sm font-semibold text-text-2">
              How was your experience?
              <span className="font-normal text-text-4 ml-1.5 text-xs">(optional)</span>
            </label>
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-text-4 hover:text-primary transition-colors cursor-pointer"
                aria-label="Clear rating"
              >
                Clear
              </button>
            )}
          </div>

          <div
            role="radiogroup"
            aria-label="Rate your experience from 1 to 5 stars"
            className="grid grid-cols-5 gap-1.5 sm:gap-2.5 max-w-sm sm:max-w-md select-none"
            onMouseLeave={() => setHoverRating(null)}
          >
            {RATINGS.map(({ value, label }) => {
              const activeValue = hoverRating || rating || 0;
              const isFilled = value <= activeValue;
              const isSelected = rating === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${value} star${value > 1 ? 's' : ''} - ${label}`}
                  onClick={() => setRating(prev => (prev === value ? null : value))}
                  onMouseEnter={() => setHoverRating(value)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      setRating(Math.min(5, (rating || 0) + 1));
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      setRating(Math.max(1, (rating || 2) - 1));
                    }
                  }}
                  className={`group flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 sm:px-2 rounded-xl border transition-all duration-150 cursor-pointer
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
                             ${isSelected
                               ? 'bg-amber-50/90 border-amber-300 shadow-xs scale-[1.02]'
                               : 'bg-white border-[#E4E4E0] hover:border-amber-200 hover:bg-amber-50/30 active:scale-95'
                             }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-150 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.25)]'
                          : 'fill-transparent text-neutral-300 group-hover:text-amber-300'
                      }`}
                      strokeWidth={isFilled ? 1.5 : 1.75}
                    />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center leading-tight transition-colors duration-150 ${
                      isSelected
                        ? 'font-semibold text-amber-900'
                        : isFilled
                        ? 'font-medium text-amber-700'
                        : 'font-normal text-text-3 group-hover:text-text-2'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {(rating || hoverRating) && (
            <p className="text-xs font-medium text-amber-800 mt-2.5 transition-all">
              {RATINGS.find(r => r.value === (hoverRating || rating))?.label} ({hoverRating || rating} of 5 stars)
            </p>
          )}
        </motion.div>

        {/* ── Submit ── */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto
                       px-8 py-3 rounded-xl bg-primary text-white font-medium text-sm
                       hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit feedback
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* ── Privacy note ── */}
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.3 }}
        className="text-text-4 text-xs mt-8 leading-relaxed"
      >
        Your feedback stays private — only the FestNest team reads it.
        We never share your responses publicly.
      </motion.p>
    </div>
  );
}
