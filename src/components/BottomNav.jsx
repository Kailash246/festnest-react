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

  // Do not render bottom nav on event details pages
  if (path.startsWith('/event/')) {
    return null;
  }

  const handleNav = (href, isProtected) => {
    if (isProtected && !requireAuth()) return;
    navigate(href);
  };

  /* ── Role-Specific Tab Configurations ── */
  let centerTab;
  let fourthTab;

  if (isAdmin || isSuperAdmin) {
    centerTab = {
      id: 'admin',
      href: '/admin',
      label: 'Admin',
      protected: true,
      icon: <Shield size={20} strokeWidth={2.2} />,
      active: path.startsWith('/admin'),
    };
    fourthTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: <PlusCircle size={19} strokeWidth={1.8} />,
      active: path === '/host',
    };
  } else if (isOrganizer) {
    centerTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: <Plus size={22} strokeWidth={2.5} />,
      active: path === '/host',
    };
    fourthTab = {
      id: 'organizer',
      href: '/organizer',
      label: 'Organizer',
      protected: true,
      icon: <LayoutDashboard size={19} strokeWidth={1.8} />,
      active: path.startsWith('/organizer'),
    };
  } else {
    // Student / Attendee
    centerTab = {
      id: 'saved',
      href: '/saved',
      label: 'Saved',
      protected: true,
      badge: savedCount > 0 ? savedCount : null,
      icon: <Bookmark size={20} strokeWidth={2.2} fill={path === '/saved' ? 'currentColor' : 'none'} />,
      active: path === '/saved',
    };
    fourthTab = {
      id: 'notifications',
      href: '/notifications',
      label: 'Alerts',
      protected: false,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      icon: <Bell size={19} strokeWidth={1.8} />,
      active: path === '/notifications',
    };
  }

  const isHomeActive = path === '/home' || path === '/';
  const isExploreActive = path === '/explore';
  const isProfileActive = path === '/profile' || path.startsWith('/profile/');

  return (
    <nav
      className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Bottom navigation"
    >
      <div className="w-full max-w-[390px] h-[60px] bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] px-2 flex items-center justify-between pointer-events-auto">
        
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
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isExploreActive ? (
              <motion.div
                layoutId="navIconPill"
                className="w-12 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
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
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group relative"
        >
          <div className="relative flex items-center justify-center">
            {fourthTab.active ? (
              <motion.div
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
            {fourthTab.badge && (
              <span className="absolute top-0 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {fourthTab.badge}
              </span>
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
          className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {isProfileActive ? (
              <motion.div
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
    </nav>
  );
}
