// src/pages/ca/components/CAToolkitPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, MessageSquare, QrCode, FileText, ArrowRight, Share2, Layers, Sparkles } from 'lucide-react';

export default function CAToolkitPreview({ existingCA }) {
  const tools = [
    {
      icon: Link2,
      name: 'Personal Tracking Links',
      desc: 'Dedicated URLs for General Discovery, Organizer Onboarding, and Student Events.',
    },
    {
      icon: MessageSquare,
      name: 'WhatsApp Outreach Copies',
      desc: '1-click copyable messages curated for department and college batch groups.',
    },
    {
      icon: QrCode,
      name: 'Tamper-Proof QR Code',
      desc: 'Scannable badges for campus noticeboards, posters, and booth presentations.',
    },
    {
      icon: FileText,
      name: 'LinkedIn & Social Templates',
      desc: 'Professional announcement templates to share your ambassador appointment.',
    },
  ];

  return (
    <section className="py-16 bg-surface-2/40 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
              Resources &amp; Growth Assets
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              CA Outreach Toolkit
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
              Every ambassador gets ready-to-deploy assets designed to make campus outreach quick and credible.
            </p>
          </div>

          {existingCA?.status === 'approved' ? (
            <Link
              to="/ca/portal"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition shrink-0"
            >
              <span>Open CA Toolkit</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-surface-2 shadow-sm transition shrink-0"
            >
              <span>Access with CA Selection</span>
              <ArrowRight size={15} />
            </a>
          )}
        </div>

        {/* 4 Tool Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <t.icon size={20} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {t.name}
                </h3>
                <p className="font-sans text-xs text-text-2 mt-1.5 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-text-3">
                <span>Included in Portal</span>
                <Sparkles size={12} className="text-primary" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

