import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES } from '../data/categories';

export const CITIES   = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Tiruchirappalli', 'Pilani', 'Vellore'];
export const ENTRY    = ['All', 'Free', 'Paid', 'Prize Pool'];
export const SORT_OPT = ['Latest', 'Oldest', 'Most Registered', 'Deadline Soon'];

export const Chip = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-md border text-[13px] font-medium transition-all duration-150 ${active ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-sm' : 'bg-white border-[#E4E4E0] text-[#4B4B47] hover:border-[#4F46E5] hover:text-[#4F46E5]'}`}>
    {label}
  </button>
);

export const FilterSection = ({ title, children, noBorder }) => (
  <div className={`mb-5 ${!noBorder ? 'pb-5 border-b border-[#F1F0ED]' : ''}`}>
    <div className="text-[12px] font-bold tracking-wider uppercase text-[#8A8A85] mb-3">{title}</div>
    {children}
  </div>
);

export function FilterSheet({ open, onClose, filters, setFilters, onApply, activeCount }) {
  const [local, setLocal] = useState(filters);
  const toggle = (key, val) => setLocal(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  const handleApply = () => { setFilters(local); onApply(local); onClose(); };
  const handleReset = () => {
    const cleared = { category: null, entry: null, city: null, sort: 'Latest' };
    setLocal(cleared); setFilters(cleared); onApply(cleared); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} className="fixed inset-0 bg-black/40 z-[200]" onClick={onClose} />
          <motion.div key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-lg max-w-[640px] mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-[#E4E4E0] rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E4E4E0] flex-shrink-0">
              <h3 className="font-display font-bold text-[18px] text-[#111110]">
                Filters
                {activeCount > 0 && <span className="ml-2 text-[12px] font-bold bg-primary text-white px-2 py-0.5 rounded-md">{activeCount}</span>}
              </h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F1F0ED] text-[#8A8A85] hover:bg-[#E4E4E0] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <FilterSection title="Category">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <Chip key={c.value} label={c.label} active={local.category === c.value} onClick={() => toggle('category', c.value)} />
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Entry Type">
                <div className="flex flex-wrap gap-2">
                  {ENTRY.map(e => <Chip key={e} label={e} active={local.entry === e} onClick={() => toggle('entry', e)} />)}
                </div>
              </FilterSection>
              <FilterSection title="City">
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <Chip key={c} label={c} active={local.city === c || (!local.city && c === 'All Cities')} onClick={() => toggle('city', c === 'All Cities' ? null : c)} />
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Sort By" noBorder>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPT.map(s => <Chip key={s} label={s} active={local.sort === s} onClick={() => setLocal(prev => ({ ...prev, sort: s }))} />)}
                </div>
              </FilterSection>
            </div>
            <div className="flex gap-3 px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-[#E4E4E0] flex-shrink-0">
              <button onClick={handleReset} className="flex-1 py-3 border-[1.5px] border-[#E4E4E0] rounded-md text-[14px] font-semibold text-[#8A8A85] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all">Reset All</button>
              <button onClick={handleApply} className="flex-[2] py-3 bg-[#4F46E5] text-white rounded-md text-[14px] font-bold hover:bg-[#3730A3] hover:shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all">Show Events</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity">
        {value}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-7 z-[51] bg-white border border-[#E4E4E0] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[160px]">
              {SORT_OPT.map(opt => (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                  className={`flex items-center justify-between w-full px-4 py-3 text-[13px] font-medium transition-colors text-left ${value === opt ? 'bg-primary-light text-primary' : 'text-[#4B4B47] hover:bg-[#F5F3FF] hover:text-primary'}`}>
                  {opt}
                  {value === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ActivePill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-light border border-[#C7D2FE] text-primary rounded-md text-[12px] font-semibold flex-shrink-0">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity" aria-label={`Remove ${label} filter`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </span>
  );
}
