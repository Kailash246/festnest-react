// src/pages/organizer/components/OrganizerStatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const COLOR_MAP = {
  indigo: {
    bg: 'bg-primary-light',
    text: 'text-primary',
    border: 'border-primary/20',
    glow: 'rgba(79,70,229,0.06)',
  },
  emerald: {
    bg: 'bg-green-bg',
    text: 'text-green',
    border: 'border-green-border',
    glow: 'rgba(16,185,129,0.06)',
  },
  amber: {
    bg: 'bg-amber-bg',
    text: 'text-amber',
    border: 'border-amber-border',
    glow: 'rgba(245,158,11,0.06)',
  },
  purple: {
    bg: 'bg-[#FDF4FF]',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    glow: 'rgba(168,85,247,0.06)',
  },
  rose: {
    bg: 'bg-[#FFF1F2]',
    text: 'text-rose-700',
    border: 'border-rose-200',
    glow: 'rgba(244,63,94,0.06)',
  },
  blue: {
    bg: 'bg-blue-bg',
    text: 'text-blue',
    border: 'border-blue/20',
    glow: 'rgba(59,130,246,0.06)',
  },
};

export default function OrganizerStatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'indigo',
  badge,
  badgeColor = 'emerald',
  onClick,
  centerOnMobile = false,
}) {
  const theme = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${label}: ${typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '')}` : undefined}
      whileHover={{ y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={`bg-white border border-border rounded-xl p-3.5 sm:p-4 shadow-1 hover:shadow-2 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
        onClick ? 'cursor-pointer hover:border-primary/40' : ''
      } ${centerOnMobile ? 'flex flex-col items-center sm:items-start text-center sm:text-left' : ''}`}
    >
      <div className={`flex items-start justify-between gap-2 mb-2.5 w-full ${centerOnMobile ? 'justify-center sm:justify-between' : ''}`}>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${theme.bg} ${theme.text} border ${theme.border} shrink-0`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
        {badge && (
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-3 border border-border shrink-0">
            {badge}
          </span>
        )}
      </div>

      <div className="font-mono text-[20px] sm:text-[24px] font-bold text-text-1 tracking-tight leading-tight mb-0.5 truncate w-full">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
      </div>

      <div className="text-[11px] sm:text-[12px] font-medium text-text-3 truncate w-full">{label}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-text-4 mt-1 leading-snug">{sub}</div>}
    </motion.div>
  );
}


