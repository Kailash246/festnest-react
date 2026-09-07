// src/pages/admin/tabs/FeaturedTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Medal, Lock, ExternalLink, Trash2,
  Sparkles, Lightbulb, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { admin, events as eventsApi } from '../../../services/api';
import { normaliseEvents } from '../../../services/normalise';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const RANK_MEDAL_COLORS = [
  'text-amber-500 bg-amber-50 border-amber-200', // Gold
  'text-slate-400 bg-slate-50 border-slate-200',  // Silver
  'text-amber-700 bg-orange-50 border-orange-200', // Bronze
];
const ordinal = n => ORDINALS[n - 1] || `${n}th`;

export default function FeaturedTab({ showToast }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const loadFeatured = useCallback(() => {
    setLoading(true);
    eventsApi.featured()
      .then(r => {
        const evs = normaliseEvents(r.data?.events || []);
        evs.sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
        setItems(evs);
      })
      .catch(e => showToast?.(e.message || 'Failed to fetch featured events', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (isSuperAdmin) loadFeatured();
  }, [isSuperAdmin, loadFeatured]);

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Super Admin Access Required</h3>
        <p className="text-xs text-neutral-500 mt-1">
          Only platform super administrators have permissions to arrange featured placement and hero algorithms.
        </p>
      </div>
    );
  }

  const changePosition = async (eventId, newRank) => {
    const moving = items.find(ev => ev._id === eventId);
    const without = items.filter(ev => ev._id !== eventId);
    without.splice(newRank - 1, 0, moving);
    setActionId(eventId + '-pos');
    try {
      await Promise.all(without.map((ev, i) => admin.featureEvent(ev._id, true, i + 1)));
      showToast?.('Priority positions updated successfully!', 'success');
      loadFeatured();
    } catch (e) {
      showToast?.(e.message || 'Failed to update priority', 'error');
    } finally {
      setActionId('');
    }
  };

  const removeFromFeatured = async (eventId) => {
    setActionId(eventId + '-remove');
    try {
      await admin.featureEvent(eventId, false);
      showToast?.('Event removed from Featured tier', 'info');
      loadFeatured();
    } catch (e) {
      showToast?.(e.message || 'Failed to remove from featured', 'error');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
            <h3 className="text-sm font-bold text-neutral-900">Featured Priority Hierarchy</h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Top ranked events are given 1st priority on the explore hero carousel, student search feeds, and weekly email roundups.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-700 whitespace-nowrap">
          {items.length} / 6 Featured slots filled
        </span>
      </div>

      {/* Featured list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Loading featured events...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <Star className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No Featured Events</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            You can feature live events directly from the "Events" tab or by checking "Mark as Featured" when approving a submission.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ev, idx) => {
            const rank = idx + 1;
            const isActing = actionId.startsWith(ev._id);
            const medalStyle = RANK_MEDAL_COLORS[idx] || 'text-neutral-500 bg-neutral-100 border-neutral-200';

            return (
              <div
                key={ev._id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Position Badge / Medal */}
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${medalStyle}`}>
                    {idx < 3 ? <Medal className="w-5 h-5" /> : `${rank}`}
                  </div>

                  {/* Thumbnail / Emoji */}
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden border border-neutral-200/60">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      ev.emoji || '🎉'
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900 truncate">{ev.name}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                        {ordinal(rank)} Position
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5 truncate">
                      {ev.college}{ev.city ? `, ${ev.city}` : ''} · <span className="font-medium text-indigo-600">{ev.category}</span>
                    </div>
                  </div>
                </div>

                {/* Rank Selector & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="relative">
                    <select
                      value={rank}
                      disabled={isActing || items.length <= 1}
                      onChange={e => changePosition(ev._id, Number(e.target.value))}
                      className="text-xs font-semibold px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                    >
                      {items.map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Rank #{i + 1} ({ordinal(i + 1)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/event/${ev.slug || ev.id}`)}
                    className="p-1.5 rounded-xl text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 transition"
                    title="View public event"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFromFeatured(ev._id)}
                    disabled={isActing}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Hint */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
        <Lightbulb className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">Algorithmic Placement:</span> 1st, 2nd, and 3rd positions receive prominent visual badges and headline placement across the FestNest student application.
        </div>
      </div>
    </div>
  );
}

