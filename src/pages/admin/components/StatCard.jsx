// src/pages/admin/components/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  icon,
  label,
  value,
  sub,
  color = 'indigo',
  onClick,
  badge,
  badgeColor,
}) {
  const colorSchemes = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    green: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    red: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    neutral: {
      iconBg: 'bg-neutral-50 text-neutral-600 border border-neutral-200',
      badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;
  const badgeScheme = badgeColor ? (colorSchemes[badgeColor] || scheme) : scheme;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
      const IconComp = icon;
      return <IconComp size={20} strokeWidth={2} className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`relative overflow-hidden bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">{label}</p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="font-heading font-black text-[24px] sm:text-[28px] text-neutral-900 tabular-nums tracking-tight leading-none">
              {value ?? '—'}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeScheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          {sub && <p className="text-[11px] text-neutral-500 mt-1.5 truncate">{sub}</p>}
        </div>

        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${scheme.iconBg}`}>
            {renderIcon()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
