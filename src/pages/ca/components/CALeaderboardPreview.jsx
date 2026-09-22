// src/pages/ca/components/CALeaderboardPreview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { fetchLeaderboard } from '../../../services/caService';

export default function CALeaderboardPreview() {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLeaderboard({ limit: 5 })
      .then((res) => {
        if (isMounted) {
          setTopPerformers(res.leaderboard || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTopPerformers([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-surface-2/30 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
              Public Leaderboard Preview
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Who's leading this month?
            </h2>
            <p className="font-sans text-sm text-text-2 mt-1">
              Top campus ambassadors ranked strictly on verified student and organizer impact.
            </p>
          </div>

          <Link
            to="/ca/leaderboard"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition shrink-0"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Top 5 Table / Card List */}
        <div className="mt-8 rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-text-3 font-mono text-[10px] sm:text-xs uppercase">
                  <th className="py-3 px-4 sm:px-6 font-semibold w-16">Rank</th>
                  <th className="py-3 px-4 font-semibold">Campus Ambassador</th>
                  <th className="py-3 px-4 font-semibold">College &amp; City</th>
                  <th className="py-3 px-4 font-semibold text-center">Verified Users</th>
                  <th className="py-3 px-4 font-semibold text-center">Approved Events</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(4)].map((_, idx) => (
                    <tr key={`skel-prev-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="h-6 w-6 bg-slate-100 rounded-lg" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-28 bg-slate-100 rounded mb-1" />
                        <div className="h-3 w-16 bg-slate-100/60 rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 w-36 bg-slate-100 rounded mb-1" />
                        <div className="h-3 w-20 bg-slate-100/60 rounded" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-4 w-6 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-4 w-6 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : topPerformers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-text-3">
                      <Trophy size={28} className="mx-auto text-amber-400 mb-1.5" />
                      <p className="font-semibold text-slate-800 text-xs">Live leaderboard rankings</p>
                      <p className="text-[11px] text-text-4 mt-0.5">Approved campus ambassadors with verified points will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  topPerformers.map((ca) => {
                    const isTop3 = ca.rank <= 3;
                    const rankBadge =
                      ca.rank === 1
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : ca.rank === 2
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : ca.rank === 3
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'text-text-3 font-mono';

                    return (
                      <tr
                        key={ca.caId || ca._id || ca.rank}
                        className={`hover:bg-surface-2/50 transition ${
                          ca.rank === 1 ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <span
                            className={`inline-flex items-center justify-center h-7 w-7 rounded-xl font-mono text-xs font-bold ${
                              isTop3 ? `border ${rankBadge}` : rankBadge
                            }`}
                          >
                            #{ca.rank}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-heading font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{ca.name}</span>
                            {ca.rank === 1 && (
                              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Leader
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-text-4 font-normal mt-0.5">
                            ID: {ca.caId}
                          </div>
                        </td>

                        {/* College & City */}
                        <td className="py-3.5 px-4 text-text-2">
                          <span>{ca.college}</span>
                          <span className="text-text-4 ml-1.5">• {ca.city}</span>
                        </td>

                        {/* Users */}
                        <td className="py-3.5 px-4 text-center font-mono text-text-2">
                          {ca.users}
                        </td>

                        {/* Events */}
                        <td className="py-3.5 px-4 text-center font-mono text-text-2">
                          {ca.events}
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <span className="font-mono text-sm sm:text-base font-bold text-primary">
                            {ca.points} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Callout */}
          <div className="p-4 border-t border-border bg-surface-2/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-3">
            <span>Points reflect verified student conversions and approved campus events.</span>
            <Link
              to="/ca/leaderboard"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Campuses</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
