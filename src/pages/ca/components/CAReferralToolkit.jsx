// src/pages/ca/components/CAReferralToolkit.jsx
import React, { useState } from 'react';
import {
  Link2, Copy, Check, Share2, QrCode, MessageSquare, Send,
  FileText, ExternalLink, Sparkles, Building, Users
} from 'lucide-react';
import { getOutreachTemplates } from '../../../services/caService';
import { getReferralUrl } from '../../../config/site';

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

function QRMarkModal({ url, label, onClose }) {
  const cell = 140 / QR_ROWS.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-border p-6 max-w-xs w-full text-center shadow-2">
        <h4 className="font-heading font-bold text-slate-900 text-sm mb-1">{label} QR Code</h4>
        <p className="font-sans text-xs text-text-3 mb-4">Scan with any mobile camera</p>

        <div className="bg-surface-2 p-3 rounded-xl border border-border inline-block mx-auto mb-4">
          <svg viewBox="0 0 140 140" width="140" height="140">
            {QR_ROWS.map((row, r) =>
              row.map((bit, c) =>
                bit ? (
                  <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1e1b4b" />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className="text-[11px] font-mono text-text-3 truncate p-2 rounded-lg bg-surface-2 border border-border mb-4">
          {url}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function CAReferralToolkit({ profile, onCopy, copiedKey }) {
  const [activeQR, setActiveQR] = useState(null); // { url, label } | null

  const code = profile?.referralCode || '';
  const generalUrl = getReferralUrl(code);
  const hostUrl = getReferralUrl(code, 'host');
  const exploreUrl = getReferralUrl(code, 'explore');

  const templates = getOutreachTemplates(profile);

  const handleShare = (url, title) => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      onCopy(url, 'share-fallback', 'Link copied to clipboard!');
    }
  };

  const handleWhatsApp = (text) => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const linkCards = [
    {
      id: 'general',
      title: 'General Referral Link',
      tag: 'All Students',
      url: generalUrl,
      desc: 'Best for general sharing on Instagram bios, personal intros, and batch groups.',
      icon: Sparkles,
      color: 'bg-indigo-50 text-primary',
    },
    {
      id: 'host',
      title: 'Organizer Onboarding Link',
      tag: 'Clubs & Leads',
      url: hostUrl,
      desc: 'Takes club leads, society heads, and fest convenors straight to the event hosting studio.',
      icon: Building,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'explore',
      title: 'Student Event Discovery Link',
      tag: 'Competitions',
      url: exploreUrl,
      desc: 'Directs students straight to verified hackathons, workshops, and competitions.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* QR Modal when active */}
      {activeQR && (
        <QRMarkModal
          url={activeQR.url}
          label={activeQR.label}
          onClose={() => setActiveQR(null)}
        />
      )}

      {/* 3 Core Tracking Links */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 size={20} className="text-primary" />
            <span>Personal Outreach Links</span>
          </h2>
          <p className="font-sans text-xs text-text-3 mt-1">
            All links automatically carry code <span className="font-mono font-bold text-slate-800">{code}</span> for accurate conversion attribution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {linkCards.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-surface-2/40 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.color}`}>
                      <c.icon size={16} />
                    </div>
                    <span className="font-heading text-xs font-bold text-slate-900">{c.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-border text-text-3">
                    {c.tag}
                  </span>
                </div>

                <p className="font-sans text-xs text-text-3 mb-3 leading-relaxed">
                  {c.desc}
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-border text-xs font-mono text-slate-700 truncate select-all mb-4">
                  {c.url}
                </div>
              </div>

              {/* Action Buttons: Copy, Share, QR */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(c.url, `tk-${c.id}`, `${c.title} copied!`)}
                  className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition active:scale-[0.98]"
                >
                  {copiedKey === `tk-${c.id}` ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === `tk-${c.id}` ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(c.url, c.title)}
                  className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-2 hover:bg-surface-2 transition"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQR({ url: c.url, label: c.title })}
                  className="inline-flex items-center justify-center gap-1 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-2 hover:bg-surface-2 transition"
                >
                  <QrCode size={13} />
                  <span>QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Message Templates */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* WhatsApp Launchers Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">
              WhatsApp 1-Click Messages
            </h3>
          </div>
          <p className="font-sans text-xs text-text-3 leading-relaxed">
            Pre-composed messages ready to launch or copy directly for student batch and club groups.
          </p>

          <div className="space-y-3">
            {/* Student Message */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-2/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xs font-bold text-slate-900">For Students &amp; Classmates</span>
                <button
                  type="button"
                  onClick={() => onCopy(templates.studentWhatsApp, 'wa-student', 'Student message copied!')}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === 'wa-student' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedKey === 'wa-student' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-sans text-xs text-text-2 italic line-clamp-3">
                "{templates.studentWhatsApp}"
              </p>
              <button
                type="button"
                onClick={() => handleWhatsApp(templates.studentWhatsApp)}
                className="mt-3 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Send size={13} className="text-emerald-600" />
                <span>Launch in WhatsApp</span>
              </button>
            </div>

            {/* Organizer Message */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-2/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xs font-bold text-slate-900">For Club Leads &amp; Organizers</span>
                <button
                  type="button"
                  onClick={() => onCopy(templates.organizerWhatsApp, 'wa-org', 'Organizer message copied!')}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === 'wa-org' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedKey === 'wa-org' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-sans text-xs text-text-2 italic line-clamp-3">
                "{templates.organizerWhatsApp}"
              </p>
              <button
                type="button"
                onClick={() => handleWhatsApp(templates.organizerWhatsApp)}
                className="mt-3 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Send size={13} className="text-primary" />
                <span>Launch in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* LinkedIn Post Template Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h3 className="font-heading text-base font-bold text-slate-900">
                  LinkedIn Announcement Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onCopy(templates.linkedInPost, 'tk-linkedin', 'LinkedIn template copied!')}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === 'tk-linkedin' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedKey === 'tk-linkedin' ? 'Copied' : 'Copy Post'}</span>
              </button>
            </div>

            <p className="font-sans text-xs text-text-3 mt-1 leading-relaxed">
              Publish on your LinkedIn feed to announce your appointment and invite campus clubs to submit events.
            </p>

            <div className="mt-3.5 p-3.5 rounded-xl bg-surface-2 border border-border text-xs text-text-2 font-sans leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {templates.linkedInPost}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCopy(templates.linkedInPost, 'tk-linkedin-btn', 'LinkedIn post copied!')}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {copiedKey === 'tk-linkedin-btn' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedKey === 'tk-linkedin-btn' ? 'Post Copied to Clipboard!' : 'Copy Full LinkedIn Post'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

