// src/pages/ca/components/CAPortalBaseBenefits.jsx
import React from 'react';
import { CheckCircle2, ShieldCheck, Award, FileCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function CAPortalBaseBenefits({ performance, profile }) {
  const baseBenefits = [
    { title: 'Official FestNest CA ID', status: 'Active Credential' },
    { title: 'Verified CA Profile', status: 'Active Designation' },
    { title: 'Referral Links & Tracking Code', status: 'Ready to Share' },
    { title: 'CA Community Access', status: 'Joined Network' },
    { title: 'Official CA Recognition', status: 'Verifiable on LinkedIn' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 uppercase">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Guaranteed Base Benefits</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
            Your Unlocked CA Benefits
          </h3>
          <p className="font-sans text-xs text-text-3 mt-0.5">
            These benefits belong to you as an approved FestNest Campus Ambassador with zero points required.
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          5 of 5 Core Active
        </span>
      </div>

      {/* 5 Core Base Benefits Grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {baseBenefits.map((b) => (
          <div
            key={b.title}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 border border-border/80 text-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">{b.title}</span>
            </div>
            <span className="font-mono text-[10px] text-text-3">
              {b.status}
            </span>
          </div>
        ))}

        {/* Certificate Milestone Status Card */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          performance.certificateUnlocked
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            : 'bg-surface-2/60 border-border/80 text-text-2'
        }`}>
          <div className="flex items-center gap-2">
            {performance.certificateUnlocked ? (
              <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
            ) : (
              <FileCheck size={15} className="text-text-4 shrink-0" />
            )}
            <div>
              <span className="font-semibold block text-slate-900">Program Certificate</span>
              <span className="text-[10px] font-mono text-text-3">
                {performance.certificateUnlocked
                  ? 'Unlocked (40+ pts)'
                  : `${performance.certificatePointsRemaining} pts needed (at 40 pts)`}
              </span>
            </div>
          </div>
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
            performance.certificateUnlocked
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {performance.certificateUnlocked ? 'Unlocked' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
}

