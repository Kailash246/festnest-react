// src/pages/organizer/tabs/TipsTab.jsx
import React, { useState } from 'react';
import {
  Camera,
  Target,
  Clock,
  Trophy,
  Link2,
  ClipboardList,
  PenLine,
  Phone,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
  Plus,
  Compass,
} from 'lucide-react';

const TIPS_DATA = [
  {
    category: 'Visibility & Discovery',
    items: [
      {
        Icon: Camera,
        title: 'Upload a high-contrast poster',
        body: 'Events with a crisp, 1200×630px banner get 3.2× more clicks. Include event date, prize pool, and college logo clearly.',
      },
      {
        Icon: Target,
        title: 'Choose the exact category',
        body: 'Students filter heavily by category. Tagging "Hackathon" vs "Competition" reaches completely different target participant pools.',
      },
      {
        Icon: Clock,
        title: 'Submit 3+ weeks early',
        body: 'Early submissions get featured in FestNest "Upcoming This Month" digests and trigger automated deadline reminder push alerts.',
      },
    ],
  },
  {
    category: 'Maximizing Registrations',
    items: [
      {
        Icon: Trophy,
        title: 'Specify exact prize distributions',
        body: 'Clear breakdown (e.g. ₹25,000 for 1st, ₹15,000 for 2nd) converts 2.1× higher than vague phrases like "attractive cash prizes".',
      },
      {
        Icon: Link2,
        title: 'Provide a direct 1-click registration URL',
        body: 'Link directly to your Google Form, Unstop, or Devfolio form. Avoid sending participants to Instagram bios or homepages.',
      },
      {
        Icon: ClipboardList,
        title: 'Clarify eligibility & team rules',
        body: 'State who can participate upfront (year, department, inter-college allowed). Eliminating doubt boosts form completions.',
      },
    ],
  },
  {
    category: 'Trust & Communications',
    items: [
      {
        Icon: PenLine,
        title: 'Write a hook in the first 2 lines',
        body: 'Students skim descriptions. State what participants will build, experience, or gain within the opening sentence.',
      },
      {
        Icon: Phone,
        title: 'Provide a working POC phone / WhatsApp',
        body: 'Questions before registration are common. A visible student coordinator phone number reduces bounce rates.',
      },
      {
        Icon: FileText,
        title: 'Create individual sub-competition tracks',
        body: 'If your fest has multiple events (dance, coding, quiz), add them as separate tracks so students can register for their favorite.',
      },
    ],
  },
];

const INITIAL_CHECKLIST = [
  { id: 'banner', label: '1200×630px high-resolution banner uploaded', checked: true },
  { id: 'prizes', label: 'Cash prizes and certificates detailed clearly', checked: true },
  { id: 'poc', label: 'Student coordinator phone and email verified', checked: false },
  { id: 'tracks', label: 'Individual sub-events / competitions added as tracks', checked: false },
  { id: 'rules', label: 'Rules, scoring criteria, and schedule published', checked: false },
  { id: 'link', label: 'Direct 1-click registration link tested and working', checked: false },
];

export default function TipsTab({ navigate }) {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const toggleItem = (id) => {
    setChecklist(items =>
      items.map(it => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const completedCount = checklist.filter(c => c.checked).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-7 text-white shadow-md">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 rounded-full bg-white/10 pointer-events-none blur-lg" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles size={16} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Organizer Growth Playbook
              </span>
            </div>
            <h2 className="font-heading text-[22px] sm:text-[24px] font-bold tracking-tight">
              How to Host a 10/10 College Event
            </h2>
            <p className="text-white/80 text-[13px] mt-1 max-w-lg leading-relaxed">
              Proven recommendations from top college organizers on FestNest to maximize attendee reach and participation.
            </p>
          </div>

          <button
            onClick={() => navigate('/host')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-orange-700 rounded-xl font-bold text-[13px] shadow-sm hover:bg-slate-50 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            Post An Event
          </button>
        </div>
      </div>

      {/* ── Event Readiness Checklist ── */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-[16px] text-text-1">Event Readiness Checklist</h3>
            <p className="text-[12px] text-text-3">Check off each item before publishing or sharing your event</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[12px] font-bold text-text-2 font-mono">
              {completedCount} of {checklist.length} ({progressPercent}%)
            </span>
            <div className="w-24 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {checklist.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                item.checked
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-surface-1 border-border text-text-2 hover:bg-surface-2'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {item.checked ? (
                  <CheckSquare size={16} className="text-emerald-600" />
                ) : (
                  <Square size={16} className="text-text-4" />
                )}
              </div>
              <span className={`text-[12px] font-medium leading-snug ${item.checked ? 'line-through text-text-3' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Playbook Pillars ── */}
      <div className="space-y-6">
        {TIPS_DATA.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-heading font-bold text-[14px] uppercase tracking-wider text-text-3">
                {section.category}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.items.map(tip => {
                const Icon = tip.Icon;
                return (
                  <div
                    key={tip.title}
                    className="bg-white border border-border rounded-2xl p-4 shadow-xs hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3">
                        <Icon size={18} strokeWidth={2} />
                      </div>
                      <h4 className="font-heading font-bold text-[14px] text-text-1 mb-1 leading-snug">
                        {tip.title}
                      </h4>
                      <p className="text-[12px] text-text-3 leading-relaxed">
                        {tip.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

