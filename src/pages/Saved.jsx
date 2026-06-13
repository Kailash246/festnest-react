import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { events as eventsApi } from '../services/api';
import { normaliseEvents } from '../services/normalise';

const SkeletonRow = () => (
  <div className="bg-white border border-border rounded-lg overflow-hidden flex mb-3">
    <div className="skeleton w-[88px] flex-shrink-0" style={{ minHeight: 96, borderRadius: 0 }} />
    <div className="p-4 flex-1 space-y-2.5">
      <div className="skeleton h-3 w-16" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-7 w-20" />
        <div className="skeleton h-7 w-16" />
      </div>
    </div>
  </div>
);

export default function Saved() {
  const navigate = useNavigate();
  const { requireAuth, isLoggedIn } = useApp();

  const [savedList, setSavedList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { requireAuth(); setLoading(false); return; }

    eventsApi.saved()
      .then(r => setSavedList(normaliseEvents(r.data.events)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleRemove = async (ev) => {
    // Optimistic remove from local list
    setSavedList(prev => prev.filter(e => e.id !== ev.id));
    try {
      await eventsApi.unsave(ev.slug || ev.id);
    } catch {
      // Revert on failure
      setSavedList(prev => [ev, ...prev]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">

      <div className="px-4 pt-5 pb-4 md:px-12 md:pt-10">
        <h2 className="font-display font-bold text-[20px] md:text-[26px] text-text-1 tracking-tight mb-1">
          Saved Events
        </h2>
        <p className="text-[14px] text-text-3">
          {loading ? 'Loading…' : savedList.length > 0
            ? `${savedList.length} event${savedList.length > 1 ? 's' : ''} saved`
            : '0 events saved'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="text-[48px] mb-3">⚠️</div>
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">Could not load saved events</div>
          <div className="text-[13px] text-text-3 mb-4">{error}</div>
          <button onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-white rounded text-[14px] font-semibold hover:bg-primary-dark transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="px-4 md:px-12">
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <AnimatePresence>
          {savedList.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 text-center px-4">
              <div className="text-[64px] mb-4">🔖</div>
              <div className="font-display font-bold text-[18px] text-text-1 mb-2">No saved events yet</div>
              <div className="text-[14px] text-text-3 mb-6">Bookmark events using the 🔖 icon on any card.</div>
              <button onClick={() => navigate('/explore')}
                className="px-6 py-3 bg-primary text-white rounded text-[14px] font-semibold
                           hover:bg-primary-dark transition-colors">
                Browse Events
              </button>
            </motion.div>
          ) : (
            <div className="px-4 md:px-12 md:max-w-[1140px] md:mx-auto md:grid md:grid-cols-2 md:gap-3.5">
              {savedList.map((ev, i) => (
                <motion.div key={ev.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18, delay: i * 0.04 }}
                  className="bg-surface border border-border rounded-lg overflow-hidden
                             flex mb-3 md:mb-0 hover:shadow-1 transition-all duration-base
                             hover:-translate-y-[2px] cursor-pointer"
                  onClick={() => navigate(`/event/${ev.id}`)}>
                  <div className={`w-[88px] flex items-center justify-center text-[32px] flex-shrink-0 ${ev.bg}`}>
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
                      : ev.emoji}
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <div className="text-[10px] font-bold tracking-wider uppercase text-primary mb-1">{ev.category}</div>
                    <div className="font-display font-bold text-[15px] text-text-1 tracking-snug mb-1 leading-snug">{ev.name}</div>
                    <div className="text-[12px] text-text-3 mb-3">{ev.college} · {ev.startDate}</div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); navigate(`/event/${ev.id}`); }}
                        className="px-3 py-[5px] bg-primary text-white rounded text-[12px] font-semibold
                                   hover:bg-primary-dark transition-colors">
                        View Details
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleRemove(ev); }}
                        className="px-3 py-[5px] border border-border-strong rounded text-[12px] font-medium
                                   text-text-2 hover:border-red hover:text-red transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
