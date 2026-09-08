// src/pages/organizer/components/OrganizerSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Lightbulb,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  X,
} from 'lucide-react';

export const ORGANIZER_NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',      icon: LayoutDashboard },
  { id: 'events',       label: 'My Events',     icon: CalendarDays,   badgeKey: 'totalEvents' },
  { id: 'participants', label: 'Participants',  icon: Users,          badgeKey: 'totalRegistrations' },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart3 },
  { id: 'tips',         label: 'Growth Playbook', icon: Lightbulb },
];

export default function OrganizerSidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  user,
  counts = {},
}) {
  const navigate = useNavigate();

  const renderContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

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
      <div className="flex flex-col h-full bg-white select-none">
        {/* Header / Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border flex-shrink-0">
          <div
            onClick={() => {
              onSelectTab('overview');
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Sparkles size={18} strokeWidth={2.4} />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-[15px] tracking-tight text-text-1 truncate">
                    Organizer Hub
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-light text-primary">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-text-4 truncate">
                  FestNest Management
                </div>
              </div>
            )}
          </div>

          {/* Close mobile drawer or toggle desktop collapse */}
          {isMobile ? (
            <button
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg text-text-4 hover:text-text-2 hover:bg-surface-2 transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-text-4 hover:text-text-2 hover:bg-surface-2 transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Primary CTA (Post Event) */}
        <div className="p-3 border-b border-border/60">
          <button
            onClick={() => navigate('/host')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-primary text-white font-semibold text-[13px] shadow-xs hover:bg-primary-dark transition-all ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Post a new event"
          >
            <Plus size={16} strokeWidth={2.5} />
            {(!isCollapsed || isMobile) && <span>Post New Event</span>}
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className={`px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-4 ${isCollapsed ? 'hidden' : 'block'}`}>
            Event Management
          </div>

          {ORGANIZER_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeValue = item.badgeKey ? counts[item.badgeKey] : null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all relative ${
                  isActive
                    ? 'bg-primary-light text-primary font-bold shadow-2xs'
                    : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-3'}`}
                />

                {(!isCollapsed || isMobile) && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {(!isCollapsed || isMobile) && badgeValue !== undefined && badgeValue !== null && (
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-surface-3 text-text-3'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Points widget if points > 0 */}
        {user?.points > 0 && (!isCollapsed || isMobile) && (
          <div className="px-3 pb-3">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Award size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-heading font-bold text-[13px] text-amber-900 leading-none">
                  {user.points.toLocaleString('en-IN')} pts
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">FestNest Points</div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile & Exit to Student Portal */}
        <div className="p-3 border-t border-border bg-surface-1 flex-shrink-0 space-y-1.5">
          <button
            onClick={() => navigate('/home')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors ${
              isCollapsed ? 'justify-center px-1' : ''
            }`}
            title="Exit to FestNest"
          >
            <ArrowLeft size={16} className="text-text-4" />
            {(!isCollapsed || isMobile) && <span>Back to FestNest</span>}
          </button>

          <div
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 cursor-pointer transition-colors ${
              isCollapsed ? 'justify-center p-1' : ''
            }`}
            title="View Profile"
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 border border-primary/20">
                {initials}
              </div>
            )}
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-text-1 truncate leading-tight">
                  {user?.name || 'Organizer'}
                </div>
                <div className="text-[10px] text-text-3 truncate mt-0.5">
                  {user?.organization || user?.college || 'Organizer Hub'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border h-dvh sticky top-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-10"
            >
              {renderContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

