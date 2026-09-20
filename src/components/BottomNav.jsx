import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Compass, Shield, LayoutDashboard, Bookmark, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HOME_TAB = {
  href: '/home', label: 'Home',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const EXPLORE_TAB = {
  href: '/explore', label: 'Explore',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
};

const SAVED_TAB = {
  href: '/saved', label: 'Saved', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
};

const ORGANIZER_TAB = {
  href: '/organizer', label: 'Organizer', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
};

const ADMIN_TAB = {
  href: '/admin', label: 'Admin', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

const HOST_TAB = {
  href: '/host', label: 'Host',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
};

const PROFILE_TAB = {
  href: '/profile', label: 'Profile', protected: true,
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { requireAuth, savedCount, isAdmin, isOrganizer, isSuperAdmin } = useApp();
  const path      = location.pathname;
  const navigate = useNavigate();
  const location = useLocation();
  const {
    requireAuth,
    savedCount,
    isAdmin,
    isOrganizer,
    isSuperAdmin,
    unreadNotifCount,
    currentUser,
  } = useApp();

  const middleTab = (isAdmin || isSuperAdmin) ? ADMIN_TAB
                  : isOrganizer               ? ORGANIZER_TAB
                  : SAVED_TAB;
  const path = location.pathname;

  const tabs = [HOME_TAB, EXPLORE_TAB, middleTab, HOST_TAB, PROFILE_TAB];
  // Role-based 4th slot (Admin -> Organizer -> Saved)
  const fourthTab = (isAdmin || isSuperAdmin)
    ? {
        id: 'admin',
        href: '/admin',
        label: 'Admin',
        protected: true,
        icon: <Shield size={19} strokeWidth={2} />,
      }
    : isOrganizer
    ? {
        id: 'organizer',
        href: '/organizer',
        label: 'Organizer',
        protected: true,
        icon: <LayoutDashboard size={19} strokeWidth={2} />,
      }
    : {
        id: 'saved',
        href: '/saved',
        label: 'Saved',
        protected: true,
        icon: <Bookmark size={19} strokeWidth={2} />,
        badge: savedCount > 0 ? savedCount : null,
      };

  const handleTab = (href, isProtected) => {
  const handleNav = (href, isProtected) => {
    if (isProtected && !requireAuth()) return;
    navigate(href);
  };

  const isHomeActive = path === '/home' || path === '/';
  const isExploreActive = path === '/explore';
  const isHostActive = path === '/host';
  const isFourthActive = fourthTab.id === 'admin'
    ? path.startsWith('/admin')
    : fourthTab.id === 'organizer'
    ? path.startsWith('/organizer')
    : path === '/saved';
  const isProfileActive = path === '/profile' || path.startsWith('/profile/');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[40]
                 flex items-center bg-white border-t border-[#E4E4E0]
                 shadow-[0_-2px_12px_rgba(0,0,0,0.07)]
                 px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom,0px))]"
      className="md:hidden fixed bottom-2 sm:bottom-3 inset-x-0 z-[40] flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Bottom navigation"
    >
      {tabs.map(({ href, label, icon, protected: isProtected }) => {
        const active = path === href;
        return (
      <div
        className="relative w-full max-w-[420px] pointer-events-auto"
        style={{
          filter: 'drop-shadow(0 12px 28px rgba(79, 70, 229, 0.16)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.05))',
        }}
      >
        {/* Center elevated arch dome seamlessly connecting to the dock */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[21px] w-[86px] h-[24px] pointer-events-none z-0">
          <svg
            viewBox="0 0 86 24"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* White solid arch fill covering the main bar top border */}
            <path
              d="M 0 21 C 18 21 22 0 43 0 C 64 0 68 21 86 21 L 86 24 L 0 24 Z"
              fill="#FFFFFF"
            />
            {/* Top curved border line */}
            <path
              d="M 0 21 C 18 21 22 0 43 0 C 64 0 68 21 86 21"
              fill="none"
              stroke="#E4E4E0"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Main floating dock body */}
        <div className="relative z-10 w-full h-[64px] bg-white rounded-[28px] border border-[#E4E4E0] px-1.5 flex items-center justify-between">
          
          {/* 1. Home Tab */}
          <button
            key={href}
            onClick={() => handleTab(href, isProtected)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center gap-[3px] py-1.5 px-1
                       rounded-md min-w-0 transition-colors duration-150
                       hover:bg-[#F1F0ED] active:bg-[#E9E9E5] relative"
            type="button"
            onClick={() => handleNav('/home', false)}
            aria-label="Home"
            aria-current={isHomeActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            <span className={`transition-all duration-150
                              ${active ? 'text-primary scale-110' : 'text-[#8A8A85]'}`}>
              {icon}
            </span>
            <span className={`text-[10px] font-semibold truncate transition-colors duration-150
                              ${active ? 'text-primary' : 'text-[#8A8A85]'}`}>
              {label}
            </span>
            {label === 'Saved' && savedCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-14px)]
                               w-4 h-4 bg-primary text-white text-[9px]
                               font-bold rounded-full flex items-center justify-center">
                {savedCount}
            {isHomeActive && (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isHomeActive ? (
                <div className="text-primary scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>
              ) : (
                <div className="w-[34px] h-[34px] rounded-full bg-[#F5F6F9] flex items-center justify-center text-text-3 group-hover:text-text-1 group-hover:bg-[#EFEFF4] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
              )}
              <span className={`text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${isHomeActive ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                Home
              </span>
              {isHomeActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </div>
          </button>

          {/* 2. Explore Tab */}
          <button
            type="button"
            onClick={() => handleNav('/explore', false)}
            aria-label="Explore"
            aria-current={isExploreActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            {isExploreActive && (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isExploreActive ? (
                <div className="text-primary scale-105 transition-transform">
                  <Compass size={20} strokeWidth={2.4} />
                </div>
              ) : (
                <div className="w-[34px] h-[34px] rounded-full bg-[#F5F6F9] flex items-center justify-center text-text-3 group-hover:text-text-1 group-hover:bg-[#EFEFF4] transition-colors">
                  <Compass size={19} strokeWidth={2} />
                </div>
              )}
              <span className={`text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${isExploreActive ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                Explore
              </span>
              {isExploreActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </div>
          </button>
        );
      })}

          {/* 3. Center Elevated Hero: Host Tab */}
          <div className="relative flex-1 flex flex-col items-center justify-center h-[52px]">
            <button
              type="button"
              onClick={() => handleNav('/host', false)}
              aria-label="Host Event"
              aria-current={isHostActive ? 'page' : undefined}
              className="group flex flex-col items-center cursor-pointer"
            >
              {/* Elevated Floating Gradient Circle */}
              <div
                className={`
                  absolute -top-[17px] w-[50px] h-[50px] rounded-full
                  bg-gradient-to-tr from-[#5038EE] via-[#6366F1] to-[#8C5CF6]
                  text-white flex items-center justify-center
                  ring-[3.5px] ring-white
                  shadow-[0_8px_20px_rgba(99,102,241,0.44),inset_0_1px_2px_rgba(255,255,255,0.45)]
                  group-active:scale-95 group-hover:scale-105
                  transition-transform duration-200
                  ${isHostActive ? 'ring-primary/20 shadow-[0_10px_24px_rgba(99,102,241,0.55)]' : ''}
                `}
              >
                <Plus size={24} strokeWidth={2.8} className="text-white drop-shadow-xs group-hover:rotate-90 transition-transform duration-200" />
              </div>

              {/* Label inside dock */}
              <span className={`text-[10.5px] tracking-tight mt-[27px] leading-none transition-colors ${isHostActive ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                Host
              </span>
              {isHostActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
          </div>

          {/* 4. Role-Based Tab (Admin / Organizer / Saved) */}
          <button
            type="button"
            onClick={() => handleNav(fourthTab.href, fourthTab.protected)}
            aria-label={fourthTab.label}
            aria-current={isFourthActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            {isFourthActive && (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isFourthActive ? (
                <div className="text-primary scale-105 transition-transform">
                  {fourthTab.icon}
                </div>
              ) : (
                <div className="w-[34px] h-[34px] rounded-full bg-[#F5F6F9] flex items-center justify-center text-text-3 group-hover:text-text-1 group-hover:bg-[#EFEFF4] transition-colors relative">
                  {fourthTab.icon}
                  {fourthTab.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {fourthTab.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${isFourthActive ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                {fourthTab.label}
              </span>
              {isFourthActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </div>
          </button>

          {/* 5. Profile Tab */}
          <button
            type="button"
            onClick={() => handleNav('/profile', true)}
            aria-label="Profile"
            aria-current={isProfileActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            {isProfileActive && (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isProfileActive ? (
                <div className="text-primary scale-105 transition-transform relative">
                  <User size={20} strokeWidth={2.4} />
                  {unreadNotifCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-white absolute -top-0.5 -right-0.5" />
                  )}
                </div>
              ) : (
                <div className="w-[34px] h-[34px] rounded-full bg-[#F5F6F9] flex items-center justify-center text-text-3 group-hover:text-text-1 group-hover:bg-[#EFEFF4] transition-colors relative">
                  {currentUser?.avatar?.url ? (
                    <img
                      src={currentUser.avatar.url}
                      alt={currentUser.name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={19} strokeWidth={2} />
                  )}
                  {/* Purple notification indicator dot exactly like the reference image */}
                  {(unreadNotifCount > 0 || !currentUser) && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white absolute top-0 right-0" />
                  )}
                </div>
              )}
              <span className={`text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${isProfileActive ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                Profile
              </span>
              {isProfileActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </div>
          </button>

        </div>
      </div>
    </nav>
  );
}
