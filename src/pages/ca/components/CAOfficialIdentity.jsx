// src/pages/ca/components/CAOfficialIdentity.jsx
import React from 'react';
import { ShieldCheck, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

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

export default function CAOfficialIdentity() {
  return (
    <section className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">

          {/* Left Explanatory Content */}
          <div className="lg:col-span-7">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
              Ambassador Credential
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Your official FestNest identity
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-2 mt-3 leading-relaxed">
              Every selected CA receives a verified FestNest Campus Ambassador identity linked to their ambassador profile. It establishes your authenticity when connecting with campus heads, clubs, and college convenors.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-text-2">
                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 font-semibold">Unique Ambassador Number:</strong> Official tracking ID verifiable by organizers and students.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-text-2">
                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 font-semibold">Instant Digital Download:</strong> High-resolution PNG format ready for social profiles and LinkedIn.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-text-2">
                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                <span><strong className="text-slate-900 font-semibold">Base Benefit:</strong> Granted directly to all approved CAs during onboarding with no point requirements.</span>
              </div>
            </div>
          </div>

          {/* Right Card Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-[#8456B6] p-[1.5px] shadow-xl">
              <div className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-base font-bold tracking-tight text-primary">FestNest</span>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary font-mono">
                    OFFICIAL AMBASSADOR
                  </span>
                </div>

                <div className="mt-5 flex gap-3.5 items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-primary font-bold text-lg font-heading">
                    AS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading text-lg font-bold text-slate-900 truncate">
                      Aditi Sharma
                    </span>
                    <span className="font-sans text-xs text-text-3 truncate mt-0.5">
                      RV College of Engineering, Bangalore
                    </span>
                    <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-700">
                      VERIFIED CA
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <div className="font-mono text-[9px] font-semibold tracking-wider text-text-3">AMBASSADOR ID</div>
                    <div className="font-mono text-sm font-bold text-slate-900">FN-CA-BLR-014</div>
                    <div className="font-mono mt-2 text-[9px] font-semibold tracking-wider text-text-3">VALID THRU</div>
                    <div className="font-mono text-xs font-medium text-slate-600">09 / 2028</div>
                  </div>
                  <QRMark size={64} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

