import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const getInitials = (name) =>
  name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const ROLE_LABEL = { user: 'Student', organizer: 'Organizer', admin: 'Admin', superadmin: 'Super Admin' };
import {
  House, Compass, Bell, Bookmark, GraduationCap, User, PlusCircle,
  Code2, Music4, Wrench, Trophy, LogOut,
  Info, HelpCircle, ClipboardList, ShieldCheck, MessageCircle,
} from 'lucide-react';

const Lbl = ({ c }) => (
  <div className="text-[10px] font-bold tracking-wider text-[#AEAEAD] uppercase px-3 pt-4 pb-1.5">
    {c}
  </div>
);
const Div = () => <div className="h-px bg-[#F1F0ED] mx-3 my-1" />;

const Btn = ({ Icon: BtnIcon, label, badge, badgeStyle, onClick, accent }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl
                text-[14px] font-medium transition-colors duration-150
                ${accent
                  ? 'text-primary bg-primary-xlight'
                  : 'text-[#4B4B47] hover:bg-[#F1F0ED] hover:text-[#111110]'}`}
  >
    <span className="flex-shrink-0 w-5 flex items-center justify-center">
      {BtnIcon && <BtnIcon size={18} strokeWidth={1.8} />}
    </span>
    <span className="flex-1">{label}</span>
    {badge !== undefined && (
      <span className={`text-[10px] font-bold px-2 py-[2px] rounded-full flex-shrink-0
                        ${badgeStyle || 'bg-primary-light text-primary border border-[#C7D2FE]'}`}>
        {badge}
      </span>
    )}
  </button>
);

export default function MobileDrawer() {
  const { drawerOpen, setDrawerOpen, savedCount, requireAuth, isLoggedIn, isAdmin, isOrganizer, isSuperAdmin, logout, currentUser, unreadNotifCount } = useApp();
  const [avatarImgError, setAvatarImgError] = useState(false);
  const initials   = currentUser?.avatar?.initials || getInitials(currentUser?.name);
  const avatarUrl  = !avatarImgError && currentUser?.avatar?.url;
  const roleLabel  = ROLE_LABEL[currentUser?.role] || 'Member';
  const subText    = currentUser?.college ? `${currentUser.college} · ${roleLabel}` : roleLabel;
  const navigate = useNavigate();

  const go = (path) => {
    setDrawerOpen(false);
    setTimeout(() => navigate(path), 60);
  };

  const goProtected = (path) => {
    setDrawerOpen(false);
    setTimeout(() => {
      if (!requireAuth()) return;
      navigate(path);
    }, 60);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/45 z-[60]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[61]
                       w-[min(300px,82vw)] bg-white flex flex-col
                       shadow-[-4px_0_32px_rgba(0,0,0,0.15)]"
            role="dialog" aria-label="Menu" aria-modal="true"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-[#E4E4E0]">
              {/* Logo row */}
              <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
                <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 14 14" fill="none" className="w-[18px] h-[18px]">
                    <path d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c.83 0 1.5.67 1.5 1.5S7.83 7 7 7s-1.5-.67-1.5-1.5S6.17 4 7 4zm0 7.2c-1.25 0-2.35-.63-3-1.58.02-.98 2-.98 3-.98s2.98.01 3 .98c-.65.95-1.75 1.58-3 1.58z" fill="white"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-[20px] text-primary tracking-[-0.4px]">FestNest</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center
                             bg-[#F1F0ED] text-[#8A8A85] hover:bg-[#E4E4E0] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="w-4 h-4">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* User strip */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3 px-4 py-3 pb-4 bg-primary-xlight border-t border-[#E4E4E0]">
                  <div className="w-10 h-10 rounded-full bg-primary-light border-2 border-primary
                                  flex items-center justify-center overflow-hidden font-display font-bold
                                  text-[13px] text-primary flex-shrink-0">
                    {avatarUrl
                      ? <img src={avatarUrl} alt={initials}
                             className="w-full h-full object-cover"
                             onError={() => setAvatarImgError(true)} />
                      : initials
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#111110] truncate">
                      {currentUser?.name || 'FestNest User'}
                    </div>
                    <div className="text-[12px] text-[#8A8A85] truncate">{subText}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 pb-4 border-t border-[#E4E4E0]">
                  <div className="flex-1 text-[13px] text-[#8A8A85]">Sign in to save & track events</div>
                  <button
                    onClick={() => { setDrawerOpen(false); setTimeout(() => requireAuth(), 80); }}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-[13px]
                               font-semibold hover:bg-primary-dark transition-colors flex-shrink-0"
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto py-2 px-2"
                 style={{ WebkitOverflowScrolling: 'touch' }}>
              <Lbl c="Navigate" />
              <Btn onClick={() => go('/home')}           Icon={House}         label="Home" />
              <Btn onClick={() => go('/explore')}       Icon={Compass}       label="Explore Events" />
              <Btn onClick={() => go('/notifications')} Icon={Bell}          label="Notifications"
                badge={unreadNotifCount > 0 ? unreadNotifCount : undefined}
                badgeStyle="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]" />
              <Btn onClick={() => goProtected('/saved')}   Icon={Bookmark}   label="Saved Events"
                badge={savedCount > 0 ? savedCount : undefined} />
              <Btn onClick={() => go('/college')}       Icon={GraduationCap} label="My College" />
              <Btn onClick={() => goProtected('/profile')} Icon={User}       label="My Profile" />

              {/* Organizer-only — placed right after Profile */}
              {(isOrganizer || isSuperAdmin) && (
                <>
                  <Div />
                  <Lbl c="Organizer" />
                  <Btn onClick={() => goProtected('/organizer')} Icon={ClipboardList} label="Organizer Dashboard" accent />
                  <Btn onClick={() => goProtected('/host')}      Icon={PlusCircle}    label="Host an Event" />
                </>
              )}

              <Div />
              <Lbl c="Browse by Type" />
              {[
                { label: 'Hackathons',     cat: 'Hackathon',    badge: '42', Icon: Code2 },
                { label: 'Cultural Fests', cat: 'Cultural+Fest', badge: '31', Icon: Music4 },
                { label: 'Workshops',      cat: 'Workshop',     badge: '58', Icon: Wrench },
                { label: 'Competitions',   cat: 'Competition',  badge: '27', Icon: Trophy },
              ].map(({ label, cat, badge, Icon: CatIcon }) => (
                <Btn key={cat}
                  onClick={() => go(`/explore?cat=${cat}`)}
                  Icon={CatIcon} label={label}
                  badge={badge} badgeStyle="bg-[#F1F0ED] text-[#8A8A85]" />
              ))}

              <Div />
              <Lbl c="FestNest" />
              <Btn onClick={() => go('/about')}   Icon={Info}          label="About FestNest" />
              <Btn onClick={() => go('/support')} Icon={HelpCircle}    label="Help & Support" />
              {isAdmin && (
                <>
                  <Div />
                  <Lbl c="Admin" />
                  <Btn onClick={() => go('/admin')} Icon={ShieldCheck} label="Admin Dashboard" accent />
                </>
              )}
              <Btn onClick={() => {}}             Icon={MessageCircle} label="Send Feedback" />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-[#E4E4E0] px-3 py-3
                            pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              {isLoggedIn ? (
                <button
                  onClick={() => { setDrawerOpen(false); logout(); }}
                  className="w-full py-3 border-[1.5px] border-[#FECACA]
                             rounded-xl text-[14px] font-semibold
                             text-[#DC2626] bg-[#FEF2F2]
                             hover:bg-[#FEE2E2] transition-colors
                             flex items-center justify-center gap-2">
                  <LogOut size={16} strokeWidth={1.8} /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { setDrawerOpen(false); setTimeout(() => requireAuth(), 80); }}
                  className="w-full py-3 bg-primary text-white rounded-xl
                             text-[14px] font-bold hover:bg-primary-dark transition-colors"
                >
                  Create Account — It's Free
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
