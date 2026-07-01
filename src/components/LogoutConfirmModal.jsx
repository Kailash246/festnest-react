import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';

export default function LogoutConfirmModal({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-[340px] bg-white rounded-xl
                       border border-border shadow-[0_8px_40px_rgba(0,0,0,0.18)]
                       p-6 flex flex-col items-center text-center"
          >
            {/* Warning icon */}
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
              <AlertTriangle size={22} strokeWidth={1.8} className="text-[#DC2626]" />
            </div>

            <h2 className="font-display font-bold text-[17px] text-text-1 mb-1">Sign Out?</h2>
            <p className="text-[13px] text-text-3 leading-relaxed mb-6">
              You'll be signed out of FestNest on this device.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg border border-border text-[13px]
                           font-semibold text-text-2 hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-lg bg-[#DC2626] text-white text-[13px]
                           font-semibold flex items-center justify-center gap-1.5
                           hover:bg-[#B91C1C] transition-colors"
              >
                <LogOut size={14} strokeWidth={2} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
