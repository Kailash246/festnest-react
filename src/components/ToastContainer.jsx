import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const icons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

const iconColor = { success: 'text-[#4ADE80]', error: 'text-[#F87171]', info: 'text-primary-mid' };

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div
      className="fixed bottom-[84px] md:bottom-8 left-1/2 -translate-x-1/2
                 z-[200] flex flex-col items-center gap-2 pointer-events-none
                 w-[calc(100%-32px)] max-w-[340px]"
      aria-live="polite" aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map(({ id, msg, type }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center gap-2 bg-text-1 text-white
                       px-[18px] py-[10px] rounded-full text-[13px] font-medium
                       shadow-3 w-fit max-w-full"
          >
            {type !== 'default' && (
              <span className={`flex-shrink-0 ${iconColor[type] || ''}`}>
                {icons[type]}
              </span>
            )}
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
