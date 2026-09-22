// src/services/caService.js
import { CA_PROGRAM_CONFIG } from '../pages/ca/config/caProgramConfig';
import { getReferralUrl } from '../config/site';

/**
 * Calculates verified points and reward eligibility based on CA stats.
 *
 * Scoring:
 * - 1 pt per verified user
 * - 5 pts per verified organizer
 * - 10 pts total for organizer with first approved event (+5 upgrade)
 */
export function calculateCAPerformance(stats = {}) {
  const verifiedUsers = Number(stats.referralSignups || 0);
  const verifiedOrganizers = Number(stats.organizersOnboarded || 0);
  const approvedEvents = Number(stats.eventsSourced || 0);

  // If backend ever provides precomputed points, respect it, otherwise compute according to model
  let totalPoints = stats.totalPoints !== undefined ? Number(stats.totalPoints) : 0;
  if (!totalPoints) {
    // Each organizer with an approved event gets upgraded from 5 to 10 pts (capped by min(organizers, events))
    const upgradedOrganizers = Math.min(verifiedOrganizers, approvedEvents);
    const standardOrganizers = Math.max(0, verifiedOrganizers - upgradedOrganizers);

    totalPoints = (verifiedUsers * 1) + (standardOrganizers * 5) + (upgradedOrganizers * 10);
  }

  const { milestones } = CA_PROGRAM_CONFIG;

  const hasUsers = verifiedUsers >= milestones.rewardUsers;
  const hasEvents = approvedEvents >= milestones.rewardEvents;
  const hasOrganizers = verifiedOrganizers >= milestones.rewardOrganizers;
  const hasPoints = totalPoints >= milestones.rewardPoints;
  const isEligible = hasUsers && hasEvents && hasOrganizers && hasPoints;

  const certificateUnlocked = totalPoints >= milestones.certificatePoints;
  const certificatePointsRemaining = Math.max(0, milestones.certificatePoints - totalPoints);
  const rewardPointsRemaining = Math.max(0, milestones.rewardPoints - totalPoints);

  // Performance status determination (strictly performance, not base benefits)
  let statusLabel = 'Getting Started';
  let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isEligible) {
    statusLabel = 'Reward Eligible';
    statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  } else if (totalPoints >= milestones.certificatePoints) {
    statusLabel = 'Certificate Unlocked';
    statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-300';
  } else {
    statusLabel = 'Getting Started';
    statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  // Progress percentage toward 100 points
  const rewardProgressPct = Math.min(100, Math.round((totalPoints / milestones.rewardPoints) * 100));
  const certificateProgressPct = Math.min(100, Math.round((totalPoints / milestones.certificatePoints) * 100));

  // Count met criteria out of 4
  const criteriaMetCount = [hasUsers, hasEvents, hasOrganizers, hasPoints].filter(Boolean).length;

  return {
    verifiedUsers,
    verifiedOrganizers,
    approvedEvents,
    totalPoints,
    hasUsers,
    hasEvents,
    hasOrganizers,
    hasPoints,
    isEligible,
    criteriaMetCount,
    certificateUnlocked,
    certificatePointsRemaining,
    rewardPointsRemaining,
    statusLabel,
    statusColor,
    rewardProgressPct,
    certificateProgressPct,
  };
}

import { ca } from './api';

/**
 * Normalizes backend CA leaderboard entry into consistent display format.
 */
export function normalizeLeaderboardEntry(entry, index = 0) {
  const rank = entry.rank || index + 1;
  return {
    ...entry,
    rank,
    displayRank: rank,
    caId: entry.caId || `FN-CA-${rank}`,
    name: entry.name || 'Campus Ambassador',
    college: entry.college || 'College Campus',
    city: entry.city || 'India',
    users: entry.stats?.referralSignups ?? entry.users ?? 0,
    events: entry.stats?.eventsSourced ?? entry.events ?? 0,
    organizers: entry.stats?.organizersOnboarded ?? entry.organizers ?? 0,
    points: entry.points ?? entry.totalPoints ?? 0,
    totalPoints: entry.totalPoints ?? entry.points ?? 0,
    performanceStatus: entry.performanceStatus || (entry.points >= 100 ? 'Reward Eligible' : entry.points >= 40 ? 'Certificate Milestone Achieved' : 'Getting Started'),
  };
}

/**
 * Fetches real, deterministic leaderboard data from the backend.
 */
export async function fetchLeaderboard({ period = 'all-time', city = '', search = '', page = 1, limit = 50 } = {}) {
  try {
    const params = {
      period,
      page,
      limit,
    };
    if (city && city.toLowerCase() !== 'all') {
      params.city = city;
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const res = await ca.leaderboard(params);
    const data = res?.data || {};
    const rawList = Array.isArray(data.leaderboard) ? data.leaderboard : [];
    const normalized = rawList.map(normalizeLeaderboardEntry);
    return {
      leaderboard: normalized,
      total: data.total ?? normalized.length,
      page: data.page ?? 1,
      pages: data.pages ?? 1,
    };
  } catch (err) {
    console.error('[fetchLeaderboard Error]', err);
    return {
      leaderboard: [],
      total: 0,
      page: 1,
      pages: 1,
      error: err.message || 'Failed to fetch leaderboard',
    };
  }
}

/**
 * Deprecated: Empty array placeholder kept only for backward compatibility.
 * All views now query the live backend leaderboard via fetchLeaderboard().
 */
export const MOCK_LEADERBOARD = [];

export function getLeaderboardData() {
  return [];
}

/**
 * Payout and reward status history for portal.
 * Structured for future backend payout status integration.
 */
export function getRewardHistory(performance) {
  return [
    {
      period: 'Month 1 (September)',
      award: 'Leaderboard #7',
      amount: '₹0',
      status: 'Not Eligible',
      statusNote: 'Points below top 3 prize threshold',
      payoutDate: '01 Oct 2025',
    },
    {
      period: 'Month 2 (October)',
      award: 'Current Cohort Cycle',
      amount: performance.isEligible ? '₹1,500 Potential' : 'Eligible for Monthly Ranks',
      status: performance.isEligible ? 'Eligible' : 'Pending Requirements',
      statusNote: performance.isEligible ? 'Met all 4 criteria' : `${performance.rewardPointsRemaining} points to eligibility`,
      payoutDate: 'End of month evaluation',
    },
    {
      period: '6-Month Grand Program',
      award: 'Final Cohort Rewards',
      amount: 'Up to ₹8,000',
      status: 'Pending',
      statusNote: 'Final ranking evaluated at program completion',
      payoutDate: 'March 2026',
    },
  ];
}

/**
 * Generates pre-written outreach messages with embedded referral codes.
 */
export function getOutreachTemplates(profile) {
  const code = profile?.referralCode || '';
  const college = profile?.college || 'our campus';
  const generalUrl = getReferralUrl(code);
  const hostUrl = getReferralUrl(code, 'host');
  const exploreUrl = getReferralUrl(code, 'explore');

  return {
    studentWhatsApp: `Hey! FestNest brings verified hackathons, college fests, competitions, and workshops from across India onto one live feed. Check out upcoming events happening near ${college} here 👇\n${exploreUrl}`,
    organizerWhatsApp: `Hi! If you lead a club or organize student events at ${college}, publish your fest on FestNest to reach verified students across Indian colleges with zero friction:\n${hostUrl}`,
    generalWhatsApp: `Hey everyone! Join FestNest to discover verified hackathons, college fests, and competitions across India. Use my ambassador code ${code} or click here:\n${generalUrl}`,
    linkedInPost: `Excited to share that I have joined FestNest as an official Campus Ambassador representing ${college}! 🎓\n\nFestNest brings together verified college events — hackathons, tech symposiums, cultural fests, and workshops — into one unified discovery platform for Indian students.\n\nIf you lead a campus club or organize student competitions, publish your event on FestNest:\n${hostUrl}\n\n#FestNest #CampusAmbassador #CollegeFests #StudentLeadership #Hackathons`,
  };
}

