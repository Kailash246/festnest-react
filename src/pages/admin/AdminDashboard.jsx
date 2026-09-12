// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, Component } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { admin } from '../../services/api';

// Admin Core Shell Components
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import UserDetailDrawer from './components/UserDetailDrawer';
import SubmissionPreviewModal from './components/SubmissionPreviewModal';
import EventCreateModal from './components/EventCreateModal';

// Admin Tab Views
import OverviewTab from './tabs/OverviewTab';
import SubmissionsTab from './tabs/SubmissionsTab';
import EventsTab from './tabs/EventsTab';
import UsersTab from './tabs/UsersTab';
import TicketsTab from './tabs/TicketsTab';
import FeaturedTab from './tabs/FeaturedTab';
import BroadcastTab from './tabs/BroadcastTab';
import CollegesTab from './tabs/CollegesTab';
import AmbassadorsTab from './tabs/AmbassadorsTab';
import FeedbackTab from './tabs/FeedbackTab';
import ReferAndEarnTab from './tabs/ReferAndEarnTab';

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-xl max-w-lg w-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Admin Console Notice</h2>
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
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
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

function AdminDashboardContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, isLoggedIn, currentUser, showToast, refreshUser } = useApp();

  // Tab state synced with URL ?tab=...
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('festnest_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Global modals & drawers
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [modalActionLoading, setModalActionLoading] = useState(false);

  // Dashboard stats & live badges
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh user role on mount to prevent stale localStorage roles
  useEffect(() => {
    if (isLoggedIn) refreshUser?.();
  }, [isLoggedIn]);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('festnest_admin_sidebar_collapsed', String(sidebarCollapsed));
    } catch (e) {
      // ignore
    }
  }, [sidebarCollapsed]);

  // Sync tab change to URL search params
  const handleSelectTab = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams(tabId === 'overview' ? {} : { tab: tabId }, { replace: true });
    setMobileNavOpen(false);
  }, [setSearchParams]);

  // Sync from URL if changed externally
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!tabParam && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [tabParam]);

  // Fetch dashboard stats for badges and indicators
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await admin.stats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchDashboardStats();
    }
  }, [isLoggedIn, isAdmin, fetchDashboardStats]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
    showToast?.('Dashboard stats refreshed', 'info');
  };

  // Handlers for Submission Preview Modal
  const handleApproveFromModal = async (id, options = {}) => {
    setModalActionLoading(true);
    try {
      await admin.approveSubmission(id, options);
      showToast?.(`Event approved and published live!`, 'success');
      setPreviewSubmission(null);
      fetchDashboardStats();
    } catch (e) {
      showToast?.(e.message || 'Approval failed', 'error');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleRejectFromModal = async (id, reason) => {
    setModalActionLoading(true);
    try {
      await admin.rejectSubmission(id, reason);
      showToast?.('Submission rejected', 'info');
      setPreviewSubmission(null);
      fetchDashboardStats();
    } catch (e) {
      showToast?.(e.message || 'Rejection failed', 'error');
    } finally {
      setModalActionLoading(false);
    }
  };

  // Graceful Access Denied Screen if user is not authenticated or not admin
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Admin Privileges Required</h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {!isLoggedIn
                ? 'Please sign in with your administrator account to access this area.'
                : `Account "${currentUser?.name || currentUser?.email}" (${currentUser?.role || 'user'}) does not have administrator privileges.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => navigate('/home')}
              className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to FestNest
            </button>
            <button
              onClick={() => {
                navigate('/home');
              }}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="relative min-h-screen bg-slate-50 text-neutral-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Collapsible Sidebar & Mobile Drawer (Fixed on desktop) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        stats={stats}
        isSuperAdmin={isSuperAdmin}
        currentUser={currentUser}
      />

      {/* Main Content Area: padded left for fixed sidebar on md+ screens */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-200 ${
          sidebarCollapsed ? 'md:pl-[70px]' : 'md:pl-[240px]'
        }`}
      >
        {/* Topbar: sticky at top 0 */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
          stats={stats}
          currentUser={currentUser}
          onCreateEvent={() => setCreateEventOpen(true)}
          onSelectTab={handleSelectTab}
        />

        {/* Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  showToast={showToast}
                  parentStats={stats}
                  onSelectTab={handleSelectTab}
                  onSelectUser={(uid) => setSelectedUserId(uid)}
                  onOpenCreateEvent={() => setCreateEventOpen(true)}
                  onPreviewSubmission={(sub) => setPreviewSubmission(sub)}
                />
              )}

              {activeTab === 'submissions' && (
                <SubmissionsTab
                  showToast={showToast}
                  onPreviewSubmission={(sub) => setPreviewSubmission(sub)}
                />
              )}

              {activeTab === 'events' && (
                <EventsTab
                  showToast={showToast}
                  onOpenCreate={() => setCreateEventOpen(true)}
                />
              )}

              {activeTab === 'users' && (
                <UsersTab
                  showToast={showToast}
                  onSelectUser={(uid) => setSelectedUserId(uid)}
                />
              )}

              {activeTab === 'refer' && (
                <ReferAndEarnTab
                  showToast={showToast}
                  onSelectUser={(uid) => setSelectedUserId(uid)}
                />
              )}

              {activeTab === 'tickets' && (
                <TicketsTab showToast={showToast} />
              )}

              {activeTab === 'featured' && (
                <FeaturedTab showToast={showToast} />
              )}

              {activeTab === 'notify' && (
                <BroadcastTab showToast={showToast} />
              )}

              {activeTab === 'colleges' && (
                <CollegesTab showToast={showToast} />
              )}

              {activeTab === 'ambassadors' && (
                <AmbassadorsTab showToast={showToast} />
              )}

              {activeTab === 'feedback' && (
                <FeedbackTab showToast={showToast} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Slide-In User Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        showToast={showToast}
        isSuperAdmin={isSuperAdmin}
        onUserUpdated={() => fetchDashboardStats()}
      />

      {/* Global Submission Preview Modal */}
      <SubmissionPreviewModal
        sub={previewSubmission}
        onClose={() => setPreviewSubmission(null)}
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
        actionLoading={modalActionLoading}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Global Direct Live Event Creator Modal */}
      <EventCreateModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={() => {
          fetchDashboardStats();
          if (activeTab === 'events') {
            handleSelectTab('events');
          }
        }}
        showToast={showToast}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminErrorBoundary>
      <AdminDashboardContent />
    </AdminErrorBoundary>
  );
}
