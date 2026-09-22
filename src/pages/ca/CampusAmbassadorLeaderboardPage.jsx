// src/pages/ca/CampusAmbassadorLeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft, Search, Filter, ShieldCheck, ArrowRight, Sparkles, Building, Calendar, Users, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchLeaderboard } from '../../services/caService';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAFooter from './components/CAFooter';

const CITIES = ['All', 'Bangalore', 'Pune', 'Chennai', 'Delhi NCR', 'Mumbai', 'Goa'];

export default function CampusAmbassadorLeaderboardPage() {
  const { currentUser, isLoggedIn } = useApp();
  const [period, setPeriod] = useState('current'); // 'current' | 'previous' | 'overall'
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myCA, setMyCA] = useState(null);
  // Fetch logged in CA's profile to identify their rank in the table
  useEffect(() => {
    if (isLoggedIn) {
      ca.me()
        .then((res) => setMyCA(res.data?.profile || null))
        .catch(() => setMyCA(null));
    } else {
      setMyCA(null);
    }
  }, [isLoggedIn]);

  // Fetch real leaderboard data from backend with debouncing
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      fetchLeaderboard({
        period,
        city: selectedCity === 'All' ? '' : selectedCity,
        search: searchQuery,
        limit: 100,
      })
        .then((res) => {
          if (!isMounted) return;
          if (res.error) {
            setError(res.error);
            setLeaderboardRows([]);
            setTotalCount(0);
          } else {
            setLeaderboardRows(res.leaderboard || []);
            setTotalCount(res.total ?? (res.leaderboard?.length || 0));
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err.message || 'Failed to load leaderboard');
          setLeaderboardRows([]);
          setLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [period, selectedCity, searchQuery]);

  return (
    <div className="font-sans min-h-screen bg-surface text-slate-900 pb-16 selection:bg-primary/15 selection:text-slate-900">
      {/* Navigation Header */}
      <CANavHeader />

      {/* Top Banner */}
      <section className="bg-gradient-to-b from-surface-2 to-white border-b border-border py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <Trophy size={14} className="text-amber-500" />
                <span>Verified Campus Standings</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">
                Campus Ambassador Leaderboard
              </h1>
              <p className="font-sans text-sm sm:text-base text-text-2 mt-2 max-w-xl">
                Real-time competitive standings of student ambassadors across campuses. Points are awarded solely for verified student signups and approved events.
              </p>
            </div>

            {/* Quick CTA to join */}
            <div className="flex items-center gap-3">
              <Link
                to="/campus-ambassador/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition active:scale-[0.98]"
              >
                <span>Join As Ambassador</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Period Toggle & Filter Controls */}
          <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-border">

            {/* Period Segmented Control */}
            <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-border self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('current')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  period === 'current'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-text-3 hover:text-text-1'
                }`}
              >
                This Month (October)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('previous')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  period === 'previous'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-text-3 hover:text-text-1'
                }`}
              >
                Previous Month
              </button>
              <button
                type="button"
                onClick={() => setPeriod('overall')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  period === 'overall'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-text-3 hover:text-text-1'
                }`}
              >
                Overall 6-Month Program
              </button>
            </div>

            {/* Search & City Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ambassador or college..."
                  className="w-full rounded-xl border border-border bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none text-xs font-medium">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCity(c)}
                    className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                      selectedCity === c
                        ? 'bg-primary text-white font-bold'
                        : 'bg-surface-2 text-text-2 hover:bg-surface-3'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Leaderboard Table */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 mt-8">
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-text-3 font-mono text-[10px] sm:text-xs uppercase">
                  <th className="py-3.5 px-4 sm:px-6 font-semibold w-16">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">Campus Ambassador</th>
                  <th className="py-3.5 px-4 font-semibold">College &amp; Campus</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Verified Users</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Approved Events</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Organizers</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {loading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={`skel-${idx}`} className="animate-pulse">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="h-7 w-8 bg-slate-100 rounded-lg" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-32 bg-slate-100 rounded mb-1" />
                        <div className="h-3 w-20 bg-slate-100/60 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-40 bg-slate-100 rounded mb-1" />
                        <div className="h-3 w-24 bg-slate-100/60 rounded" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 w-8 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="h-5 w-14 bg-slate-100 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-rose-600">
                      <AlertCircle size={32} className="mx-auto text-rose-400 mb-2" />
                      <p className="font-semibold text-sm">{error}</p>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 transition"
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    </td>
                  </tr>
                ) : leaderboardRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-text-3">
                      <Trophy size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-800 text-sm">
                        {searchQuery || selectedCity !== 'All' ? 'No ambassadors found' : 'No approved ambassadors on the leaderboard yet'}
                      </p>
                      <p className="text-xs text-text-4 mt-1 max-w-sm mx-auto">
                        {searchQuery || selectedCity !== 'All'
                          ? 'Try clearing your search query or choosing "All" cities.'
                          : 'As student ambassadors onboard clubs and refer students, verified points and live rankings will appear here.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  leaderboardRows.map((row) => {
                    const isTop1 = row.rank === 1;
                    const isTop3 = row.rank <= 3;
                    const isCurrentUser = Boolean(myCA && (myCA.caId === row.caId || (row._id && myCA._id === row._id)));

                    const rankBadge =
                      row.rank === 1
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : row.rank === 2
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : row.rank === 3
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'text-text-3 font-mono';

                    return (
                      <tr
                        key={row.caId || row._id || row.rank}
                        className={`hover:bg-surface-2/50 transition ${
                          isTop1 ? 'bg-amber-50/20' : ''
                        } ${isCurrentUser ? 'bg-indigo-50/30 font-medium' : ''}`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 sm:px-6">
                          <span
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-mono text-xs font-bold ${
                              isTop3 ? `border ${rankBadge}` : rankBadge
                            }`}
                          >
                            #{row.rank}
                          </span>
                        </td>

                        {/* Ambassador */}
                        <td className="py-4 px-4 font-heading font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{row.name}</span>
                            {isTop1 && (
                              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                🥇 Monthly Leader
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-text-4 font-normal mt-0.5">
                            ID: {row.caId}
                          </div>
                        </td>

                        {/* College & City */}
                        <td className="py-4 px-4 text-text-2">
                          <span className="font-medium text-slate-800">{row.college}</span>
                          <span className="text-text-4 ml-1.5">• {row.city}</span>
                        </td>

                        {/* Users */}
                        <td className="py-4 px-4 text-center font-mono text-text-2 font-medium">
                          {row.users}
                        </td>

                        {/* Events */}
                        <td className="py-4 px-4 text-center font-mono text-text-2 font-medium">
                          {row.events}
                        </td>

                        {/* Organizers */}
                        <td className="py-4 px-4 text-center font-mono text-text-2 font-medium">
                          {row.organizers}
                        </td>

                        {/* Total Points */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <span className="font-mono text-base font-bold text-primary">
                            {row.points} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Privacy & Scoring Rule Footnote */}
          <div className="p-4 sm:p-5 border-t border-border bg-surface-2/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-3">
            <span>Standings reflect verified user conversions, verified organizers, and approved campus events.</span>
            <span className="font-mono text-[11px] text-text-4">Personal contact data is strictly confidential.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-16">
        <CAFooter />
      </div>
    </div>
  );
}

