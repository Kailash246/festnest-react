import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ── Icons ── */
const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 13, height: 13 }}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

/* ── Prize helpers ── */
function formatPrize(val) {
  if (!val) return null;
  const stripped = String(val).replace(/,/g, '').replace(/^₹/, '').trim();
  const num = Number(stripped);
  if (!isNaN(num) && num > 0) return '₹' + num.toLocaleString('en-IN');
  return val.startsWith('₹') ? val : `₹${val}`;
}

function getPrizeAmount(event) {
  if (event.totalPrize) return formatPrize(event.totalPrize);
  if (event.prize1)     return formatPrize(event.prize1);
  const raw = event.badgeText || '';
  const main = raw.split('|')[0].replace(/🏆\s*/g, '').replace(/\s*(Total\s+)?Prize(\s+Pool)?$/i, '').trim();
  return main && main !== '—' ? main : null;
}

const PrizeBadge = ({ amount }) => (
  <motion.span
    whileHover={{ scale: 1.04 }}
    transition={{ duration: 0.15 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      background: 'linear-gradient(135deg, #FEF9C3 0%, #FDE68A 100%)',
      color: '#78350F',
      border: '1px solid #FCD34D',
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    <Trophy size={8} strokeWidth={2.5} style={{ verticalAlign: 'middle' }} />{amount}
  </motion.span>
);

/* ── Main EventCard ── */
export default function EventCard({ event, onDelete }) {
  const navigate   = useNavigate();
  const { savedEvents, toggleSave, showToast, isSuperAdmin } = useApp();
  const isSaved    = savedEvents.has(event.id);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const hasPrize   = event.entryType === 'prize' || event.badgeClass === 'badge-prize';
  const prizeAmount = hasPrize ? getPrizeAmount(event) : null;

  const goDetail   = (e) => { e?.stopPropagation(); navigate(`/event/${event.id}`); };
  const handleSave  = (e) => { e.stopPropagation(); toggleSave(event.id); };
  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/event/${event.id}`;
    if (navigator.share) {
      navigator.share({ title: event.name, text: `Check out ${event.name} at ${event.college}!`, url })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
      showToast('Event link copied! 📋', 'success');
    }
  };

  const handleDeleteClick = (e) => { e.stopPropagation(); setShowConfirm(true); };
  const handleDeleteConfirm = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(event._id);
    } catch (err) {
      showToast(err.message || 'Delete failed. Try again.', 'error');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={goDetail}
      tabIndex={0}
      role="listitem"
      aria-label={`${event.name} at ${event.college}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && goDetail()}
      style={{
        background: '#fff',
        border: '1px solid #E4E4E0',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >

      {/* ── IMAGE AREA — 16:9 ── */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', flexShrink: 0 }}>
        <div
          className={event.bg}
          style={{ position: 'absolute', inset: 0,
                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <motion.span
              whileHover={{ scale: 1.12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ fontSize: 62, lineHeight: 1, userSelect: 'none', display: 'block' }}
            >
              {event.emoji}
            </motion.span>
          )}

          {/* Category badge — top left */}
          <span style={{
            position: 'absolute', top: 12, left: 12,
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            borderRadius: 999,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}>
            {event.category}
          </span>

          {/* Share + Bookmark — top right */}
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleShare}
              aria-label="Share event"
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.90)',
                border: '1px solid rgba(0,0,0,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#555',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              <ShareIcon />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save'}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: isSaved ? '#EEF2FF' : 'rgba(255,255,255,0.90)',
                border: isSaved ? '1.5px solid #C7D2FE' : '1px solid rgba(0,0,0,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isSaved ? '#4F46E5' : '#555',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              <BookmarkIcon filled={isSaved} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── CARD BODY (30%) ── */}
      <div style={{ padding: '12px 14px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* 1. Event name */}
        <h3 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 15, fontWeight: 700, color: '#111110',
          letterSpacing: '-0.02em', lineHeight: 1.25,
          marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {event.name}
        </h3>

        {/* 2. Location — college + city, once */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: '#8A8A85', marginBottom: 6,
        }}>
          <PinIcon />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.college}, {event.city}
          </span>
        </div>

        {/* 3. Date + deadline (no city) · prize badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#8A8A85' }}>
            <CalIcon />
            <span style={{ color: '#4B4B47', fontWeight: 500 }}>{event.startDate}</span>
            {event.deadlineDays > 0 && event.deadlineDays <= 6 && (
              <>
                <span style={{ color: '#CBCBC6' }}>·</span>
                <span style={{
                  color: event.deadlineDays <= 2 ? '#DC2626' : '#B45309',
                  fontWeight: 700, fontSize: 11,
                }}>
                  {event.deadlineDays === 1 ? 'Last day!' : `${event.deadlineDays}d left`}
                </span>
              </>
            )}
          </div>
          {hasPrize && prizeAmount && <PrizeBadge amount={prizeAmount} />}
        </div>

        {/* Bottom row: superadmin delete (left) + View Details (right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 8 }}>
          {isSuperAdmin && onDelete && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleDeleteClick}
              aria-label="Delete event permanently"
              style={{
                marginRight: 'auto',
                width: 26, height: 26, borderRadius: 7,
                border: '1.5px solid #FECACA',
                background: '#FEF2F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#DC2626', cursor: 'pointer',
              }}
            >
              <TrashIcon />
            </motion.button>
          )}
          <motion.span
            whileHover={{ x: 2 }}
            transition={{ duration: 0.12 }}
            onClick={goDetail}
            style={{
              fontSize: 12, fontWeight: 600, color: '#4F46E5',
              display: 'flex', alignItems: 'center', gap: 2,
              cursor: 'pointer',
            }}
          >
            View Details ›
          </motion.span>
        </div>
      </div>

      {/* ── Delete confirmation modal (portal) ── */}
      {createPortal(
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              key="delete-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => !deleting && setShowConfirm(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.50)',
                zIndex: 1200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 16px',
              }}
            >
              <motion.div
                key="delete-modal"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '28px 24px 24px',
                  maxWidth: 360,
                  width: '100%',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <Trash2 size={42} strokeWidth={1.5} style={{ color: '#DC2626' }} />
                </div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18, fontWeight: 700, color: '#111110',
                  textAlign: 'center', marginBottom: 10,
                }}>
                  Permanently Delete?
                </h3>
                <p style={{
                  fontSize: 13, color: '#6B7280',
                  textAlign: 'center', lineHeight: 1.55, marginBottom: 22,
                }}>
                  <strong style={{ color: '#111110' }}>{event.name}</strong> will be removed for all users and cannot be recovered.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setShowConfirm(false); }}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '10px 0',
                      border: '1.5px solid #E4E4E0', borderRadius: 10,
                      fontSize: 14, fontWeight: 600,
                      color: '#6B7280', background: '#fff',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '10px 0',
                      border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      color: '#fff',
                      background: deleting ? '#FCA5A5' : '#DC2626',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Delete Forever'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.article>
  );
}
