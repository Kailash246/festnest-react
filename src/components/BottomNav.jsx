import { useNavigate, useLocation } from 'react-router-dom';
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
      icon: Shield,
      active: path.startsWith('/admin'),
    };
    fourthTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: PlusCircle,
      active: path === '/host',
    };
  } else if (isOrganizer) {
    centerTab = {
      id: 'host',
      href: '/host',
      label: 'Host',
      protected: false,
      icon: Plus,
      active: path === '/host',
    };
    fourthTab = {
      id: 'organizer',
      href: '/organizer',
      label: 'Organizer',
      protected: true,
      icon: LayoutDashboard,
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
      icon: Bookmark,
      active: path === '/saved',
    };
    fourthTab = {
      id: 'notifications',
      href: '/notifications',
      label: 'Alerts',
      protected: false,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null,
      icon: Bell,
      active: path === '/notifications',
    };
  }

  const isHomeActive = path === '/home' || path === '/';
  const isExploreActive = path === '/explore';
  const isProfileActive = path === '/profile' || path.startsWith('/profile/');

  const navItems = [
    {
      id: 'home',
      href: '/home',
      label: 'Home',
      protected: false,
      active: isHomeActive,
      icon: Home,
      fillOnActive: true,
    },
    {
      id: 'explore',
      href: '/explore',
      label: 'Explore',
      protected: false,
      active: isExploreActive,
      icon: Compass,
    },
    {
      ...centerTab,
      isCenter: true,
    },
    {
      ...fourthTab,
      isCenter: false,
    },
    {
      id: 'profile',
      href: '/profile',
      label: 'Profile',
      protected: true,
      active: isProfileActive,
      icon: User,
      isProfile: true,
      isCenter: false,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E4E4E0] shadow-[0_-1px_3px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Bottom navigation"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-around px-1 h-[56px]">
        {navItems.map((item) => {
          const IconComponent = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.href, item.protected)}
                aria-label={item.label}
                aria-current={item.active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none select-none relative -translate-y-3"
              >
                <div
                  className={`
                    relative w-12 h-12 rounded-full text-white flex items-center justify-center
                    ring-[3.5px] ring-white
                    shadow-[0_4px_14px_rgba(79,70,229,0.35)]
                    group-hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)]
                    active:scale-95 group-hover:scale-105 transition-all duration-150
                    ${
                      item.active
                        ? 'bg-primary ring-primary/20 shadow-[0_6px_18px_rgba(79,70,229,0.5)]'
                        : 'bg-gradient-to-tr from-[#4338CA] to-[#6366F1]'
                    }
                  `}
                >
                  <IconComponent
                    size={21}
                    strokeWidth={2.3}
                    className={`${item.id === 'saved' && item.active ? 'fill-white' : ''}`}
                  />
                  {item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors duration-150 ${
                    item.active
                      ? 'font-bold text-primary'
                      : 'font-semibold text-neutral-600 group-hover:text-primary'
                  }`}
                >
                  {item.label}
                </span>

                {/* Subtle active dot indicator */}
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 transition-all duration-150 ${
                    item.active
                      ? 'bg-primary scale-100 opacity-100'
                      : 'bg-transparent scale-0 opacity-0'
                  }`}
                />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.href, item.protected)}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none select-none relative"
            >
              <div className="relative flex items-center justify-center">
                {item.isProfile && currentUser?.avatar?.url ? (
                  <img
                    src={currentUser.avatar.url}
                    alt=""
                    className={`w-[22px] h-[22px] rounded-full object-cover transition-all duration-150 ${
                      item.active
                        ? 'ring-2 ring-primary ring-offset-1'
                        : 'ring-1 ring-neutral-300 group-hover:ring-neutral-400'
                    }`}
                  />
                ) : (
                  <IconComponent
                    size={20}
                    strokeWidth={item.active ? 2.3 : 1.8}
                    className={`transition-colors duration-150 ${
                      item.active
                        ? 'text-primary'
                        : 'text-neutral-400 group-hover:text-neutral-700'
                    } ${item.fillOnActive && item.active ? 'fill-primary/20' : ''}`}
                  />
                )}

                {/* Badges */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {item.badge}
                  </span>
                )}

                {/* Profile unread / attention dot */}
                {item.isProfile &&
                  (!currentUser ||
                    (unreadNotifCount > 0 && (isAdmin || isOrganizer))) && (
                    <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-white absolute -top-0.5 -right-0.5" />
                  )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 leading-none transition-colors duration-150 ${
                  item.active
                    ? 'font-semibold text-primary'
                    : 'font-medium text-neutral-500 group-hover:text-neutral-700'
                }`}
              >
                {item.label}
              </span>

              {/* Subtle active dot indicator */}
              <span
                className={`w-1 h-1 rounded-full mt-0.5 transition-all duration-150 ${
                  item.active
                    ? 'bg-primary scale-100 opacity-100'
                    : 'bg-transparent scale-0 opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
