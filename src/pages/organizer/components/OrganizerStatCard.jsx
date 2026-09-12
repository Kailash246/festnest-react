// src/pages/organizer/components/OrganizerStatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const COLOR_MAP = {
  indigo: {
    bg: 'bg-primary-light',
    text: 'text-primary',
    border: 'border-[#C7D2FE]',
    glow: 'rgba(79,70,229,0.06)',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    glow: 'rgba(16,185,129,0.06)',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    glow: 'rgba(245,158,11,0.06)',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    glow: 'rgba(168,85,247,0.06)',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    glow: 'rgba(244,63,94,0.06)',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
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
}) {
  const theme = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white border border-border rounded-xl p-4 sm:p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} border ${theme.border}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
        {badge && (
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-3 border border-border">
            {badge}
          </span>
        )}
      </div>

      <div className="font-heading text-[24px] sm:text-[28px] font-bold text-text-1 tracking-tight leading-none mb-1">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
      </div>

      <div className="text-[12px] font-medium text-text-3">{label}</div>
      {sub && <div className="text-[11px] text-text-4 mt-1 leading-snug">{sub}</div>}
    </motion.div>
  );
}

