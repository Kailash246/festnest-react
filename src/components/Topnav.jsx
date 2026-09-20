import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BrandMark from './BrandMark';

const getInitials = (name) =>
  name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function Topnav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDrawerOpen, requireAuth, isLoggedIn, currentUser, unreadNotifCount } = useApp();
  const [avatarImgError, setAvatarImgError] = useState(false);
  const initials = currentUser?.avatar?.initials || getInitials(currentUser?.name);
  const avatarUrl = !avatarImgError && currentUser?.avatar?.url;
  const path = location.pathname;

  const isActive = (href) => path === href;

  const handleProtected = (href) => {
    if (!requireAuth()) return;
    navigate(href);
  };

  return (
    <nav
      className="sticky top-0 z-[50] w-full bg-white/95 backdrop-blur-md border-b border-border/50"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between gap-3 px-4 h-14 md:h-16 md:px-6">

        {/* ── Brand Logo ── */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer group"
          aria-label="FestNest home"
        >
          <BrandMark className="w-7 h-7 group-hover:scale-105 transition-transform duration-150" />
          <span className="font-heading font-bold text-[19px] md:text-[20px] text-primary tracking-tight">
            FestNest
          </span>
        </button>

        {/* ── Search pill (Desktop) ── */}
        <button
          onClick={() => navigate('/explore')}
          className="hidden md:flex items-center gap-2 flex-1 max-w-[340px] lg:max-w-[420px] h-9 px-3.5 rounded-full bg-surface-2 border border-border text-text-3 text-[13px] hover:border-primary/40 hover:bg-white hover:shadow-2xs transition-all duration-150 cursor-pointer"
          role="search"
          aria-label="Search events"
        >
          <Search size={14} className="text-text-3" />
          <span className="truncate">Search events, colleges, fests…</span>
          <kbd className="ml-auto hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-border rounded text-text-4">
            ⌘K
          </kbd>
        </button>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {[
            { label: 'Home', href: '/home' },
            { label: 'Explore', href: '/explore' },
            { label: 'Blog', href: '/blog' },
          ].map(({ label, href }) => {
            const active = isActive(href);
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            onClick={() => navigate('/host')}
            className="ml-1 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-full text-[13px] font-semibold shadow-xs hover:shadow-indigo active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Host Event</span>
          </button>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto md:ml-0">
          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-text-2 hover:bg-surface-2 hover:text-text-1 active:scale-95 transition-all cursor-pointer"
          >
            <Bell size={18} strokeWidth={1.9} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Avatar / Login (Desktop) */}
          {isLoggedIn ? (
            <button
              onClick={() => handleProtected('/profile')}
              aria-label="Profile"
              className="hidden md:flex w-9 h-9 rounded-full bg-primary-light border border-primary/30 items-center justify-center overflow-hidden flex-shrink-0 font-sans font-bold text-[12px] text-primary hover:scale-105 transition-all cursor-pointer"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={initials}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarImgError(true)}
                />
              ) : (
                initials
              )}
            </button>
          ) : (
            <button
              onClick={() => requireAuth()}
              aria-label="Log in"
              className="hidden md:flex items-center px-4 py-1.5 border border-border rounded-full text-[13px] font-medium text-text-1 hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              Log in
            </button>
          )}

          {/* ── Hamburger menu button (Mobile) ── */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-text-2 hover:bg-surface-2 hover:text-text-1 active:scale-95 transition-all cursor-pointer"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>

      </div>
    </nav>
  );
}
