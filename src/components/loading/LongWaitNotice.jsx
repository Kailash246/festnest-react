import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LongWaitNotice({
  isLongWait,
  message = 'Still loading — first load can take a little longer.',
  className = '',
}) {
  return (
    <AnimatePresence>
      {isLongWait && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-indigo-50/90 border border-indigo-100 text-xs font-medium text-indigo-900 shadow-xs mb-4 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

