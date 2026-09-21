// src/pages/ca/config/caProgramConfig.js
/**
 * Single source of truth for FestNest Campus Ambassador program configuration,
 * reward structures, point calculation rules, and milestone definitions.
 */

export const CA_PROGRAM_CONFIG = {
  programName: 'FestNest Campus Ambassador Program',
  cohortYear: '2025–26',
  duration: '6-Month Program',
  totalPositions: 60,
  positionsLabel: '60 CA Positions',

  // Reward pool reconciliation:
  // Monthly (6 months x ₹2,800/mo) = ₹16,800
  // Final rewards (1st to 10th) = ₹27,000
  // Grand Total Distributed = ₹43,800 (+ ₹1,200 performance reserve = ₹45,000 Total Pool)
  totalRewardPoolDistributed: 43800,
  performanceReserve: 1200,
  totalRewardPoolDisplay: '₹43,800*',
  rewardPoolFootnote: '*Performance rewards. Minimum eligibility criteria apply.',

  // Monthly Reward Distribution
  monthlyRewards: [
    { rank: '1st', amount: 1500, formatted: '₹1,500', badge: '🥇 1st Place' },
    { rank: '2nd', amount: 800, formatted: '₹800', badge: '🥈 2nd Place' },
    { rank: '3rd', amount: 500, formatted: '₹500', badge: '🥉 3rd Place' },
  ],
  monthlyTotal: 2800,

  // Final 6-Month Program Reward Distribution
  finalRewards: [
    { rank: '1st', amount: 8000, formatted: '₹8,000', badge: '🏆 Champion' },
    { rank: '2nd', amount: 5000, formatted: '₹5,000', badge: '🥈 Runner-Up' },
    { rank: '3rd', amount: 3500, formatted: '₹3,500', badge: '🥉 3rd Place' },
    { rank: '4th', amount: 2500, formatted: '₹2,500', badge: 'Top Performer' },
    { rank: '5th', amount: 2000, formatted: '₹2,000', badge: 'Top Performer' },
    { rank: '6th–10th', amount: 1200, formatted: '₹1,200', count: 5, badge: 'Finalist' },
  ],
  finalTotal: 27000,

  // Point scoring values
  points: {
    userSignup: 1,       // +1 point per verified student signup
    organizerOnboarded: 5, // +5 points per verified organizer
    organizerWithEventTotal: 10, // 10 points TOTAL when that organizer publishes first approved event
  },

  // Milestone thresholds
  milestones: {
    certificatePoints: 40, // Official Certificate unlocked at 40 points
    rewardPoints: 100,      // Minimum points for cash reward eligibility
    rewardUsers: 40,       // Minimum verified users for cash reward eligibility
    rewardEvents: 2,       // Minimum approved events for cash reward eligibility
    rewardOrganizers: 1,   // Minimum verified organizers for cash reward eligibility
  },

  // Base benefits granted to EVERY selected/approved CA
  baseBenefits: [
    {
      id: 'id-card',
      title: 'Official FestNest CA ID',
      tag: 'Identity',
      description: 'Verified digital credential with your unique CA number, college name, and tamper-proof verification QR code.',
    },
    {
      id: 'ca-profile',
      title: 'Verified CA Profile',
      tag: 'Status',
      description: 'Dedicated ambassador profile on FestNest certifying your official role as the campus representative.',
    },
    {
      id: 'referral-links',
      title: 'Personal Referral Link & Code',
      tag: 'Attribution',
      description: 'Unique tracking URLs for student discovery and organizer onboarding with automated credit attribution.',
    },
    {
      id: 'ca-portal',
      title: 'CA Portal Access',
      tag: 'Tools',
      description: 'Performance dashboard with live referral tracking, point progression, and activity auditing.',
    },
    {
      id: 'ca-community',
      title: 'FestNest CA Community',
      tag: 'Network',
      description: 'Access to the private ambassador channel to collaborate, share growth ideas, and get announcements directly.',
    },
    {
      id: 'official-recognition',
      title: 'Official CA Recognition',
      tag: 'Resume',
      description: 'Verified designation to showcase on LinkedIn, resume, and student portfolios as startup campus leadership.',
    },
  ],

  // Certificate milestone (40 points)
  certificateBenefit: {
    title: 'Program Certificate',
    threshold: 40,
    description: 'Official FestNest Campus Ambassador certificate unlocked after reaching 40 verified participation points.',
  },

  // Performance-based benefits (earned only through verified performance)
  performanceBenefits: [
    {
      title: 'Monthly Cash Rewards',
      description: 'Compete each month for top 3 positions on the leaderboard to win ₹1,500, ₹800, or ₹500.',
      badge: 'Monthly Cash',
    },
    {
      title: 'Final Program Rewards',
      description: 'Cumulative 6-month rewards for top 10 ambassadors, with ₹8,000 for 1st place.',
      badge: '₹27K Final Pool',
    },
    {
      title: 'Top Performer Recognition',
      description: 'Special platform highlights, founder spotlight, and verified proof of impact for standout leaders.',
      badge: 'Recognition',
    },
    {
      title: 'Executive Recommendations',
      description: 'Official letter of recommendation and startup reference provided to eligible top-performing ambassadors.',
      badge: 'Top Performers',
    },
  ],

  // 4-step locked progression model
  progressionLadder: [
    {
      stage: '01',
      step: 'Approved CA',
      requirement: 'Selection & Onboarding',
      outcome: 'Official CA ID, Verified Profile, Referral Link/Code, CA Portal, Community, and Official Recognition.',
      unlocked: 'Base Benefits',
    },
    {
      stage: '02',
      step: '40 Points',
      requirement: '40 Verified Points Milestone',
      outcome: 'Official FestNest Campus Ambassador Certificate unlocked.',
      unlocked: 'Certificate',
    },
    {
      stage: '03',
      step: 'Reward Eligible',
      requirement: '100+ Pts + 40 Users + 2 Events + 1 Org',
      outcome: 'Qualifies for cash rewards and leaderboard prize distribution.',
      unlocked: 'Cash Eligibility',
    },
    {
      stage: '04',
      step: 'Leaderboard Rank',
      requirement: 'Top 3 Monthly / Top 10 Final',
      outcome: 'Earn monthly payouts (up to ₹1,500) and final cohort rewards (up to ₹8,000).',
      unlocked: 'Cash Payouts',
    },
  ],
};

