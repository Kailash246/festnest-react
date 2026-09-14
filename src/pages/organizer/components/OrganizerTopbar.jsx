// src/pages/organizer/components/OrganizerTopbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  RotateCw,
  Plus,
  ArrowLeft,
  Bell,
  ChevronDown,
  User,
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const TAB_TITLES = {
  overview:     'Dashboard',
  events:       'Manage Events',
  participants: 'Event Participants',
  analytics:    'Performance Analytics',
  tips:         'Organizer Growth Playbook',
};

const TAB_SUBTITLES = {
  overview:     'Organizer Portal',
  events:       'Create, update & monitor events',
  participants: 'Attendee rosters & check-ins',
  analytics:    'Views & registration metrics',
  tips:         'Turnout & growth tactics',
};

export default function OrganizerTopbar({
  activeTab,
  onOpenMobileSidebar,
  onRefresh,
  refreshing,
  user,
}) {
  const navigate = useNavigate();
  const { logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileProfileMenuRef = useRef(null);
  const desktopProfileMenuRef = useRef(null);

  const title = TAB_TITLES[activeTab] || 'Dashboard';
  const subtitle = TAB_SUBTITLES[activeTab] || 'Organizer Portal';

  const initials =
    user?.avatar?.initials ||
    user?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    'FE';

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inMobile = mobileProfileMenuRef.current && mobileProfileMenuRef.current.contains(event.target);
      const inDesktop = desktopProfileMenuRef.current && desktopProfileMenuRef.current.contains(event.target);
      if (!inMobile && !inDesktop) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout?.();
    navigate('/home');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
      {/* ── Dedicated Mobile Header (< sm) ── */}
      <div className="flex sm:hidden h-14 items-center justify-between px-3.5 w-full">
        {/* Left: Menu trigger & Page title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar navigation"
            className="w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 active:bg-surface-3 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-[16px] text-text-1 leading-tight truncate">
              {title}
            </h1>
            <p className="text-[11px] text-text-3 font-medium truncate leading-tight mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Mobile controls (Bell + Avatar dropdown) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            title="Notifications"
            className="relative w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:text-text-1 hover:bg-surface-2 active:bg-surface-3 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full border-[1.5px] border-white" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={mobileProfileMenuRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              aria-label="User menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 pl-1.5 pr-2 py-1.5 rounded-full border border-border bg-surface-1 hover:bg-surface-2 active:bg-surface-3 transition-all cursor-pointer shadow-1"
            >
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold border border-primary/20">
                {initials}
              </div>
              <ChevronDown size={13} className={`text-text-3 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Dropdown popup */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-2 p-1.5 z-50 text-[13px] animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-heading font-bold text-text-1 truncate">{user?.name || 'Organizer'}</p>
                  <p className="text-[11px] text-text-3 truncate">{user?.college || user?.email || 'Organizer Portal'}</p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <User size={15} />
                  <span>Organizer Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/host'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Post New Event</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/home'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <ExternalLink size={15} />
                  <span>Visit FestNest App</span>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors text-left cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tablet & Desktop Header (sm: and up) ── */}
      <div className="hidden sm:flex h-16 items-center justify-between px-5 lg:px-6 w-full gap-4">
        {/* Left: Tablet Menu Trigger + Breadcrumb + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar navigation"
            className="md:hidden w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 transition-colors flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-4">
              <button
                onClick={() => navigate('/home')}
                className="hover:text-primary transition-colors flex items-center gap-1 text-text-3 cursor-pointer"
                title="Return to FestNest Home"
              >
                <ArrowLeft size={11} /> FestNest
              </button>
              <span>/</span>
              <span className="text-text-3 font-medium">Organizer</span>
              <span>/</span>
              <span className="text-primary font-bold">{title}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h1 className="font-heading font-bold text-[18px] lg:text-[19px] text-text-1 leading-tight truncate">
                {title}
              </h1>
              <span className="text-[11px] text-text-3 font-medium truncate">
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions Suite (Refresh, Notification, Post Event, Profile Dropdown) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard data"
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 hover:border-border transition-all flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50 shrink-0 shadow-sm cursor-pointer"
            title="Refresh dashboard data"
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
            <span>Refresh</span>
          </button>

          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            title="Notifications"
            className="relative w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full border-[1.5px] border-white" />
          </button>

          {/* Post Event CTA */}
          <button
            onClick={() => navigate('/host')}
            aria-label="Post Event"
            title="Post a new campus event"
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-[12px] font-bold shadow-xs hover:shadow-indigo active:scale-[0.98] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Post Event</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-border/80 mx-0.5" aria-hidden="true" />

          {/* Profile Dropdown Chip */}
          <div className="relative" ref={desktopProfileMenuRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-border hover:border-primary/40 bg-white hover:bg-surface-2 transition-all cursor-pointer select-none"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-primary/30 ring-1 ring-primary/20 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold border border-primary/30 shrink-0">
                  {initials}
                </div>
              )}
              <div className="hidden lg:block text-left min-w-0 max-w-[120px]">
                <div className="text-[12px] font-bold text-text-1 leading-tight truncate">
                  {user?.name || 'Organizer'}
                </div>
                <div className="text-[10px] text-text-4 uppercase tracking-wider font-semibold leading-tight mt-0.5 truncate">
                  {user?.college ? user.college.split(' ')[0] : 'Portal'}
                </div>
              </div>
              <ChevronDown size={14} className={`text-text-3 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Dropdown popup */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-2 p-1.5 z-50 text-[13px] animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-heading font-bold text-text-1 truncate">{user?.name || 'Organizer'}</p>
                  <p className="text-[11px] text-text-3 truncate">{user?.college || user?.email || 'Organizer Portal'}</p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <User size={15} />
                  <span>Organizer Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/host'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Post New Event</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate('/home'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left cursor-pointer"
                >
                  <ExternalLink size={15} />
                  <span>Visit FestNest App</span>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors text-left cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

