import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ENTRY_PILL = {
  free:  'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  paid:  'bg-[#FFFBEB] text-[#B45309]  border-[#FDE68A]',
  prize: 'bg-primary-light text-primary border-[#C7D2FE]',
};
const ENTRY_LABEL = { free: 'Free', paid: 'Paid', prize: 'Prize Pool' };

export default function FeaturedEventCard({ event: ev, className = '' }) {
  const navigate = useNavigate();
  if (!ev) return null;

  const slug      = ev.slug || ev.id;
  const pillStyle = ENTRY_PILL[ev.entryType] || ENTRY_PILL.free;
  const pillLabel = ENTRY_LABEL[ev.entryType] || 'Free';

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
      onClick={() => navigate(`/event/${slug}`)}
      className={`bg-white border border-[#E4E4E0] rounded-[18px] overflow-hidden
                  shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer flex-shrink-0 ${className}`}
    >
      {/* Image area */}
      <div className={`relative h-[140px] ${ev.bg || 'bg1'} flex items-center justify-center`}>
        {ev.imageUrl
          ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
          : <span className="text-[52px] select-none" aria-hidden>{ev.emoji || '🎉'}</span>
        }
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-[5px] px-2.5 py-[3px]
                         rounded-full text-[10px] font-bold bg-primary text-white shadow-sm">
          🔥 Featured
        </span>
        <span className={`absolute top-2.5 right-2.5 inline-flex items-center px-2.5 py-[3px]
                          rounded-full text-[10px] font-bold border ${pillStyle}`}>
          {pillLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        <div className="text-[10px] font-bold tracking-[0.07em] uppercase text-primary">
          {ev.category}
        </div>
        <div
          className="font-display font-bold text-[15px] text-text-1 leading-snug tracking-tight"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {ev.name}
        </div>
        <div className="flex flex-col gap-0.5 text-[11px] text-text-3">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{ev.college}, {ev.city}</span>
          </div>
          {ev.startDate && (
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0">
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{ev.startDate}</span>
            </div>
          )}
        </div>
        <button
          className="w-full mt-1 py-2.5 bg-primary text-white rounded-[10px] text-[12px] font-bold
                     hover:bg-primary-dark transition-colors duration-150"
          onClick={e => { e.stopPropagation(); navigate(`/event/${slug}`); }}
        >
          View Event →
        </button>
      </div>
    </motion.div>
  );
}
