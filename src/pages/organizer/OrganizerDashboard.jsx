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
import useLongWait from '../../hooks/useLongWait';
import LongWaitNotice from '../../components/loading/LongWaitNotice';

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
  const [userLoading, setUserLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [user, setUser] = useState(currentUser);
  const isEventsLongWait = useLongWait(eventsLoading);

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

  // Load dashboard data with decoupled promises
  const loadData = useCallback(async (isSilent = false) => {
    if (!isLoggedIn || !canAccess) return;
    if (!isSilent) {
      setUserLoading(true);
      setEventsLoading(true);
    }
    setRefreshing(true);

    const userPromise = usersApi.me()
      .then(meRes => {
        setUser(meRes.data?.user || currentUser);
      })
      .catch(err => {
        console.error('Failed to fetch user', err);
        if (currentUser) setUser(currentUser);
      })
      .finally(() => {
        setUserLoading(false);
      });

    const hostedPromise = usersApi.hosted()
      .then(hostedRes => {
        setEvents(hostedRes.data?.hostedEvents || []);
        setRegistrations(hostedRes.data?.registrations || []);
      })
      .catch(err => {
        console.error('Failed to fetch hosted events', err);
        showToast?.(err.message || 'Failed to refresh dashboard data', 'error');
      })
      .finally(() => {
        setEventsLoading(false);
      });

    try {
      await Promise.allSettled([userPromise, hostedPromise]);
    } finally {
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
                  userLoading={userLoading}
                  eventsLoading={eventsLoading}
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
                eventsLoading ? (
                  <div className="space-y-5">
                    <LongWaitNotice isLongWait={isEventsLongWait} />
                    <div className="bg-white border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
                      <div className="skeleton h-10 w-full max-w-md rounded-xl" />
                      <div className="skeleton h-10 w-32 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="skeleton h-40 w-full rounded-xl" />
                          <div className="skeleton h-5 w-3/4 rounded" />
                          <div className="skeleton h-3.5 w-1/2 rounded" />
                          <div className="flex justify-between items-center pt-2">
                            <div className="skeleton h-6 w-16 rounded-full" />
                            <div className="skeleton h-8 w-20 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EventsTab
                    events={events}
                    navigate={navigate}
                    onInspectEvent={ev => setInspectedEvent(ev)}
                    onOpenCompetitions={ev => setCompetitionEvent(ev)}
                    showToast={showToast}
                  />
                )
              )}

              {activeTab === 'participants' && (
                eventsLoading ? (
                  <div className="space-y-5">
                    <LongWaitNotice isLongWait={isEventsLongWait} />
                    <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="skeleton h-6 w-48 rounded" />
                      <div className="skeleton h-4 w-72 rounded" />
                      <div className="space-y-2.5 pt-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="skeleton h-12 w-full rounded-xl" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ParticipantsTab
                    events={events}
                    registrations={registrations}
                    showToast={showToast}
                  />
                )
              )}

              {activeTab === 'analytics' && (
                eventsLoading ? (
                  <div className="space-y-5">
                    <LongWaitNotice isLongWait={isEventsLongWait} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="skeleton h-5 w-40 rounded" />
                        <div className="skeleton h-64 w-full rounded-xl" />
                      </div>
                      <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="skeleton h-5 w-40 rounded" />
                        <div className="skeleton h-64 w-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnalyticsTab
                    events={events}
                    registrations={registrations}
                    navigate={navigate}
                  />
                )
              )}

              {activeTab === 'tips' && (
                <TipsTab navigate={navigate} />
              )}
            </motion.div>
          </AnimatePresence>
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
