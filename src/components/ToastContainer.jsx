import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

/* ─── Per-type visual config ──────────────────────────────
   Background, left accent, icon ring + glyph, and title text. */
const TYPES = {
  error: {
    bg: '#FEF2F2', border: '#DC2626', ring: '#FEE2E2',
    iconColor: '#DC2626', title: 'Error', titleColor: '#DC2626',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  success: {
    bg: '#F0FDF4', border: '#16A34A', ring: '#DCFCE7',
    iconColor: '#16A34A', title: 'Success', titleColor: '#16A34A',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  info: {
    bg: '#EEF2FF', border: '#4F46E5', ring: '#E0E7FF',
    iconColor: '#4F46E5', title: 'Info', titleColor: '#4F46E5',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
        <line x1="12" y1="16" x2="12" y2="11" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  warning: {
    bg: '#FFFBEB', border: '#F59E0B', ring: '#FEF3C7',
    iconColor: '#F59E0B', title: 'Warning', titleColor: '#B45309',
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
};
// 'default' falls back to the info styling.
const cfgFor = (type) => TYPES[type] || TYPES.info;

function Toast({ id, msg, type, duration, onClose }) {
  const cfg = cfgFor(type);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="pointer-events-auto relative w-full overflow-hidden rounded-lg"
      style={{ background: cfg.bg, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      role="alert"
    >
      {/* Left accent border */}
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cfg.border }} />

      <div className="flex items-start gap-3 pl-[18px] pr-3 py-3">
        {/* Icon in a tinted circle */}
        <span
          className="flex-shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded-full"
          style={{ background: cfg.ring, color: cfg.iconColor }}
        >
          {cfg.glyph}
        </span>

        {/* Title + message */}
        <div className="flex-1 min-w-0 pt-px">
          <div className="text-[13px] font-bold leading-tight" style={{ color: cfg.titleColor }}>
            {cfg.title}
          </div>
          <div className="text-[13px] leading-snug mt-0.5 break-words" style={{ color: '#374151' }}>
            {msg}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(id)}
          aria-label="Dismiss notification"
          className="flex-shrink-0 -mr-0.5 w-6 h-6 rounded flex items-center justify-center
                     text-[#9CA3AF] hover:text-[#374151] hover:bg-black/[0.04] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar — shrinks over the toast's lifetime */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px]"
        style={{ background: cfg.border, opacity: 0.55 }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (duration || 3500) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col items-end gap-2.5
                 w-[360px] max-w-[calc(100vw-32px)] pointer-events-none"
      aria-live="polite" aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
