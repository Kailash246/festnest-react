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

/**
 * Public leaderboard cohort data.
 * Ready for drop-in backend API swap when live endpoint is wired.
 */
export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Rahul Sharma', college: 'RV College of Engineering', city: 'Bangalore', users: 112, events: 4, organizers: 3, points: 137, badge: '🥇 1st' },
  { rank: 2, name: 'Priya Iyer', college: 'COEP Technological University', city: 'Pune', users: 96, events: 3, organizers: 2, points: 121, badge: '🥈 2nd' },
  { rank: 3, name: 'Arjun Nair', college: 'IIT Madras', city: 'Chennai', users: 85, events: 3, organizers: 2, points: 110, badge: '🥉 3rd' },
  { rank: 4, name: 'Neha Deshmukh', college: 'DTU', city: 'Delhi NCR', users: 73, events: 2, organizers: 2, points: 98, badge: 'Top 5' },
  { rank: 5, name: 'Karan Mehra', college: 'BITS Pilani (Goa)', city: 'Goa', users: 66, events: 2, organizers: 2, points: 91, badge: 'Top 5' },
  { rank: 6, name: 'Sneha Patel', college: 'VJTI', city: 'Mumbai', users: 64, events: 2, organizers: 1, points: 84, badge: 'Top 10' },
  { rank: 7, name: 'Rohan Verma', college: 'Christ University', city: 'Bangalore', users: 57, events: 2, organizers: 1, points: 82, badge: 'Top 10', isCurrentUserPlaceholder: true },
  { rank: 8, name: 'Ananya Gupta', college: 'SRM University', city: 'Chennai', users: 54, events: 2, organizers: 1, points: 79, badge: 'Top 10' },
  { rank: 9, name: 'Aditya Joshi', college: 'MIT-WPU', city: 'Pune', users: 49, events: 1, organizers: 2, points: 74, badge: 'Top 10' },
  { rank: 10, name: 'Meera Sengupta', college: 'NSUT', city: 'Delhi NCR', users: 46, events: 2, organizers: 1, points: 71, badge: 'Top 10' },
  { rank: 11, name: 'Vikas Rao', college: 'BMS College of Engineering', city: 'Bangalore', users: 42, events: 1, organizers: 1, points: 57 },
  { rank: 12, name: 'Tanvi Shah', college: 'NMIMS', city: 'Mumbai', users: 38, events: 1, organizers: 1, points: 53 },
];

/**
 * Filters public leaderboard by period, city, and college search query.
 */
export function getLeaderboardData({ period = 'current', city = 'all', search = '' } = {}) {
  let list = [...MOCK_LEADERBOARD];

  if (city && city !== 'all') {
    list = list.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.college.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q)
    );
  }

  // Recalculate rank after filtering if city or search is active
  return list.map((item, index) => ({
    ...item,
    displayRank: index + 1,
  }));
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

