import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, ClipboardList, Bell, Trophy,
  Globe, MessageCircle, ExternalLink,
  BadgeCheck, MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';

/* ── Person JSON-LD (kept for founder SEO) ───────────────────────── */
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

/* ── Data ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: '850+',   label: 'Colleges',    sub: 'Listed'      },
  { value: '7',      label: 'Event',       sub: 'Categories'  },
  { value: '4.3 Cr', label: 'Students',   sub: 'in India'    },
];

const WHY = [
  { Icon: BadgeCheck,   title: 'Always Free',         desc: 'FestNest is free for every student — no sign-up fees, no hidden charges, ever.' },
  { Icon: ExternalLink, title: 'Direct Registration', desc: 'We link straight to the official form. No middlemen, no re-registration, no friction.' },
  { Icon: MapPin,       title: 'Discover by City',    desc: 'Find events in your city or across India. Filter by category, date, or prize pool.' },
  { Icon: Trophy,       title: 'Points & Rankings',   desc: 'Earn FestNest points for every event you attend. See how you rank in your college.' },
];

const HOW = [
  { num: '01', Icon: Search,        title: 'Discover events near you',   desc: 'Search by college, city, category, or date. Filter by entry type or prize pool.' },
  { num: '02', Icon: ClipboardList, title: 'Register in one tap',        desc: 'Every event links directly to the official registration form. No middlemen.' },
  { num: '03', Icon: Bell,          title: 'Never miss a deadline',      desc: 'Get smart reminders before registration closes. Track all your events in one place.' },
  { num: '04', Icon: Trophy,        title: 'Earn points, climb rankings', desc: 'Every event you attend earns FestNest points. See how you rank nationally and within your college.' },
];

/* ── Chevron ─────────────────────────────────────────────────────── */
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 flex-shrink-0">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
        className="bg-white min-h-screen w-full overflow-x-hidden"
      >

        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#4F46E5] to-indigo-700 px-6 py-16 md:py-24 text-center">
          <span className="inline-block bg-white/20 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            v1.0 Beta
          </span>
          <h1 className="font-display font-bold text-[26px] sm:text-[34px] md:text-[44px] text-white leading-tight tracking-tight mb-4 max-w-3xl mx-auto">
            Discover Every College Event<br className="hidden sm:block" /> Across India
          </h1>
          <p className="text-indigo-200 text-[15px] md:text-[17px] max-w-xl mx-auto leading-relaxed">
            One platform. Every hackathon, fest, workshop and competition.
          </p>
        </section>

        {/* ── 2. STATS BAR ────────────────────────────────────────── */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {STATS.map(({ value, label, sub }) => (
                <div key={label} className="text-center px-2 sm:px-6">
                  <div className="font-display font-bold text-[24px] sm:text-[32px] md:text-[38px] text-[#4F46E5] leading-none mb-1">
                    {value}
                  </div>
                  <div className="text-[11px] sm:text-[13px] text-gray-500 leading-snug">
                    {label}<br />{sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. OUR MISSION ──────────────────────────────────────── */}
        <section className="bg-white py-14 px-6">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#4F46E5] border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-full mb-6">
              Our Mission
            </span>
            <blockquote className="border-l-4 border-[#4F46E5] pl-6">
              <p className="text-[16px] md:text-[18px] text-gray-700 leading-relaxed italic">
                "Students across India miss incredible events — hackathons, cultural fests, workshops, and competitions — because information is scattered across WhatsApp forwards, Instagram stories, and random posters. FestNest fixes that."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ── 4. WHY FESTNEST ─────────────────────────────────────── */}
        <section className="bg-gray-50 py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-[20px] md:text-[24px] text-gray-900 mb-8 text-center">
              Why FestNest?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WHY.map(({ Icon: WhyIcon, title, desc }) => (
                <div key={title}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm
                             hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <WhyIcon size={18} strokeWidth={1.8} className="text-indigo-600" />
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900 mb-1.5">{title}</div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. HOW FESTNEST WORKS ───────────────────────────────── */}
        <section className="bg-white py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-[20px] md:text-[24px] text-gray-900 mb-8 text-center">
              How FestNest Works
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {HOW.map(({ num, title, desc }) => (
                <div key={num}
                  className="flex gap-4 p-5 rounded-xl border border-gray-100
                             hover:border-indigo-200 hover:shadow-sm transition-all duration-150">
                  <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-bold text-white font-display">{num}</span>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-gray-900 mb-1">{title}</div>
                    <div className="text-[13px] text-gray-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. TEAM / FOUNDER ───────────────────────────────────── */}
        <section className="bg-gray-50 py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-[20px] md:text-[24px] text-gray-900 mb-8 text-center">
              The People Building FestNest
            </h2>
            <div className="grid md:grid-cols-3 gap-4">

              {/* Founder — prominent, spans 2 cols */}
              <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex">
                <div className="w-1.5 bg-gradient-to-b from-[#4F46E5] to-indigo-700 flex-shrink-0" />
                <div className="p-6 flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-[72px] h-[72px] rounded-full bg-indigo-600 flex items-center justify-center
                                    font-display font-bold text-[22px] text-white flex-shrink-0">
                      KK
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[18px] text-gray-900 mb-0.5">
                        Kailash Kumar B
                      </div>
                      <div className="text-[13px] font-semibold text-indigo-600 mb-2">Founder &amp; CEO</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                          Bengaluru, Karnataka
                        </span>
                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                          Alliance University (BCA)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                    BCA student at Alliance University, Bengaluru. Kailash built FestNest to solve a problem he experienced firsthand — the near-impossible task of discovering inter-college events across India. His mission: connect India's 4.3 crore college students with the hackathons, fests, and competitions that shape careers.
                  </p>
                  <div className="flex gap-2">
                    <a href="https://www.linkedin.com/in/kailash-kumar-5209b02a8/"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200
                                 text-indigo-600 text-[12px] font-semibold rounded-md
                                 hover:bg-indigo-50 transition-colors">
                      LinkedIn <ExternalLink size={11} />
                    </a>
                    <a href="https://github.com/Kailash246"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200
                                 text-gray-700 text-[12px] font-semibold rounded-md
                                 hover:bg-gray-50 transition-colors">
                      GitHub <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Co-founder */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6
                              flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center
                                font-display font-bold text-[18px] text-white mb-3">
                  AK
                </div>
                <div className="font-display font-bold text-[16px] text-gray-900 mb-0.5">Adarsh Kumar</div>
                <div className="text-[12px] font-semibold text-teal-600 mb-2">Co-Founder</div>
                <div className="text-[11px] text-gray-400">Building FestNest</div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. CONNECT / SOCIAL ─────────────────────────────────── */}
        <section className="bg-white py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-[20px] md:text-[24px] text-gray-900 mb-8 text-center">
              Connect With FestNest
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  Icon: Globe,
                  label: 'Website',
                  sub: 'festnest.in',
                  action: () => window.open('https://festnest.in', '_blank'),
                },
                {
                  Icon: ExternalLink,
                  label: 'Instagram',
                  sub: '@festnest_india',
                  action: () => window.open('https://instagram.com/festnest_india', '_blank'),
                },
                {
                  Icon: MessageCircle,
                  label: 'Help & Support',
                  sub: 'Report bugs, get help',
                  action: () => navigate('/support'),
                },
              ].map(({ Icon: LIcon, label, sub, action }) => (
                <button key={label} onClick={action}
                  className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100
                             shadow-sm hover:border-indigo-200 hover:shadow-md text-left
                             transition-all duration-150 w-full">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <LIcon size={18} strokeWidth={1.8} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900">{label}</div>
                    <div className="text-[11px] text-gray-500 truncate">{sub}</div>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. FOOTER NOTE ──────────────────────────────────────── */}
        <div className="bg-white border-t border-gray-100 py-8 px-6 text-center">
          <div className="text-[12px] text-gray-400 mb-3">
            FestNest v1.0 Beta · Built with ❤️ in India
          </div>
          <div className="flex justify-center gap-5">
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Use',   to: '/terms'   },
              { label: 'Careers',        to: null        },
            ].map(({ label, to }) => (
              <button key={label}
                onClick={() => to ? navigate(to) : showToast(`Opening ${label}…`, 'info')}
                className="text-[12px] text-gray-400 hover:text-[#4F46E5] transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>

      </motion.div>
    </>
  );
}
