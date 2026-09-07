// src/pages/admin/components/StatCard.jsx
import { motion } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'indigo',
  onClick,
  badge,
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
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    red: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`relative overflow-hidden bg-white border border-border rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-text-3 tracking-wide uppercase">{label}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-heading font-black text-[26px] sm:text-[28px] text-text-1 tabular-nums tracking-tight leading-none">
              {value ?? '—'}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          {sub && <p className="text-[12px] text-text-3 mt-1.5 line-clamp-1">{sub}</p>}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${scheme.iconBg}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

