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
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar navigation"
          className="lg:hidden p-2 rounded-xl border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-4">
            <button
              onClick={() => navigate('/home')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={11} className="hidden sm:inline" /> FestNest
            </button>
            <span>/</span>
            <span className="text-text-3">Organizer</span>
          </div>
          <h1 className="font-heading font-bold text-[16px] sm:text-[18px] text-text-1 leading-tight truncate">
            {TAB_TITLES[activeTab] || 'Organizer Hub'}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
          className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 transition-all flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50"
          title="Refresh data"
        >
          <RotateCw size={15} className={refreshing ? 'animate-spin text-primary' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Post Event CTA */}
        <button
          onClick={() => navigate('/host')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-[12px] font-bold shadow-xs hover:bg-primary-dark transition-all"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Post Event</span>
        </button>

        {/* User avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex-shrink-0"
          title={`${user?.name || 'Organizer'} (Click to view profile)`}
        >
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-primary/40 hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold border border-primary/30 hover:scale-105 transition-transform">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

