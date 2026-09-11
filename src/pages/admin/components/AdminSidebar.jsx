// src/pages/admin/components/AdminSidebar.jsx
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  Ticket,
  Star,
  Megaphone,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Activity,
  X,
  Award,
  MessageSquare,
} from 'lucide-react';

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'submissions', label: 'Submissions', icon: ClipboardList, badgeKey: 'pendingSubmissions', badgeColor: 'amber' },
      { id: 'events',      label: 'Events',      icon: CalendarDays },
      { id: 'users',       label: 'Users',       icon: Users },
      { id: 'tickets',     label: 'Tickets',     icon: Ticket, badgeKey: 'openTickets', badgeColor: 'red' },
      { id: 'feedback',    label: 'Feedback',    icon: MessageSquare, badgeKey: 'totalFeedback', badgeColor: 'blue' },
      { id: 'ambassadors', label: 'Ambassadors', icon: Award,  badgeKey: 'pendingAmbassadors', badgeColor: 'purple' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { id: 'featured',  label: 'Featured',  icon: Star, superAdminOnly: true },
      { id: 'notify',    label: 'Broadcast', icon: Megaphone },
      { id: 'colleges',  label: 'Colleges',  icon: GraduationCap },
    ],
  },
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  stats,
  isSuperAdmin,
  currentUser,
}) {
  const navigate = useNavigate();

  const totals = stats?.totals || {};

  const renderContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-white select-none">
        {/* Top Brand / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border flex-shrink-0">
          <div
            onClick={() => onSelectTab('overview')}
            onClick={() => {
              onSelectTab('overview');
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-[17px] text-text-1 tracking-tight">FestNest</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-primary-light text-primary border border-primary/20 rounded-md">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-text-3 truncate -mt-0.5">Admin Console</div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="w-7 h-7 rounded-lg border border-border text-text-3 hover:text-text-1 hover:bg-surface-2 flex items-center justify-center transition-colors ml-auto"
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="w-8 h-8 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => !item.superAdminOnly || isSuperAdmin);
            if (!visibleItems.length) return null;

            return (
              <div key={section.title} className="space-y-1">
                {(!isCollapsed || isMobile) && (
                  <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-4">
                    {section.title}
                  </div>
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badgeCount = item.badgeKey ? totals[item.badgeKey] : null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={isCollapsed ? item.label : undefined}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (isMobile) onCloseMobile();
                      }}
                      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={`flex-shrink-0 transition-transform ${
                          isActive ? 'text-white' : 'text-text-3 group-hover:text-primary'
                        }`}
                      />

                      {(!isCollapsed || isMobile) && (
                        <span className="flex-1 text-left truncate">{item.label}</span>
                      )}

                      {/* Live Badge counts (e.g. pending submissions or open tickets) */}
                      {Boolean(badgeCount && badgeCount > 0) && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : item.badgeColor === 'red'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : item.badgeColor === 'purple'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          } ${isCollapsed ? 'absolute -top-1 -right-1 px-1 text-[9px]' : ''}`}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-border space-y-2 flex-shrink-0">
          {/* Health Status Indicator */}
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg border border-border/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-text-3 truncate flex-1">API & DB Online</span>
              <Activity size={12} className="text-emerald-500 flex-shrink-0" />
            </div>
          )}

          {/* Back to User App Button */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            title={isCollapsed ? 'Exit to FestNest' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-text-3 hover:text-primary hover:bg-primary-light/60 rounded-xl transition-colors border border-transparent hover:border-primary/20 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            {(!isCollapsed || isMobile) && <span>Exit to FestNest</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 h-screen flex-shrink-0 border-r border-border bg-white transition-[width] duration-200 ease-in-out z-30 ${
          collapsed ? 'w-[70px]' : 'w-[240px]'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop + Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-[300]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-[270px] bg-white z-[301] shadow-2xl"
            >
              {renderContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

