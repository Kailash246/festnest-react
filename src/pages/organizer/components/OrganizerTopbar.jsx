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

const TAB_DESCRIPTIONS = {
  overview:     'Performance metrics and active event operations',
  events:       'Create, update, and monitor your campus events',
  participants: 'Review registered attendees and export participant data',
  analytics:    'Audience reach, engagement, and conversion insights',
  tips:         'Tactics and playbooks to maximize event turnout',
};

const TAB_BADGES = {
  overview:     'Overview',
  events:       'Events',
  participants: 'Attendees',
  analytics:    'Insights',
  tips:         'Playbook',
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
  const description = TAB_DESCRIPTIONS[activeTab] || 'FestNest Management Workspace';
  const badge = TAB_BADGES[activeTab] || 'Hub';

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
      {/* ── Mobile View (< sm) ── */}
      <div className="sm:hidden">
        {/* Row 1: Primary navigation & action suite */}
        <div className="h-13 px-3.5 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              aria-label="Open sidebar navigation"
              className="p-1.5 rounded-lg border border-border/80 bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 active:bg-surface-3 transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb back-link */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-4 truncate">
              <button
                onClick={() => navigate('/home')}
                className="hover:text-primary transition-colors flex items-center gap-1 text-text-3 cursor-pointer"
                title="Return to FestNest Home"
              >
                <ArrowLeft size={12} />
                <span>FestNest</span>
              </button>
              <span>/</span>
              <span className="text-primary font-bold">Organizer</span>
            </div>
          </div>

          {/* Quick actions: Refresh, Post Event, Profile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh dashboard data"
              title="Refresh dashboard data"
              className="w-8 h-8 rounded-lg border border-border/70 bg-white text-text-3 hover:text-text-1 hover:bg-surface-2 active:bg-surface-3 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
            </button>

            <button
              onClick={() => navigate('/host')}
              aria-label="Post Event"
              title="Post a new event"
              className="h-8 px-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Post</span>
            </button>

            <div
              onClick={() => navigate('/profile')}
              className="cursor-pointer shrink-0 ml-0.5"
              title={`${user?.name || 'Organizer'} (Click to view profile)`}
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-primary/30 ring-1 ring-primary/20 hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[10px] font-bold border border-primary/30 hover:scale-105 transition-transform">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Page Title & Context metadata */}
        <div className="px-3.5 py-1.5 flex items-center justify-between gap-2 bg-surface-1/50">
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-[14px] text-text-1 leading-tight truncate">
              {title}
            </h1>
            <p className="text-[11px] text-text-3 truncate mt-0.5">
              {description}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light border border-primary/20 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        </div>
      </div>

      {/* ── Tablet & Desktop View (sm: and up) ── */}
      <div className="hidden sm:flex h-[68px] items-center justify-between px-5 lg:px-7 w-full gap-4">
        {/* Left: Mobile Sidebar Trigger + Breadcrumb + Title + Subtitle */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar navigation"
            className="lg:hidden p-2 rounded-lg border border-border/80 bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-4 mb-0.5">
              <button
                onClick={() => navigate('/home')}
                className="hover:text-primary transition-colors flex items-center gap-1 text-text-3 cursor-pointer"
                title="Return to FestNest Home"
              >
                <ArrowLeft size={11} /> FestNest
              </button>
              <span>/</span>
              <span className="text-text-3 font-medium">Organizer Hub</span>
              <span>/</span>
              <span className="text-primary font-bold truncate">{title}</span>
            </div>

            {/* Title & Badge */}
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading font-bold text-[18px] lg:text-[20px] text-text-1 leading-tight tracking-tight truncate">
                {title}
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light border border-primary/20 px-2 py-0.5 rounded-md shrink-0">
                {badge}
              </span>
            </div>
            <p className="hidden md:block text-[11px] lg:text-[12px] text-text-3 truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Right: Actions Suite */}
        <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
          {/* Live Status indicator on larger desktop */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Workspace</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard data"
            className="px-3 py-1.5 rounded-lg border border-border/80 bg-white text-text-2 hover:bg-surface-2 hover:text-text-1 hover:border-border transition-all flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-50 shrink-0 shadow-2xs cursor-pointer"
            title="Refresh dashboard data"
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Post Event CTA */}
          <button
            onClick={() => navigate('/host')}
            aria-label="Post Event"
            title="Post a new campus event"
            className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-[12px] font-bold shadow-xs hover:bg-primary-dark active:scale-[0.98] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Post Event</span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-border/80 mx-0.5" aria-hidden="true" />

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
                {user?.college ? user.college.split(' ')[0] : 'Hub Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
