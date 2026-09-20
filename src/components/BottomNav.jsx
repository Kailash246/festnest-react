import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Shield,
  LayoutDashboard,
  Bookmark,
  User,
  Plus,
  Bell,
  PlusCircle,
  Home,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
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

  const path = location.pathname;

  const handleNav = (href, isProtected) => {
    if (isProtected && !requireAuth()) return;
    navigate(href);
  };

  /* ── Role-Specific Configuration ──
   * 1. Student / Attendee:
   *    Home | Explore | [Center: Saved (badge)] | Alerts (badge) | Profile
   * 2. Organizer:
   *    Home | Explore | [Center: + Host] | Organizer Hub | Profile
   * 3. Admin / SuperAdmin:
   *    Home | Explore | [Center: Shield Admin] | Host | Profile
   */
  /* ── Role-Specific Tab Configurations ── */
  let centerTab;
  let fourthTab;

  if (isAdmin || isSuperAdmin) {
    centerTab = {
      id: 'admin',
      href: '/admin',
      label: 'Admin',
      protected: true,
      icon: <Shield size={23} strokeWidth={2.4} className="text-white drop-shadow-xs" />,
      icon: <Shield size={20} strokeWidth={2.2} />,
      active: path.startsWith('/admin'),
    };
    fourthTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: <PlusCircle size={19} strokeWidth={2} />,
      icon: <PlusCircle size={19} strokeWidth={1.8} />,
      active: path === '/host',
    };
  } else if (isOrganizer) {
    centerTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: <Plus size={25} strokeWidth={2.8} className="text-white drop-shadow-xs group-hover:rotate-90 transition-transform duration-200" />,
      icon: <Plus size={22} strokeWidth={2.5} />,
      active: path === '/host',
    };
    fourthTab = {
      id: 'organizer',
      href: '/organizer',
      label: 'Organizer',
      protected: true,
      icon: <LayoutDashboard size={19} strokeWidth={2} />,
      icon: <LayoutDashboard size={19} strokeWidth={1.8} />,
      active: path.startsWith('/organizer'),
    };
  } else {
    // Regular Student / Attendee
    // Student / Attendee
    centerTab = {
      id: 'saved',
      href: '/saved',
      label: 'Saved',
      protected: true,
      badge: savedCount > 0 ? savedCount : null,
      icon: <Bookmark size={23} strokeWidth={2.4} className="text-white drop-shadow-xs" fill="currentColor" />,
      icon: <Bookmark size={20} strokeWidth={2.2} fill={path === '/saved' ? 'currentColor' : 'none'} />,
      active: path === '/saved',
    };
    fourthTab = {
      id: 'notifications',
      href: '/notifications',
      label: 'Alerts',
      protected: false,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      icon: <Bell size={19} strokeWidth={2} />,
      icon: <Bell size={19} strokeWidth={1.8} />,
      active: path === '/notifications',
    };
  }

  const isHomeActive = path === '/home' || path === '/';
  const isExploreActive = path === '/explore';
  const isProfileActive = path === '/profile' || path.startsWith('/profile/');

  return (
    <nav
      className="md:hidden fixed bottom-2 sm:bottom-3 inset-x-0 z-[40] flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
      className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Bottom navigation"
    >
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
            type="button"
            onClick={() => handleNav('/home', false)}
            aria-label="Home"
            aria-current={isHomeActive ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            {isHomeActive && (
      <div className="w-full max-w-[390px] h-[60px] bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] px-2 flex items-center justify-between pointer-events-auto">
        
        {/* 1. Home Tab */}
        <button
          type="button"
          onClick={() => handleNav('/home', false)}
          aria-label="Home"
          aria-current={isHomeActive ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isHomeActive ? (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
                layoutId="navIconPill"
                className="w-12 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <Home size={19} strokeWidth={2.3} className="fill-primary/20" />
              </motion.div>
            ) : (
              <div className="w-12 h-7 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                <Home size={19} strokeWidth={1.8} />
              </div>
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
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${isHomeActive ? 'font-semibold text-primary' : 'font-medium text-neutral-500 group-hover:text-neutral-700'}`}>
            Home
          </span>
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
        {/* 2. Explore Tab */}
        <button
          type="button"
          onClick={() => handleNav('/explore', false)}
          aria-label="Explore"
          aria-current={isExploreActive ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isExploreActive ? (
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

          {/* 3. Role-Specific Center Elevated Hero CTA */}
          <div className="relative flex-1 flex flex-col items-center justify-center h-[52px]">
            <button
              type="button"
              onClick={() => handleNav(centerTab.href, centerTab.protected)}
              aria-label={centerTab.label}
              aria-current={centerTab.active ? 'page' : undefined}
              className="group flex flex-col items-center cursor-pointer"
            >
              {/* Elevated Floating Gradient Circle */}
              <div
                className={`
                  absolute -top-[17px] w-[50px] h-[50px] rounded-full
                  bg-gradient-to-tr from-[#5038EE] via-[#6366F1] to-[#8C5AF9]
                  text-white flex items-center justify-center
                  ring-[3.5px] ring-white
                  shadow-[0_8px_20px_rgba(99,102,241,0.44),inset_0_1px_2px_rgba(255,255,255,0.45)]
                  group-active:scale-95 group-hover:scale-105
                  transition-transform duration-200
                  ${centerTab.active ? 'ring-primary/20 shadow-[0_10px_24px_rgba(99,102,241,0.55)]' : ''}
                `}
                layoutId="navIconPill"
                className="w-12 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                {centerTab.icon}
                {centerTab.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {centerTab.badge}
                  </span>
                )}
                <Compass size={19} strokeWidth={2.3} />
              </motion.div>
            ) : (
              <div className="w-12 h-7 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                <Compass size={19} strokeWidth={1.8} />
              </div>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${isExploreActive ? 'font-semibold text-primary' : 'font-medium text-neutral-500 group-hover:text-neutral-700'}`}>
            Explore
          </span>
        </button>

              {/* Label inside dock */}
              <span className={`text-[10.5px] tracking-tight mt-[27px] leading-none transition-colors ${centerTab.active ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                {centerTab.label}
        {/* 3. Center Hero Action Button */}
        <button
          type="button"
          onClick={() => handleNav(centerTab.href, centerTab.protected)}
          aria-label={centerTab.label}
          aria-current={centerTab.active ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group relative -translate-y-2.5"
        >
          <div
            className={`
              relative w-11 h-11 rounded-full text-white flex items-center justify-center
              ring-[3px] ring-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]
              active:scale-95 group-hover:scale-105 transition-all duration-150
              ${centerTab.active
                ? 'bg-primary ring-primary/20 shadow-[0_6px_18px_rgba(79,70,229,0.45)]'
                : 'bg-gradient-to-tr from-[#4338CA] to-[#6366F1] hover:shadow-[0_6px_18px_rgba(79,70,229,0.4)]'}
            `}
          >
            {centerTab.icon}
            {centerTab.badge && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {centerTab.badge}
              </span>
              {centerTab.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${centerTab.active ? 'font-bold text-primary' : 'font-semibold text-neutral-600 group-hover:text-primary'}`}>
            {centerTab.label}
          </span>
        </button>

          {/* 4. Role-Specific 4th Tab */}
          <button
            type="button"
            onClick={() => handleNav(fourthTab.href, fourthTab.protected)}
            aria-label={fourthTab.label}
            aria-current={fourthTab.active ? 'page' : undefined}
            className="relative flex-1 flex flex-col items-center justify-center h-[52px] rounded-[20px] transition-all cursor-pointer group"
          >
            {fourthTab.active && (
        {/* 4. Role-Specific 4th Tab */}
        <button
          type="button"
          onClick={() => handleNav(fourthTab.href, fourthTab.protected)}
          aria-label={fourthTab.label}
          aria-current={fourthTab.active ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group relative"
        >
          <div className="relative flex items-center justify-center">
            {fourthTab.active ? (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
                layoutId="navIconPill"
                className="w-12 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                {fourthTab.icon}
              </motion.div>
            ) : (
              <div className="w-12 h-7 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                {fourthTab.icon}
              </div>
            )}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {fourthTab.active ? (
                <div className="text-primary scale-105 transition-transform">
                  {fourthTab.icon}
                </div>
              ) : (
                <div className="w-[34px] h-[34px] rounded-full bg-[#F5F6F9] flex items-center justify-center text-text-3 group-hover:text-text-1 group-hover:bg-[#EFEFF4] transition-colors relative">
                  {fourthTab.icon}
                  {fourthTab.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {fourthTab.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10.5px] tracking-tight mt-0.5 leading-none transition-colors ${fourthTab.active ? 'font-bold text-primary' : 'font-semibold text-text-3 group-hover:text-text-2'}`}>
                {fourthTab.label}
            {fourthTab.badge && (
              <span className="absolute top-0 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {fourthTab.badge}
              </span>
              {fourthTab.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </div>
          </button>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${fourthTab.active ? 'font-semibold text-primary' : 'font-medium text-neutral-500 group-hover:text-neutral-700'}`}>
            {fourthTab.label}
          </span>
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
        {/* 5. Profile Tab */}
        <button
          type="button"
          onClick={() => handleNav('/profile', true)}
          aria-label="Profile"
          aria-current={isProfileActive ? 'page' : undefined}
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isProfileActive ? (
              <motion.div
                layoutId="bottomNavCapsule"
                className="absolute inset-0 bg-[#EEF1FE] rounded-[20px] z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
                layoutId="navIconPill"
                className="w-12 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <User size={19} strokeWidth={2.3} />
              </motion.div>
            ) : (
              <div className="w-12 h-7 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                {currentUser?.avatar?.url ? (
                  <img
                    src={currentUser.avatar.url}
                    alt=""
                    className="w-[20px] h-[20px] rounded-full object-cover ring-1 ring-neutral-300"
                  />
                ) : (
                  <User size={19} strokeWidth={1.8} />
                )}
              </div>
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
                  {/* Purple notification indicator dot on profile for guests or when not on alerts */}
                  {(!currentUser || (unreadNotifCount > 0 && (isAdmin || isOrganizer))) && (
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
            {/* Subtle indicator dot if unread notifications or unauthenticated */}
            {(!currentUser || (unreadNotifCount > 0 && (isAdmin || isOrganizer))) && (
              <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-white absolute top-0.5 right-3" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 leading-none transition-colors ${isProfileActive ? 'font-semibold text-primary' : 'font-medium text-neutral-500 group-hover:text-neutral-700'}`}>
            Profile
          </span>
        </button>

        </div>
      </div>
    </nav>
  );
}
