import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin, GraduationCap, ArrowRight } from 'lucide-react';
import Seo from '../../components/Seo';

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

const STATS = [
  { value: '850+',  label: 'Colleges Covered' },
  { value: '7',     label: 'Event Categories' },
  { value: '4.3Cr', label: 'College Students in India' },
];

export default function AboutFounder() {
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
        <div className="px-4 pt-5 pb-10 md:px-12 md:pt-10 md:max-w-[780px] md:mx-auto">

          {/* ── Hero ─────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center py-8 md:py-10">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4
                         font-display font-bold text-[28px] text-white select-none flex-shrink-0"
              style={{ background: '#4F46E5' }}
            >
              KK
            </div>

            <h1 className="font-display font-bold text-[26px] md:text-[34px] text-text-1 tracking-tight mb-1">
              Kailash Kumar B
            </h1>
            <p className="text-[15px] text-primary font-semibold mb-2">Founder &amp; CEO · FestNest</p>

            <div className="flex items-center gap-1.5 text-[13px] text-text-3 mb-3">
              <MapPin size={13} strokeWidth={1.8} />
              Bengaluru, Karnataka, India
            </div>

            <div className="inline-flex items-center gap-1.5 bg-primary-light text-primary
                            border border-[#C7D2FE] rounded-full text-[12px] font-semibold
                            px-3.5 py-1 mb-6">
              <GraduationCap size={13} strokeWidth={1.8} />
              Alliance University, Bengaluru — BCA
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/kailash-kumar-5209b02a8/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white
                           text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
                <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/Kailash246"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#24292e] text-white
                           text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* ── Bio ──────────────────────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-5 mb-4">
            <h2 className="font-display font-bold text-[15px] text-text-1 mb-3">About</h2>
            <p className="text-[14px] text-text-2 leading-relaxed">
              Kailash Kumar B is a BCA student at Alliance University, Bengaluru, and the founder and CEO
              of FestNest. Based in Bengaluru, Karnataka, Kailash started FestNest to solve a problem he
              experienced firsthand — college students across India were missing incredible events simply
              because there was no single, reliable place to discover them. With India's 4.3 crore college
              students scattered across thousands of institutions, hackathons, cultural fests, workshops,
              and competitions were buried in WhatsApp forwards and Instagram stories. FestNest is his
              answer: one clean platform where every college event in India lives, so no student misses an
              opportunity because of poor information access.
            </p>
          </div>

          {/* ── The Problem FestNest Solves ──────────────────────────── */}
          <div className="mb-5">
            <h2 className="font-display font-bold text-[18px] text-text-1 mb-3">
              The Problem FestNest Solves
            </h2>
            <div className="space-y-3 text-[14px] text-text-2 leading-relaxed">
              <p>
                India has over 4.3 crore college students spread across more than 42,000 institutions. Every
                semester, hundreds of hackathons, cultural fests, technical workshops, and competitions are
                organised across every major city. Yet most students discover these events by accident — a
                friend's forward, an Instagram reel, or a poster spotted on someone else's campus.
              </p>
              <p>
                Event organisers face the mirror problem: they invest significant effort promoting their
                events on disconnected channels, but reach stays limited to their own network. A hackathon
                in Bengaluru rarely finds talented participants from Chennai or Hyderabad who would love to
                compete — not because the event isn't good enough, but because the information never
                reached them.
              </p>
              <p>
                Kailash built FestNest to close this gap. Organisers list events once; students everywhere
                find them instantly, register directly without middlemen, and get reminded before deadlines
                close. The mission is simple: make sure no Indian college student misses an opportunity
                because of broken information access.
              </p>
            </div>
          </div>

          {/* ── FestNest by the Numbers ──────────────────────────────── */}
          <div className="mb-6">
            <h2 className="font-display font-bold text-[18px] text-text-1 mb-3">
              FestNest by the Numbers
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(({ value, label }) => (
                <div key={label}
                  className="bg-surface border border-border rounded-lg p-4 text-center
                             hover:border-primary hover:-translate-y-[1px] transition-all">
                  <div className="font-display font-bold text-[22px] text-primary mb-1">{value}</div>
                  <div className="text-[11px] text-text-3 font-medium leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <div className="bg-primary-light border border-[#C7D2FE] rounded-xl p-5 text-center">
            <p className="font-display font-bold text-[16px] text-primary mb-1">
              Discover Events on FestNest
            </p>
            <p className="text-[13px] text-text-2 mb-4">
              Browse hackathons, cultural fests, workshops, and competitions at colleges across India.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold
                         text-[13px] px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Explore Events <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </motion.div>
    </>
  );
}
