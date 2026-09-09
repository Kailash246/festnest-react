// src/pages/organizer/OrganizerDashboard.jsx
import React, { useState, useEffect, useCallback, Component } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  RotateCw,
  ArrowLeft,
  ShieldAlert,
  CalendarDays,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { users as usersApi, events as eventsApi } from '../../services/api';

// Core Organizer Shell Components
import OrganizerSidebar from './components/OrganizerSidebar';
import OrganizerTopbar from './components/OrganizerTopbar';
import CompetitionManager from './components/CompetitionManager';
import EventDetailDrawer from './components/EventDetailDrawer';

// Organizer Tabs
import OverviewTab from './tabs/OverviewTab';
import EventsTab from './tabs/EventsTab';
import ParticipantsTab from './tabs/ParticipantsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import TipsTab from './tabs/TipsTab';
import { SHOW_ENGAGEMENT_ANALYTICS } from './config';

// Re-export CompetitionManager for backward compatibility with EventDetails.jsx
export { CompetitionManager };

class OrganizerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Organizer Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-xl max-w-lg w-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Organizer Dashboard Notice
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                A component encountered an issue while rendering. Diagnostic details:
              </p>
            </div>
            <pre className="p-3 bg-neutral-900 text-rose-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
              {this.state.error?.message || 'Unknown render error'}
            </pre>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Reload Dashboard
              </button>
              <button
                onClick={() => {
                  window.location.href = '/home';
                }}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function OrganizerDashboardContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, currentUser, requireAuth, showToast } = useApp();

  const isOrganizer  = currentUser?.role === 'organizer';
  const isAdmin      = currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const canAccess    = isOrganizer || isAdmin || isSuperAdmin;

  // Active Tab synchronized with ?tab=
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  // Sync tab state to URL
  const handleSelectTab = useCallback(
    tabId => {
      setActiveTab(tabId);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (tabId === 'overview') {
          next.delete('tab');
        } else {
          next.set('tab', tabId);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // Sync back from URL on navigation
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!tabParam && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [tabParam]);

  // Collapsible Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('festnest_organizer_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('festnest_organizer_sidebar_collapsed', String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [user, setUser] = useState(currentUser);

  // Detail Drawer state
  const [inspectedEvent, setInspectedEvent] = useState(null);

  // Direct Competition Modal state
  const [competitionEvent, setCompetitionEvent] = useState(null);

  // Auth gate check
  useEffect(() => {
    if (!isLoggedIn) {
      requireAuth();
      return;
    }
    if (!canAccess) {
      showToast?.('You must be an organizer or admin to access this dashboard', 'error');
      navigate('/home');
    }
  }, [isLoggedIn, canAccess, requireAuth, navigate, showToast]);

  // Load dashboard data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isLoggedIn || !canAccess) return;
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    try {
      const [meRes, hostedRes] = await Promise.all([
        usersApi.me(),
        usersApi.hosted(),
      ]);

      setUser(meRes.data?.user || currentUser);
      setEvents(hostedRes.data?.hostedEvents || []);
      setRegistrations(hostedRes.data?.registrations || []);
    } catch (err) {
      showToast?.(err.message || 'Failed to refresh dashboard data', 'error');
      if (currentUser) setUser(currentUser);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoggedIn, canAccess, currentUser, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isLoggedIn || !canAccess) return null;

  // Badge counts for sidebar
  const pendingCount = events.filter(e => e.status === 'pending').length;
  const totalRegistrationsCount =
    registrations.length > 0
      ? registrations.length
      : events.reduce((sum, e) => sum + (e.linkedEvent?.stats?.registrationCount || e.registrationCount || 0), 0);

  return (
    <div className="min-h-dvh flex bg-[#F8F8F6] text-text-1 antialiased font-sans">
      {/* ── Sidebar ── */}
      <OrganizerSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        user={user}
        counts={{
          totalEvents: events.length,
          totalRegistrations: SHOW_ENGAGEMENT_ANALYTICS ? totalRegistrationsCount : null,
          pendingEvents: pendingCount,
        }}
      />

      {/* ── Main Layout Column ── */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-y-auto">
        {/* Topbar */}
        <OrganizerTopbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onRefresh={() => loadData(true)}
          refreshing={refreshing}
          user={user}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 rounded-2xl bg-surface-2" />
              <div className={`grid gap-4 ${
                SHOW_ENGAGEMENT_ANALYTICS
                  ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4'
              }`}>
                {[...Array(SHOW_ENGAGEMENT_ANALYTICS ? 6 : 4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-surface-2" />
                ))}
              </div>
              <div className="h-72 rounded-2xl bg-surface-2" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    events={events}
                    registrations={registrations}
                    user={user}
                    navigate={navigate}
                    onSelectTab={handleSelectTab}
                    onInspectEvent={ev => setInspectedEvent(ev)}
                    onOpenCompetitions={ev => setCompetitionEvent(ev)}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'events' && (
                  <EventsTab
                    events={events}
                    navigate={navigate}
                    onInspectEvent={ev => setInspectedEvent(ev)}
                    onOpenCompetitions={ev => setCompetitionEvent(ev)}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'participants' && (
                  <ParticipantsTab
                    events={events}
                    registrations={registrations}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    events={events}
                    registrations={registrations}
                    navigate={navigate}
                  />
                )}

                {activeTab === 'tips' && (
                  <TipsTab navigate={navigate} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── Slide-over Event Detail Drawer ── */}
      <EventDetailDrawer
        event={inspectedEvent}
        isOpen={Boolean(inspectedEvent)}
        onClose={() => setInspectedEvent(null)}
        navigate={navigate}
        showToast={showToast}
        onOpenCompetitions={ev => {
          setInspectedEvent(null);
          setCompetitionEvent(ev);
        }}
      />

      {/* ── Sub-Events / Competition Manager Modal ── */}
      {competitionEvent && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
              <div>
                <h3 className="font-heading font-bold text-[17px] text-text-1">
                  Track Management
                </h3>
                <p className="text-[12px] text-text-3">
                  {competitionEvent.eventName}
                </p>
              </div>
              <button
                onClick={() => setCompetitionEvent(null)}
                className="px-3 py-1.5 rounded-lg bg-surface-2 text-text-2 hover:bg-surface-3 text-[12px] font-semibold transition-colors"
              >
                Close
              </button>
            </div>
            <CompetitionManager
              eventKey={
                competitionEvent.linkedEvent?.slug ||
                competitionEvent.linkedEvent?._id ||
                competitionEvent.linkedEvent
              }
              eventName={competitionEvent.eventName}
              showToast={showToast}
              onCompetitionsChanged={() => loadData(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizerDashboard() {
  return (
    <OrganizerErrorBoundary>
      <OrganizerDashboardContent />
    </OrganizerErrorBoundary>
  );
}
