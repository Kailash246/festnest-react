import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BrandMark from './BrandMark';

const getInitials = (name) =>
  name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const LogoMark = () => <BrandMark className="w-7 h-7" />;

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
      className="sticky top-0 z-[50] w-full bg-white border-b border-[#E4E4E0]"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2 px-3 h-14 md:h-16 md:px-6 md:gap-3">

        {/* ── Logo ── */}
        <button
          onClick={() => navigate(isLoggedIn ? '/home' : '/landing')}
          className="flex items-center gap-1.5 flex-shrink-0
                     font-heading font-bold text-[18px] md:text-[20px]
                     text-primary tracking-[-0.025em] cursor-pointer"
          aria-label="FestNest home"
        >
          <LogoMark />
          <span>FestNest</span>
        </button>

        {/* ── Search pill — grows to fill space ── */}
        <button
          onClick={() => navigate('/explore')}
          className="hidden md:flex items-center gap-2 flex-1 min-w-0
                     px-3 py-2 rounded-md
                     bg-[#F1F0ED] border border-[#E4E4E0]
                     text-[#8A8A85] text-[13px]
                     hover:border-[#CBCBC6] hover:bg-[#E9E9E5]
                     transition-colors duration-150"
          role="search" aria-label="Search events"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-3.5 h-3.5 flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="truncate">Search events…</span>
        </button>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {[{ label: 'Home', href: '/home' }, { label: 'Explore', href: '/explore' }, { label: 'Blog', href: '/blog' }]
            .map(({ label, href }) => (
              <button key={href} onClick={() => navigate(href)}
                className={`px-4 py-2 rounded-md text-[14px] font-medium transition-colors duration-150
                            ${isActive(href)
                              ? 'bg-primary-light text-primary'
                              : 'text-[#4B4B47] hover:bg-[#F1F0ED] hover:text-[#111110]'}`}>
                {label}
              </button>
            ))}
          <button onClick={() => navigate('/host')}
            className="ml-1 px-4 py-2 bg-primary text-white rounded-md text-[14px]
                       font-semibold hover:bg-primary-dark transition-colors duration-150 whitespace-nowrap">
            + Host Event
          </button>
        </div>

        {/* ── Right icons ── */}
        <div className="flex items-center gap-1.5 md:gap-1 flex-shrink-0 ml-auto">
          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full md:rounded-lg flex items-center justify-center
                       text-text-2 md:text-[#4B4B47] hover:bg-surface-2 md:hover:bg-[#F1F0ED] transition-colors duration-150 cursor-pointer active:scale-95 md:active:scale-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2
                               bg-red rounded-full border-[1.5px] border-white" />
            )}
          </button>

          {/* Avatar / Login */}
          {isLoggedIn ? (
            <button
              onClick={() => handleProtected('/profile')}
              aria-label="Profile"
              className="hidden md:flex w-9 h-9 rounded-full bg-primary-light border-2 border-primary
                         items-center justify-center overflow-hidden flex-shrink-0
                         font-sans font-bold text-[12px] text-primary
                         hover:shadow-indigo transition-all duration-150 cursor-pointer"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={initials}
                       className="w-full h-full object-cover"
                       onError={() => setAvatarImgError(true)} />
                : initials
              }
            </button>
          ) : (
            <button
              onClick={() => requireAuth()}
              aria-label="Log in"
              className="hidden md:flex items-center px-4 py-2
                         border-[1.5px] border-[#CBCBC6] rounded-md
                         text-[14px] font-medium text-[#4B4B47]
                         hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer"
            >
              Log in
            </button>
          )}

          {/* ── Hamburger — mobile only, far right ── */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-text-2 hover:bg-surface-2 active:scale-95 transition-all cursor-pointer"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </nav>
  );
}
