// src/pages/ca/components/CAActivityLedger.jsx
import React, { useState } from 'react';
import { Award, Building, Calendar, Users, CheckCircle2, Clock, XCircle, Filter, Copy } from 'lucide-react';

export default function CAActivityLedger({
  impactLogs = [],
  impactTotal = 0,
  impactLoading = false,
  referralCode = '',
  onCopyLink,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'student' | 'organizer' | 'event'

  const filtered = impactLogs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const studentCount = impactLogs.filter((l) => l.type === 'student').length;
  const organizerCount = impactLogs.filter((l) => l.type === 'organizer').length;
  const eventCount = impactLogs.filter((l) => l.type === 'event').length;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
      {/* Ledger Header & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award size={20} className="text-primary" />
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Verified Activity &amp; Points Ledger
            </h2>
          </div>
          <p className="font-sans text-xs text-text-3 mt-1">
            Transparent breakdown of points earned from code <span className="font-mono font-bold text-slate-800">{referralCode}</span>.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-border text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-lg transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-text-3 hover:text-slate-900'
            }`}
          >
            <span>All ({impactTotal})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('student')}
            className={`shrink-0 px-3 py-1.5 rounded-lg transition ${
              filter === 'student'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-text-3 hover:text-slate-900'
            }`}
          >
            <span>Students ({studentCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('organizer')}
            className={`shrink-0 px-3 py-1.5 rounded-lg transition ${
              filter === 'organizer'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-text-3 hover:text-slate-900'
            }`}
          >
            <span>Organizers ({organizerCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('event')}
            className={`shrink-0 px-3 py-1.5 rounded-lg transition ${
              filter === 'event'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-text-3 hover:text-slate-900'
            }`}
          >
            <span>Events ({eventCount})</span>
          </button>
        </div>
      </div>

      {/* Point Rules Reminder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-surface-2/60 border border-border/80 flex items-center justify-between">
          <span className="font-semibold text-slate-800">+1 Point / User</span>
          <span className="font-mono text-[11px] text-text-3">Student Signup</span>
        </div>
        <div className="p-3 rounded-xl bg-surface-2/60 border border-border/80 flex items-center justify-between">
          <span className="font-semibold text-slate-800">+5 Points / Organizer</span>
          <span className="font-mono text-[11px] text-text-3">Club Verified</span>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
          <span className="font-semibold text-indigo-900">10 Points TOTAL</span>
          <span className="font-mono text-[11px] text-indigo-700">Org + 1st Event</span>
        </div>
      </div>

      {/* Activity Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center border-2 border-dashed border-border rounded-2xl p-6">
          <Users size={32} className="mx-auto text-slate-300 mb-2.5" />
          <h3 className="font-heading text-sm font-bold text-slate-700">No activity records found</h3>
          <p className="font-sans text-xs text-text-3 mt-1 max-w-sm mx-auto">
            Share your personal referral link with students or club heads. As they join, your points ledger updates here in real time.
          </p>
          <button
            type="button"
            onClick={onCopyLink}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
          >
            <Copy size={13} />
            <span>Copy Referral Link</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-text-3 font-mono text-[10px] uppercase">
                <th className="py-3 px-4 font-semibold">Entity / Action</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Points</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log, idx) => {
                const isOrg = log.type === 'organizer';
                const isEvent = log.type === 'event';
                const isStudent = log.type === 'student';

                const pointText = isEvent ? '+10 pts total' : isOrg ? '+5 pts' : '+1 pt';
                const badgeColor = isOrg
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : isEvent
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <tr key={log._id || idx} className="hover:bg-surface-2/60 transition">
                    <td className="py-3.5 px-4 font-heading font-semibold text-slate-900 flex items-center gap-2">
                      {isOrg && <Building size={14} className="text-purple-600 shrink-0" />}
                      {isEvent && <Calendar size={14} className="text-indigo-600 shrink-0" />}
                      {isStudent && <Users size={14} className="text-blue-600 shrink-0" />}
                      <span className="truncate max-w-xs">{log.label || 'FestNest Member'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border ${badgeColor}`}>
                        {log.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {pointText}
                    </td>

                    <td className="py-3.5 px-4 text-text-3 font-mono text-[11px]">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-mono text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

