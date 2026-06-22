// src/data/seoCategories.js
// SEO landing-page config for the seven public category pages (/category/:slug)
// and the discovery hub (/discover). Each `value` is the EXACT backend category
// string the API filters by — never rename it. `slug` is the URL form; `label`
// is the display plural used in headings and titles.
import { Code2, Music4, Wrench, Medal, Mic, Dumbbell, PartyPopper } from 'lucide-react';

export const SEO_CATEGORIES = [
  {
    slug: 'mega-fest',
    value: 'Mega Fest',
    label: 'Mega Fests',
    Icon: PartyPopper,
    intro:
      "Mega fests are India's largest college festivals — multi-day, inter-college celebrations packing hackathons, cultural nights, competitions, and star events into one campus. They draw thousands of students from across the country and are the highlight of every college calendar. Browse the biggest mega fests happening across India below.",
    description:
      "Discover India's biggest college mega fests — multi-day inter-college festivals packed with hackathons, cultural nights, competitions, and headline events. Find and register on FestNest.",
  },
  {
    slug: 'hackathon',
    value: 'Hackathon',
    label: 'Hackathons',
    Icon: Code2,
    intro:
      'Hackathons are time-bound coding marathons where student teams build real software and hardware projects from scratch. FestNest brings together the top inter-college hackathons across India — ideal for developers, designers, and first-time builders looking to learn, network, and win prizes. Browse upcoming hackathons and register in a tap.',
    description:
      'Find and join the best college hackathons across India. Compete in inter-college coding marathons, build real projects, win prizes, and get noticed by recruiters on FestNest.',
  },
  {
    slug: 'cultural-fest',
    value: 'Cultural Fest',
    label: 'Cultural Fests',
    Icon: Music4,
    intro:
      'Cultural fests are inter-college celebrations of music, dance, drama, fashion, and art hosted by colleges across India. They are where students perform, compete, and connect beyond the classroom. Explore the most exciting cultural fests happening nationwide and register on FestNest.',
    description:
      'Explore inter-college cultural fests across India — music, dance, drama, fashion, and art competitions hosted by top colleges. Discover and register on FestNest.',
  },
  {
    slug: 'workshop',
    value: 'Workshop',
    label: 'Workshops',
    Icon: Wrench,
    intro:
      'Workshops are hands-on learning sessions where students pick up practical skills in tech, design, business, and more. Run by experts and student communities at colleges across India, these inter-college workshops are perfect for anyone who learns by doing. Browse upcoming workshops below.',
    description:
      'Browse hands-on college workshops across India. Learn new skills in tech, design, and business through inter-college workshops led by experts and student communities on FestNest.',
  },
  {
    slug: 'competition',
    value: 'Competition',
    label: 'Competitions',
    Icon: Medal,
    intro:
      'Competitions put students head-to-head in coding, design, business, quizzing, and beyond. FestNest gathers inter-college competitions from across India so you can test your skills against students nationwide and win recognition and prizes. Find the right competition for you below.',
    description:
      'Discover inter-college competitions across India — coding, design, business, quizzing, and more. Compete against students nationwide and win prizes on FestNest.',
  },
  {
    slug: 'tech-talk',
    value: 'Tech Talk',
    label: 'Tech Talks',
    Icon: Mic,
    intro:
      'Tech talks bring industry leaders, researchers, and student speakers to campus to share what is next in technology, AI, and engineering. Hosted at colleges across India, these inter-college sessions are a great way to learn and stay ahead of the curve. Explore upcoming tech talks below.',
    description:
      'Attend inter-college tech talks across India. Hear from industry leaders, researchers, and student speakers on the latest in technology, AI, and engineering on FestNest.',
  },
  {
    slug: 'sports',
    value: 'Sports',
    label: 'Sports',
    Icon: Dumbbell,
    intro:
      'Sports events bring colleges together to compete in cricket, football, athletics, and more. FestNest lists inter-college sports tournaments and fixtures from across India so athletes and fans never miss a match. Browse upcoming sports events below.',
    description:
      'Find inter-college sports events and tournaments across India. Compete in cricket, football, athletics, and more sporting fixtures hosted by colleges nationwide on FestNest.',
  },
];

/** Lookup a category descriptor by its URL slug. */
export const SEO_CATEGORY_BY_SLUG = Object.fromEntries(SEO_CATEGORIES.map(c => [c.slug, c]));
