// src/pages/landing/Landing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal, useMouseParallax, Reveal } from './_hooks';
import BrandMark from '../../components/BrandMark';
import { events as eventsApi } from '../../services/api';
import {
  Flame, CheckCircle2,
  // Star, UserCircle, Brain — kept for legacy sections below
  PartyPopper, Landmark, Users, Trophy,
  Code2, Music, Wrench, Mic2, Volleyball, Palette, Rocket, BriefcaseBusiness,
  BarChart3, Calendar, Eye, Search,
  Sparkles, Bookmark, Bell, Briefcase, Smartphone,
  TrendingUp, Target,
  Bot, ClipboardList, Clock,
} from 'lucide-react';

const IconX         = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconLinkedin  = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const IconInstagram = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
const IconYoutube   = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;

/* ════════════════════════════════════════════════════════════
   BRAND MARK
════════════════════════════════════════════════════════════ */
const Logo = ({ light }) => (
  <div className="flex items-center gap-2.5">
    <BrandMark className="w-9 h-9" />
    <span className={`font-display font-bold text-[21px] tracking-tight ${light ? 'text-white' : 'text-text-1'}`}>
      FestNest
    </span>
  </div>
);

/* ════════════════════════════════════════════════════════════
   STICKY NAV
════════════════════════════════════════════════════════════ */
function Nav({ onEnter }) {
  const navigate = useNavigate();
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
              className="px-4 py-2 text-[14px] font-medium text-text-2 hover:text-text-1 rounded-md hover:bg-surface-2 transition-all">
              {label}
            </button>
          ))}
          <button onClick={() => navigate('/blog')}
            className="px-4 py-2 text-[14px] font-medium text-text-2 hover:text-text-1 rounded-md hover:bg-surface-2 transition-all">
            Blog
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onEnter}
            className="px-4 py-2 text-[14px] font-semibold text-text-2 hover:text-primary transition-colors">
            Log in
          </button>
          <button onClick={onEnter}
            className="px-5 py-2.5 bg-primary text-white text-[14px] font-bold rounded-md
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
const MiniCard = ({ icon: Icon, bg, title, sub, badge, badgeColor, style, cls }) => (
  <div style={style}
    className={`absolute bg-white rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-border p-3 w-[200px] ${cls}`}>
    <div className={`w-full h-[88px] rounded-md ${bg} flex items-center justify-center mb-2.5 relative overflow-hidden lp-shine-wrap`}>
      <Icon className="w-10 h-10 text-white/80" />
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
              <span className="text-[13px] font-semibold text-primary">Live events across India</span>
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
              from colleges across India, all in your pocket.
              Never miss a deadline again.
            </p>
          </Reveal>

          {/* Search */}
          <Reveal delay={0.18}>
            <div className="flex items-center gap-2 bg-white border-[1.5px] border-border-strong rounded-lg pl-4 pr-2 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.06)] max-w-[480px] mb-6 focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(79,70,229,0.10)] transition-all">
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
                className="bg-primary text-white text-[14px] font-bold px-5 py-2.5 rounded-md hover:bg-primary-dark transition-all flex-shrink-0">
                Search
              </button>
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.24}>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/explore')}
                className="group bg-primary text-white text-[15px] font-bold px-7 py-3.5 rounded-lg hover:bg-primary-dark hover:shadow-indigo transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
                Explore Events
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
              <button onClick={() => navigate('/host')}
                className="bg-white text-text-1 text-[15px] font-bold px-7 py-3.5 rounded-lg border-[1.5px] border-border-strong hover:border-primary hover:text-primary transition-all duration-200 hover:-translate-y-0.5">
                Post an Event
              </button>
            </div>
          </Reveal>

        </div>

        {/* ── Right: Floating mockup ── */}
        <div className="relative h-[520px] hidden lg:block"
          style={{ transform: `translate(${px}px, ${py}px)`, transition: 'transform 0.2s ease-out' }}>

          {/* Main dashboard card */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-lg shadow-[0_30px_80px_rgba(0,0,0,0.18)] border border-border overflow-hidden lp-float-slow">
            <div className="bg-gradient-to-br from-primary to-[#7C3AED] px-5 pt-5 pb-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/80 text-[12px] font-semibold">Good afternoon 👋</span>
                <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"/>)}</div>
              </div>
              <div className="text-white font-display font-bold text-[22px] leading-tight">Find your next<br/>big moment</div>
              <div className="mt-4 bg-white/95 rounded-md px-3 py-2.5 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8A8A85" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span className="text-[12px] text-text-3">Search events…</span>
              </div>
            </div>
            <div className="px-4 py-4 space-y-2.5">
              {[
                { E: Code2, bg: 'bg1', t: 'HackBits 2025', s: 'IIT Bombay · ₹2L prize', showFlame: true },
                { E: Music, bg: 'bg5', t: "Kaleidoscope '25", s: 'NIT Trichy · 3 days', showFlame: false },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md border border-border hover:border-primary-mid transition-colors">
                  <div className={`w-11 h-11 rounded-md ${c.bg} flex items-center justify-center`}>
                    <c.E className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-bold text-text-1">{c.t}</div>
                    <div className="text-[10px] text-text-3">{c.s}</div>
                  </div>
                  {c.showFlame && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Floating mini cards */}
          <MiniCard icon={Trophy} bg="bg7" title="AI Challenge '25" sub="IISc · ₹5L prize"
            badge="₹5L" badgeColor="bg-amber-bg text-amber"
            cls="lp-float" style={{ top: 0, right: -10, '--r': '4deg', animationDelay: '0.5s' }} />

          <MiniCard icon={Bot} bg="bg4" title="RoboWar Arena" sub="VIT · 2 days left"
            badge="LIVE" badgeColor="bg-red-bg text-red"
            cls="lp-float-slow" style={{ bottom: 30, left: -20, '--r': '-5deg', animationDelay: '1.2s' }} />

          {/* Notification pop */}
          <div className="absolute bottom-0 right-4 bg-white rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-border p-3 w-[210px] lp-float" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-md bg-green-bg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
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
   LOGO MARQUEE — hidden until real partner data available
   To restore: uncomment below, remove <CategoryStrip /> in render,
   add <LogoWall /> instead.
════════════════════════════════════════════════════════════
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
            <div key={i} className="flex items-center gap-2.5 bg-white border border-border rounded-md px-5 py-3 whitespace-nowrap grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-primary-mid transition-all duration-300">
              <span className="font-display font-bold text-[15px] text-text-2">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
END LEGACY LOGO WALL */

/* ════════════════════════════════════════════════════════════
   CATEGORY STRIP (replaces fake college logo marquee)
════════════════════════════════════════════════════════════ */
function CategoryStrip() {
  const navigate = useNavigate();
  return (
    <section className="py-12 border-y border-border bg-surface-2/50">
      <Reveal>
        <p className="text-center text-[13px] font-bold tracking-wider uppercase text-text-3 mb-6">
          Browse by Category
        </p>
      </Reveal>
      <div className="flex flex-wrap justify-center gap-3 px-8 max-w-[1100px] mx-auto">
        {CATS.map(c => {
          const CatIcon = c.icon;
          return (
            <button key={c.cat} onClick={() => navigate(`/explore?cat=${encodeURIComponent(c.cat)}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-full
                         text-[14px] font-semibold text-text-2 hover:border-primary hover:text-primary
                         transition-all duration-200 hover:-translate-y-0.5">
              <CatIcon className={`w-4 h-4 ${c.iconColor}`} />
              {c.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   LEGACY STATS — fake placeholder numbers, kept for reference.
   To restore: uncomment below, remove <StatsRow .../> in render,
   add <Stats /> instead. Also re-add useCountUp to _hooks import.
════════════════════════════════════════════════════════════
function StatItem({ target, suffix, prefix, label, icon: Icon }) {
  // const [ref, val] = useCountUp(target);
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2"><Icon className="w-8 h-8 text-text-2" /></div>
      <div className="font-display font-bold text-[40px] text-text-1 leading-none tracking-tight">
        {prefix}{target.toLocaleString('en-IN')}{suffix}
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
          <StatItem icon={PartyPopper} target={2400}  suffix="+" label="Events Listed" />
          <StatItem icon={Landmark}   target={850}   suffix="+" label="Colleges" />
          <StatItem icon={Users}      target={48000} suffix="+" label="Active Students" />
          <StatItem icon={Trophy}     target={2}     suffix="Cr+" prefix="₹" label="Prize Pool" />
        </div>
      </Reveal>
    </section>
  );
}
END LEGACY STATS */

/* ════════════════════════════════════════════════════════════
   STATS (real API data — hidden on failure)
════════════════════════════════════════════════════════════ */
function StatsRow({ loading, stats }) {
  if (!loading && !stats) return null;

  if (loading) {
    return (
      <section className="py-20 max-w-[1100px] mx-auto px-8">
        <div className="grid grid-cols-3 gap-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="text-center">
              <div className="skeleton h-8 w-8 rounded-md mx-auto mb-3" />
              <div className="skeleton h-10 w-28 rounded mx-auto mb-2" />
              <div className="skeleton h-4 w-20 rounded mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const items = [
    { icon: PartyPopper, value: stats.totalEvents.toLocaleString('en-IN') + '+', label: 'Events Listed' },
    { icon: Landmark,    value: stats.totalColleges.toLocaleString('en-IN') + '+', label: 'Colleges Represented' },
    { icon: Sparkles,    value: String(stats.totalCategories), label: 'Event Categories' },
  ];

  return (
    <section className="py-20 max-w-[1100px] mx-auto px-8">
      <Reveal>
        <div className="grid grid-cols-3 gap-8">
          {items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-8 h-8 text-text-2" />
              </div>
              <div className="font-display font-bold text-[40px] text-text-1 leading-none tracking-tight">
                {value}
              </div>
              <div className="text-[14px] text-text-3 font-medium mt-2">{label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}


/* ════════════════════════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════
   LEGACY FEATURED EVENTS — fake placeholder cards, kept for reference.
   To restore: uncomment below, add <Featured /> back in render
   (between <StatsRow /> and <Categories />).
   Also re-add: Brain, Star imports from lucide-react.
════════════════════════════════════════════════════════════
const FEATURED = [
  { icon: Code2,  iconCls: 'text-indigo-200',  bg: 'bg1', cat: 'Hackathon',    name: 'HackBits 2025',    college: 'IIT Bombay',    prize: '₹2,00,000', deadline: '4 days left', deadlineColor: 'text-amber', accent: 'from-indigo-500/10' },
  { icon: Brain,  iconCls: 'text-blue-200',    bg: 'bg8', cat: 'Competition',  name: "AI Challenge '25", college: 'IISc Bangalore', prize: '₹5,00,000', deadline: '2 days left', deadlineColor: 'text-red',   accent: 'from-blue-500/10'   },
  { icon: Music,  iconCls: 'text-fuchsia-200', bg: 'bg5', cat: 'Cultural Fest',name: "Kaleidoscope '25", college: 'NIT Trichy',     prize: '₹50,000',   deadline: '8 days left', deadlineColor: 'text-green', accent: 'from-fuchsia-500/10' },
];
function Featured() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-surface-2/40">
      <div className="max-w-[1240px] mx-auto px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Featured
              </div>
              <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">This week's spotlight</h2>
            </div>
            <button onClick={() => navigate('/explore')} className="text-[14px] font-semibold text-primary flex items-center gap-1">
              View all events
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </Reveal>
        <div className="grid grid-cols-3 gap-6">
          {FEATURED.map((ev, i) => {
            const EvIcon = ev.icon;
            return (
              <Reveal key={ev.name} delay={i * 0.1}>
                <div onClick={() => navigate('/explore')} className="group bg-white rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300">
                  <div className={`relative h-[200px] ${ev.bg} flex items-center justify-center overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-t ${ev.accent} to-transparent`} />
                    <EvIcon className={`relative w-20 h-20 ${ev.iconCls} group-hover:scale-110 transition-transform duration-500`} />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[11px] font-bold text-text-1 px-3 py-1 rounded-full">{ev.cat}</span>
                    <span className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {ev.prize}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-[20px] text-text-1 mb-1 group-hover:text-primary transition-colors">{ev.name}</h3>
                    <div className="flex items-center gap-1.5 text-[13px] text-text-3 mb-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      {ev.college}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className={`text-[12px] font-bold ${ev.deadlineColor} flex items-center gap-1`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot"/>{ev.deadline}
                      </span>
                      <span className="text-[13px] font-bold text-primary flex items-center gap-1">
                        View Details <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m9 18 6-6-6-6"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
END LEGACY FEATURED */

// Priority categories lead the showcase, then the remaining categories.
const CATS = [
  { icon: PartyPopper,       iconColor: 'text-amber-600',   name: 'Mega Fests',     g: 'from-amber-50 to-orange-50',   cat: 'Mega Fest' },
  { icon: Code2,             iconColor: 'text-indigo-600',  name: 'Hackathons',     g: 'from-indigo-50 to-blue-50',    cat: 'Hackathon' },
  { icon: BriefcaseBusiness, iconColor: 'text-blue-600',    name: 'Management',     g: 'from-blue-50 to-sky-50',       cat: 'Management' },
  { icon: Rocket,            iconColor: 'text-violet-600',  name: 'Startups',       g: 'from-violet-50 to-purple-50',  cat: 'Startup' },
  { icon: Music,             iconColor: 'text-fuchsia-600', name: 'Cultural Fests', g: 'from-fuchsia-50 to-pink-50',   cat: 'Cultural Fest' },
  { icon: Volleyball,        iconColor: 'text-green-600',   name: 'Sports Meets',   g: 'from-green-50 to-lime-50',     cat: 'Sports' },
  { icon: Wrench,            iconColor: 'text-teal-600',    name: 'Workshops',      g: 'from-teal-50 to-emerald-50',   cat: 'Workshop' },
  { icon: Trophy,            iconColor: 'text-amber-600',   name: 'Competitions',   g: 'from-amber-50 to-orange-50',   cat: 'Competition' },
  { icon: Mic2,              iconColor: 'text-blue-600',    name: 'Tech Talks',     g: 'from-blue-50 to-sky-50',       cat: 'Tech Talk' },
  { icon: Palette,           iconColor: 'text-rose-600',    name: 'Design Jams',    g: 'from-rose-50 to-red-50',       cat: 'Workshop' },
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
        {CATS.map((c, i) => {
          const CatIcon = c.icon;
          return (
            <Reveal key={c.name} delay={(i % 4) * 0.06}>
              <button onClick={() => navigate(`/explore?cat=${encodeURIComponent(c.cat)}`)}
                className={`group relative w-full text-left bg-gradient-to-br ${c.g} rounded-md p-6 border border-border
                           hover:border-primary hover:shadow-[0_16px_40px_rgba(79,70,229,0.14)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}>
                <div className={`absolute -right-6 -bottom-6 opacity-[0.07] group-hover:scale-125 group-hover:opacity-[0.12] transition-all duration-500 ${c.iconColor}`}>
                  <CatIcon className="w-24 h-24" />
                </div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${c.iconColor}`}>
                    <CatIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-text-1 mb-1">{c.name}</h3>
                </div>
              </button>
            </Reveal>
          );
        })}
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

const FEED_PILL_ICONS = [null, Code2, Music, Wrench];
const FEED_CARD_ICONS = [Code2, Music, Trophy, Bot];

function Showcase() {
  const [active, setActive] = useState('feed');

  const mockups = {
    feed: (
      <div className="space-y-3">
        <div className="h-10 bg-gradient-to-r from-primary to-[#7C3AED] rounded-md" />
        <div className="flex gap-2">
          {FEED_PILL_ICONS.map((C, i) => (
            <div key={i} className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${i === 0 ? 'bg-primary text-white' : 'bg-surface-3 text-text-3'}`}>
              {C ? <C className="w-3 h-3" /> : 'All'}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['bg1','bg5','bg7','bg4'].map((b, i) => {
            const FeedIcon = FEED_CARD_ICONS[i];
            return (
              <div key={i} className="bg-white border border-border rounded-md overflow-hidden">
                <div className={`h-16 ${b} flex items-center justify-center`}>
                  <FeedIcon className="w-7 h-7 text-white/80" />
                </div>
                <div className="p-2"><div className="h-2 bg-surface-3 rounded w-3/4 mb-1.5"/><div className="h-1.5 bg-surface-3 rounded w-1/2"/></div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    detail: (
      <div className="space-y-3">
        <div className="h-28 bg-gradient-to-br from-indigo-100 to-violet-50 rounded-md flex items-center justify-center">
          <Code2 className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="h-3 bg-surface-3 rounded w-2/3" />
        <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="h-12 flex-1 bg-surface-2 rounded-md"/>)}</div>
        <div className="h-2 bg-surface-3 rounded w-full" /><div className="h-2 bg-surface-3 rounded w-5/6" />
        <div className="h-10 bg-primary rounded-md" />
      </div>
    ),
    organizer: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[['12','Submitted'],['8','Live'],['3','Pending'],['1.2k','Registered']].map(([n,l],i)=>(
            <div key={i} className="bg-white border border-border rounded-md p-2.5">
              <div className="text-[16px] font-bold text-text-1">{n}</div>
              <div className="text-[9px] text-text-3">{l}</div>
            </div>
          ))}
        </div>
        {[1,2].map(i=><div key={i} className="flex items-center gap-2 bg-white border border-border rounded-md p-2"><div className="w-8 h-8 bg-primary-light rounded-md"/><div className="flex-1"><div className="h-2 bg-surface-3 rounded w-2/3 mb-1"/><div className="h-1.5 bg-surface-3 rounded w-1/3"/></div><div className="px-2 py-0.5 bg-green-bg rounded-full text-[8px] text-green font-bold">Live</div></div>)}
      </div>
    ),
    admin: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[Users, Calendar, Clock].map((E, i) => (
            <div key={i} className="bg-white border border-border rounded-md p-2 text-center">
              <div className="flex justify-center"><E className="w-4 h-4 text-text-3" /></div>
              <div className="h-1.5 bg-surface-3 rounded mt-1"/>
            </div>
          ))}
        </div>
        {[1,2,3].map(i=>(
          <div key={i} className="flex items-center gap-2 bg-amber-bg border border-amber-border rounded-md p-2">
            <ClipboardList className="w-3.5 h-3.5 text-amber flex-shrink-0" />
            <div className="flex-1 h-2 bg-amber-border/50 rounded"/>
            <div className="px-2 py-0.5 bg-white rounded text-[8px] text-amber font-bold">Review</div>
          </div>
        ))}
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
                className={`px-5 py-2.5 rounded-md text-[14px] font-semibold transition-all
                  ${active === s.id ? 'bg-primary text-white shadow-indigo' : 'bg-white border border-border text-text-2 hover:border-primary-mid'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid grid-cols-[1fr_1.2fr] gap-10 items-center bg-white rounded-lg border border-border p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
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
              <div className="w-[300px] bg-surface-2 rounded-lg border-[6px] border-text-1 p-4 shadow-2xl">
                <div className="bg-white rounded-md p-4 min-h-[360px]">
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
  { icon: Search,    title: 'Smart Discovery',  desc: 'Personalised feed filtered by your college, city, and interests — no noise.' },
  { icon: Trophy,    title: 'Win Big',           desc: 'Find hackathons and competitions with prizes across India, all in one place.' },
  { icon: Bell,      title: 'Never Miss Out',    desc: 'Deadline reminders and live updates so you never miss a registration.' },
  { icon: Briefcase, title: 'Organizer Tools',   desc: 'Post, manage, and promote your events with a powerful dashboard.' },
  { icon: Bookmark,  title: 'Save & Track',      desc: "Bookmark events and track everything you've registered for in one place." },
  { icon: Smartphone,title: 'Built for Mobile',  desc: 'A blazing-fast, app-like experience designed for life on the go.' },
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
        {FEATURES.map((f, i) => {
          const FIcon = f.icon;
          return (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group bg-white rounded-md border border-border p-7 hover:border-primary-mid hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-lg bg-primary-light flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 text-primary">
                  <FIcon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-text-1 mb-2">{f.title}</h3>
                <p className="text-[14px] text-text-2 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════════════ */
const STEPS = [
  { n: '01', icon: Sparkles, title: 'Create your account', desc: 'Sign up free in 30 seconds with your email.' },
  { n: '02', icon: Search,   title: 'Discover events',     desc: 'Browse a feed tailored to your interests.' },
  { n: '03', icon: Bookmark, title: 'Register & save',     desc: 'One-tap register and bookmark your favourites.' },
  { n: '04', icon: Trophy,   title: 'Compete & win',       desc: 'Show up, participate, and climb the leaderboard.' },
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

          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <Reveal key={s.n} delay={i * 0.12}>
                <div className="relative text-center">
                  <div className="relative w-[84px] h-[84px] mx-auto mb-5">
                    <div className="absolute inset-0 bg-primary-light rounded-lg rotate-3" />
                    <div className="relative w-full h-full bg-white rounded-lg border-2 border-primary flex items-center justify-center shadow-[0_8px_24px_rgba(79,70,229,0.15)] text-primary">
                      <StepIcon className="w-9 h-9" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-[11px] font-bold">
                      {s.n}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-text-1 mb-2">{s.title}</h3>
                  <p className="text-[14px] text-text-2 leading-relaxed px-2">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   ORGANIZER SECTION
════════════════════════════════════════════════════════════ */
const ORG_STATS = [[Calendar, '12', 'Events'], [Users, '3.4k', 'Signups'], [Eye, '18k', 'Views']];
const ORG_FEATURES = [
  [TrendingUp, 'More registrations', 'Get in front of students actively looking for events'],
  [Target,    'Featured promotion',  'Boost visibility with featured event placement'],
  [BarChart3, 'Real-time analytics', 'Track views, signups, and engagement live'],
];

function Organizers() {
  const navigate = useNavigate();
  return (
    <section id="organizers" className="py-24 max-w-[1240px] mx-auto px-8">
      <div className="grid grid-cols-2 gap-16 items-center">
        {/* Left: mockup */}
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-[#7C3AED]/10 rounded-lg blur-2xl" />
            <div className="relative bg-white rounded-lg border border-border shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display font-bold text-[18px] text-text-1">Organizer Dashboard</div>
                <div className="px-3 py-1 bg-green-bg text-green text-[11px] font-bold rounded-full">● Live</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {ORG_STATS.map(([E, n, l]) => (
                  <div key={l} className="bg-surface-2 rounded-md p-3 text-center">
                    <div className="flex justify-center mb-1"><E className="w-5 h-5 text-text-2" /></div>
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
              List your hackathon, fest, or workshop and get discovered by students across India.
              Track registrations, manage submissions, and grow your reach — all for free.
            </p>
            <div className="space-y-3 mb-9">
              {ORG_FEATURES.map(([I, t, d]) => (
                <div key={t} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                    <I className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[15px] text-text-1">{t}</div>
                    <div className="text-[14px] text-text-3">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/host')}
              className="bg-primary text-white text-[15px] font-bold px-8 py-4 rounded-lg hover:bg-primary-dark hover:shadow-indigo hover:-translate-y-0.5 transition-all flex items-center gap-2">
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
          <div className="bg-white rounded-lg border border-border overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
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
   LEGACY TESTIMONIALS — fake placeholder quotes, kept for reference.
   To restore: uncomment below, remove <WhyStudentsLove /> in render,
   add <Testimonials /> instead. Also re-add Star, UserCircle imports.
════════════════════════════════════════════════════════════
const TESTIMONIALS = [
  { name: 'Ananya Sharma', role: 'CS, IIT Bombay',          avatarColor: 'text-indigo-500', text: 'Found and registered for 3 hackathons in one week. Won ₹50k at one of them. FestNest literally changed my semester.', rating: 5 },
  { name: 'Rohan Mehta',   role: 'Events Head, NIT Trichy', avatarColor: 'text-violet-500', text: 'As an organizer, listing our fest on FestNest got us 4x the registrations we got from Instagram. The dashboard is gold.', rating: 5 },
  { name: 'Priya Nair',    role: 'Design, BITS Pilani',     avatarColor: 'text-rose-500',   text: "I used to miss deadlines all the time. Now I get reminders and never miss a workshop. Wish I'd found this in my 1st year.", rating: 5 },
  { name: 'Karthik Reddy', role: 'ECE, IISc',               avatarColor: 'text-teal-500',   text: 'The search and filters are so good. I can find AI competitions in my city in seconds. Genuinely the cleanest app I use.', rating: 5 },
];
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t); }, []);
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
              <button key={k} onClick={fn} className="w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center text-text-2 hover:border-primary hover:text-primary transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d={d}/></svg>
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 gap-6">
          {visible.map((t, i) => (
            <div key={`${idx}-${i}`} className="bg-white rounded-lg border border-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]" style={{ animation: 'screenIn 0.4s ease-out both', animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[16px] text-text-1 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-primary-light flex items-center justify-center ${t.avatarColor}`}>
                  <UserCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-display font-bold text-[15px] text-text-1">{t.name}</div>
                  <div className="text-[13px] text-text-3">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-primary' : 'w-2 bg-surface-4'}`} />
        ))}
      </div>
    </section>
  );
}
END LEGACY TESTIMONIALS */

/* ════════════════════════════════════════════════════════════
   WHY STUDENTS LOVE FESTNEST (replaces fake testimonials)
════════════════════════════════════════════════════════════ */
const WHY_LOVE = [
  { icon: CheckCircle2, title: 'Zero middlemen',              desc: 'Every event links directly to the official registration page — no re-registration, no friction.' },
  { icon: Search,       title: 'All categories in one place', desc: 'Hackathons, fests, workshops, competitions, and more — search once, find everything.' },
  { icon: Sparkles,     title: 'Always free for students',    desc: 'No sign-up fees, no hidden costs, no premium tiers. FestNest is free forever.' },
];

function WhyStudentsLove() {
  return (
    <section className="py-24 max-w-[1100px] mx-auto px-8">
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-[13px] font-bold tracking-wider uppercase text-primary mb-2">Why FestNest</div>
          <h2 className="font-display font-bold text-[38px] tracking-tight text-text-1">Why students love FestNest</h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-3 gap-6">
          {WHY_LOVE.map(w => {
            const WIcon = w.icon;
            return (
              <div key={w.title} className="bg-white rounded-lg border border-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                <div className="w-14 h-14 rounded-lg bg-primary-light flex items-center justify-center mb-5 text-primary">
                  <WIcon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-[20px] text-text-1 mb-3">{w.title}</h3>
                <p className="text-[15px] text-text-2 leading-relaxed">{w.desc}</p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FAQ
════════════════════════════════════════════════════════════ */
const FAQS = [
  ['Is FestNest free to use?', 'Yes — 100% free for students, forever. You can discover, save, and register for unlimited events at no cost. Organizers can also list events for free.'],
  ['How do I post an event?', 'Click "Post an Event", fill in the details across a quick 5-step form, and submit. Our team reviews and publishes verified events within 24 hours.'],
  ['Can students register directly through FestNest?', "You register on FestNest and we link you straight to the organizer's official registration page or form — no extra steps, no middleman."],
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
              <div className={`bg-white rounded-lg border transition-all duration-300 ${open === i ? 'border-primary shadow-[0_8px_30px_rgba(79,70,229,0.08)]' : 'border-border'}`}>
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
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary via-[#5B4FE5] to-[#7C3AED] px-12 py-16">
          {/* Decorative */}
          <div className="absolute top-[-60px] right-[-40px] w-72 h-72 bg-white/10 lp-blob blur-2xl" />
          <div className="absolute bottom-[-80px] left-[-60px] w-80 h-80 bg-white/10 lp-blob blur-2xl" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 lp-grid-bg opacity-30" />

          <div className="relative max-w-[640px] mx-auto text-center">
            <h2 className="font-display font-bold text-[44px] leading-[1.1] tracking-tight text-white mb-4">
              Ready to discover your<br />next big opportunity?
            </h2>
            <p className="text-[18px] text-white/75 mb-9">
              Free forever. No sign-ups fees, no hidden costs — just events.
            </p>

            {/* Newsletter */}
            <div className="flex gap-2 max-w-[440px] mx-auto mb-5">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/95 rounded-lg px-5 py-4 text-[15px] text-text-1 placeholder:text-text-3 outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                onClick={() => { if (email.includes('@')) { setSubbed(true); setEmail(''); } }}
                className="bg-white text-primary text-[15px] font-bold px-6 py-4 rounded-lg hover:bg-white/90 transition-all flex-shrink-0">
                {subbed ? '✓ Subscribed' : 'Notify me'}
              </button>
            </div>
            <p className="text-[13px] text-white/50 mb-9">Get a weekly digest of the best new events. No spam, ever.</p>

            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/explore')}
                className="bg-white text-primary text-[15px] font-bold px-8 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-2xl transition-all">
                Explore Events
              </button>
              <button onClick={() => navigate('/host')}
                className="bg-white/15 backdrop-blur text-white text-[15px] font-bold px-8 py-4 rounded-lg border border-white/25 hover:bg-white/25 transition-all">
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
const SOCIAL_ICONS = [IconX, IconLinkedin, IconInstagram, IconYoutube];

function Footer() {
  const navigate = useNavigate();
  const cols = [
    ['Platform', [['Explore Events', '/explore'], ['Post an Event', '/host'], ['Categories', '/explore'], ['Leaderboard', '/leaderboard']]],
    ['Company', [['About', '/about'], ['Blog', '/blog'], ['Careers', '#'], ['Press', '#']]],
    ['Support', [['Help Center', '/support'], ['Contact', '/support'], ['Privacy', '/privacy'], ['Terms', '/terms']]],
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
              {SOCIAL_ICONS.map((S, i) => (
                <button key={i} className="w-9 h-9 rounded-md bg-white border border-border flex items-center justify-center text-text-3 hover:border-primary hover:text-primary transition-all">
                  <S className="w-4 h-4" />
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
  const [apiStats,    setApiStats]    = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    eventsApi.stats()
      .then(r => setApiStats(r.data))
      .catch(() => setApiStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // SEO: set document title + meta
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'FestNest — Discover Every College Event in India';
    const setMeta = (name, content) => {
      let m = document.querySelector(`meta[name="${name}"]`);
      if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
      m.content = content;
    };
    setMeta('description', "FestNest is India's platform to discover college events — hackathons, fests, workshops, and competitions from colleges across India. Free for students. Post events for free.");
    setMeta('keywords', 'college events india, hackathons, college fest, workshops, competitions, student events, festnest');
    return () => { document.title = prevTitle; };
  }, []);

  const enter = () => navigate('/explore');

  return (
    <div className="bg-white text-text-1 antialiased">
      <Nav onEnter={enter} />
      <main>
        <Hero onEnter={enter} />
        <CategoryStrip />
        <StatsRow loading={statsLoading} stats={apiStats} />
        <Categories />
        <Showcase />
        <Features />
        <HowItWorks />
        <Organizers />
        <Comparison />
        <WhyStudentsLove />
        <FAQ />
        <FinalCTA onEnter={enter} />
      </main>
      <Footer />
    </div>
  );
}
