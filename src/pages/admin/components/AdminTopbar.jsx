// src/pages/admin/components/AdminTopbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  RotateCw,
  Plus,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function AdminTopbar({
  activeTab,
  onOpenMobileNav,
  onRefresh,
  refreshing,
  stats,
  currentUser,
  onCreateEvent,
  onSelectTab,
}) {
  const navigate = useNavigate();
  const { logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const titles = {
    overview:    { title: 'Dashboard Overview', sub: 'Platform KPIs & performance metrics' },
    submissions: { title: 'Event Submissions',  sub: 'Review and approve organizer events' },
    events:      { title: 'Live Events',        sub: 'Manage active, inactive, and featured listings' },
    users:       { title: 'User Management',    sub: 'Students, organizers, permissions and roles' },
    tickets:     { title: 'Support Tickets',    sub: 'Inquiries and user support threads' },
    featured:    { title: 'Featured Priority',  sub: 'Feed spotlight and placement hierarchy' },
    notify:      { title: 'Push Broadcast',     sub: 'Send platform notifications to student base' },
    colleges:    { title: 'College Directory',  sub: 'Manage college campuses and hubs' },
    refer:       { title: 'Refer & Earn',       sub: 'Referrals, FN Coins economy, wheel spins, and rewards' },
  };

  const currentView = titles[activeTab] || { title: 'Admin Console', sub: 'FestNest Administration' };
  const pendingCount = stats?.totals?.pendingSubmissions || 0;
  const ticketCount  = stats?.totals?.openTickets || 0;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) =>
    name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <header className="h-16 px-4 sm:px-6 md:px-8 bg-white border-b border-border flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden w-9 h-9 rounded-lg border border-border text-text-2 hover:bg-surface-2 flex items-center justify-center flex-shrink-0"
          aria-label="Open navigation drawer"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[12px] font-semibold text-text-4">Admin</span>
            <span className="hidden sm:inline text-text-4">/</span>
            <h1 className="font-heading font-black text-[17px] sm:text-[19px] text-text-1 tracking-tight truncate leading-tight">
              {currentView.title}
            </h1>
          </div>
          <p className="hidden md:block text-[11px] text-text-3 font-medium truncate -mt-0.5">
            {currentView.sub}
          </p>
        </div>
      </div>

      {/* Right: Operational alerts, Refresh, Create button & User dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Operational Attention Badge (if pending submissions exist) */}
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={() => onSelectTab('submissions')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#B45309] rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
          >
            <AlertCircle size={14} className="text-amber-600" />
            <span>{pendingCount} Pending Review{pendingCount !== 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh dashboard data"
          className="w-9 h-9 rounded-lg border border-border text-text-2 hover:text-text-1 hover:bg-surface-2 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <RotateCw size={15} className={refreshing ? 'animate-spin text-primary' : ''} />
        </button>

        {/* Create Event CTA */}
        <button
          type="button"
          onClick={onCreateEvent}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg text-[13px] font-bold shadow-sm transition-all"
        >
          <Plus size={15} strokeWidth={2.4} />
          <span>New Event</span>
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2.5 p-1 sm:pl-2.5 sm:pr-3 rounded-xl border border-border hover:border-primary/40 bg-surface-1 hover:bg-surface-2 transition-all cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-primary font-bold text-[12px] flex items-center justify-center flex-shrink-0">
              {currentUser?.avatar?.initials || getInitials(currentUser?.name)}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <div className="text-[13px] font-bold text-text-1 leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'Admin'}
              </div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mt-0.5">
                {currentUser?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </div>
            </div>
            <ChevronDown size={14} className="text-text-3 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-xl p-1.5 z-50 text-[13px]">
              <div className="px-3 py-2 border-b border-border/80 mb-1">
                <p className="font-bold text-text-1 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-text-3 truncate">{currentUser?.email}</p>
              </div>

              <button
                type="button"
                onClick={() => { setProfileOpen(false); navigate('/home'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-text-2 hover:text-primary hover:bg-surface-2 rounded-lg font-medium transition-colors text-left"
              >
                <ExternalLink size={15} />
                <span>Visit FestNest App</span>
              </button>

              <button
                type="button"
                onClick={() => { setProfileOpen(false); onSelectTab('tickets'); }}
                className="w-full flex items-center justify-between px-3 py-2 text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-lg font-medium transition-colors text-left"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle size={15} /> Support Inbox
                </span>
                {ticketCount > 0 && (
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded-full">
                    {ticketCount}
                  </span>
                )}
              </button>

              <div className="my-1 border-t border-border/80" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors text-left"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

