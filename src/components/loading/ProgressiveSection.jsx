import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const crossfadeTransition = {
  duration: 0.18,
  ease: 'easeOut',
};

export default function ProgressiveSection({
  isLoading,
  skeleton,
  children,
  className = '',
  wrapperKey,
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', handler);
      return () => mediaQuery.removeEventListener?.('change', handler);
    }
  }, []);

  const transition = prefersReducedMotion ? { duration: 0 } : crossfadeTransition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.div
          key={wrapperKey ? `${wrapperKey}-skeleton` : 'skeleton'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className={className}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key={wrapperKey ? `${wrapperKey}-content` : 'content'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

