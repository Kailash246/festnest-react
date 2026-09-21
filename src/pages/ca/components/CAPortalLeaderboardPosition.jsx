// src/pages/ca/components/CAPortalLeaderboardPosition.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, ArrowRight, Award } from 'lucide-react';
import { MOCK_LEADERBOARD } from '../../../services/caService';

export default function CAPortalLeaderboardPosition({ performance, profile }) {
  // Current CA placeholder in mock is rank 7
  const currentRank = 7;
  const currentPoints = performance.totalPoints || 82;
  const nextRank = 6;
  const nextRankPoints = 84;
  const pointsGap = Math.max(1, nextRankPoints - currentPoints);

  const top10 = MOCK_LEADERBOARD.slice(0, 10);

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
            Ranked based on verified student conversions and approved campus events.
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
            {currentPoints} Points Earned
          </span>
        </div>

        {/* Next Rank Up */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <span className="text-[10px] font-mono font-bold uppercase text-text-3 block">Next Rank (#6)</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-800 mt-0.5">
            #{nextRank}
          </div>
          <span className="font-mono text-xs text-text-2 mt-1 block">
            {nextRankPoints} Points (Sneha P.)
          </span>
        </div>

        {/* Points Gap */}
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
              {top10.map((row) => {
                const isCurrent = row.rank === currentRank;
                return (
                  <tr
                    key={row.rank}
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
                      {isCurrent ? currentPoints : row.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

