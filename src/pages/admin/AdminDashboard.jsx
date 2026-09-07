// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function AdminDashboard() {
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

  // Guard access
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      showToast?.('Admin access required', 'error');
    }
  }, [isLoggedIn, isAdmin, navigate, showToast]);

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

  if (!isLoggedIn || !isAdmin) return null;

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Collapsible Sidebar & Mobile Drawer */}
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

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[70px]' : 'lg:pl-[240px]'
        }`}
      >
        {/* Topbar */}
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
            // Trigger refresh
            handleSelectTab('events');
          }
        }}
        showToast={showToast}
      />
    </div>
  );
}
