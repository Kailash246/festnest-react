// src/pages/organizer/components/OrganizerTopbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, RotateCw, Plus, ArrowLeft } from 'lucide-react';

const TAB_TITLES = {
  overview:     'Dashboard Overview',
  events:       'Manage Events',
  participants: 'Event Participants',
  analytics:    'Performance Analytics',
  tips:         'Organizer Growth Playbook',
};

export default function OrganizerTopbar({
  activeTab,
  onOpenMobileSidebar,
  onRefresh,
  refreshing,
  user,
}) {
  const navigate = useNavigate();

  const title = TAB_TITLES[activeTab] || 'Organizer Hub';

  const initials =
    user?.avatar?.initials ||
    user?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    'OG';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border shadow-2xs">
      {/* ── Dedicated Mobile Header (< sm) ── */}
      <div className="flex sm:hidden h-14 items-center justify-between px-3.5 w-full">
        {/* Left: Menu trigger & Page title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
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
          </div>
        </div>

        {/* Right: Essential mobile controls (Refresh & Profile only) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
            className="w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 active:bg-surface-3 transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RotateCw size={15} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>

          <div
            onClick={() => navigate('/profile')}
            className="cursor-pointer shrink-0"
            title={`${user?.name || 'Organizer'} (View profile)`}
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-primary/30 ring-1 ring-primary/20 hover:scale-105 active:scale-95 transition-transform"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold border border-primary/30 hover:scale-105 active:scale-95 transition-transform">
                {initials}
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
            className="lg:hidden w-9 h-9 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 transition-colors flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
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
            </div>
            <h1 className="font-heading font-bold text-[18px] lg:text-[19px] text-text-1 leading-tight truncate mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Actions Suite (Refresh, Post Event, Profile) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard data"
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 hover:border-border transition-all flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50 shrink-0 shadow-2xs cursor-pointer"
            title="Refresh dashboard data"
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
            <span>Refresh</span>
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

          {/* Profile chip */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer group"
            title={`${user?.name || 'Organizer'} (Click to view profile)`}
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-primary/30 group-hover:border-primary/60 ring-2 ring-primary/10 transition-all shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold border border-primary/30 group-hover:border-primary/60 ring-2 ring-primary/10 transition-all shrink-0">
                {initials}
              </div>
            )}
            <div className="hidden lg:block text-left min-w-0 max-w-[130px]">
              <div className="text-[12px] font-bold text-text-1 leading-tight truncate group-hover:text-primary transition-colors">
                {user?.name || 'Organizer'}
              </div>
              <div className="text-[10px] text-text-4 uppercase tracking-wider font-semibold leading-tight mt-0.5 truncate">
                {user?.college ? user.college.split(' ')[0] : 'Organizer'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
