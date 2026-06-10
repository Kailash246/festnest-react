// src/pages/landing/Landing.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal, useCountUp, useMouseParallax, Reveal } from './_hooks';

/* ════════════════════════════════════════════════════════════
   BRAND MARK
════════════════════════════════════════════════════════════ */
const Logo = ({ light }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[20px] ${light ? 'bg-white/15' : 'bg-primary'}`}>
      🪺
    </div>
    <span className={`font-display font-bold text-[21px] tracking-tight ${light ? 'text-white' : 'text-text-1'}`}>
      FestNest
    </span>
  </div>
);

/* ════════════════════════════════════════════════════════════
   STICKY NAV
════════════════════════════════════════════════════════════ */
function Nav({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['Features', 'features'], ['Categories', 'categories'],
    ['How it Works', 'how'], ['For Organizers', 'organizers'], ['FAQ', 'faq'],
  ];
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-border shadow-[0_1px_20px_rgba(0,0,0,0.04)]' : 'bg-transparent'}`}>
      <div className="max-w-[1240px] mx-auto px-8 h-[68px] flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Logo /></button>

        <nav className="flex items-center gap-1">
          {links.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="px-4 py-2 text-[14px] font-medium text-text-2 hover:text-text-1 rounded-lg hover:bg-surface-2 transition-all">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onEnter}
            className="px-4 py-2 text-[14px] font-semibold text-text-2 hover:text-primary transition-colors">
            Log in
          </button>
          <button onClick={onEnter}
            className="px-5 py-2.5 bg-primary text-white text-[14px] font-bold rounded-xl
                       hover:bg-primary-dark hover:shadow-indigo transition-all duration-200
                       hover:-translate-y-0.5">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}

/* ════════════════════════════════════════════════════════════
   FLOATING EVENT CARD (hero mockup)
════════════════════════════════════════════════════════════ */
const MiniCard = ({ emoji, bg, title, sub, badge, badgeColor, style, cls }) => (
  <div style={style}
    className={`absolute bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-border p-3 w-[200px] ${cls}`}>
    <div className={`w-full h-[88px] rounded-xl ${bg} flex items-center justify-center text-[40px] mb-2.5 relative overflow-hidden lp-shine-wrap`}>
      {emoji}
      {badge && (
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    <div className="font-display font-bold text-[13px] text-text-1 leading-snug">{title}</div>
    <div className="text-[11px] text-text-3 mt-0.5">{sub}</div>
  </div>
);

/* ════════════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════════════ */
const SEARCH_HINTS = ['hackathons…', 'cultural fests…', 'workshops by college…', 'events near you…', 'competitions with prizes…'];

function Hero({ onEnter }) {
  const navigate = useNavigate();
  const [paraRef, mouse] = useMouseParallax();
  const [hintIdx, setHintIdx] = useState(0);
  const [typed, setTyped] = useState('');

  // Typewriter placeholder
  useEffect(() => {
    const word = SEARCH_HINTS[hintIdx];
    let i = 0, deleting = false, timer;
    const tick = () => {
      if (!deleting) {
        setTyped(word.slice(0, i + 1)); i++;
        if (i === word.length) { deleting = true; timer = setTimeout(tick, 1600); return; }
      } else {
        setTyped(word.slice(0, i - 1)); i--;
        if (i === 0) { deleting = false; setHintIdx(p => (p + 1) % SEARCH_HINTS.length); return; }
      }
      timer = setTimeout(tick, deleting ? 45 : 85);
    };
    timer = setTimeout(tick, 200);
    return () => clearTimeout(timer);
  }, [hintIdx]);

  const px = mouse.x * 18, py = mouse.y * 18;

  return (
    <section className="relative pt-[68px] overflow-hidden">
      {/* Background flourish */}
      <div className="absolute inset-0 lp-grid-bg pointer-events-none" />
      <div className="absolute top-[-120px] right-[-80px] w-[460px] h-[460px] bg-primary/10 lp-blob blur-3xl pointer-events-none" />
      <div className="absolute top-[180px] left-[-100px] w-[360px] h-[360px] bg-[#7C3AED]/10 lp-blob blur-3xl pointer-events-none" style={{ animationDelay: '3s' }} />

      <div ref={paraRef} className="relative max-w-[1240px] mx-auto px-8 pt-20 pb-24 grid grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        {/* ── Left ── */}
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-primary-light border border-[#C7D2FE] rounded-full pl-1.5 pr-3.5 py-1.5 mb-7">
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">NEW</span>
              <span className="text-[13px] font-semibold text-primary">2,400+ live events across India</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display font-bold text-[52px] leading-[1.05] tracking-tight text-text-1 mb-6">
              Discover every<br />
              college event in<br />
              India. <span className="lp-gradient-text">In one place.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-[18px] text-text-2 leading-relaxed max-w-[480px] mb-8">
              Hackathons, fests, workshops, competitions, and student opportunities —
              from <strong className="text-text-1">850+ colleges</strong>, all in your pocket.
              Never miss a deadline again.
            </p>
          </Reveal>

          {/* Search */}
          <Reveal delay={0.18}>
            <div className="flex items-center gap-2 bg-white border-[1.5px] border-border-strong rounded-2xl pl-4 pr-2 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.06)] max-w-[480px] mb-6 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(79,70,229,0.10)] transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-text-3 flex-shrink-0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                readOnly
                onClick={() => navigate('/explore')}
                placeholder={`Search ${typed}`}
                className="flex-1 bg-transparent text-[15px] text-text-1 placeholder:text-text-3 outline-none cursor-pointer py-2"
              />
              <button onClick={() => navigate('/explore')}
                className="bg-primary text-white text-[14px] font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all flex-shrink-0">
                Search
              </button>
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.24}>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/explore')}
                className="group bg-primary text-white text-[15px] font-bold px-7 py-3.5 rounded-2xl hover:bg-primary-dark hover:shadow-indigo transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
                Explore Events
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
              <button onClick={() => navigate('/host')}
                className="bg-white text-text-1 text-[15px] font-bold px-7 py-3.5 rounded-2xl border-[1.5px] border-border-strong hover:border-primary hover:text-primary transition-all duration-200 hover:-translate-y-0.5">
                Post an Event
              </button>
            </div>
          </Reveal>

          {/* Trust strip */}
          <Reveal delay={0.32}>
            <div className="flex items-center gap-4 mt-9">
              <div className="flex -space-x-2.5">
                {['🧑‍💻','👩‍🎓','🧑‍🎤','👨‍🔬','🧑‍🎨'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-surface-3 border-2 border-white flex items-center justify-center text-[15px]">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber">
                  {'★★★★★'.split('').map((s, i) => <span key={i} className="text-[13px]">{s}</span>)}
                </div>
                <div className="text-[12px] text-text-3 mt-0.5"><strong className="text-text-1">48,000+</strong> students already on board</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Right: Floating mockup ── */}
        <div className="relative h-[520px] hidden lg:block"
          style={{ transform: `translate(${px}px, ${py}px)`, transition: 'transform 0.2s ease-out' }}>

          {/* Main dashboard card */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.18)] border border-border overflow-hidden lp-float-slow">
            <div className="bg-gradient-to-br from-primary to-[#7C3AED] px-5 pt-5 pb-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/80 text-[12px] font-semibold">Good afternoon 👋</span>
                <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"/>)}</div>
              </div>
              <div className="text-white font-display font-bold text-[22px] leading-tight">Find your next<br/>big moment</div>
              <div className="mt-4 bg-white/95 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8A8A85" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span className="text-[12px] text-text-3">Search events…</span>
              </div>
            </div>
            <div className="px-4 py-4 space-y-2.5">
              {[
                { e: '💻', bg: 'bg1', t: 'HackBits 2025', s: 'IIT Bombay · ₹2L prize', b: '🔥' },
                { e: '🎭', bg: 'bg5', t: "Kaleidoscope '25", s: 'NIT Trichy · 3 days', b: '' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl border border-border hover:border-primary-mid transition-colors">
                  <div className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center text-[20px]`}>{c.e}</div>
                  <div className="flex-1">
                    <div className="text-[12px] font-bold text-text-1">{c.t}</div>
                    <div className="text-[10px] text-text-3">{c.s}</div>
                  </div>
                  {c.b && <span className="text-[14px]">{c.b}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Floating mini cards */}
          <MiniCard emoji="🏆" bg="bg7" title="AI Challenge '25" sub="IISc · ₹5L prize"
            badge="₹5L" badgeColor="bg-amber-bg text-amber"
            cls="lp-float" style={{ top: 0, right: -10, '--r': '4deg', animationDelay: '0.5s' }} />

          <MiniCard emoji="🤖" bg="bg4" title="RoboWar Arena" sub="VIT · 2 days left"
            badge="LIVE" badgeColor="bg-red-bg text-red"
            cls="lp-float-slow" style={{ bottom: 30, left: -20, '--r': '-5deg', animationDelay: '1.2s' }} />

          {/* Notification pop */}
          <div className="absolute bottom-0 right-4 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-border p-3 w-[210px] lp-float" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-bg flex items-center justify-center text-[15px] flex-shrink-0">✅</div>
              <div>
                <div className="text-[12px] font-bold text-text-1">Registration confirmed!</div>
                <div className="text-[10px] text-text-3 mt-0.5">You're all set for HackBits 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   LOGO MARQUEE
════════════════════════════════════════════════════════════ */
const COLLEGES = ['IIT Bombay','IIT Delhi','NIT Warangal','BITS Pilani','VIT Vellore','IISc Bangalore','Christ University','PES University','RV University','NIT Trichy'];

function LogoWall() {
  const row = [...COLLEGES, ...COLLEGES];
  return (
    <section className="py-14 border-y border-border bg-surface-2/50 overflow-hidden">
      <Reveal>
        <p className="text-center text-[13px] font-bold tracking-wider uppercase text-text-3 mb-8">
          Trusted by students from India's top colleges
        </p>
      </Reveal>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="flex gap-4 lp-marquee w-max">
          {row.map((c, i) => (
            <div key={i}
              className="flex items-center gap-2.5 bg-white border border-border rounded-xl px-5 py-3 whitespace-nowrap
                         grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-primary-mid transition-all duration-300">
              <span className="text-[20px]">🏛️</span>
              <span className="font-display font-bold text-[15px] text-text-2">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   STATS
════════════════════════════════════════════════════════════ */
function StatItem({ target, suffix, prefix, label, icon }) {
  const [ref, val] = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-[34px] mb-2">{icon}</div>
      <div className="font-display font-bold text-[40px] text-text-1 leading-none tracking-tight">
        {prefix}{val.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-[14px] text-text-3 font-medium mt-2">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section className="py-24 max-w-[1100px] mx-auto px-8">
      <Reveal>
        <div className="grid grid-cols-4 gap-8">
          <StatItem icon="🎉" target={2400}  suffix="+" label="Events Listed" />
          <StatItem icon="🏛️" target={850}   suffix="+" label="Colleges" />
          <StatItem icon="🧑‍💻" target={48000} suffix="+" label="Active Students" />
          <StatItem icon="🏆" target={2}     suffix="Cr+" prefix="₹" label="Prize Pool" />
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FEATURED EVENTS
════════════════════════════════════════════════════════════ */
const FEATURED = [
  { emoji: '💻', bg: 'bg1', cat: 'Hackathon', name: 'HackBits 2025', college: 'IIT Bombay', prize: '₹2,00,000', deadline: '4 days left', deadlineColor: 'text-amber', accent: 'from-indigo-500/10' },
  { emoji: '🧠', bg: 'bg8', cat: 'Competition', name: "AI Challenge '25", college: 'IISc Bangalore', prize: '₹5,00,000', deadline: '2 days left', deadlineColor: 'text-red', accent: 'from-blue-500/10' },
  { emoji: '🎭', bg: 'bg5', cat: 'Cultural Fest', name: "Kaleidoscope '25", college: 'NIT Trichy', prize: '₹50,000', deadline: '8 days left', deadlineColor: 'text-green', accent: 'from-fuchsia-500/10' },
];

function Featured() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-surface-2/40">
      <div className="max-w-[1240px] mx-auto px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">⭐ Featured</div>
              <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">This week's spotlight</h2>
            </div>
            <button onClick={() => navigate('/explore')}
              className="text-[14px] font-semibold text-primary hover:gap-2 flex items-center gap-1 transition-all">
              View all events
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </Reveal>

        <div className="grid grid-cols-3 gap-6">
          {FEATURED.map((ev, i) => (
            <Reveal key={ev.name} delay={i * 0.1}>
              <div onClick={() => navigate('/explore')}
                className="group bg-white rounded-[24px] border border-border overflow-hidden cursor-pointer
                           hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300">
                {/* Poster */}
                <div className={`relative h-[200px] ${ev.bg} flex items-center justify-center text-[72px] overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-t ${ev.accent} to-transparent`} />
                  <span className="relative group-hover:scale-110 transition-transform duration-500">{ev.emoji}</span>
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[11px] font-bold text-text-1 px-3 py-1 rounded-full">
                    {ev.cat}
                  </span>
                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    🏆 {ev.prize}
                  </span>
                </div>
                {/* Body */}
                <div className="p-5">
                  <h3 className="font-display font-bold text-[20px] text-text-1 mb-1 group-hover:text-primary transition-colors">{ev.name}</h3>
                  <div className="flex items-center gap-1.5 text-[13px] text-text-3 mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    {ev.college}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className={`text-[12px] font-bold ${ev.deadlineColor} flex items-center gap-1`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot"/>
                      {ev.deadline}
                    </span>
                    <span className="text-[13px] font-bold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m9 18 6-6-6-6"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════════════════════════ */
const CATS = [
  { emoji: '💻', name: 'Hackathons',    count: '420 events', g: 'from-indigo-50 to-blue-50',   cat: 'Hackathon' },
  { emoji: '🎭', name: 'Cultural Fests', count: '310 events', g: 'from-fuchsia-50 to-pink-50',  cat: 'Cultural Fest' },
  { emoji: '🛠️', name: 'Workshops',      count: '580 events', g: 'from-teal-50 to-emerald-50',  cat: 'Workshop' },
  { emoji: '🏆', name: 'Competitions',   count: '270 events', g: 'from-amber-50 to-orange-50',  cat: 'Competition' },
  { emoji: '🎙️', name: 'Tech Talks',     count: '190 events', g: 'from-blue-50 to-sky-50',      cat: 'Tech Talk' },
  { emoji: '⚽', name: 'Sports Meets',   count: '140 events', g: 'from-green-50 to-lime-50',    cat: 'Sports' },
  { emoji: '🎨', name: 'Design Jams',    count: '95 events',  g: 'from-rose-50 to-red-50',      cat: 'Workshop' },
  { emoji: '🚀', name: 'Startup Pitches',count: '110 events', g: 'from-violet-50 to-purple-50', cat: 'Competition' },
];

function Categories() {
  const navigate = useNavigate();
  return (
    <section id="categories" className="py-24 max-w-[1240px] mx-auto px-8">
      <Reveal>
        <div className="text-center mb-14">
          <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Categories</div>
          <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1 mb-3">Find your kind of event</h2>
          <p className="text-[17px] text-text-2 max-w-[520px] mx-auto">Whatever you're into, there's a community and a competition waiting.</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-4 gap-5">
        {CATS.map((c, i) => (
          <Reveal key={c.name} delay={(i % 4) * 0.06}>
            <button onClick={() => navigate(`/explore?cat=${encodeURIComponent(c.cat)}`)}
              className={`group relative w-full text-left bg-gradient-to-br ${c.g} rounded-[22px] p-6 border border-border
                         hover:border-primary hover:shadow-[0_16px_40px_rgba(79,70,229,0.14)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 text-[100px] opacity-[0.07] group-hover:scale-125 group-hover:opacity-[0.12] transition-all duration-500">{c.emoji}</div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[30px] mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {c.emoji}
                </div>
                <h3 className="font-display font-bold text-[17px] text-text-1 mb-1">{c.name}</h3>
                <p className="text-[13px] text-text-3">{c.count}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   PRODUCT SHOWCASE (tabbed)
════════════════════════════════════════════════════════════ */
const SHOWCASE = [
  { id: 'feed',    label: 'Home Feed',     desc: 'A personalised feed of events tuned to your college, city, and interests.' },
  { id: 'detail',  label: 'Event Page',    desc: 'Everything in one view — prizes, rules, deadlines, and one-tap registration.' },
  { id: 'organizer', label: 'Organizer',   desc: 'Post events, track submissions, and watch registrations roll in.' },
  { id: 'admin',   label: 'Admin',         desc: 'Review and approve submissions with a powerful moderation dashboard.' },
];

function Showcase() {
  const [active, setActive] = useState('feed');

  const mockups = {
    feed: (
      <div className="space-y-3">
        <div className="h-10 bg-gradient-to-r from-primary to-[#7C3AED] rounded-xl" />
        <div className="flex gap-2">{['All','💻','🎭','🛠️'].map((c,i)=><div key={i} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${i===0?'bg-primary text-white':'bg-surface-3 text-text-3'}`}>{c}</div>)}</div>
        <div className="grid grid-cols-2 gap-3">
          {['bg1','bg5','bg7','bg4'].map((b,i)=>(
            <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
              <div className={`h-16 ${b} flex items-center justify-center text-[28px]`}>{['💻','🎭','🏆','🤖'][i]}</div>
              <div className="p-2"><div className="h-2 bg-surface-3 rounded w-3/4 mb-1.5"/><div className="h-1.5 bg-surface-3 rounded w-1/2"/></div>
            </div>
          ))}
        </div>
      </div>
    ),
    detail: (
      <div className="space-y-3">
        <div className="h-28 bg-gradient-to-br from-indigo-100 to-violet-50 rounded-xl flex items-center justify-center text-[48px]">💻</div>
        <div className="h-3 bg-surface-3 rounded w-2/3" />
        <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="h-12 flex-1 bg-surface-2 rounded-lg"/>)}</div>
        <div className="h-2 bg-surface-3 rounded w-full" /><div className="h-2 bg-surface-3 rounded w-5/6" />
        <div className="h-10 bg-primary rounded-xl" />
      </div>
    ),
    organizer: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">{['🗓️ 12','✅ 8','⏳ 3','🧑‍💻 1.2k'].map((s,i)=><div key={i} className="bg-white border border-border rounded-lg p-2.5"><div className="text-[16px] font-bold text-text-1">{s.split(' ')[1]}</div><div className="text-[9px] text-text-3">{['Submitted','Live','Pending','Registered'][i]}</div></div>)}</div>
        {[1,2].map(i=><div key={i} className="flex items-center gap-2 bg-white border border-border rounded-lg p-2"><div className="w-8 h-8 bg-primary-light rounded-lg"/><div className="flex-1"><div className="h-2 bg-surface-3 rounded w-2/3 mb-1"/><div className="h-1.5 bg-surface-3 rounded w-1/3"/></div><div className="px-2 py-0.5 bg-green-bg rounded-full text-[8px] text-green font-bold">Live</div></div>)}
      </div>
    ),
    admin: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">{['👥','🗓️','⏳'].map((e,i)=><div key={i} className="bg-white border border-border rounded-lg p-2 text-center"><div className="text-[18px]">{e}</div><div className="h-1.5 bg-surface-3 rounded mt-1"/></div>)}</div>
        {[1,2,3].map(i=><div key={i} className="flex items-center gap-2 bg-amber-bg border border-amber-border rounded-lg p-2"><div className="text-[14px]">📋</div><div className="flex-1 h-2 bg-amber-border/50 rounded"/><div className="px-2 py-0.5 bg-white rounded text-[8px] text-amber font-bold">Review</div></div>)}
      </div>
    ),
  };

  return (
    <section className="py-24 bg-surface-2/40">
      <div className="max-w-[1100px] mx-auto px-8">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Product Tour</div>
            <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">See FestNest in action</h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex justify-center gap-2 mb-10">
            {SHOWCASE.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all
                  ${active === s.id ? 'bg-primary text-white shadow-indigo' : 'bg-white border border-border text-text-2 hover:border-primary-mid'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid grid-cols-[1fr_1.2fr] gap-10 items-center bg-white rounded-[28px] border border-border p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div>
              <h3 className="font-display font-bold text-[26px] text-text-1 mb-3">{SHOWCASE.find(s => s.id === active).label}</h3>
              <p className="text-[16px] text-text-2 leading-relaxed mb-6">{SHOWCASE.find(s => s.id === active).desc}</p>
              <div className="space-y-2.5">
                {['Lightning fast', 'Mobile first', 'Always free for students'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-[14px] text-text-2">
                    <div className="w-5 h-5 rounded-full bg-green-bg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Phone frame */}
            <div className="flex justify-center">
              <div className="w-[300px] bg-surface-2 rounded-[32px] border-[6px] border-text-1 p-4 shadow-2xl">
                <div className="bg-white rounded-[20px] p-4 min-h-[360px]">
                  {mockups[active]}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FEATURES
════════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: '🔍', title: 'Smart Discovery', desc: 'Personalised feed filtered by your college, city, and interests — no noise.' },
  { icon: '🏆', title: 'Win Big',         desc: 'Track ₹2Cr+ in prizes across hackathons and competitions nationwide.' },
  { icon: '🔔', title: 'Never Miss Out',  desc: 'Deadline reminders and live updates so you never miss a registration.' },
  { icon: '🧑‍💼', title: 'Organizer Tools',  desc: 'Post, manage, and promote your events with a powerful dashboard.' },
  { icon: '🔖', title: 'Save & Track',    desc: 'Bookmark events and track everything you\'ve registered for in one place.' },
  { icon: '📱', title: 'Built for Mobile', desc: 'A blazing-fast, app-like experience designed for life on the go.' },
];

function Features() {
  return (
    <section id="features" className="py-24 max-w-[1240px] mx-auto px-8">
      <Reveal>
        <div className="text-center mb-14">
          <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Why FestNest</div>
          <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1 mb-3">Everything you need, nothing you don't</h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.08}>
            <div className="group bg-white rounded-[22px] border border-border p-7 hover:border-primary-mid hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-[28px] mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-[18px] text-text-1 mb-2">{f.title}</h3>
              <p className="text-[14px] text-text-2 leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════════════ */
const STEPS = [
  { n: '01', icon: '✨', title: 'Create your account', desc: 'Sign up free in 30 seconds with your email.' },
  { n: '02', icon: '🔭', title: 'Discover events',     desc: 'Browse a feed tailored to your interests.' },
  { n: '03', icon: '🔖', title: 'Register & save',     desc: 'One-tap register and bookmark your favourites.' },
  { n: '04', icon: '🏆', title: 'Compete & win',       desc: 'Show up, participate, and climb the leaderboard.' },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-surface-2/40">
      <div className="max-w-[1240px] mx-auto px-8">
        <Reveal>
          <div className="text-center mb-16">
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">How it works</div>
            <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">Up and running in 4 steps</h2>
          </div>
        </Reveal>

        <div className="relative grid grid-cols-4 gap-6">
          {/* Connecting line */}
          <div className="absolute top-[42px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative text-center">
                <div className="relative w-[84px] h-[84px] mx-auto mb-5">
                  <div className="absolute inset-0 bg-primary-light rounded-2xl rotate-3" />
                  <div className="relative w-full h-full bg-white rounded-2xl border-2 border-primary flex items-center justify-center text-[36px] shadow-[0_8px_24px_rgba(79,70,229,0.15)]">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-[11px] font-bold">
                    {s.n}
                  </div>
                </div>
                <h3 className="font-display font-bold text-[17px] text-text-1 mb-2">{s.title}</h3>
                <p className="text-[14px] text-text-2 leading-relaxed px-2">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   ORGANIZER SECTION
════════════════════════════════════════════════════════════ */
function Organizers() {
  const navigate = useNavigate();
  return (
    <section id="organizers" className="py-24 max-w-[1240px] mx-auto px-8">
      <div className="grid grid-cols-2 gap-16 items-center">
        {/* Left: mockup */}
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-[#7C3AED]/10 rounded-[32px] blur-2xl" />
            <div className="relative bg-white rounded-[28px] border border-border shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display font-bold text-[18px] text-text-1">Organizer Dashboard</div>
                <div className="px-3 py-1 bg-green-bg text-green text-[11px] font-bold rounded-full">● Live</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[['🗓️','12','Events'],['🧑‍💻','3.4k','Signups'],['👁️','18k','Views']].map(([e,n,l])=>(
                  <div key={l} className="bg-surface-2 rounded-xl p-3 text-center">
                    <div className="text-[20px]">{e}</div>
                    <div className="font-display font-bold text-[20px] text-text-1 mt-1">{n}</div>
                    <div className="text-[10px] text-text-3">{l}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-24 mb-2">
                {[40,65,50,80,95,70,88].map((h,i)=>(
                  <div key={i} className="flex-1 bg-gradient-to-t from-primary to-primary-mid rounded-t-md lp-bob" style={{ height: `${h}%`, animationDelay: `${i*0.1}s` }} />
                ))}
              </div>
              <div className="text-[11px] text-text-3 text-center">Registrations this week ↑ 23%</div>
            </div>
          </div>
        </Reveal>

        {/* Right: copy */}
        <Reveal delay={0.1}>
          <div>
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-3">For Organizers</div>
            <h2 className="font-display font-bold text-[40px] leading-[1.1] tracking-tight text-text-1 mb-5">
              Reach thousands of students with your event
            </h2>
            <p className="text-[17px] text-text-2 leading-relaxed mb-8">
              List your hackathon, fest, or workshop and get discovered by 48,000+ students.
              Track registrations, manage submissions, and grow your reach — all for free.
            </p>
            <div className="space-y-3 mb-9">
              {[
                ['📈', 'More registrations', 'Get in front of students actively looking for events'],
                ['🎯', 'Featured promotion',  'Boost visibility with featured event placement'],
                ['📊', 'Real-time analytics',  'Track views, signups, and engagement live'],
              ].map(([icon, t, d]) => (
                <div key={t} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-[20px] flex-shrink-0">{icon}</div>
                  <div>
                    <div className="font-display font-bold text-[15px] text-text-1">{t}</div>
                    <div className="text-[14px] text-text-3">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/host')}
              className="bg-primary text-white text-[15px] font-bold px-8 py-4 rounded-2xl hover:bg-primary-dark hover:shadow-indigo hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Host Your Event
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPARISON
════════════════════════════════════════════════════════════ */
const COMPARE_ROWS = [
  ['Event Discovery', true, false, 'partial'],
  ['Registration Tracking', true, false, false],
  ['Smart Search & Filters', true, false, false],
  ['Saved Events', true, false, 'partial'],
  ['Deadline Reminders', true, false, false],
  ['Organizer Analytics', true, false, false],
  ['Verified Events', true, false, false],
];

const Cell = ({ v }) => {
  if (v === true) return <div className="w-6 h-6 rounded-full bg-green-bg flex items-center justify-center mx-auto"><svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg></div>;
  if (v === 'partial') return <span className="text-text-4 text-[18px]">~</span>;
  return <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center mx-auto"><svg viewBox="0 0 24 24" fill="none" stroke="#AEAEAD" strokeWidth="2.5" className="w-3 h-3"><path d="M18 6 6 18M6 6l12 12"/></svg></div>;
};

function Comparison() {
  return (
    <section className="py-24 bg-surface-2/40">
      <div className="max-w-[860px] mx-auto px-8">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Why switch</div>
            <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">FestNest vs the group chat chaos</h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-white rounded-[24px] border border-border overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr]">
              {/* Header */}
              <div className="p-5 bg-surface-2 font-display font-bold text-[14px] text-text-3">Feature</div>
              <div className="p-5 bg-primary text-center font-display font-bold text-[15px] text-white">FestNest</div>
              <div className="p-5 bg-surface-2 text-center font-display font-bold text-[13px] text-text-3">WhatsApp</div>
              <div className="p-5 bg-surface-2 text-center font-display font-bold text-[13px] text-text-3">Instagram</div>
              {/* Rows */}
              {COMPARE_ROWS.map((row, i) => (
                <div key={row[0]} className="contents">
                  <div className={`p-4 text-[14px] font-medium text-text-1 ${i % 2 ? 'bg-surface-2/40' : ''}`}>{row[0]}</div>
                  <div className={`p-4 flex items-center justify-center bg-primary-xlight/60 ${i % 2 ? '' : ''}`}><Cell v={row[1]} /></div>
                  <div className={`p-4 flex items-center justify-center ${i % 2 ? 'bg-surface-2/40' : ''}`}><Cell v={row[2]} /></div>
                  <div className={`p-4 flex items-center justify-center ${i % 2 ? 'bg-surface-2/40' : ''}`}><Cell v={row[3]} /></div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { name: 'Ananya Sharma', role: 'CS, IIT Bombay', avatar: '👩‍💻', text: 'Found and registered for 3 hackathons in one week. Won ₹50k at one of them. FestNest literally changed my semester.', rating: 5 },
  { name: 'Rohan Mehta', role: 'Events Head, NIT Trichy', avatar: '🧑‍💼', text: 'As an organizer, listing our fest on FestNest got us 4x the registrations we got from Instagram. The dashboard is gold.', rating: 5 },
  { name: 'Priya Nair', role: 'Design, BITS Pilani', avatar: '👩‍🎨', text: "I used to miss deadlines all the time. Now I get reminders and never miss a workshop. Wish I'd found this in my 1st year.", rating: 5 },
  { name: 'Karthik Reddy', role: 'ECE, IISc', avatar: '🧑‍🔬', text: 'The search and filters are so good. I can find AI competitions in my city in seconds. Genuinely the cleanest app I use.', rating: 5 },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1].map(o => TESTIMONIALS[(idx + o) % TESTIMONIALS.length]);

  return (
    <section className="py-24 max-w-[1100px] mx-auto px-8">
      <Reveal>
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Loved by students</div>
            <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">Don't just take our word for it</h2>
          </div>
          <div className="flex gap-2">
            {[['prev', prev, 'm15 18-6-6 6-6'], ['next', next, 'm9 18 6-6-6-6']].map(([k, fn, d]) => (
              <button key={k} onClick={fn}
                className="w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center text-text-2 hover:border-primary hover:text-primary transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d={d}/></svg>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 gap-6">
          {visible.map((t, i) => (
            <div key={`${idx}-${i}`}
              className="bg-white rounded-[24px] border border-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              style={{ animation: 'screenIn 0.4s ease-out both', animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-0.5 text-amber mb-4">
                {Array.from({ length: t.rating }).map((_, j) => <span key={j} className="text-[16px]">★</span>)}
              </div>
              <p className="text-[16px] text-text-1 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-[24px]">{t.avatar}</div>
                <div>
                  <div className="font-display font-bold text-[15px] text-text-1">{t.name}</div>
                  <div className="text-[13px] text-text-3">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-primary' : 'w-2 bg-surface-4'}`} />
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FAQ
════════════════════════════════════════════════════════════ */
const FAQS = [
  ['Is FestNest free to use?', 'Yes — 100% free for students, forever. You can discover, save, and register for unlimited events at no cost. Organizers can also list events for free.'],
  ['How do I post an event?', 'Click "Post an Event", fill in the details across a quick 5-step form, and submit. Our team reviews and publishes verified events within 24 hours.'],
  ['Can students register directly through FestNest?', 'You register on FestNest and we link you straight to the organizer\'s official registration page or form — no extra steps, no middleman.'],
  ['Are the events verified?', 'Every submitted event is reviewed by our team before going live. We check for legitimacy so you only see real, trustworthy opportunities.'],
  ['How do featured events work?', 'Featured events get premium placement on the home feed and landing page. Organizers can request featuring, and our team curates the weekly spotlight.'],
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 bg-surface-2/40">
      <div className="max-w-[760px] mx-auto px-8">
        <Reveal>
          <div className="text-center mb-12">
            <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">FAQ</div>
            <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">Questions? Answered.</h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.05}>
              <div className={`bg-white rounded-2xl border transition-all duration-300 ${open === i ? 'border-primary shadow-[0_8px_30px_rgba(79,70,229,0.08)]' : 'border-border'}`}>
                <button onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="font-display font-bold text-[16px] text-text-1">{q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open === i ? 'bg-primary text-white rotate-45' : 'bg-surface-3 text-text-2'}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </button>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15px] text-text-2 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   NEWSLETTER + FINAL CTA
════════════════════════════════════════════════════════════ */
function FinalCTA({ onEnter }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);

  return (
    <section className="py-24 max-w-[1240px] mx-auto px-8">
      <Reveal>
        <div className="relative rounded-[36px] overflow-hidden bg-gradient-to-br from-primary via-[#5B4FE5] to-[#7C3AED] px-12 py-16">
          {/* Decorative */}
          <div className="absolute top-[-60px] right-[-40px] w-72 h-72 bg-white/10 lp-blob blur-2xl" />
          <div className="absolute bottom-[-80px] left-[-60px] w-80 h-80 bg-white/10 lp-blob blur-2xl" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 lp-grid-bg opacity-30" />

          <div className="relative max-w-[640px] mx-auto text-center">
            <h2 className="font-display font-bold text-[44px] leading-[1.1] tracking-tight text-white mb-4">
              Ready to discover your<br />next big opportunity?
            </h2>
            <p className="text-[18px] text-white/75 mb-9">
              Join 48,000+ students who never miss an event. Free forever.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2 max-w-[440px] mx-auto mb-5">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/95 rounded-2xl px-5 py-4 text-[15px] text-text-1 placeholder:text-text-3 outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                onClick={() => { if (email.includes('@')) { setSubbed(true); setEmail(''); } }}
                className="bg-white text-primary text-[15px] font-bold px-6 py-4 rounded-2xl hover:bg-white/90 transition-all flex-shrink-0">
                {subbed ? '✓ Subscribed' : 'Notify me'}
              </button>
            </div>
            <p className="text-[13px] text-white/50 mb-9">Get a weekly digest of the best new events. No spam, ever.</p>

            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/explore')}
                className="bg-white text-primary text-[15px] font-bold px-8 py-4 rounded-2xl hover:-translate-y-0.5 hover:shadow-2xl transition-all">
                Explore Events
              </button>
              <button onClick={() => navigate('/host')}
                className="bg-white/15 backdrop-blur text-white text-[15px] font-bold px-8 py-4 rounded-2xl border border-white/25 hover:bg-white/25 transition-all">
                Post an Event
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════════════════ */
function Footer() {
  const navigate = useNavigate();
  const cols = [
    ['Platform', [['Explore Events', '/explore'], ['Post an Event', '/host'], ['Categories', '/explore'], ['Leaderboard', '/leaderboard']]],
    ['Company', [['About', '/about'], ['Blog', '#'], ['Careers', '#'], ['Press', '#']]],
    ['Support', [['Help Center', '/support'], ['Contact', '/support'], ['Privacy', '#'], ['Terms', '#']]],
  ];
  return (
    <footer className="border-t border-border bg-surface-2/30">
      <div className="max-w-[1240px] mx-auto px-8 py-16">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-12">
          <div>
            <Logo />
            <p className="text-[14px] text-text-3 leading-relaxed mt-4 max-w-[260px]">
              India's home for college events. Discover, register, and never miss an opportunity again.
            </p>
            <div className="flex gap-2 mt-5">
              {['𝕏', 'in', 'ig', 'yt'].map(s => (
                <button key={s} className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-[13px] font-bold text-text-3 hover:border-primary hover:text-primary transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <div className="font-display font-bold text-[14px] text-text-1 mb-4">{title}</div>
              <div className="space-y-2.5">
                {links.map(([label, href]) => (
                  <button key={label} onClick={() => href !== '#' && navigate(href)}
                    className="block text-[14px] text-text-3 hover:text-primary transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <p className="text-[13px] text-text-3">© 2025 FestNest · Made with 🪺 in India</p>
          <p className="text-[13px] text-text-3">Built for students, by students</p>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();

  // SEO: set document title + meta
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'FestNest — Discover Every College Event in India';
    const setMeta = (name, content) => {
      let m = document.querySelector(`meta[name="${name}"]`);
      if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
      m.content = content;
    };
    setMeta('description', 'FestNest is India\'s #1 platform to discover college events — hackathons, fests, workshops, and competitions from 850+ colleges. Free for students. Post events for free.');
    setMeta('keywords', 'college events india, hackathons, college fest, workshops, competitions, student events, festnest');
    return () => { document.title = prevTitle; };
  }, []);

  const enter = () => navigate('/explore');

  return (
    <div className="bg-white text-text-1 antialiased">
      <Nav onEnter={enter} />
      <main>
        <Hero onEnter={enter} />
        <LogoWall />
        <Stats />
        <Featured />
        <Categories />
        <Showcase />
        <Features />
        <HowItWorks />
        <Organizers />
        <Comparison />
        <Testimonials />
        <FAQ />
        <FinalCTA onEnter={enter} />
      </main>
      <Footer />
    </div>
  );
}
