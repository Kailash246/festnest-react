// src/pages/legal/_LegalLayout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

/* ───────────────────────────────────────────────
   Reusable styled blocks
─────────────────────────────────────────────── */
export function Callout({ type = 'info', icon, title, children }) {
  const styles = {
    info:    'bg-primary-light border-[#C7D2FE]',
    warning: 'bg-amber-bg border-amber-border',
    success: 'bg-green-bg border-green-border',
    legal:   'bg-surface-2 border-border',
    danger:  'bg-red-bg border-red-border',
  };
  const titleColor = {
    info: 'text-primary', warning: 'text-amber', success: 'text-[#16A34A]',
    legal: 'text-text-1', danger: 'text-red',
  };
  const iconColor = {
    info: 'text-primary', warning: 'text-amber', success: 'text-[#16A34A]',
    legal: 'text-text-1', danger: 'text-red',
  };
  const Icon = icon;
  return (
    <div className={`rounded-lg border p-4 my-4 ${styles[type]}`}>
      <div className="flex items-start gap-2.5">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor[type]}`} />}
        <div className="flex-1 min-w-0">
          {title && <div className={`font-display font-bold text-[13px] mb-1 ${titleColor[type]}`}>{title}</div>}
          <div className="text-[13px] leading-relaxed text-text-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Section({ num, title, id, children }) {
  return (
    <section id={id} className="scroll-mt-20 mb-10">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-md bg-primary text-white font-display font-bold text-[13px] flex items-center justify-center">
          {num}
        </span>
        <h2 className="font-display font-bold text-[18px] md:text-[20px] text-text-1 tracking-tight leading-tight">{title}</h2>
      </div>
      <div className="text-[14px] text-text-2 leading-relaxed space-y-3 md:pl-[42px]">
        {children}
      </div>
    </section>
  );
}

export function List({ items }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-[7px]" />
          <span className="text-[14px] text-text-2 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DualList({ leftTitle, leftItems, rightTitle, rightItems }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 my-4">
      <div className="bg-green-bg border border-green-border rounded-lg p-4">
        <div className="font-display font-bold text-[13px] text-[#16A34A] mb-3 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
          {leftTitle}
        </div>
        <ul className="space-y-2">
          {leftItems.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-text-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              {it}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-red-bg border border-red-border rounded-lg p-4">
        <div className="font-display font-bold text-[13px] text-red mb-3 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
          {rightTitle}
        </div>
        <ul className="space-y-2">
          {rightItems.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-text-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              {it}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RoleCard({ icon: Icon, title, badge, items }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-display font-bold text-[15px] text-text-1">{title}</div>
          <div className="text-[11px] font-semibold text-primary uppercase tracking-wide">{badge}</div>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-text-2">
            <span className="text-primary flex-shrink-0">›</span>{it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContactCard({ icon: Icon, title, email, desc }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5">
      <div className="mb-2 text-primary">{Icon && <Icon className="w-5 h-5" />}</div>
      <div className="font-display font-bold text-[14px] text-text-1 mb-1">{title}</div>
      <a href={`mailto:${email}`} className="text-[13px] font-semibold text-primary hover:underline block mb-1.5 break-all">{email}</a>
      <div className="text-[12px] text-text-3 leading-relaxed">{desc}</div>
    </div>
  );
}

export function InfoTable({ rows }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden my-4 divide-y divide-border">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1.4fr_1fr] gap-3 px-4 py-3 bg-white">
          <div>
            <div className="text-[13px] font-semibold text-text-1">{r.label}</div>
            <div className="text-[12px] text-text-3 mt-0.5">{r.desc}</div>
          </div>
          <div className="text-[12px] md:text-[13px] font-bold text-primary self-center text-right">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Main shell — mobile-first
─────────────────────────────────────────────── */
export default function LegalLayout({ kind, title, subtitle, effectiveDate, lastUpdated, sections, children }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(sections[0]?.id);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-[#F8F8F6] min-h-screen w-full">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-[#7C3AED] px-5 py-10 md:px-6 md:py-16">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/[0.07] pointer-events-none" />
        <div className="relative max-w-[820px] mx-auto">
          <button onClick={() => navigate('/welcome')}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-medium mb-5 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
            Back to FestNest
          </button>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 mb-3">
            <span className="text-white/90 text-[11px] font-bold uppercase tracking-wider">{kind}</span>
          </div>
          <h1 className="font-display font-bold text-[28px] md:text-[40px] text-white tracking-tight leading-[1.1] mb-3">{title}</h1>
          <p className="text-[14px] md:text-[16px] text-white/75 leading-relaxed max-w-[560px]">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {effectiveDate && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-md px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[12px] text-white/90 font-medium">Effective {effectiveDate}</span>
              </div>
            )}
            {lastUpdated && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-md px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[12px] text-white/90 font-medium">Updated {lastUpdated}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile section jump (collapsible) */}
      <div className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border">
        <button onClick={() => setNavOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3 text-left">
          <span className="text-[13px] font-semibold text-text-1">
            Jump to section
          </span>
          <motion.svg animate={{ rotate: navOpen ? 180 : 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-3"><polyline points="6 9 12 15 18 9"/></motion.svg>
        </button>
        <AnimatePresence>
          {navOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-border">
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {sections.map((s) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left px-5 py-2 text-[13px] transition-all
                      ${active === s.id ? 'text-primary font-semibold bg-primary-light' : 'text-text-2'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body */}
      <div className="max-w-[1040px] mx-auto px-4 py-8 md:px-6 md:py-10 md:grid md:grid-cols-[230px_1fr] md:gap-8 items-start">

        {/* Desktop sticky nav */}
        <nav className="hidden md:block sticky top-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-3 px-3">On this page</div>
          <div className="space-y-0.5 max-h-[72vh] overflow-y-auto no-scrollbar">
            {sections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-[12.5px] transition-all leading-snug
                  ${active === s.id ? 'bg-primary-light text-primary font-semibold' : 'text-text-3 hover:text-text-1 hover:bg-surface-3'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="bg-white border border-border rounded-xl p-5 md:p-10 min-w-0">
          {children}

          <div className="mt-10 pt-6 border-t border-border text-center">
            <div className="text-[12px] text-text-3 mb-3 leading-relaxed">
              <strong className="text-text-1">FestNest</strong> · Operated in India · Subject to the laws &amp; jurisdiction of India
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/terms')} className="text-[13px] text-primary hover:underline font-medium">Terms of Service</button>
              <span className="text-border-strong">·</span>
              <button onClick={() => navigate('/privacy')} className="text-[13px] text-primary hover:underline font-medium">Privacy Policy</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
