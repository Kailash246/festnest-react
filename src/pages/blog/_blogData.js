// src/pages/blog/_blogData.js
// Central registry for all blog posts — metadata only (no JSX content here)

export const BLOG_POSTS = [
  {
    slug: 'how-to-win-a-hackathon',
    title: 'How to Win a Hackathon: The Complete 2025 Guide',
    description:
      'From team formation to the final pitch — a practical, step-by-step guide to winning your first (or next) college hackathon in India.',
    category: 'Hackathons',
    categorySlug: 'hackathon',
    readTime: '12 min read',
    publishedAt: 'June 2025',
    tags: [
      'hackathon tips',
      'how to win hackathon',
      'college hackathon India',
      'hackathon strategy',
      'inter college competition',
      'hackathon for beginners',
    ],
    component: 'HowToWinHackathon',
  },
  {
    slug: 'hackathon-strategy-guide',
    title: 'Hackathon Strategy: From Registration to Podium',
    description:
      'A complete hour-by-hour strategy for 24 and 48-hour hackathons — from pre-event prep to the final demo. Built for Indian college students.',
    category: 'Hackathons',
    categorySlug: 'hackathon',
    readTime: '10 min read',
    publishedAt: 'June 2025',
    tags: [
      'hackathon preparation',
      'hackathon planning',
      '24 hour hackathon tips',
      'hackathon time management',
      'college competition strategy',
    ],
    component: 'HackathonStrategy',
  },
  {
    slug: 'how-to-win-startup-pitch-competition',
    title: 'How to Win a Startup Pitch Competition: The Insider Guide',
    description:
      'What judges actually look for, the 7-slide deck structure that wins, how to handle brutal Q&A, and the top startup competitions at Indian colleges.',
    category: 'Competitions',
    categorySlug: 'competition',
    readTime: '11 min read',
    publishedAt: 'June 2025',
    tags: [
      'startup pitch competition',
      'how to win pitch competition',
      'business competition tips India',
      'college startup competition',
      'E-cell competition',
      'pitch deck tips',
    ],
    component: 'WinningPitch',
  },
  {
    slug: 'best-colleges-for-inter-college-competitions-india',
    title: 'Best Colleges for Inter-College Competitions in India (2025)',
    description:
      'IITs, NITs, BITS, VIT and more — the definitive guide to India\'s top colleges hosting the biggest inter-college competitions, fests, and hackathons.',
    category: 'College Events',
    categorySlug: 'cultural-fest',
    readTime: '9 min read',
    publishedAt: 'June 2025',
    tags: [
      'best colleges inter college competitions India',
      'top college fests India',
      'IIT techfest',
      'NIT competitions',
      'college events India',
      'inter college events',
    ],
    component: 'TopColleges',
  },
  {
    slug: 'best-college-events-india-2025',
    title: 'Best College Events in India 2025: The Ultimate Student Guide',
    description:
      'The biggest tech fests, cultural fests, hackathons, and business events happening at Indian colleges in 2025 — and how to register for all of them.',
    category: 'College Events',
    categorySlug: 'mega-fest',
    readTime: '8 min read',
    publishedAt: 'June 2025',
    tags: [
      'best college events India 2025',
      'top college fests 2025',
      'college cultural fest India',
      'college tech fest India',
      'college competitions India',
    ],
    component: 'BestCollegeEvents',
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getRelatedPosts(currentSlug, category, count = 3) {
  return BLOG_POSTS.filter(
    (p) => p.slug !== currentSlug && p.category === category
  ).slice(0, count);
}
