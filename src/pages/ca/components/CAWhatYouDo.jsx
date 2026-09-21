// src/pages/ca/components/CAWhatYouDo.jsx
import React from 'react';
import { Users, Calendar, Megaphone, TrendingUp } from 'lucide-react';

export default function CAWhatYouDo() {
  const pillars = [
    {
      icon: Users,
      title: 'Bring Students',
      desc: 'Share FestNest with classmates and student groups to help them discover verified hackathons, workshops, and competitions.',
      tag: 'Acquisition',
    },
    {
      icon: Calendar,
      title: 'Source Events',
      desc: 'Spot upcoming department symposiums, college fests, and hackathons on your campus and bring them to FestNest.',
      tag: 'Event Discovery',
    },
    {
      icon: Megaphone,
      title: 'Connect Organizers',
      desc: 'Introduce campus clubs, student chapters, E-Cells, and fest convenors to our zero-friction event publishing studio.',
      tag: 'Partnerships',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Campus',
      desc: 'Lead the event discovery movement at your college and establish your campus as an active hub for inter-college events.',
      tag: 'Influence',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Responsibilities &amp; Impact
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            What you'll actually do
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            Practical leadership on the ground — connecting students, organizers, and campus culture.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-surface-2/40 p-6 hover:bg-white hover:shadow-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <p.icon size={20} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-border text-text-3">
                    {p.tag}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900">
                  {p.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-text-2 mt-2 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-primary font-medium">
                Core CA Responsibility
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

