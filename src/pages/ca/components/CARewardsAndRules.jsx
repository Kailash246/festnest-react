// src/pages/ca/components/CARewardsAndRules.jsx
import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, Trophy, Clock, AlertCircle } from 'lucide-react';
import { getRewardHistory } from '../../../services/caService';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CARewardsAndRules({ performance, profile }) {
  const payoutHistory = getRewardHistory(performance);

  return (
    <div className="space-y-6">

      {/* Payout Status & Reward History UI */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-600" />
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Reward Payout History
              </h2>
            </div>
            <p className="font-sans text-xs text-text-3 mt-0.5">
              Track your eligibility status and distributed cash payouts across program cycles.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-surface-2 border border-border text-text-2 self-start sm:self-auto">
            Cycle Status: Active
          </span>
        </div>

        {/* Payout Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-text-3 font-mono text-[10px] uppercase">
                <th className="py-3 px-4 font-semibold">Program Cycle</th>
                <th className="py-3 px-4 font-semibold">Award / Tier</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Evaluation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payoutHistory.map((item, idx) => {
                const isPaid = item.status === 'Paid';
                const isEligible = item.status === 'Eligible';
                const isPending = item.status === 'Pending' || item.status === 'Pending Requirements';

                const statusColor = isPaid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isEligible
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : isPending
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-surface-2 text-text-3 border-border';

                return (
                  <tr key={idx} className="hover:bg-surface-2/60 transition">
                    <td className="py-3.5 px-4 font-heading font-semibold text-slate-900">
                      {item.period}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.award}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-text-3 text-[11px]">
                      {item.payoutDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-text-3 font-mono">
          * Cash payouts are processed via direct bank transfer to verified account details upon cycle audit.
        </p>
      </div>

      {/* Program Rules Handbook */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <BookOpen size={20} className="text-primary" />
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Ambassador Program Rules &amp; Policies
            </h2>
            <p className="font-sans text-xs text-text-3 mt-0.5">
              Official guidelines governing verified points, payout eligibility, and fair attribution.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1.5">
            <h4 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>1. Base Benefits vs. Performance Rewards</span>
            </h4>
            <p className="font-sans text-text-2 leading-relaxed">
              Every approved Campus Ambassador receives the official CA ID, verified profile, referral code, portal access, and community support immediately upon selection. Cash rewards are performance-based and require meeting all 4 eligibility criteria.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1.5">
            <h4 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>2. Only Verified Conversions Count</span>
            </h4>
            <p className="font-sans text-text-2 leading-relaxed">
              A student registration must be verified before +1 point is awarded. An organizer must be verified for +5 points, and their first approved event upgrades the conversion to 10 points total.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1.5">
            <h4 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>3. Minimum Eligibility Threshold</span>
            </h4>
            <p className="font-sans text-text-2 leading-relaxed">
              To be eligible for monthly and final cash reward payouts, an ambassador must achieve: 100+ Points, 40+ Verified Users, 2+ Approved Events, and 1+ Verified Organizer.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-1.5">
            <h4 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-600" />
              <span>4. Anti-Fraud &amp; Disqualification Policy</span>
            </h4>
            <p className="font-sans text-text-2 leading-relaxed">
              Self-referrals, fake student accounts, or illegitimate event submissions are strictly monitored by automated fraud filters. Any fraudulent conversions result in immediate disqualification and revocation of CA credentials.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

