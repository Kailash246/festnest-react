import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, ClipboardList, Bell, Trophy, Target,
  Globe, Camera, MessageCircle, ExternalLink,
  BadgeCheck, MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BrandMark from '../../components/BrandMark';
import Seo from '../../components/Seo';

/* ── Person JSON-LD (kept from founder SEO pass) ─────────────────── */
const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kailash Kumar B',
  jobTitle: 'Founder & CEO',
  worksFor: { '@type': 'Organization', name: 'FestNest', url: 'https://festnest.in' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Alliance University, Bengaluru' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  url: 'https://festnest.in/about',
  sameAs: [
    'https://www.linkedin.com/in/kailash-kumar-5209b02a8/',
    'https://github.com/Kailash246',
    'https://festnest.in',
  ],
};

/* ── Original About page data ─────────────────────────────────────── */
const HOW = [
  { Icon: Search,        title: 'Discover events near you',   desc: 'Search by college, city, category, or date. Filter by entry type or prize pool.' },
  { Icon: ClipboardList, title: 'Register in one tap',         desc: 'Every event links directly to the official registration form. No middlemen.' },
  { Icon: Bell,          title: 'Never miss a deadline',       desc: 'Get smart reminders before registration closes. Track all your events in one place.' },
  { Icon: Trophy,        title: 'Earn points, climb rankings', desc: 'Every event you attend earns FestNest points. See how you rank nationally and within your college.' },
];

const TEAM = [
  { av: 'KK', color: '#4F46E5', name: 'Kailash Kumar', role: 'Founder & CEO', college: 'Building FestNest' },
  { av: 'AK', color: '#34D399', name: 'Adarsh Kumar',  role: 'Co-founder',    college: 'Building FestNest' },
];

const LINKS = [
  { Icon: Globe,         label: 'Website',       sub: 'festnest.in',                          action: null },
  { Icon: Camera,        label: 'Instagram',     sub: '@festnest_india',                      action: null },
  { Icon: MessageCircle, label: 'Twitter / X',   sub: '@festnest',                            action: null },
  { Icon: MessageCircle, label: 'Help & Support', sub: 'Get help, report bugs, contact us',  action: 'support' },
];

const WHY = [
  { Icon: BadgeCheck,   title: 'Always Free',         desc: 'FestNest is free for every student — no sign-up fees, no hidden charges, ever.' },
  { Icon: ExternalLink, title: 'Direct Registration', desc: 'We link straight to the official form. No middlemen, no re-registration, no friction.' },
  { Icon: MapPin,       title: 'Discover by City',    desc: 'Find events in your city or across India. Filter by category, date, or prize pool.' },
  { Icon: Trophy,       title: 'Points & Rankings',   desc: 'Earn FestNest points for every event you attend. See how you rank in your college.' },
];

export default function AboutFounder() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        rawTitle="Kailash Kumar B — Founder & CEO of FestNest"
        description="Kailash Kumar B is a BCA student at Alliance University, Bengaluru and the founder and CEO of FestNest, India's college event discovery platform."
        canonical="https://festnest.in/about"
        jsonLd={PERSON_JSON_LD}
      />
      <motion.div
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
        className="bg-white min-h-screen w-full overflow-x-hidden"
      >
        <div className="px-4 pt-5 pb-8 md:px-12 md:pt-10 md:max-w-[1000px] md:mx-auto">

          {/* Hero */}
          <div className="text-center py-10 md:py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-[72px] h-[72px] flex items-center justify-center mx-auto mb-4"
            >
              <BrandMark className="w-[72px] h-[72px]" />
            </motion.div>
            <h1 className="font-display font-bold text-[28px] md:text-[40px] text-primary tracking-tight mb-2">
              FestNest
            </h1>
            <p className="text-[15px] text-text-3 leading-relaxed">
              Discover every college event across India — in one place.
            </p>
            <div className="inline-block mt-3 bg-green-bg text-[#16A34A] border border-green-border
                            rounded-full text-[12px] font-bold px-3.5 py-1 tracking-wide">
              v1.0 · Beta
            </div>
          </div>

          {/* Mission */}
          <div className="bg-primary-light border border-[#C7D2FE] rounded-xl p-5 mb-4">
            <div className="font-display font-bold text-[16px] text-primary mb-3 flex items-center gap-2">
              <Target size={16} strokeWidth={1.8} /> Our Mission
            </div>
            <p className="text-[14px] text-text-2 leading-relaxed">
              Students across India miss incredible events — hackathons, cultural fests, workshops, and competitions —
              because information is scattered across WhatsApp forwards, Instagram stories, and random posters.
              FestNest fixes that. We built one clean, beautiful platform where every college event lives.
            </p>
          </div>

          {/* Why FestNest */}
          <div className="mb-5">
            <div className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">
              Why FestNest?
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WHY.map(({ Icon: WhyIcon, title, desc }) => (
                <div key={title}
                  className="bg-surface border border-border rounded-lg p-4
                             hover:border-primary hover:-translate-y-[1px] transition-all">
                  <div className="w-9 h-9 bg-primary-light rounded-md flex items-center justify-center mb-3">
                    <WhyIcon size={18} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <div className="text-[13px] font-semibold text-text-1 mb-1">{title}</div>
                  <div className="text-[12px] text-text-3 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="mb-5">
            <div className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">
              How FestNest Works
            </div>
            <div className="grid md:grid-cols-2 gap-3 about-steps-grid">
              {HOW.map(({ Icon: HowIcon, title, desc }) => (
                <div key={title}
                  className="flex items-start gap-3 p-4 bg-surface border border-border rounded-lg
                             hover:border-primary-mid hover:-translate-y-[1px] transition-all">
                  <div className="w-9 h-9 bg-primary-light rounded-md flex items-center justify-center flex-shrink-0">
                    <HowIcon size={18} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-text-1 mb-1">{title}</div>
                    <div className="text-[13px] text-text-3 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-5">
            <div className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">
              The Team
            </div>
            <div className="grid grid-cols-2 gap-3 about-team-grid" style={{ maxWidth: 420 }}>
              {TEAM.map(({ av, color, name, role, college }) => (
                <div key={name}
                  className="bg-surface border border-border rounded-lg p-4 text-center
                             hover:border-primary-mid hover:-translate-y-[1px] transition-all">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
                                font-display font-bold text-[16px] text-white"
                    style={{ background: color }}
                  >
                    {av}
                  </div>
                  <div className="text-[14px] font-semibold text-text-1 mb-0.5">{name}</div>
                  <div className="text-[12px] text-text-3 mb-0.5">{role}</div>
                  <div className="text-[11px] text-text-4">{college}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4 shadow-1">
            {LINKS.map(({ Icon: LIcon, label, sub, action }) => (
              <div
                key={label}
                onClick={() => action === 'support' ? navigate('/support') : showToast(`Opening ${label}…`, 'info')}
                className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0
                           cursor-pointer hover:bg-primary-xlight transition-colors"
              >
                <div className="w-[34px] h-[34px] rounded-md bg-surface-3 flex items-center justify-center flex-shrink-0">
                  <LIcon size={16} strokeWidth={1.8} className="text-text-2" />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-text-1">{label}</div>
                  <div className="text-[12px] text-text-3 mt-0.5">{sub}</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-4">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>

          {/* ── Meet the Founder ──────────────────────────────────────── */}
          <div className="mb-5">
            <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 mb-4">
              Meet the Founder
            </h2>
            <div className="bg-surface border border-border rounded-lg p-5
                            hover:border-primary-mid transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center
                              font-display font-bold text-[22px] text-white flex-shrink-0 mx-auto sm:mx-0"
                  style={{ background: '#4F46E5' }}
                >
                  KK
                </div>
                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-[16px] font-bold text-text-1 mb-0.5">Kailash Kumar B</div>
                  <div className="text-[13px] text-primary font-semibold mb-1">Founder &amp; CEO</div>
                  <div className="text-[12px] text-text-3 mb-0.5">Bengaluru, Karnataka</div>
                  <div className="text-[12px] text-text-4 mb-3">Alliance University, Bengaluru (BCA)</div>
                  <p className="text-[13px] text-text-2 leading-relaxed mb-4">
                    BCA student at Alliance University, Bengaluru. Kailash built FestNest to solve a problem
                    he experienced firsthand — the near-impossible task of discovering inter-college events
                    across India. FestNest is his attempt to connect India's 4.3 crore college students
                    with the hackathons, fests, and competitions that can shape their careers.
                  </p>
                  {/* Social links */}
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <a
                      href="https://www.linkedin.com/in/kailash-kumar-5209b02a8/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white
                                 text-[12px] font-semibold rounded-md hover:opacity-90 transition-opacity"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[13px] h-[13px]">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                      LinkedIn
                      <ExternalLink size={11} />
                    </a>
                    <a
                      href="https://github.com/Kailash246"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#24292e] text-white
                                 text-[12px] font-semibold rounded-md hover:opacity-90 transition-opacity"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>
                      GitHub
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <div className="text-[13px] text-text-4 mb-2">FestNest v1.0 Beta · Built with ❤️ in India</div>
            <div className="flex justify-center gap-5">
              {[
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Use',   to: '/terms'   },
                { label: 'Careers',        to: null        },
              ].map(({ label, to }) => (
                <button
                  key={label}
                  onClick={() => to ? navigate(to) : showToast(`Opening ${label}…`, 'info')}
                  className="text-[12px] text-text-3 hover:text-primary transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
