// src/pages/admin/tabs/ReferAndEarnTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Coins, RotateCw, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Settings, Play, Plus, Search, RefreshCw, Sliders,
  DollarSign, History, Sparkles, UserCheck, Award, Edit3, Trash2,
  Eye, ShieldCheck, ChevronLeft, ChevronRight, User, AlertCircle,
  Clock, ArrowUpRight, ArrowDownLeft, Lock, Filter, Check
} from 'lucide-react';
import { admin } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import StatCard from '../components/StatCard';
import ConfirmDialog from '../components/ConfirmDialog';

const SUB_TABS = [
  { id: 'referrals', label: 'Referrals List', icon: UserCheck },
  { id: 'spins', label: 'Spins & Payouts', icon: RotateCw },
  { id: 'ledger', label: 'FN Coin Ledger', icon: History },
  { id: 'rewards', label: 'Wheel Rewards', icon: Gift },
  { id: 'settings', label: 'Program Settings', icon: Settings },
  { id: 'users', label: 'User Operations', icon: User },
];

export default function ReferAndEarnTab({ showToast, onSelectUser }) {
  const { currentUser, refreshUser } = useApp();

  // Top sub-navigation
  const [subTab, setSubTab] = useState('referrals');

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Self testing state
  const [selfCoins, setSelfCoins] = useState(currentUser?.fnCoins || 0);
  const [grantLoading, setGrantLoading] = useState(false);
  const [testSpinLoading, setTestSpinLoading] = useState(false);
  const [testSpinResult, setTestSpinResult] = useState(null);

  // Modals state
  const [confirmResetCoins, setConfirmResetCoins] = useState(false);
  const [customGrantModal, setCustomGrantModal] = useState(false);
  const [customGrantAmount, setCustomGrantAmount] = useState('100');
  const [customGrantReason, setCustomGrantReason] = useState('Admin manual testing');

  // Test Wheel Modal
  const [testWheelModal, setTestWheelModal] = useState(false);
  const [testWheelSegment, setTestWheelSegment] = useState('');
  const [testWheelDeduct, setTestWheelDeduct] = useState(false);

  // Data states
  const [referrals, setReferrals] = useState([]);
  const [refPage, setRefPage] = useState(1);
  const [refTotalPages, setRefTotalPages] = useState(1);
  const [refStatus, setRefStatus] = useState('');
  const [refEventStatus, setRefEventStatus] = useState('');
  const [refSearch, setRefSearch] = useState('');
  const [refLoading, setRefLoading] = useState(false);

  // Spins data
  const [spins, setSpins] = useState([]);
  const [spinsPage, setSpinsPage] = useState(1);
  const [spinsTotalPages, setSpinsTotalPages] = useState(1);
  const [spinStatusFilter, setSpinStatusFilter] = useState('');
  const [spinTypeFilter, setSpinTypeFilter] = useState('');
  const [spinSearch, setSpinSearch] = useState('');
  const [spinsLoading, setSpinsLoading] = useState(false);

  // Ledger data
  const [ledger, setLedger] = useState([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [ledgerType, setLedgerType] = useState('');
  const [ledgerDirection, setLedgerDirection] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Rewards data
  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardEditModal, setRewardEditModal] = useState(null); // null, 'create', or reward object
  const [deleteRewardItem, setDeleteRewardItem] = useState(null);

  // Settings data
  const [settings, setSettings] = useState({
    coinsPerReferral: 10,
    coinsPerSpin: 200,
    referralsPerMilestone: 10,
    registrationsPerMilestone: 5,
    programActive: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // User Operations Tab state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userProfileData, setUserProfileData] = useState(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userCoinsModal, setUserCoinsModal] = useState(null); // { user, amount: '', reason: '' }
  const [userSpinsModal, setUserSpinsModal] = useState(null); // { user, amount: '', reason: '' }

  // Action modals
  const [invalidateModal, setInvalidateModal] = useState(null); // referral obj
  const [invalidateReason, setInvalidateReason] = useState('');
  const [overrideModal, setOverrideModal] = useState(null); // referral obj
  const [overrideForm, setOverrideForm] = useState({ status: '', eventStatus: '', fnCoinsAwarded: 10, reason: '' });

  const [payoutModal, setPayoutModal] = useState(null); // spin obj
  const [payoutForm, setPayoutForm] = useState({ status: 'paid', statusReason: '', utrNumber: '', notes: '' });

  // 1. Fetch Stats
  const loadStats = useCallback(() => {
    setStatsLoading(true);
    admin.refer.stats()
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(err => showToast?.(err.message || 'Failed to fetch referral stats', 'error'))
      .finally(() => setStatsLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Keep selfCoins in sync with currentUser
  useEffect(() => {
    if (currentUser?.fnCoins !== undefined) {
      setSelfCoins(currentUser.fnCoins);
    }
  }, [currentUser]);

  // 2. Self-grant quick test coins
  const handleQuickGrant = async (amount) => {
    setGrantLoading(true);
    try {
      const res = await admin.refer.grantTestCoins(amount, `Quick test grant (+${amount})`);
      setSelfCoins(res.data?.user?.fnCoins || selfCoins + amount);
      showToast?.(res.message || `Granted +${amount} FN Coins!`, 'success');
      refreshUser?.();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Grant failed', 'error');
    } finally {
      setGrantLoading(false);
    }
  };

  // Custom grant
  const handleCustomGrant = async (e) => {
    e.preventDefault();
    const amt = parseInt(customGrantAmount, 10);
    if (!amt || amt <= 0) {
      showToast?.('Please enter a valid positive amount', 'error');
      return;
    }
    setGrantLoading(true);
    try {
      const res = await admin.refer.grantTestCoins(amt, customGrantReason || 'Admin manual test');
      setSelfCoins(res.data?.user?.fnCoins || selfCoins + amt);
      showToast?.(res.message || `Granted +${amt} FN Coins!`, 'success');
      setCustomGrantModal(false);
      refreshUser?.();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Grant failed', 'error');
    } finally {
      setGrantLoading(false);
    }
  };

  // Reset coins
  const handleResetCoins = async () => {
    try {
      const res = await admin.refer.resetTestCoins();
      setSelfCoins(0);
      setConfirmResetCoins(false);
      showToast?.(res.message || 'Reset test coins to 0', 'success');
      refreshUser?.();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Reset failed', 'error');
    }
  };

  // Admin test spin
  const handleAdminTestSpin = async () => {
    setTestSpinLoading(true);
    try {
      const res = await admin.refer.testSpin({
        forcedSegmentId: testWheelSegment || undefined,
        deductCoins: testWheelDeduct,
      });
      setTestSpinResult(res.data);
      if (testWheelDeduct && res.data?.fnCoinsRemaining !== undefined) {
        setSelfCoins(res.data.fnCoinsRemaining);
        refreshUser?.();
      }
      showToast?.(`Test spin result: Won "${res.data?.reward?.label}"`, 'success');
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Test spin failed', 'error');
    } finally {
      setTestSpinLoading(false);
    }
  };

  // 3. Load Referrals List
  const loadReferrals = useCallback(() => {
    setRefLoading(true);
    const params = { page: refPage, limit: 15 };
    if (refStatus) params.status = refStatus;
    if (refEventStatus) params.eventStatus = refEventStatus;
    if (refSearch.trim()) params.search = refSearch.trim();

    admin.refer.referrals(params)
      .then(res => {
        setReferrals(res.data?.items || []);
        setRefTotalPages(res.data?.pages || 1);
      })
      .catch(err => showToast?.(err.message || 'Failed to load referrals', 'error'))
      .finally(() => setRefLoading(false));
  }, [refPage, refStatus, refEventStatus, refSearch, showToast]);

  useEffect(() => {
    if (subTab === 'referrals') loadReferrals();
  }, [subTab, loadReferrals]);

  // 4. Load Spins List
  const loadSpins = useCallback(() => {
    setSpinsLoading(true);
    const params = { page: spinsPage, limit: 15 };
    if (spinStatusFilter) params.status = spinStatusFilter;
    if (spinTypeFilter) params.type = spinTypeFilter;
    if (spinSearch.trim()) params.search = spinSearch.trim();

    admin.refer.spins(params)
      .then(res => {
        setSpins(res.data?.items || []);
        setSpinsTotalPages(res.data?.pages || 1);
      })
      .catch(err => showToast?.(err.message || 'Failed to load spins', 'error'))
      .finally(() => setSpinsLoading(false));
  }, [spinsPage, spinStatusFilter, spinTypeFilter, spinSearch, showToast]);

  useEffect(() => {
    if (subTab === 'spins') loadSpins();
  }, [subTab, loadSpins]);

  // 5. Load Ledger List
  const loadLedger = useCallback(() => {
    setLedgerLoading(true);
    const params = { page: ledgerPage, limit: 20 };
    if (ledgerType) params.type = ledgerType;
    if (ledgerDirection) params.direction = ledgerDirection;
    if (ledgerSearch.trim()) params.search = ledgerSearch.trim();

    admin.refer.ledger(params)
      .then(res => {
        setLedger(res.data?.items || []);
        setLedgerTotalPages(res.data?.pages || 1);
      })
      .catch(err => showToast?.(err.message || 'Failed to load ledger', 'error'))
      .finally(() => setLedgerLoading(false));
  }, [ledgerPage, ledgerType, ledgerDirection, ledgerSearch, showToast]);

  useEffect(() => {
    if (subTab === 'ledger') loadLedger();
  }, [subTab, loadLedger]);

  // 6. Load Rewards
  const loadRewards = useCallback(() => {
    setRewardsLoading(true);
    admin.refer.rewards()
      .then(res => setRewards(res.data?.rewards || []))
      .catch(err => showToast?.(err.message || 'Failed to load rewards', 'error'))
      .finally(() => setRewardsLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (subTab === 'rewards' || testWheelModal) loadRewards();
  }, [subTab, testWheelModal, loadRewards]);

  // 7. Load Settings
  const loadSettings = useCallback(() => {
    setSettingsLoading(true);
    admin.refer.settings()
      .then(res => {
        if (res.data?.settings) setSettings(res.data.settings);
      })
      .catch(err => showToast?.(err.message || 'Failed to load settings', 'error'))
      .finally(() => setSettingsLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (subTab === 'settings') loadSettings();
  }, [subTab, loadSettings]);

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await admin.refer.updateSettings(settings);
      setSettings(res.data?.settings || settings);
      showToast?.('Referral settings updated successfully', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Referral Actions
  const handleVerifyRegistration = async (id) => {
    try {
      await admin.refer.verifyRegistration(id);
      showToast?.('Event registration verified', 'success');
      loadReferrals();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Verification failed', 'error');
    }
  };

  const handleUnverifyRegistration = async (id) => {
    try {
      await admin.refer.unverifyRegistration(id);
      showToast?.('Event registration qualification reset', 'info');
      loadReferrals();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Reset failed', 'error');
    }
  };

  const handleInvalidate = async () => {
    if (!invalidateModal) return;
    try {
      await admin.refer.invalidateReferral(invalidateModal._id, invalidateReason || 'Fraudulent activity detected');
      showToast?.('Referral invalidated & coins reversed', 'success');
      setInvalidateModal(null);
      setInvalidateReason('');
      loadReferrals();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Invalidation failed', 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      await admin.refer.restoreReferral(id, 'Admin restored validity');
      showToast?.('Referral restored & coins re-credited', 'success');
      loadReferrals();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Restore failed', 'error');
    }
  };

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!overrideModal) return;
    try {
      await admin.refer.overrideReferral(overrideModal._id, overrideForm);
      showToast?.('Referral state successfully overridden', 'success');
      setOverrideModal(null);
      loadReferrals();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Override failed', 'error');
    }
  };

  // Payout Status Update
  const handleUpdatePayout = async (e) => {
    e.preventDefault();
    if (!payoutModal) return;
    try {
      await admin.refer.updateSpinStatus(payoutModal._id, {
        status: payoutForm.status,
        statusReason: payoutForm.statusReason,
        payoutDetails: {
          utrNumber: payoutForm.utrNumber,
          notes: payoutForm.notes,
        },
      });
      showToast?.(`Spin marked as ${payoutForm.status}`, 'success');
      setPayoutModal(null);
      loadSpins();
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Update failed', 'error');
    }
  };

  // User Search Operations
  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;
    setUserSearchLoading(true);
    try {
      // Find matching user first
      const uRes = await admin.listUsers({ search: userSearchQuery.trim(), limit: 1 });
      const user = uRes.data?.users?.[0];
      if (!user) {
        showToast?.('No user found matching search query', 'error');
        setUserProfileData(null);
        return;
      }
      const pRes = await admin.refer.getUserProfile(user._id);
      setUserProfileData(pRes.data);
    } catch (err) {
      showToast?.(err.message || 'User lookup failed', 'error');
    } finally {
      setUserSearchLoading(false);
    }
  };

  // Adjust User Coins
  const handleAdjustCoins = async (e) => {
    e.preventDefault();
    if (!userCoinsModal?.user?._id) return;
    const amt = parseInt(userCoinsModal.amount, 10);
    if (!amt) {
      showToast?.('Please enter a non-zero integer amount', 'error');
      return;
    }
    if (!userCoinsModal.reason?.trim()) {
      showToast?.('Reason is mandatory for manual balance adjustments', 'error');
      return;
    }
    try {
      const res = await admin.refer.adjustCoins(userCoinsModal.user._id, amt, userCoinsModal.reason);
      showToast?.(res.message || 'Balance adjusted successfully', 'success');
      setUserCoinsModal(null);
      if (userProfileData && userProfileData.user._id === userCoinsModal.user._id) {
        const pRes = await admin.refer.getUserProfile(userCoinsModal.user._id);
        setUserProfileData(pRes.data);
      }
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Adjustment failed', 'error');
    }
  };

  // Adjust User Bonus Spins
  const handleAdjustBonusSpins = async (e) => {
    e.preventDefault();
    if (!userSpinsModal?.user?._id) return;
    const amt = parseInt(userSpinsModal.amount, 10);
    if (!amt) {
      showToast?.('Please enter a non-zero integer amount', 'error');
      return;
    }
    if (!userSpinsModal.reason?.trim()) {
      showToast?.('Reason is mandatory for bonus spins modifications', 'error');
      return;
    }
    try {
      const res = await admin.refer.adjustBonusSpins(userSpinsModal.user._id, amt, userSpinsModal.reason);
      showToast?.(res.message || 'Promotional spins updated', 'success');
      setUserSpinsModal(null);
      if (userProfileData && userProfileData.user._id === userSpinsModal.user._id) {
        const pRes = await admin.refer.getUserProfile(userSpinsModal.user._id);
        setUserProfileData(pRes.data);
      }
      loadStats();
    } catch (err) {
      showToast?.(err.message || 'Modification failed', 'error');
    }
  };

  // Reward Config Save
  const handleSaveReward = async (e) => {
    e.preventDefault();
    try {
      if (rewardEditModal?._id) {
        await admin.refer.updateReward(rewardEditModal._id, rewardEditModal);
        showToast?.('Reward segment updated', 'success');
      } else {
        await admin.refer.createReward(rewardEditModal);
        showToast?.('New reward segment created', 'success');
      }
      setRewardEditModal(null);
      loadRewards();
    } catch (err) {
      showToast?.(err.message || 'Reward save failed', 'error');
    }
  };

  const handleDeleteReward = async () => {
    if (!deleteRewardItem) return;
    try {
      await admin.refer.deleteReward(deleteRewardItem._id);
      showToast?.('Reward segment deleted', 'success');
      setDeleteRewardItem(null);
      loadRewards();
    } catch (err) {
      showToast?.(err.message || 'Reward deletion failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── ADMIN TESTING & SELF-DIAGNOSTICS BAR ─── */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/40 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Admin Testing Center
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Direct self-testing & ledger verification
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Your FN Coins Balance:
              </span>
              <span className="inline-flex items-center gap-1.5 text-lg font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-neutral-900 px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                {selfCoins.toLocaleString()}
              </span>
              <button
                onClick={() => setConfirmResetCoins(true)}
                title="Reset test coins to 0"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition"
              >
                Reset to 0
              </button>
            </div>
          </div>

          {/* Quick Grant Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mr-1">
              Self-Grant:
            </span>
            {[10, 50, 100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                disabled={grantLoading}
                onClick={() => handleQuickGrant(amt)}
                className="px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white rounded-xl shadow-2xs transition disabled:opacity-50"
              >
                +{amt}
              </button>
            ))}

            <button
              onClick={() => setCustomGrantModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom
            </button>

            <button
              onClick={() => setTestWheelModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xs flex items-center gap-1 transition ml-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Test Wheel
            </button>
          </div>
        </div>
      </div>

      {/* ─── AUTHORITATIVE KPI OVERVIEW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={UserCheck}
          label="Total Referrals"
          value={stats?.overview?.totalReferrals?.toLocaleString() || '0'}
          sub={`${stats?.overview?.verifiedReferrals || 0} verified (${Math.round(stats?.overview?.conversionRate || 0)}%)`}
          color="indigo"
        />
        <StatCard
          icon={Award}
          label="Event Registrations"
          value={stats?.overview?.registeredReferredUsers?.toLocaleString() || '0'}
          sub={`${Math.round(stats?.overview?.registrationConversion || 0)}% of verified referred users`}
          color="emerald"
        />
        <StatCard
          icon={Coins}
          label="FN Coins in Circulation"
          value={stats?.coins?.inCirculation?.toLocaleString() || '0'}
          sub={`+${stats?.coins?.issued?.toLocaleString() || 0} issued, -${stats?.coins?.spentOnSpins?.toLocaleString() || 0} spent`}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Cash Rewards Paid"
          value={`₹${(stats?.cash?.totalCashPaid || 0).toLocaleString()}`}
          sub={`${stats?.cash?.pending || 0} pending review, ${stats?.cash?.approved || 0} approved`}
          color="rose"
        />
      </div>

      {/* ─── SUB-NAVIGATION PILLS ─── */}
      <div className="bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'spins' && (stats?.cash?.pending || 0) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                  {stats.cash.pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── SUB-TAB 1: REFERRALS LIST ─── */}
      {subTab === 'referrals' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={refStatus}
                onChange={(e) => { setRefStatus(e.target.value); setRefPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="invalid">Invalid</option>
              </select>

              <select
                value={refEventStatus}
                onChange={(e) => { setRefEventStatus(e.target.value); setRefPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                <option value="">All Event Registrations</option>
                <option value="registered">Registered</option>
                <option value="not_registered">Not Registered</option>
              </select>

              <button
                onClick={loadReferrals}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 transition"
                title="Refresh referrals"
              >
                <RefreshCw className={`w-4 h-4 ${refLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search referrer, user, code..."
                value={refSearch}
                onChange={(e) => { setRefSearch(e.target.value); setRefPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] uppercase font-bold text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Referrer</th>
                    <th className="px-4 py-3">Referred User</th>
                    <th className="px-4 py-3">Referral Status</th>
                    <th className="px-4 py-3">Event Registration</th>
                    <th className="px-4 py-3">Coins Awarded</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Supreme Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {refLoading && referrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                        Loading referrals...
                      </td>
                    </tr>
                  ) : referrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                        No referrals found matching criteria
                      </td>
                    </tr>
                  ) : (
                    referrals.map((r) => (
                      <tr key={r._id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {r.referrer?.name || 'Unknown'}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            <span>{r.referrer?.email}</span>
                            <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                              {r.referrer?.referralCode || 'NO_CODE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {r.referredUser?.name || 'New User'}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {r.referredUser?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : r.status === 'invalid'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                          {r.invalidationReason && (
                            <div className="text-[10px] text-rose-500 truncate max-w-[140px]" title={r.invalidationReason}>
                              {r.invalidationReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.eventStatus === 'registered'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {r.eventStatus === 'registered' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                Registered
                              </>
                            ) : (
                              'Not Registered'
                            )}
                          </span>
                          {r.registeredEvent?.title && (
                            <div className="text-[10px] text-neutral-400 truncate max-w-[130px]" title={r.registeredEvent.title}>
                              {r.registeredEvent.title}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">
                          +{r.fnCoinsAwarded || 10} FN
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Qualification verification */}
                            {r.eventStatus !== 'registered' ? (
                              <button
                                onClick={() => handleVerifyRegistration(r._id)}
                                title="Manually verify event registration qualification"
                                className="px-2 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg transition"
                              >
                                Qualify Event
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnverifyRegistration(r._id)}
                                title="Reset event registration qualification"
                                className="px-2 py-1 text-[10px] font-bold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 rounded-lg transition"
                              >
                                Unqualify
                              </button>
                            )}

                            {/* Invalidate / Restore */}
                            {r.status !== 'invalid' ? (
                              <button
                                onClick={() => { setInvalidateModal(r); setInvalidateReason(''); }}
                                title="Mark fraudulent & reverse awarded coins"
                                className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 rounded-lg transition"
                              >
                                Invalidate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(r._id)}
                                title="Restore referral & re-credit coins"
                                className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg transition"
                              >
                                Restore
                              </button>
                            )}

                            {/* Operational Override */}
                            <button
                              onClick={() => {
                                setOverrideModal(r);
                                setOverrideForm({
                                  status: r.status,
                                  eventStatus: r.eventStatus,
                                  fnCoinsAwarded: r.fnCoinsAwarded || 10,
                                  reason: '',
                                });
                              }}
                              title="Supreme Override (State & Coins)"
                              className="px-2 py-1 text-[10px] font-bold bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg transition"
                            >
                              Override
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {refTotalPages > 1 && (
              <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span>Page {refPage} of {refTotalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={refPage <= 1}
                    onClick={() => setRefPage(p => p - 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={refPage >= refTotalPages}
                    onClick={() => setRefPage(p => p + 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 2: SPINS & PAYOUTS ─── */}
      {subTab === 'spins' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={spinStatusFilter}
                onChange={(e) => { setSpinStatusFilter(e.target.value); setSpinsPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Spin Statuses</option>
                <option value="pending">Pending Payout</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="credited">Credited</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={spinTypeFilter}
                onChange={(e) => { setSpinTypeFilter(e.target.value); setSpinsPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Reward Types</option>
                <option value="cash">Cash</option>
                <option value="fn_coins">FN Coins</option>
                <option value="merch">Merchandise</option>
                <option value="bonus_spin">Bonus Spin</option>
                <option value="none">No Prize</option>
              </select>

              <button
                onClick={loadSpins}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 transition"
              >
                <RefreshCw className={`w-4 h-4 ${spinsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, reward label..."
                value={spinSearch}
                onChange={(e) => { setSpinSearch(e.target.value); setSpinsPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] uppercase font-bold text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Won Reward</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Milestone Index</th>
                    <th className="px-4 py-3">Spin Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {spinsLoading && spins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">Loading spins...</td>
                    </tr>
                  ) : spins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No spin records found</td>
                    </tr>
                  ) : (
                    spins.map((s) => (
                      <tr key={s._id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {s.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-[11px] text-neutral-400">{s.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">
                          {s.reward?.label}
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800">
                            {s.reward?.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.status === 'paid' || s.status === 'credited'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : s.status === 'approved'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : s.status === 'pending' || s.status === 'under_review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          #{s.milestoneIndex}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-400">
                          {new Date(s.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setPayoutModal(s);
                              setPayoutForm({
                                status: s.status === 'pending' ? 'approved' : 'paid',
                                statusReason: s.statusReason || '',
                                utrNumber: s.payoutDetails?.utrNumber || '',
                                notes: s.payoutDetails?.notes || '',
                              });
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition"
                          >
                            Manage Payout
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {spinsTotalPages > 1 && (
              <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span>Page {spinsPage} of {spinsTotalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={spinsPage <= 1}
                    onClick={() => setSpinsPage(p => p - 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={spinsPage >= spinsTotalPages}
                    onClick={() => setSpinsPage(p => p + 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 3: FN COIN LEDGER ─── */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ledgerType}
                onChange={(e) => { setLedgerType(e.target.value); setLedgerPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Transaction Types</option>
                <option value="referral_reward">Referral Reward (+10)</option>
                <option value="spin_cost">Spin Cost (-200)</option>
                <option value="spin_reward_coins">Wheel Coins Reward</option>
                <option value="admin_adjustment">Admin Manual Adjustment</option>
                <option value="fraud_reversal">Fraud Reversal</option>
              </select>

              <select
                value={ledgerDirection}
                onChange={(e) => { setLedgerDirection(e.target.value); setLedgerPage(1); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="">All Directions (+ / -)</option>
                <option value="credit">Credits (+)</option>
                <option value="debit">Debits (-)</option>
              </select>

              <button
                onClick={loadLedger}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 transition"
              >
                <RefreshCw className={`w-4 h-4 ${ledgerLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, reason..."
                value={ledgerSearch}
                onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] uppercase font-bold text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Balance After</th>
                    <th className="px-4 py-3">Description & Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {ledgerLoading && ledger.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">Loading ledger...</td></tr>
                  ) : ledger.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No ledger records found</td></tr>
                  ) : (
                    ledger.map((l) => {
                      const isCredit = l.amount > 0;
                      return (
                        <tr key={l._id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition">
                          <td className="px-4 py-3 text-[11px] text-neutral-400 whitespace-nowrap">
                            {new Date(l.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {l.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-[11px] text-neutral-400">{l.user?.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                              {l.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center font-bold font-mono text-xs ${
                                isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5" />
                              )}
                              {isCredit ? `+${l.amount}` : l.amount}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                            {l.balanceAfter?.toLocaleString() ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-neutral-600 dark:text-neutral-300">
                            <div>{l.description}</div>
                            {l.metadata?.adminEmail && (
                              <div className="text-[10px] text-neutral-400">
                                by {l.metadata.adminEmail}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {ledgerTotalPages > 1 && (
              <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span>Page {ledgerPage} of {ledgerTotalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={ledgerPage <= 1}
                    onClick={() => setLedgerPage(p => p - 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={ledgerPage >= ledgerTotalPages}
                    onClick={() => setLedgerPage(p => p + 1)}
                    className="p-1 rounded border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 4: REWARD CONFIGS MANAGER ─── */}
      {subTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Active Wheel Segments & Probabilities
            </h3>
            <button
              onClick={() =>
                setRewardEditModal({
                  segmentId: `segment-${Date.now().toString().slice(-4)}`,
                  label: '',
                  type: 'cash',
                  value: 10,
                  probability: 10,
                  inventory: '',
                  maxWinners: '',
                  order: rewards.length,
                  isActive: true,
                })
              }
              className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Segment
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-400">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] uppercase font-bold text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Segment ID</th>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Probability Weight</th>
                    <th className="px-4 py-3">Inventory / Won</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {rewardsLoading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-400">Loading rewards...</td></tr>
                  ) : rewards.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-400">No rewards configured</td></tr>
                  ) : (
                    rewards.map((r) => (
                      <tr key={r._id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-neutral-500">#{r.order ?? 0}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">{r.segmentId}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">{r.label}</td>
                        <td className="px-4 py-3 capitalize font-bold">{r.type}</td>
                        <td className="px-4 py-3 font-mono">{r.value !== null ? r.value : '—'}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.probability}%</td>
                        <td className="px-4 py-3 text-[11px]">
                          {r.inventory !== null ? `${r.inventory} left` : 'Unlimited'} ({r.totalWon || 0} won)
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {r.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setRewardEditModal({ ...r })}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600"
                              title="Edit segment"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteRewardItem(r)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 rounded text-rose-600"
                              title="Delete segment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TAB 5: PROGRAM RULES & SETTINGS ─── */}
      {subTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Referral & Spin Economy Rules
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Changes apply immediately to milestone progression and cost calculations platform-wide.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60">
              <div>
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Referral Program Active
                </div>
                <div className="text-[11px] text-neutral-500">
                  Enable or temporarily freeze the Refer & Earn reward distribution
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.programActive}
                onChange={(e) => setSettings({ ...settings, programActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  FN Coins per Verified Referral
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.coinsPerReferral}
                  onChange={(e) => setSettings({ ...settings, coinsPerReferral: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Standard: 10 FN Coins</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  FN Coins Cost per Spin
                </label>
                <input
                  type="number"
                  min="10"
                  value={settings.coinsPerSpin}
                  onChange={(e) => setSettings({ ...settings, coinsPerSpin: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Standard: 200 FN Coins</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Referrals per Milestone Unlock
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.referralsPerMilestone}
                  onChange={(e) => setSettings({ ...settings, referralsPerMilestone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Standard: 10 referrals</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Registrations per Milestone Unlock
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.registrationsPerMilestone}
                  onChange={(e) => setSettings({ ...settings, registrationsPerMilestone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Standard: 5 event registrations</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── SUB-TAB 6: USER OPERATIONS & DIRECT ADJUSTMENTS ─── */}
      {subTab === 'users' && (
        <div className="space-y-6">
          {/* User Search Bar */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <form onSubmit={handleSearchUser} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or referral code to inspect & adjust..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={userSearchLoading}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs transition disabled:opacity-50"
              >
                {userSearchLoading ? 'Searching...' : 'Inspect User'}
              </button>
            </form>
          </div>

          {/* User Profile Card & Direct Operational Overrides */}
          {userProfileData && (
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {userProfileData.user?.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Code: {userProfileData.user?.referralCode || 'NONE'}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {userProfileData.user?.email} • Joined {new Date(userProfileData.user?.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setUserCoinsModal({
                        user: userProfileData.user,
                        amount: '100',
                        reason: '',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Adjust FN Coins
                  </button>

                  <button
                    onClick={() =>
                      setUserSpinsModal({
                        user: userProfileData.user,
                        amount: '1',
                        reason: '',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Grant/Revoke Spins
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] font-bold text-neutral-500">FN Coins Balance</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {(userProfileData.user?.fnCoins || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] font-bold text-neutral-500">Available Spins</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {userProfileData.stats?.availableSpins || 0}{' '}
                    <span className="text-xs font-normal text-neutral-400">
                      (+{userProfileData.stats?.bonusSpins || 0} bonus)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] font-bold text-neutral-500">Verified Referrals</div>
                  <div className="text-lg font-black text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {userProfileData.stats?.verifiedReferrals || 0}{' '}
                    <span className="text-xs font-normal text-neutral-400">
                      / {userProfileData.stats?.totalReferrals || 0}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="text-[11px] font-bold text-neutral-500">Registered Events</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {userProfileData.stats?.uniqueRegisteredUsers || 0}
                  </div>
                </div>
              </div>

              {/* User Referrals Snippet */}
              <div>
                <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Recent Referrals by {userProfileData.user?.name}
                </h4>
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                      <tr>
                        <th className="px-3 py-2">Referred User</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Event</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {userProfileData.referrals?.length === 0 ? (
                        <tr><td colSpan={4} className="px-3 py-4 text-center text-neutral-400">No referrals made yet</td></tr>
                      ) : (
                        userProfileData.referrals?.map((r) => (
                          <tr key={r._id}>
                            <td className="px-3 py-2 font-medium">{r.referredUser?.name} ({r.referredUser?.email})</td>
                            <td className="px-3 py-2 capitalize font-bold">{r.status}</td>
                            <td className="px-3 py-2 capitalize">{r.eventStatus}</td>
                            <td className="px-3 py-2 text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODALS ─── */}

      {/* 1. Custom Self-Grant Modal */}
      <AnimatePresence>
        {customGrantModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Custom Self-Grant FN Coins
              </h3>
              <form onSubmit={handleCustomGrant} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Amount (Max 10,000)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={customGrantAmount}
                    onChange={(e) => setCustomGrantAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Audit Reason
                  </label>
                  <input
                    type="text"
                    value={customGrantReason}
                    onChange={(e) => setCustomGrantReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCustomGrantModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grantLoading}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                  >
                    {grantLoading ? 'Granting...' : 'Grant to Self'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Confirm Reset Coins Dialog */}
      <ConfirmDialog
        isOpen={confirmResetCoins}
        title="Reset Your Test FN Coins?"
        message="This will reset your personal FN Coins balance to 0. A negative adjustment will be recorded in the ledger for full audit accountability."
        confirmText="Confirm Reset to 0"
        confirmVariant="danger"
        onConfirm={handleResetCoins}
        onCancel={() => setConfirmResetCoins(false)}
      />

      {/* 3. Test Spin Wheel Modal */}
      <AnimatePresence>
        {testWheelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-purple-600" />
                Isolated Admin Test Spin
              </h3>
              <p className="text-xs text-neutral-500">
                Execute a test spin to verify reward payouts and wheel randomness without consuming milestone slots.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Force Specific Segment (Optional)
                  </label>
                  <select
                    value={testWheelSegment}
                    onChange={(e) => setTestWheelSegment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-medium"
                  >
                    <option value="">Random (Weighted Probability)</option>
                    {rewards.map((r) => (
                      <option key={r.segmentId} value={r.segmentId}>
                        {r.label} ({r.type} - weight {r.probability}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <input
                    type="checkbox"
                    id="deductCoinsCheck"
                    checked={testWheelDeduct}
                    onChange={(e) => setTestWheelDeduct(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="deductCoinsCheck" className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                    Simulate real spin cost (deduct 200 FN Coins from your balance)
                  </label>
                </div>

                {testSpinResult && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                    <div className="font-bold text-purple-800 dark:text-purple-200">
                      Result: Won "{testSpinResult.reward?.label}"
                    </div>
                    <div className="text-neutral-500">
                      Segment: {testSpinResult.winningSegmentId} | Remaining coins: {testSpinResult.fnCoinsRemaining}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setTestWheelModal(false); setTestSpinResult(null); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={testSpinLoading}
                  onClick={handleAdminTestSpin}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5"
                >
                  {testSpinLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Spin Test Wheel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Invalidate Referral Modal */}
      <AnimatePresence>
        {invalidateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Invalidate Referral & Reverse Points
              </h3>
              <p className="text-xs text-neutral-500">
                Marking referral between <strong>{invalidateModal.referrer?.name}</strong> and <strong>{invalidateModal.referredUser?.name}</strong> as fraudulent. This will deduct +{invalidateModal.fnCoinsAwarded || 10} FN Coins from the referrer's balance.
              </p>
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Reason for Invalidation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Self-referral, fake email, coordinated botting"
                  value={invalidateReason}
                  onChange={(e) => setInvalidateReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInvalidateModal(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInvalidate}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Confirm Invalidate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Override Referral State Modal */}
      <AnimatePresence>
        {overrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Supreme Referral Override
              </h3>
              <form onSubmit={handleOverride} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Referral Status
                  </label>
                  <select
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="invalid">Invalid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Event Qualification Status
                  </label>
                  <select
                    value={overrideForm.eventStatus}
                    onChange={(e) => setOverrideForm({ ...overrideForm, eventStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value="not_registered">Not Registered</option>
                    <option value="registered">Registered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mandatory Operational Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Provide justification for audit log..."
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOverrideModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Spin Cash Payout Management Modal */}
      <AnimatePresence>
        {payoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Process Spin Payout ({payoutModal.reward?.label})
              </h3>
              <p className="text-xs text-neutral-500">
                User: <strong>{payoutModal.user?.name}</strong> ({payoutModal.user?.email})
              </p>
              <form onSubmit={handleUpdatePayout} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payout Status
                  </label>
                  <select
                    value={payoutForm.status}
                    onChange={(e) => setPayoutForm({ ...payoutForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value="approved">Approved</option>
                    <option value="paid">Paid (Disbursed)</option>
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Bank / UPI Reference (UTR Number)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI/1234567890/SBI"
                    value={payoutForm.utrNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, utrNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Admin Notes / Status Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Transferred via GPay to 9876543210"
                    value={payoutForm.statusReason}
                    onChange={(e) => setPayoutForm({ ...payoutForm, statusReason: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayoutModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. User Coins Adjustment Modal */}
      <AnimatePresence>
        {userCoinsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Adjust FN Coins for {userCoinsModal.user?.name}
              </h3>
              <p className="text-xs text-neutral-500">
                Current balance: <strong>{userCoinsModal.user?.fnCoins || 0} FN Coins</strong>.
                Enter a positive number to add, or negative number to deduct.
              </p>
              <form onSubmit={handleAdjustCoins} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Amount Delta (+/-)
                  </label>
                  <input
                    type="number"
                    required
                    value={userCoinsModal.amount}
                    onChange={(e) => setUserCoinsModal({ ...userCoinsModal, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mandatory Reason for Ledger Record
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Promotional grant, event participation bonus, correction"
                    value={userCoinsModal.reason}
                    onChange={(e) => setUserCoinsModal({ ...userCoinsModal, reason: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUserCoinsModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. User Bonus Spins Modal */}
      <AnimatePresence>
        {userSpinsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-purple-600" />
                Grant/Revoke Promotional Bonus Spins
              </h3>
              <p className="text-xs text-neutral-500">
                User: <strong>{userSpinsModal.user?.name}</strong> (Current bonus spins: {userSpinsModal.user?.bonusSpins || 0}).
                Promotional spins can be used directly without milestone restrictions.
              </p>
              <form onSubmit={handleAdjustBonusSpins} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Spins Delta (+/-)
                  </label>
                  <input
                    type="number"
                    required
                    value={userSpinsModal.amount}
                    onChange={(e) => setUserSpinsModal({ ...userSpinsModal, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mandatory Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campaign reward, VIP gift, bug compensation"
                    value={userSpinsModal.reason}
                    onChange={(e) => setUserSpinsModal({ ...userSpinsModal, reason: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUserSpinsModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                  >
                    Apply Spins Delta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Reward Segment Create/Edit Modal */}
      <AnimatePresence>
        {rewardEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-600" />
                {rewardEditModal._id ? 'Edit Reward Segment' : 'Create Wheel Segment'}
              </h3>
              <form onSubmit={handleSaveReward} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Segment ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!rewardEditModal._id}
                    value={rewardEditModal.segmentId}
                    onChange={(e) => setRewardEditModal({ ...rewardEditModal, segmentId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Display Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹50 Cash, FestNest Merch"
                    value={rewardEditModal.label}
                    onChange={(e) => setRewardEditModal({ ...rewardEditModal, label: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Type</label>
                    <select
                      value={rewardEditModal.type}
                      onChange={(e) => setRewardEditModal({ ...rewardEditModal, type: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    >
                      <option value="cash">Cash</option>
                      <option value="fn_coins">FN Coins</option>
                      <option value="merch">Merchandise</option>
                      <option value="bonus_spin">Bonus Spin</option>
                      <option value="none">No Prize</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Value (Amount)</label>
                    <input
                      type="number"
                      value={rewardEditModal.value ?? ''}
                      onChange={(e) => setRewardEditModal({ ...rewardEditModal, value: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Probability Weight</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={rewardEditModal.probability}
                      onChange={(e) => setRewardEditModal({ ...rewardEditModal, probability: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Inventory Limit</label>
                    <input
                      type="number"
                      placeholder="Blank for unlimited"
                      value={rewardEditModal.inventory ?? ''}
                      onChange={(e) => setRewardEditModal({ ...rewardEditModal, inventory: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rewardActiveCheck"
                    checked={rewardEditModal.isActive}
                    onChange={(e) => setRewardEditModal({ ...rewardEditModal, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="rewardActiveCheck" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Segment is active on the wheel
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRewardEditModal(null)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Save Segment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. Delete Reward Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteRewardItem}
        title="Delete Reward Segment?"
        message={`Are you sure you want to delete "${deleteRewardItem?.label}" (${deleteRewardItem?.segmentId})? This action cannot be undone.`}
        confirmText="Delete Segment"
        confirmVariant="danger"
        onConfirm={handleDeleteReward}
        onCancel={() => setDeleteRewardItem(null)}
      />
    </div>
  );
}

