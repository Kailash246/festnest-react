import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { support } from '../services/api';
import {
  MessageCircle, Inbox, Handshake, Bell,
  Clock, Lightbulb, HelpCircle, User, PenLine, Ticket,
} from 'lucide-react';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const CONTACT_CHANNELS = [
  {
    id: 'general',
    Icon: MessageCircle,
    label: 'General Support',
    email: 'support@festnest.in',
    desc: 'Questions, bugs, account issues',
    responseTime: 'Usually replies in 2–4 hours',
    color: 'bg-primary-light border-[#C7D2FE] text-primary',
    iconBg: 'bg-primary',
  },
  {
    id: 'contact',
    Icon: Inbox,
    label: 'General Enquiry',
    email: 'contact@festnest.in',
    desc: 'Anything else you want to share',
    responseTime: 'Usually replies in 24 hours',
    color: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
    iconBg: 'bg-[#2563EB]',
  },
  {
    id: 'partners',
    Icon: Handshake,
    label: 'Partnerships',
    email: 'partners@festnest.in',
    desc: 'Sponsorships, collaborations, B2B',
    responseTime: 'Usually replies in 48 hours',
    color: 'bg-[#FDF4FF] border-[#E9D5FF] text-[#7C3AED]',
    iconBg: 'bg-[#7C3AED]',
  },
  {
    id: 'noreply',
    Icon: Bell,
    label: 'Automated Emails',
    email: 'noreply@festnest.in',
    desc: 'OTP, receipts, notifications — do not reply',
    responseTime: 'This address does not accept replies',
    color: 'bg-surface-2 border-border text-text-3',
    iconBg: 'bg-text-3',
    muted: true,
  },
];

const FAQS = [
  {
    q: 'How do I register for an event?',
    a: 'Tap on any event card to open the event detail page, then hit "Register Now" or "Book Tickets". You\'ll be redirected to the official registration form for that event.',
  },
  {
    q: 'Is FestNest free to use?',
    a: 'Yes! FestNest is completely free for students. Some events may have their own registration fees, but discovering and saving events on FestNest costs nothing.',
  },
  {
    q: 'How do I list my college event?',
    a: 'Tap "Host an Event" from the bottom nav or sidebar. Fill in the 4-step form with your event details. Our team reviews submissions within 24 hours and publishes approved events.',
  },
  {
    q: 'My event details are wrong — how do I fix it?',
    a: 'Email us at support@festnest.in with the event name and the corrections needed. We\'ll update it within a few hours.',
  },
  {
    q: 'Can I save events and come back later?',
    a: 'Yes. Tap the 🔖 bookmark icon on any event card to save it. You\'ll find all saved events in the Saved tab. You need to be logged in to save events.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Profile → scroll to the bottom → tap "Delete Account". This action is permanent and will remove all your data from FestNest.',
  },
  {
    q: 'How are FestNest Points calculated?',
    a: 'Points are earned by registering (+50), attending (+150), winning (+500), referring friends (+75), and hosting events (+300). Points update within 24 hours of an activity.',
  },
  {
    q: 'I didn\'t receive my OTP. What should I do?',
    a: 'Check your spam folder first. If it\'s not there, wait 60 seconds and tap "Resend code". If the issue persists, email support@festnest.in with your email address.',
  },
];

const TOPICS = [
  'Bug Report',
  'Event Listing Issue',
  'Account & Login',
  'Payment / Tickets',
  'FestNest Points',
  'Partnership',
  'Feature Request',
  'Other',
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className={`border rounded-xl overflow-hidden transition-colors duration-200
                  ${open ? 'border-primary bg-primary-xlight' : 'border-border bg-surface'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-start justify-between w-full text-left px-5 py-4 gap-4"
        aria-expanded={open}
      >
        <span className={`text-[14px] font-semibold leading-snug transition-colors
                          ${open ? 'text-primary' : 'text-text-1'}`}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                      text-[18px] font-light transition-colors
                      ${open ? 'bg-primary text-white' : 'bg-surface-3 text-text-3'}`}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="px-5 pb-5 text-[14px] text-text-2 leading-relaxed border-t border-primary/20 pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ContactCard = ({ channel, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const CIcon = channel.Icon;

  const handleCopy = () => {
    navigator.clipboard?.writeText(channel.email).catch(() => {});
    setCopied(true);
    onCopy(channel.email);
    setTimeout(() => setCopied(false), 2000);
  };

  if (channel.muted) {
    return (
      <div className={`rounded-xl border p-4 ${channel.color} opacity-60`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center flex-shrink-0">
            <CIcon size={16} strokeWidth={1.8} className="text-text-3" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-3">{channel.label}</div>
            <div className="text-[11px] text-text-4">{channel.desc}</div>
          </div>
        </div>
        <div className="font-mono text-[12px] text-text-4 bg-surface/60 rounded-md px-3 py-2">
          {channel.email}
        </div>
        <div className="text-[11px] text-text-4 mt-2 italic">{channel.responseTime}</div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      className={`rounded-xl border p-5 cursor-pointer transition-all duration-base ${channel.color}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${channel.iconBg} flex items-center justify-center
                         flex-shrink-0 shadow-sm`}>
          <CIcon size={20} strokeWidth={1.8} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-text-1 mb-0.5">{channel.label}</div>
          <div className="text-[12px] text-text-3">{channel.desc}</div>
        </div>
      </div>

      {/* Email + Copy */}
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2.5 mb-3">
        <span className="font-mono text-[13px] text-text-1 flex-1 truncate select-all">
          {channel.email}
        </span>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCopy}
          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1
                     rounded-md bg-white border border-border/50 text-text-2
                     hover:text-primary hover:border-primary/50 transition-all"
          aria-label={copied ? 'Copied!' : 'Copy email'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="done" initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                className="text-[#16A34A]">✓</motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      </div>

      {/* Response time + mailto link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-text-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block animate-pulse" />
          {channel.responseTime}
        </div>
        <a
          href={`mailto:${channel.email}`}
          className="text-[12px] font-semibold text-current opacity-70 hover:opacity-100
                     flex items-center gap-1 transition-opacity"
          aria-label={`Send email to ${channel.email}`}
        >
          Email →
        </a>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Support() {
  const navigate = useNavigate();
  const { showToast, isLoggedIn } = useApp();

  const [activeSection, setActiveSection] = useState('contact'); // 'contact' | 'faq' | 'form' | 'mytickets'
  const [formData, setFormData] = useState({ name: '', email: '', topic: '', message: '' });
  const [selectedTopic, setSelectedTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [faqQuery, setFaqQuery] = useState('');

  // My Tickets state
  const [myTickets,          setMyTickets]          = useState([]);
  const [ticketsLoading,     setTicketsLoading]     = useState(false);
  const [ticketFilter,       setTicketFilter]       = useState('all');
  const [replyingId,          setReplyingId]          = useState(null);
  const [replyText,           setReplyText]           = useState('');
  const [ticketActionLoading, setTicketActionLoading] = useState('');

  const loadMyTickets = useCallback(() => {
    setTicketsLoading(true);
    support.myTickets()
      .then(r => setMyTickets(r.data.tickets || []))
      .catch(() => showToast('Could not load your tickets', 'error'))
      .finally(() => setTicketsLoading(false));
  }, []);

  const cancelReply = () => { setReplyingId(null); setReplyText(''); };

  const handleReopen = async (id) => {
    setTicketActionLoading(id + '-reopen');
    try {
      await support.reopenTicket(id, replyText);
      showToast('Ticket reopened ✓', 'success');
      cancelReply();
      loadMyTickets();
    } catch (e) { showToast(e.message || 'Failed to reopen ticket', 'error'); }
    finally { setTicketActionLoading(''); }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return showToast('Please write a message', 'error');
    setTicketActionLoading(id + '-reply');
    try {
      await support.replyToTicket(id, replyText);
      showToast('Reply sent ✓', 'success');
      cancelReply();
      loadMyTickets();
    } catch (e) { showToast(e.message || 'Failed to send reply', 'error'); }
    finally { setTicketActionLoading(''); }
  };


  useEffect(() => {
    if (activeSection === 'mytickets' && isLoggedIn) loadMyTickets();
  }, [activeSection, isLoggedIn]);

  const update = (k, v) => setFormData(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!formData.name.trim()) return showToast('Please enter your name', 'error');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return showToast('Please enter a valid email', 'error');
    if (!selectedTopic) return showToast('Please select a topic', 'error');
    if (formData.message.trim().length < 20)
      return showToast('Please describe your issue in at least 20 characters', 'error');

    setSubmitting(true);
    try {
      const r = await support.submitTicket({
        name:      formData.name.trim(),
        email:     formData.email.trim(),
        issueType: selectedTopic,
        subject:   selectedTopic,
        message:   formData.message.trim(),
      });
      setCreatedTicketId(r.data.ticket._id);
      setSubmitted(true);
    } catch (e) {
      showToast(e.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = FAQS.filter(
    f => !faqQuery ||
      f.q.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(faqQuery.toLowerCase())
  );

  const TABS = [
    { id: 'contact',   label: 'Contact Us',   Icon: Inbox },
    { id: 'faq',       label: 'FAQs',         Icon: HelpCircle },
    { id: 'form',      label: 'Send Message', Icon: PenLine },
    ...(isLoggedIn ? [{ id: 'mytickets', label: 'My Tickets', Icon: Ticket }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-screen bg-white pb-24 md:pb-12"
    >

      {/* ══════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-[#4338CA] to-[#3730A3]
                      px-5 pt-10 pb-8 md:px-12 md:pt-14 md:pb-12">

        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/[0.04] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-[600px] md:max-w-[860px] md:mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25
                          rounded-full px-3 py-1.5 text-[12px] font-semibold text-white/90 mb-4">
            <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
            Support team online · avg. response in 3h
          </div>

          <h1 className="font-display font-bold text-[28px] md:text-[38px] text-white
                         leading-tight tracking-tight mb-3">
            How can we<br className="md:hidden" /> help you?
          </h1>
          <p className="text-[14px] md:text-[16px] text-white/70 leading-relaxed max-w-[460px]">
            Whether you have a question, found a bug, or just want to say hi —
            we're here. Pick the fastest route below.
          </p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          TABS
      ══════════════════════════════════════ */}
      <div className="bg-surface border-b border-border
                      shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex max-w-[860px] md:mx-auto px-4 md:px-10">
          {TABS.map(({ id, label, Icon: TIcon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[13px] font-semibold
                          border-b-2 transition-all duration-fast
                          ${activeSection === id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-3 hover:text-text-1'}`}
            >
              <TIcon size={15} strokeWidth={1.8} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 pb-4 md:px-10 max-w-[860px] md:mx-auto">
        <AnimatePresence mode="wait">

          {/* ══ TAB 1: CONTACT ══ */}
          {activeSection === 'contact' && (
            <motion.div key="contact"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

              <h2 className="font-display font-bold text-[20px] md:text-[24px] text-text-1
                             tracking-tight mb-1">Contact channels</h2>
              <p className="text-[14px] text-text-3 mb-6">
                Reach the right team directly — or use the message form for a guided experience.
              </p>

              {/* Contact cards grid */}
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {CONTACT_CHANNELS.map(ch => (
                  <ContactCard
                    key={ch.id}
                    channel={ch}
                    onCopy={(email) => showToast(`${email} copied to clipboard ✓`, 'success')}
                  />
                ))}
              </div>

              {/* Office hours */}
              <div className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="font-display font-bold text-[16px] text-text-1 mb-4 flex items-center gap-2">
                  <Clock size={16} strokeWidth={1.8} className="text-text-2" /> Support hours
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { day: 'Mon – Fri', hours: '9:00 AM – 9:00 PM', active: true },
                    { day: 'Saturday',  hours: '10:00 AM – 6:00 PM', active: true },
                    { day: 'Sunday',    hours: 'Limited support', active: false },
                    { day: 'Holidays',  hours: 'Emergency only', active: false },
                  ].map(({ day, hours, active }) => (
                    <div key={day} className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                                        ${active ? 'bg-[#16A34A]' : 'bg-border-strong'}`} />
                      <div>
                        <div className="text-[13px] font-semibold text-text-1">{day}</div>
                        <div className={`text-[12px] ${active ? 'text-text-3' : 'text-text-4'}`}>{hours}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border text-[12px] text-text-4 leading-relaxed">
                  All times are Indian Standard Time (IST, UTC +5:30).
                  For urgent issues during off-hours, email support@festnest.in — we monitor critical alerts 24/7.
                </div>
              </div>

              {/* Quick action */}
              <div className="bg-primary-light border border-[#C7D2FE] rounded-xl p-5 flex items-start gap-4">
                <Lightbulb size={32} strokeWidth={1.5} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-display font-bold text-[15px] text-primary mb-1">
                    Not sure where to start?
                  </div>
                  <p className="text-[13px] text-text-2 leading-relaxed mb-3">
                    Most questions are answered in our FAQ — no email needed. Try searching there first.
                  </p>
                  <button
                    onClick={() => setActiveSection('faq')}
                    className="px-4 py-2 bg-primary text-white rounded-md text-[13px] font-semibold
                               hover:bg-primary-dark transition-colors"
                  >
                    Browse FAQs →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ TAB 2: FAQ ══ */}
          {activeSection === 'faq' && (
            <motion.div key="faq"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

              <h2 className="font-display font-bold text-[20px] md:text-[24px] text-text-1
                             tracking-tight mb-1">Frequently asked questions</h2>
              <p className="text-[14px] text-text-3 mb-5">
                {FAQS.length} questions covering the most common issues.
              </p>

              {/* FAQ search */}
              <div className="flex items-center gap-3 bg-surface border-[1.5px] border-border-strong
                              rounded-xl px-4 py-3 mb-5 focus-within:border-primary
                              focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.10)] transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-3 flex-shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={faqQuery}
                  onChange={e => setFaqQuery(e.target.value)}
                  placeholder="Search questions…"
                  className="flex-1 font-body text-[14px] text-text-1 bg-transparent outline-none
                             placeholder:text-text-3"
                />
                {faqQuery && (
                  <button onClick={() => setFaqQuery('')} className="text-text-4 hover:text-text-2 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-3"><HelpCircle size={48} strokeWidth={1.3} className="text-text-3" /></div>
                  <div className="font-display font-bold text-[17px] text-text-1 mb-2">No results found</div>
                  <p className="text-[14px] text-text-3 mb-5">
                    Couldn't find an answer for "{faqQuery}"
                  </p>
                  <button onClick={() => setActiveSection('form')}
                    className="px-5 py-2.5 bg-primary text-white rounded-md text-[14px] font-semibold
                               hover:bg-primary-dark transition-colors">
                    Ask us directly →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredFaqs.map((faq, i) => (
                    <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
                  ))}
                </div>
              )}

              {/* Still stuck */}
              {filteredFaqs.length > 0 && (
                <div className="mt-8 flex flex-col items-center text-center">
                  <div className="flex justify-center mb-2"><User size={28} strokeWidth={1.5} className="text-text-3" /></div>
                  <div className="font-display font-bold text-[15px] text-text-1 mb-1">Still stuck?</div>
                  <p className="text-[13px] text-text-3 mb-4">Our team usually replies within a few hours.</p>
                  <button onClick={() => setActiveSection('form')}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-bold
                               hover:bg-primary-dark hover:shadow-indigo transition-all">
                    Send a message →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ TAB 3: CONTACT FORM ══ */}
          {activeSection === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Ticket confirmation ── */
                  <motion.div key="success"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-8 md:py-12 max-w-[460px] mx-auto">

                    {/* Check icon */}
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
                      className="w-14 h-14 rounded-full bg-green-bg border-2 border-green-border
                                 flex items-center justify-center mx-auto mb-5"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }} className="space-y-5">

                      {/* Heading */}
                      <div className="text-center">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-[#16A34A] mb-2">
                          ✅ Support Ticket Created
                        </div>
                        <h2 className="font-display font-bold text-[24px] text-text-1 tracking-tight mb-2">
                          Thank you, {formData.name.split(' ')[0]}
                        </h2>
                        <p className="text-[14px] text-text-3 leading-relaxed">
                          Your request has been submitted successfully and a support ticket has been created.
                        </p>
                      </div>

                      {/* Ticket card */}
                      <div className="bg-white border-2 border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-surface-2 px-4 py-2.5 border-b border-border flex items-center gap-2">
                          <span className="text-sm">🎫</span>
                          <span className="text-[11px] font-bold text-text-3 uppercase tracking-wide">Support Ticket</span>
                        </div>
                        <div className="px-4 py-4 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-1">Ticket ID</div>
                            <div className="font-mono font-bold text-[15px] text-text-1">
                              #{createdTicketId?.slice(-6).toUpperCase() ?? '——'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-1">Status</div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-red-bg text-red border-red-border">
                              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                              Open
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-1">Subject</div>
                            <div className="text-[13px] text-text-1 font-medium">{selectedTopic}</div>
                          </div>
                        </div>
                      </div>

                      {/* Tracking info */}
                      <div className="bg-primary-light border border-[#C7D2FE] rounded-xl p-4 space-y-1">
                        <div className="text-[12px] font-bold text-primary">📍 Track your ticket inside FestNest</div>
                        <div className="text-[13px] text-primary/80 font-mono font-medium">
                          Profile → Help & Support → My Tickets
                        </div>
                        <div className="text-[12px] text-primary/60 pt-1">
                          Our team typically responds within 2–4 working hours.
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        {isLoggedIn && (
                          <button
                            onClick={() => { setSubmitted(false); setCreatedTicketId(null); setActiveSection('mytickets'); }}
                            className="flex-1 py-3 bg-primary text-white rounded-xl text-[14px] font-bold
                                       hover:bg-primary-dark transition-colors text-center">
                            View My Ticket →
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setCreatedTicketId(null);
                            setFormData({ name: '', email: '', topic: '', message: '' });
                            setSelectedTopic('');
                          }}
                          className="flex-1 py-3 border-[1.5px] border-border rounded-xl text-[14px]
                                     font-medium text-text-2 hover:border-primary hover:text-primary
                                     transition-all text-center">
                          Submit Another Request
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.div key="form-fields"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    <h2 className="font-display font-bold text-[20px] md:text-[24px] text-text-1
                                   tracking-tight mb-1">Send us a message</h2>
                    <p className="text-[14px] text-text-3 mb-7">
                      Fill in the form and we'll get back to you at support@festnest.in
                    </p>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[13px] font-semibold text-text-1 mb-1.5">
                          Your name <span className="text-red">*</span>
                        </label>
                        <input
                          value={formData.name}
                          onChange={e => update('name', e.target.value)}
                          placeholder="Arjun Kumar"
                          autoComplete="name"
                          className="w-full px-4 py-[11px] border-[1.5px] border-border-strong rounded-xl
                                     font-body text-[14px] text-text-1 bg-surface outline-none
                                     placeholder:text-text-4
                                     focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.10)]
                                     transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-text-1 mb-1.5">
                          Email address <span className="text-red">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => update('email', e.target.value)}
                          placeholder="you@college.edu"
                          autoComplete="email"
                          className="w-full px-4 py-[11px] border-[1.5px] border-border-strong rounded-xl
                                     font-body text-[14px] text-text-1 bg-surface outline-none
                                     placeholder:text-text-4
                                     focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.10)]
                                     transition-all"
                        />
                      </div>
                    </div>

                    {/* Topic chips */}
                    <div className="mb-5">
                      <label className="block text-[13px] font-semibold text-text-1 mb-2">
                        Topic <span className="text-red">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map(topic => (
                          <motion.button
                            key={topic}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium
                                        transition-all duration-fast
                                        ${selectedTopic === topic
                                          ? 'bg-primary-light border-primary text-primary shadow-[0_0_0_2px_rgba(79,70,229,0.15)]'
                                          : 'bg-surface border-border text-text-2 hover:border-primary-mid hover:text-primary'}`}
                          >
                            {topic}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label className="flex items-center justify-between text-[13px] font-semibold
                                        text-text-1 mb-1.5">
                        <span>Your message <span className="text-red">*</span></span>
                        <span className={`font-normal text-[12px]
                                          ${formData.message.length < 20 ? 'text-text-4' : 'text-[#16A34A]'}`}>
                          {formData.message.length} chars {formData.message.length >= 20 ? '✓' : '(min 20)'}
                        </span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={e => update('message', e.target.value)}
                        placeholder="Describe your issue, question, or feedback in detail…"
                        rows={5}
                        className="w-full px-4 py-3.5 border-[1.5px] border-border-strong rounded-xl
                                   font-body text-[14px] text-text-1 bg-surface outline-none resize-y
                                   placeholder:text-text-4
                                   focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.10)]
                                   transition-all min-h-[120px]"
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 bg-primary text-white rounded-xl font-body text-[15px]
                                 font-bold flex items-center justify-center gap-2.5
                                 hover:bg-primary-dark hover:shadow-indigo
                                 transition-all disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-[12px] text-text-4 mt-3">
                      By submitting, you agree to our{' '}
                      <button className="text-primary hover:underline">Privacy Policy</button>.
                      We never share your data.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══ TAB 4: MY TICKETS ══ */}
          {activeSection === 'mytickets' && (
            <motion.div key="mytickets"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-[20px] md:text-[24px] text-text-1 tracking-tight">My Tickets</h2>
                  <p className="text-[14px] text-text-3 mt-0.5">Track all your support requests</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={loadMyTickets}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-text-2
                             border border-border rounded-lg hover:border-primary hover:text-primary transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                  Refresh
                </motion.button>
              </div>

              {/* Filter pills */}
              {(() => {
                const FILTERS = [
                  { id: 'all',         label: 'All' },
                  { id: 'open',        label: 'Open' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'resolved',    label: 'Resolved' },
                ];
                const filtered = ticketFilter === 'all'
                  ? myTickets
                  : myTickets.filter(t => t.status === ticketFilter);

                const STATUS_STYLE = {
                  open:        { badge: 'bg-red-bg text-red border-red-border',       dot: 'bg-red',          label: 'Open' },
                  in_progress: { badge: 'bg-amber-bg text-amber border-amber-border', dot: 'bg-amber',        label: 'In Progress' },
                  resolved:    { badge: 'bg-green-bg text-[#16A34A] border-green-border', dot: 'bg-[#16A34A]', label: 'Resolved' },
                };

                const counts = {
                  all:         myTickets.length,
                  open:        myTickets.filter(t => t.status === 'open').length,
                  in_progress: myTickets.filter(t => t.status === 'in_progress').length,
                  resolved:    myTickets.filter(t => t.status === 'resolved').length,
                };

                return (
                  <>
                    <div className="flex gap-2 flex-wrap mb-5">
                      {FILTERS.map(f => (
                        <button key={f.id} onClick={() => setTicketFilter(f.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold
                                      border transition-all ${ticketFilter === f.id
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-text-2 border-border hover:border-primary/40 hover:text-primary'}`}>
                          {f.label}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                                            ${ticketFilter === f.id ? 'bg-white/20 text-white' : 'bg-surface-3 text-text-3'}`}>
                            {counts[f.id]}
                          </span>
                        </button>
                      ))}
                    </div>

                    {ticketsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <svg className="w-7 h-7 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/>
                        </svg>
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-14">
                        <div className="text-5xl mb-3">🎫</div>
                        <div className="font-semibold text-text-2 text-[15px] mb-1">
                          {myTickets.length === 0 ? 'No tickets yet' : `No ${ticketFilter.replace('_', ' ')} tickets`}
                        </div>
                        <p className="text-[13px] text-text-3 max-w-[260px] mx-auto">
                          {myTickets.length === 0
                            ? 'Submit a message from the "Send Message" tab and we\'ll track it here.'
                            : 'Try a different filter above.'}
                        </p>
                        {myTickets.length === 0 && (
                          <button onClick={() => setActiveSection('form')}
                            className="mt-5 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold
                                       hover:bg-primary-dark transition-colors">
                            Send a message →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filtered.map((t, i) => {
                          const s = STATUS_STYLE[t.status] || STATUS_STYLE.open;
                          const isResolved = t.status === 'resolved';
                          return (
                            <motion.div key={t._id}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, delay: i * 0.04 }}
                              className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">

                              {/* Card header */}
                              <div className={`px-4 pt-4 pb-3 ${isResolved ? 'bg-[#F0FDF4]' : t.status === 'in_progress' ? 'bg-[#FFFBEB]' : 'bg-white'}`}>
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <span className="font-mono text-[11px] font-bold text-text-4">#{t._id.slice(-6).toUpperCase()}</span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${s.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${t.status !== 'resolved' ? 'animate-pulse' : ''}`} />
                                    {s.label}
                                  </span>
                                </div>
                                <div className="font-bold text-[15px] text-text-1 mb-1">{t.subject}</div>
                                <span className="inline-block text-[11px] font-medium text-text-3 bg-white/70 border border-border px-2 py-0.5 rounded-full">
                                  {t.issueType}
                                </span>
                              </div>

                              <div className="px-4 py-3 space-y-4">
                                {/* USER MESSAGE */}
                                <div>
                                  <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-2">Your Message</div>
                                  <div className="bg-surface-2 rounded-xl p-3 text-[13px] text-text-2 leading-relaxed">
                                    {t.message}
                                  </div>
                                </div>

                                {/* ADMIN RESPONSES */}
                                {t.replies?.filter(r => r.author === 'admin').length > 0 ? (
                                  <div>
                                    <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-2">FestNest Response</div>
                                    <div className="space-y-2">
                                      {t.replies.filter(r => r.author === 'admin').map((r, ri) => (
                                        <div key={ri} className="bg-primary-light border border-[#C7D2FE] rounded-xl p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">FN</div>
                                            <span className="text-[11px] font-bold text-primary">FestNest Team</span>
                                            <span className="text-[10px] text-text-4 ml-auto">
                                              {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                          </div>
                                          <p className="text-[13px] text-primary/90 leading-relaxed">{r.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : t.status === 'in_progress' ? (
                                  <div className="flex items-center gap-2 bg-amber-bg border border-amber-border rounded-xl px-3 py-2.5">
                                    <span>🔍</span>
                                    <span className="text-[12px] font-semibold text-amber">Our team is reviewing your request.</span>
                                  </div>
                                ) : null}

                                {/* STATUS + TIMELINE */}
                                <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-0.5">Status</div>
                                    <div className={`text-[12px] font-semibold ${isResolved ? 'text-[#16A34A]' : t.status === 'in_progress' ? 'text-amber' : 'text-red'}`}>{s.label}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-0.5">Submitted</div>
                                    <div className="text-[12px] text-text-2">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                  </div>
                                  {isResolved && t.resolvedAt && (
                                    <div className="col-span-2">
                                      <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-0.5">Resolution Date</div>
                                      <div className="text-[12px] text-[#16A34A] font-semibold">{new Date(t.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                  )}
                                </div>

                                {/* ── REOPEN (resolved) ── */}
                                {isResolved && (
                                  <div className="pt-1">
                                    {replyingId === t._id ? (
                                      <div className="space-y-2">
                                        <div className="text-[11px] font-semibold text-text-3">
                                          Describe what's still unresolved <span className="text-text-4 font-normal">(optional)</span>
                                        </div>
                                        <textarea
                                          value={replyText}
                                          onChange={e => setReplyText(e.target.value)}
                                          placeholder="Tell us what's still not working…"
                                          rows={3}
                                          autoFocus
                                          className="w-full text-[13px] px-3 py-2.5 border border-border rounded-xl
                                                     bg-white focus:border-primary outline-none resize-none"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleReopen(t._id)}
                                            disabled={ticketActionLoading === t._id + '-reopen'}
                                            className="flex-1 py-2 bg-amber text-white rounded-xl text-[13px] font-bold
                                                       hover:opacity-90 transition-opacity disabled:opacity-50">
                                            {ticketActionLoading === t._id + '-reopen' ? 'Reopening…' : 'Reopen Ticket'}
                                          </button>
                                          <button onClick={cancelReply}
                                            className="px-4 py-2 border border-border rounded-xl text-[13px]
                                                       font-medium text-text-2 hover:border-primary hover:text-primary transition-all">
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => { setReplyingId(t._id); setReplyText(''); }}
                                        className="w-full py-2.5 border border-border rounded-xl text-[13px] font-medium
                                                   text-text-3 hover:text-amber hover:border-amber transition-all text-center">
                                        🔄 Not satisfied or issue persists? Reopen ticket
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* ── REPLY (open / in_progress) ── */}
                                {!isResolved && (
                                  <div className="pt-1">
                                    {replyingId === t._id ? (
                                      <div className="space-y-2">
                                        <div className="text-[11px] font-semibold text-text-3">Add information for the team</div>
                                        <textarea
                                          value={replyText}
                                          onChange={e => setReplyText(e.target.value)}
                                          placeholder="Add more context or an update…"
                                          rows={3}
                                          autoFocus
                                          className="w-full text-[13px] px-3 py-2.5 border border-border rounded-xl
                                                     bg-white focus:border-primary outline-none resize-none"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleReply(t._id)}
                                            disabled={ticketActionLoading === t._id + '-reply'}
                                            className="flex-1 py-2 bg-primary text-white rounded-xl text-[13px] font-bold
                                                       hover:bg-primary-dark transition-colors disabled:opacity-50">
                                            {ticketActionLoading === t._id + '-reply' ? 'Sending…' : 'Send Reply'}
                                          </button>
                                          <button onClick={cancelReply}
                                            className="px-4 py-2 border border-border rounded-xl text-[13px]
                                                       font-medium text-text-2 hover:border-primary hover:text-primary transition-all">
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => { setReplyingId(t._id); setReplyText(''); }}
                                        className="w-full py-2.5 border border-border rounded-xl text-[13px] font-medium
                                                   text-text-3 hover:text-primary hover:border-primary transition-all text-center">
                                        💬 Add a reply
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
