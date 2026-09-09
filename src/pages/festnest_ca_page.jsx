import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Trophy, Rocket, Megaphone, GraduationCap, QrCode, IdCard,
  ChevronDown, CheckCircle2, MapPin, Star, Handshake, Sparkles,
  AlertCircle, Loader2, ArrowRight, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ca } from '../services/api';

const GlobalStyle = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');
    .fn-display { font-family: 'Clash Display', sans-serif; }
    .fn-body { font-family: 'Satoshi', sans-serif; }
    .fn-mono { font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace; }
    @keyframes fn-sheen {
      0% { transform: translateX(-160%) translateY(-160%) rotate(20deg); }
      100% { transform: translateX(160%) translateY(160%) rotate(20deg); }
    }
    .fn-sheen { animation: fn-sheen 4.5s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .fn-sheen { animation: none; } }
  `}</style>
);

// Deterministic finder-pattern QR-style mark (decorative, not a real QR)
const QR_ROWS = [
  [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],
  [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0],
  [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0],
];

function QRMark({ size = 68 }) {
  const cell = size / QR_ROWS.length;
  return (
    <div style={{ width: size, height: size }} className="bg-white rounded-md p-1 shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {QR_ROWS.map((row, r) =>
          row.map((bit, c) =>
            bit ? (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1e1b4b" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

const TIERS = [
  { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', req: '0–2 organizers onboarded', perk: 'Official ID + welcome kit' },
  { name: 'Silver', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-300', req: '3–7 organizers onboarded', perk: 'Merch drop + priority event hosting' },
  { name: 'Gold', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-300', req: '8–15 organizers onboarded', perk: 'Cash reward + founder shoutout' },
  { name: 'City Lead', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', ring: 'ring-fuchsia-300', req: '15+ organizers onboarded', perk: 'Leads other CAs in your city' },
];

function IDCard({ tilt = true }) {
  return (
    <div className={`relative w-80 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-fuchsia-600 p-[1.5px] shadow-2xl ${tilt ? '-rotate-3' : ''}`}>
      <div className="relative overflow-hidden rounded-2xl bg-white p-5">
        <div className="pointer-events-none absolute -inset-10 opacity-30">
          <div className="fn-sheen h-40 w-16 bg-white blur-md" />
        </div>

        <div className="flex items-center justify-between">
          <span className="fn-display text-sm font-semibold tracking-tight text-indigo-600">FestNest</span>
          <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-600 fn-mono">CAMPUS AMBASSADOR</span>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 text-indigo-300">
            <Users size={28} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="fn-display text-lg font-semibold text-slate-900 leading-tight">Aditi Sharma</span>
            <span className="fn-body text-sm text-slate-500">Christ University, Bangalore</span>
            <span className="mt-1 inline-flex w-fit items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 fn-mono">GOLD TIER</span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="fn-mono text-[10px] text-slate-400">ID NUMBER</div>
            <div className="fn-mono text-sm font-bold text-slate-800">FN-CA-BLR-014</div>
            <div className="fn-mono mt-2 text-[10px] text-slate-400">VALID THRU</div>
            <div className="fn-mono text-xs text-slate-600">08 / 2027</div>
          </div>
          <QRMark />
        </div>
      </div>
    </div>
  );
}

const BENEFITS = [
  { icon: IdCard, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'An official FestNest ID', text: 'A verified digital credential with your name, college, and ambassador number — shareable on LinkedIn and Instagram.' },
  { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Tier-based rewards', text: 'Climb from Bronze to City Lead as you onboard organizers — each tier unlocks merch, cash rewards, and priority access.' },
  { icon: Handshake, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', title: 'Direct founder access', text: 'Monthly calls with the FestNest founding team, and a real say in what gets built next.' },
  { icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50', title: 'Resume-ready experience', text: 'A verifiable certificate and recommendation for real startup growth and community-building work.' },
  { icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Your college, first', text: 'Priority event hosting and early feature access for events from your own campus.' },
  { icon: Sparkles, color: 'text-green-600', bg: 'bg-green-50', title: 'A real network', text: 'Connect with ambassadors across Bangalore, Pune, Chennai, Delhi NCR, and Mumbai.' },
];

const STEPS = [
  { title: 'Apply', text: 'Tell us about your college and why you want in — takes under five minutes.' },
  { title: 'Screening call', text: 'A short call with our team to understand your campus and community.' },
  { title: 'Onboarding', text: 'You get your official ID, referral link, and a starter kit within a week.' },
  { title: 'Grow & earn', text: 'Onboard organizers, source events, and move up the tiers every month.' },
];

const FAQS = [
  { q: 'Do I need to already use FestNest to apply?', a: 'No — anyone currently enrolled at a college can apply. We\u2019ll help you get set up once you\u2019re selected.' },
  { q: 'Is this a paid role?', a: 'Higher tiers unlock cash rewards and merch. Every ambassador gets the official ID, certificate, and founder access regardless of tier.' },
  { q: 'How much time does it take weekly?', a: 'Most ambassadors spend 2\u20134 hours a week — mainly reaching out to clubs and organizers on campus.' },
  { q: 'What if my college isn\u2019t in your five launch cities?', a: 'Apply anyway. We prioritise Bangalore, Pune, Chennai, Delhi NCR, and Mumbai first, but strong applicants elsewhere are kept on our shortlist.' },
];

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-slate-200 py-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="fn-body font-medium text-slate-900">{item.q}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="fn-body mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>}
    </div>
  );
}

export default function CampusAmbassadorPage() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, showToast } = useApp();

  const [openFAQ, setOpenFAQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  const [existingCA, setExistingCA] = useState(null);
  const [checkingCA, setCheckingCA] = useState(false);

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    college: currentUser?.college || '',
    course: '',
    year: currentUser?.year || '',
    city: currentUser?.city || '',
    instagram: currentUser?.instagram || '',
    why: '',
    referral: '',
  });

  // Pre-fill user data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        college: prev.college || currentUser.college || '',
        city: prev.city || currentUser.city || '',
        year: prev.year || currentUser.year || '',
        instagram: prev.instagram || currentUser.instagram || '',
      }));
    }
  }, [currentUser]);

  // Check if logged-in user already has a CA application
  useEffect(() => {
    if (isLoggedIn) {
      setCheckingCA(true);
      ca.me()
        .then((res) => {
          if (res.data?.profile) {
            setExistingCA(res.data.profile);
          }
        })
        .catch(() => {
          // ignore error if unapplied
        })
        .finally(() => setCheckingCA(false));
    }
  }, [isLoggedIn]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await ca.apply(form);
      setSubmitted(true);
      setSubmitSuccessMsg(
        res.message || "Application received! We'll review your application within 5–7 days."
      );
      showToast?.('Application submitted successfully!', 'success');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please check your details and try again.');
      showToast?.(err.message || 'Application failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fn-body min-h-screen bg-gray-50 text-slate-900">
      <GlobalStyle />

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft size={15} />
              <span>FestNest</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/ca" className="fn-display text-xl font-bold tracking-tight text-indigo-600">
              Campus Ambassador
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Explore Events
            </Link>

            {existingCA?.status === 'approved' ? (
              <Link
                to="/ca/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
              >
                <span>My CA Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : existingCA?.status === 'applied' || existingCA?.status === 'screening' ? (
              <Link
                to="/ca/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
              >
                <span>Track Application</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <a
                href="#apply"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
              >
                Apply now
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 border border-fuchsia-200/60 px-3 py-1 text-xs font-semibold text-fuchsia-600">
            <Sparkles size={13} />
            Campus Ambassador Program 2025–26
          </span>
          <h1 className="fn-display mt-5 text-4xl font-bold leading-[1.1] text-slate-900 md:text-5xl">
            Your campus. Your ID. Your movement.
          </h1>
          <p className="fn-body mt-5 max-w-md text-lg text-slate-600 leading-relaxed">
            Every fest, hackathon, and workshop on FestNest starts with someone on the ground. Be that person for your college — and get an official verified credential to show for it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {existingCA?.status === 'approved' ? (
              <Link
                to="/ca/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
              >
                <span>Go to Ambassador Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
              >
                <span>Apply to become a CA</span>
                <ArrowRight size={16} />
              </a>
            )}
            <a
              href="#how"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              See how it works
            </a>
          </div>
          <div className="mt-10 flex gap-8 border-t border-slate-200/80 pt-6">
            <div>
              <div className="fn-mono text-2xl font-bold text-slate-900">1,000+</div>
              <div className="text-xs text-slate-500 font-medium">Student community</div>
            </div>
            <div>
              <div className="fn-mono text-2xl font-bold text-slate-900">12+</div>
              <div className="text-xs text-slate-500 font-medium">Launch cities</div>
            </div>
            <div>
              <div className="fn-mono text-2xl font-bold text-slate-900">40+</div>
              <div className="text-xs text-slate-500 font-medium">Ambassadors onboard</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <IDCard />
        </div>
      </section>

      {/* What is it */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="fn-display text-2xl font-semibold text-slate-900">What is a FestNest Campus Ambassador?</h2>
          <p className="fn-body mt-4 text-slate-600 leading-relaxed">
            FestNest replaces scattered WhatsApp groups with one verified feed for every hackathon, fest, and workshop happening across Indian colleges. Ambassadors are our on-ground reps — the students who bring their college's clubs and events onto the platform, and make sure their campus never misses out on what's happening elsewhere.
          </p>
          <p className="fn-body mt-4 text-slate-600 leading-relaxed">
            In return, you get an official verified identity within FestNest — not just a title, but a trackable credential that automatically advances your tier as organizers submit events using your referral link.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="fn-display text-2xl font-semibold text-slate-900">Why become a CA</h2>
        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${b.bg} ${b.color}`}>
                <b.icon size={20} />
              </div>
              <div>
                <h3 className="fn-body font-semibold text-slate-900">{b.title}</h3>
                <p className="fn-body mt-1 text-sm text-slate-600 leading-relaxed">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="fn-display text-2xl font-semibold text-slate-900">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="fn-mono flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
                  {i + 1}
                </div>
                <h3 className="fn-body mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="fn-body mt-1 text-sm text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="fn-display text-2xl font-semibold text-slate-900">Tiers &amp; recognition</h2>
        <p className="fn-body mt-2 text-sm text-slate-600">Your tier updates automatically as you onboard organizers — track it live from your ambassador dashboard.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name} className={`rounded-xl ring-1 ${t.ring} ${t.bg} p-5 shadow-sm`}>
              <div className={`fn-display font-semibold ${t.color}`}>{t.name}</div>
              <div className="fn-mono mt-3 text-xs text-slate-500">{t.req}</div>
              <div className="fn-body mt-2 text-sm text-slate-700 leading-relaxed">{t.perk}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="fn-display text-2xl font-semibold text-slate-900">Common questions</h2>
          <div className="mt-6">
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} open={openFAQ === i} onToggle={() => setOpenFAQ(openFAQ === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="mx-auto max-w-2xl px-6 py-20">
        <h2 className="fn-display text-2xl font-semibold text-slate-900">Apply now</h2>
        <p className="fn-body mt-2 text-sm text-slate-600">Takes under five minutes. Our team will review and get in touch.</p>

        {existingCA?.status === 'approved' ? (
          <div className="mt-8 rounded-2xl bg-indigo-50 border border-indigo-200 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="mt-0.5 text-indigo-600 shrink-0" />
              <div>
                <h3 className="fn-display font-bold text-indigo-950 text-lg">You are an active Campus Ambassador!</h3>
                <p className="fn-body mt-1 text-sm text-indigo-700">
                  You already hold official credentials ({existingCA.caId}). Access your live digital badge, referral link, and impact metrics in your dashboard.
                </p>
                <div className="mt-4">
                  <Link
                    to="/ca/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition"
                  >
                    <span>Open CA Dashboard</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : existingCA?.status === 'applied' || existingCA?.status === 'screening' ? (
          <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <h3 className="fn-display font-bold text-amber-950 text-lg">Your application is under review</h3>
                <p className="fn-body mt-1 text-sm text-amber-800">
                  We received your application for {existingCA.college || 'your college'}. Our campus screening team is currently reviewing your submission.
                </p>
                <div className="mt-4">
                  <Link
                    to="/ca/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm transition"
                  >
                    <span>Check Application Status</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : submitted ? (
          <div className="mt-8 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-6 text-green-900">
            <CheckCircle2 size={24} className="mt-0.5 text-green-600 shrink-0" />
            <div>
              <p className="fn-body font-bold text-base">Application received successfully!</p>
              <p className="fn-body mt-1 text-sm text-green-700 leading-relaxed">
                {submitSuccessMsg || "We'll email you about next steps and screening within 5–7 business days."}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/home"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800 transition"
                >
                  Return to Home
                </Link>
                <Link
                  to="/ca/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-4 py-2 text-xs font-semibold text-green-800 hover:bg-green-100 transition"
                >
                  Track Status
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            {submitError && (
              <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
                <div className="text-sm">
                  <span className="font-semibold">Unable to submit application:</span> {submitError}
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Full name *</label>
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="e.g. Aditi Sharma"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="aditi@college.edu"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Phone (10 digits) *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="9876543210"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">City *</label>
                <input
                  required
                  value={form.city}
                  onChange={update('city')}
                  placeholder="e.g. Bangalore, Pune, Delhi"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">College name *</label>
                <input
                  required
                  value={form.college}
                  onChange={update('college')}
                  placeholder="e.g. Christ University"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Course &amp; year *</label>
                <input
                  required
                  value={form.course}
                  onChange={update('course')}
                  placeholder="e.g. B.Tech CSE, 2nd year"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Instagram / LinkedIn (optional)</label>
                <input
                  value={form.instagram}
                  onChange={update('instagram')}
                  placeholder="@handle or linkedin.com/in/..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="fn-body text-sm font-medium text-slate-700">Referral code (optional)</label>
                <input
                  value={form.referral}
                  onChange={update('referral')}
                  placeholder="e.g. FN-BLR-001"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                />
              </div>
            </div>
            <div>
              <label className="fn-body text-sm font-medium text-slate-700">
                Why do you want to be a FestNest CA? * <span className="text-xs text-slate-400 font-normal">(min 20 chars)</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.why}
                onChange={update('why')}
                placeholder="Tell us about student clubs you're part of, your network on campus, and why you want to lead event discovery for your college..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting application...</span>
                </>
              ) : (
                <>
                  <span>Submit application</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-indigo-600 py-14 text-center text-white px-6">
        <h2 className="fn-display text-2xl font-semibold">Ready to represent your campus?</h2>
        <p className="fn-body mt-2 text-sm text-indigo-100 max-w-md mx-auto">
          Join ambitious student leaders across India bringing fests and hackathons onto one platform.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="#apply"
            className="fn-body inline-flex items-center gap-1.5 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition shadow-sm"
          >
            <span>Apply now</span>
            <ArrowRight size={15} />
          </a>
          <Link
            to="/home"
            className="fn-body inline-flex items-center rounded-lg border border-indigo-400/80 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Explore FestNest
          </Link>
        </div>
      </section>
    </div>
  );
}

