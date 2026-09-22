// src/pages/ca/components/CAPortalLeaderboardPosition.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, ArrowRight, Award, Crown, Sparkles } from 'lucide-react';
import { fetchLeaderboard } from '../../../services/caService';

export default function CAPortalLeaderboardPosition({ performance, profile }) {
  const [top10, setTop10] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLeaderboard({ limit: 10 })
      .then((res) => {
        if (isMounted) {
          setTop10(res.leaderboard || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTop10([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPoints = Number(performance?.totalPoints ?? profile?.totalPoints ?? 0);
  const myRowInList = top10.find((r) => (profile?.caId && r.caId === profile.caId) || (profile?._id && r._id === profile._id));
  const currentRank = performance?.rank || myRowInList?.rank || (top10.length > 0 ? top10.length + 1 : 1);

  // Find the competitor immediately above in rank
  const personAbove = currentRank > 1 ? top10.find((r) => r.rank === currentRank - 1) : null;
  const personBelow = currentRank === 1 && top10.length > 1 ? top10.find((r) => r.rank === 2) : null;

  const nextRank = currentRank > 1 ? currentRank - 1 : 1;
  const nextRankPoints = personAbove ? personAbove.points : currentPoints;
  const nextRankName = personAbove ? personAbove.name : '';
  const pointsGap = personAbove ? Math.max(1, nextRankPoints - currentPoints + (nextRankPoints === currentPoints ? 1 : 0)) : 0;
  const leadGap = personBelow ? Math.max(0, currentPoints - personBelow.points) : 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
      {/* Header & Position Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-primary uppercase">
            Standings Analysis
          </span>
          <h3 className="font-heading text-xl font-bold text-slate-900 mt-0.5">
            Your Leaderboard Position
          </h3>
          <p className="font-sans text-xs text-text-3 mt-0.5">
            Ranked dynamically based on verified student conversions and approved campus events.
          </p>
        </div>

        <Link
          to="/ca/leaderboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          <span>Open Public Leaderboard</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Rank Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Your Current Rank */}
        <div className="rounded-xl border border-primary/30 bg-indigo-50/40 p-4">
          <span className="text-[10px] font-mono font-bold uppercase text-primary block">Your Current Rank</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mt-0.5">
            #{currentRank}
          </div>
          <span className="font-mono text-xs text-indigo-900 mt-1 block">
            {currentPoints} Verified Points
          </span>
        </div>

        {/* Position Context / Next Rank Up */}
        {currentRank === 1 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 block">Position Status</span>
            <div className="font-heading text-lg sm:text-xl font-bold text-amber-900 mt-1 flex items-center gap-1.5">
              <Crown size={18} className="text-amber-600" />
              <span>Rank #1 Leader</span>
            </div>
            <span className="font-sans text-xs text-amber-800 mt-1 block">
              You are currently holding the top spot on the leaderboard!
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <span className="text-[10px] font-mono font-bold uppercase text-text-3 block">Next Rank (#{nextRank})</span>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-800 mt-0.5">
              #{nextRank}
            </div>
            <span className="font-mono text-xs text-text-2 mt-1 block truncate">
              {nextRankPoints} Points {nextRankName ? `(${nextRankName})` : ''}
            </span>
          </div>
        )}

        {/* Points Gap or Lead */}
        {currentRank === 1 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">Lead Margin</span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-700 mt-0.5">
                +{leadGap} pts lead
              </div>
            </div>
            <span className="font-sans text-xs text-emerald-900 mt-1 block">
              {personBelow ? `Leading rank #2 (${personBelow.name}) by ${leadGap} points` : 'Keep onboarding to extend your score!'}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800 block">Gap to Move Up</span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-700 mt-0.5">
                +{pointsGap} pts
              </div>
            </div>
            <span className="font-sans text-xs text-amber-900 mt-1 block">
              {pointsGap} more verified point{pointsGap > 1 ? 's' : ''} needed to climb to #{nextRank}
            </span>
          </div>
        )}
      </div>

      {/* Compact Top 10 Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-text-3 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-4 font-semibold w-14">Rank</th>
                <th className="py-2.5 px-4 font-semibold">Campus Ambassador</th>
                <th className="py-2.5 px-4 font-semibold">College</th>
                <th className="py-2.5 px-4 font-semibold text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, idx) => (
                  <tr key={`skel-top10-${idx}`} className="animate-pulse">
                    <td className="py-2.5 px-4">
                      <div className="h-4 w-6 bg-slate-100 rounded" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="h-4 w-28 bg-slate-100 rounded" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="h-4 w-36 bg-slate-100 rounded" />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="h-4 w-12 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : top10.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-3">
                    <p className="font-semibold text-slate-700 text-xs">No ambassadors on the leaderboard yet</p>
                    <p className="text-[11px] text-text-4 mt-0.5">As ambassadors earn points, rankings update in real time.</p>
                  </td>
                </tr>
              ) : (
                top10.map((row) => {
                  const isCurrent =
                    Boolean(profile?.caId && row.caId === profile.caId) ||
                    Boolean(profile?._id && row._id === profile._id) ||
                    Boolean(profile?.name && row.name === profile.name);

                  return (
                    <tr
                      key={row.caId || row._id || row.rank}
                      className={`transition ${
                        isCurrent
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'hover:bg-surface-2/60 text-text-2'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold">
                        #{row.rank}
                      </td>
                      <td className="py-2.5 px-4 font-heading text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{row.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-text-3 truncate max-w-xs">
                        {row.college}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {row.points} pts
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
