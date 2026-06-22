// src/pages/blog/posts/HowToWinHackathon.jsx
// Route: /blog/how-to-win-a-hackathon

import Seo from '../../components/Seo';
import BlogLayout, { Callout, FindEventsCTA, PostSection } from './_BlogLayout';

const META = {
  title: 'How to Win a Hackathon: The Complete 2025 Guide',
  description:
    'From team formation to the final pitch — a practical, step-by-step guide to winning your first (or next) college hackathon in India.',
  category: 'Hackathons',
  readTime: '12 min read',
  publishedAt: 'June 2025',
  tags: [
    'hackathon tips',
    'how to win hackathon',
    'college hackathon India',
    'hackathon strategy',
    'inter college competition',
    'hackathon for beginners',
    'hackathon team formation',
  ],
};

const SECTIONS = [
  { id: 'what-judges-look-for', label: 'What Judges Actually Look For' },
  { id: 'team-formation', label: 'Building the Right Team' },
  { id: 'choosing-problem', label: 'Choosing the Right Problem' },
  { id: 'planning-time', label: 'Planning Your 24/48 Hours' },
  { id: 'building-prototype', label: 'Building a Prototype That Impresses' },
  { id: 'crafting-pitch', label: 'Crafting the Winning Pitch' },
  { id: 'handling-qa', label: 'Handling Q&A Like a Pro' },
  { id: 'common-mistakes', label: 'Mistakes That Cost You the Trophy' },
  { id: 'after-hackathon', label: 'What Winners Do Next' },
  { id: 'checklist', label: 'The Complete Hackathon Checklist' },
];

export default function HowToWinHackathon() {
  return (
    <>
      <Seo
        title="How to Win a Hackathon: The Complete 2025 Guide | FestNest"
        description="Step-by-step guide to winning college hackathons in India — team formation, problem selection, prototype tips, pitch structure, Q&A handling and more."
        canonical="https://festnest.in/blog/how-to-win-a-hackathon"
        ogImage="https://festnest.in/og-image.png"
      />
      <BlogLayout
        meta={META}
        sections={SECTIONS}
        relatedSlugs={['hackathon-strategy-guide', 'how-to-win-startup-pitch-competition', 'best-college-events-india-2025']}
      >
        <p className="text-gray-600 leading-relaxed text-lg mb-8">
          Every year, hundreds of thousands of Indian college students compete in hackathons — from 24-hour local fests to national events like Smart India Hackathon with prize pools in crores. Most of them lose not because they aren't smart enough, but because they make the same avoidable mistakes. This guide fixes that.
        </p>

        {/* ── Section 1 ── */}
        <PostSection id="what-judges-look-for" title="What Judges Actually Look For">
          <p className="text-gray-600 leading-relaxed mb-4">
            Before diving into strategy, understand what judges are evaluating. Most hackathon judging criteria break down into roughly the same four pillars — though weightage varies by event:
          </p>
          <ul className="space-y-3 mb-5">
            {[
              { t: 'Innovation & Originality (25%)', d: 'Is this a genuinely new idea, or a reskin of an existing app? Judges can tell.' },
              { t: 'Technical Implementation (25%)', d: 'Does it work? Is the tech stack appropriate for the problem? Broken demos lose points fast.' },
              { t: 'Business Viability / Impact (25%)', d: 'Could this become a real product? Who are the users? How many people does it help?' },
              { t: 'Presentation & Pitch (25%)', d: 'Can you communicate the idea clearly in 5 minutes to someone who\'s never heard of it?' },
            ].map((item) => (
              <li key={item.t} className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#4F46E5] shrink-0" />
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{item.t}</span>
                  <p className="text-gray-500 text-sm">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <Callout type="info">
            Most hackathons publish their exact judging rubric in the problem statement PDF. Read it on day one and align every decision you make — feature choice, slide order, demo sequence — back to those criteria.
          </Callout>
        </PostSection>

        {/* ── Section 2 ── */}
        <PostSection id="team-formation" title="Building the Right Team">
          <p className="text-gray-600 leading-relaxed mb-4">
            Team composition is the single biggest predictor of hackathon success, and most students get it wrong by forming teams with their friends instead of with the right skill mix.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-6 mb-3">The ideal 4-person team</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { role: 'Backend Developer', desc: 'Handles APIs, database, auth, server logic. Must be fast — no perfectionism allowed in a hackathon.' },
              { role: 'Frontend / UI Dev', desc: 'Builds the interface. Speed matters — Tailwind, shadcn/ui, or a component library is mandatory. No custom CSS from scratch.' },
              { role: 'Domain Expert / Researcher', desc: 'Deeply understands the problem space. Validates the idea, researches market size, prepares pitch content.' },
              { role: 'Presenter / Product Thinker', desc: 'Owns the pitch, slide deck, and demo flow. Can also contribute to product decisions during the build.' },
            ].map((item) => (
              <div key={item.role} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Callout type="tip">
            If you can only have 3 people, combine "Domain Expert" and "Presenter" into one role. The backend and frontend must always be separate people — never let one person own both in a hackathon.
          </Callout>
          <h3 className="text-base font-bold text-gray-800 mt-6 mb-3">The pre-hackathon dry run</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            One week before the hackathon, run a 4-hour mini sprint with your team. Pick a random problem, build something small, and demo it to each other. This surfaces technical compatibility issues, communication styles, and who slows down under pressure — before it's too late to fix anything.
          </p>
        </PostSection>

        {/* ── Section 3 ── */}
        <PostSection id="choosing-problem" title="Choosing the Right Problem">
          <p className="text-gray-600 leading-relaxed mb-4">
            The problem you choose to solve determines whether you're fighting for 1st place or just finishing. Most teams pick problems that are either too broad (solve climate change) or too niche (optimize bus schedules for a specific village). Here's how to land in the sweet spot.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">The "grandma test"</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            If you can't explain your problem to a non-technical person in one sentence, it's too abstract. Judges who've heard 30 pitches that day don't have patience for complex setup. "Students don't know which college fests to attend" beats "we're leveraging ML to create a decentralised event discovery ontology."
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">Problem selection criteria</h3>
          <ul className="space-y-2 mb-5 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Real pain point that you or someone you know has experienced personally</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> At least one person on your team has domain knowledge</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Can be prototyped in 24–48 hours with your team's skills</li>
            <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Aligns with the hackathon's theme or problem statement tracks</li>
            <li className="flex gap-2"><span className="text-red-400 font-bold">✗</span> Requires ML model training from scratch (use pre-trained APIs instead)</li>
            <li className="flex gap-2"><span className="text-red-400 font-bold">✗</span> Has no realistic path to monetization or impact at scale</li>
            <li className="flex gap-2"><span className="text-red-400 font-bold">✗</span> Is just a "what if X, but with blockchain" idea</li>
          </ul>
          <Callout type="warning">
            Avoid "AI for everything" pitches unless your AI is actually doing something specific and demonstrable. Judges see through vague "AI-powered platform" claims instantly — especially if your demo doesn't show the AI working live.
          </Callout>
        </PostSection>

        <FindEventsCTA category="Hackathon" label="Find Hackathons at Your College" />

        {/* ── Section 4 ── */}
        <PostSection id="planning-time" title="Planning Your 24/48 Hours">
          <p className="text-gray-600 leading-relaxed mb-4">
            Time is the rarest resource in a hackathon. Most teams either sprint into coding immediately (and waste 6 hours building the wrong thing) or spend too long ideating (and run out of build time). The winning schedule looks like this:
          </p>
          <div className="space-y-3 mb-6">
            {[
              { phase: 'Hour 0–2: Foundation', color: 'bg-indigo-500', steps: ['Brainstorm 5 ideas (yes, all 5 — then vote)', 'Lock the problem statement', 'Define the exact MVP — one core feature only', 'Decide tech stack (no debates allowed after this)', 'Create Git repo, share branches, set up local environments'] },
              { phase: 'Hour 2–18: Build Phase', color: 'bg-blue-500', steps: ['Backend: core API endpoints first', 'Frontend: screens in order of demo flow', 'No new features allowed after Hour 14', 'Run 2-hour progress check-ins', 'Start slide deck at Hour 16, not Hour 22'] },
              { phase: 'Hour 18–22: Polish Phase', color: 'bg-teal-500', steps: ['Feature freeze — what\'s done is done', 'Fix critical bugs only (UI > logic completeness for demo)', 'Record a backup demo video', 'Rehearse pitch with full team once'] },
              { phase: 'Hour 22–24: Pitch Phase', color: 'bg-purple-500', steps: ['Final slide polish', 'Full pitch rehearsal twice', 'Sleep if you can (minimum 90 minutes)', 'Eat something'] },
            ].map((block) => (
              <div key={block.phase} className="rounded-lg border border-gray-100 overflow-hidden">
                <div className={`${block.color} px-4 py-2`}>
                  <p className="text-white font-bold text-sm">{block.phase}</p>
                </div>
                <ul className="px-4 py-3 space-y-1">
                  {block.steps.map((s) => (
                    <li key={s} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-gray-300">—</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Callout type="tip">
            The 60/20/20 rule: 60% of your time on building, 20% on polish, 20% on pitch prep. If you spend more than 70% coding, you will lose on presentation. If you spend more than 30% on slides, you won't have enough to demo.
          </Callout>
        </PostSection>

        {/* ── Section 5 ── */}
        <PostSection id="building-prototype" title="Building a Prototype That Impresses">
          <p className="text-gray-600 leading-relaxed mb-4">
            Here's the truth most hackathon guides won't tell you: <strong className="text-gray-800">judges evaluate the demo, not the code.</strong> No judge reads your repository during the judging round. They watch your live demo for 3–4 minutes. Build accordingly.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">The demo-first development mindset</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Before your team writes a single line of code, map out exactly what the demo will look like from the judge's point of view. Start from the demo and work backwards into what needs to be built. Everything else is a bonus.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-5">
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">→</span> Build the happy path only — no edge cases, no error handling, no auth unless it's the point</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">→</span> Hardcode data if the backend isn't ready — a "fake" live demo beats a broken real one</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">→</span> If the real UI is messy, show a Figma mockup in your slides for that screen</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">→</span> Use pre-built component libraries — Tailwind UI, shadcn, Chakra. Pixel-perfect custom CSS is a time trap</li>
            <li className="flex gap-2"><span className="text-indigo-500 font-bold">→</span> For AI features, wrap a pre-trained model (OpenAI API, HuggingFace) — don't train from scratch</li>
          </ul>
          <Callout type="warning">
            Always record a backup demo video at Hour 20. If your live demo crashes during the pitch (it happens), play the video. Never stand in front of judges with a broken app and no backup plan.
          </Callout>
        </PostSection>

        {/* ── Section 6 ── */}
        <PostSection id="crafting-pitch" title="Crafting the Winning Pitch">
          <p className="text-gray-600 leading-relaxed mb-4">
            Most teams spend 90% of the hackathon building and 10% pitching. Winners flip the ratio — or at least approach 70/30. A mediocre product with an excellent pitch beats an excellent product with a mediocre pitch. Every time.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">The 5-minute pitch structure</h3>
          <div className="space-y-3 mb-6">
            {[
              { num: '01', title: 'Hook (30 sec)', desc: 'Open with a story or stat that makes the problem visceral. "Last month, 40,000 students searched for college hackathons in India on Google and found nothing useful." Not: "Our app is a platform that..."' },
              { num: '02', title: 'Problem (1 min)', desc: 'Define the problem with specificity. Who faces it? How often? What\'s the current workaround and why it sucks?' },
              { num: '03', title: 'Solution + Demo (2 min)', desc: 'One sentence solution, then show the live demo immediately. Walk through exactly one user journey, narrating as you go. Don\'t click around randomly.' },
              { num: '04', title: 'Impact & Market (45 sec)', desc: 'How many people have this problem? Give a real number. How does your solution make their life better in measurable terms?' },
              { num: '05', title: 'Team (30 sec)', desc: 'Why are YOU the right people to build this? Personal connection to the problem is the strongest answer.' },
              { num: '06', title: 'What\'s Next (15 sec)', desc: 'One next step if you had more time or won the prize money. Shows judges you\'ve thought beyond the hackathon.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-4">
                <span className="text-2xl font-bold text-gray-200 font-syne shrink-0 w-8">{item.num}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Callout type="tip">
            Rehearse the pitch a minimum of 3 times with your actual slides open. The first rehearsal is always rough. The third one is where you start sounding like you believe it.
          </Callout>
        </PostSection>

        {/* ── Section 7 ── */}
        <PostSection id="handling-qa" title="Handling Q&A Like a Pro">
          <p className="text-gray-600 leading-relaxed mb-4">
            Q&A is where hackathons are often won or lost. Confident, thoughtful answers to hard questions can flip a judge's impression entirely. Here's how to handle the most common traps:
          </p>
          <div className="space-y-4 mb-5">
            {[
              { q: '"What about X existing solution / competitor?"', a: 'Show you know it. "Yes, X exists. Here\'s how we\'re different: [specific differentiator]." Never pretend competitors don\'t exist — it destroys credibility.' },
              { q: '"How do you make money?"', a: 'Have at least two revenue model ideas ready, even if not built. "We see two paths: a freemium tier for students and a premium listing fee for college organizers." Vagueness is a red flag.' },
              { q: '"Why hasn\'t anyone built this before?"', a: '"Great question. The main reason is [insight you have]. That\'s also why we think the timing is right now."' },
              { q: '"What would you do with the prize money?"', a: 'Be specific. Not "we\'d continue development." Say: "We\'d use ₹50K for cloud hosting and outreach to 10 colleges in our city."' },
              { q: 'Something you don\'t know the answer to', a: '"We haven\'t fully thought through that yet — our hypothesis is [X] but we\'d want to validate it with users first." Never bluff technical judges.' },
            ].map((item) => (
              <div key={item.q} className="border-l-2 border-indigo-200 pl-4">
                <p className="font-semibold text-gray-800 text-sm mb-1">Q: {item.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">A: {item.a}</p>
              </div>
            ))}
          </div>
        </PostSection>

        {/* ── Section 8 ── */}
        <PostSection id="common-mistakes" title="Mistakes That Cost You the Trophy">
          <p className="text-gray-600 leading-relaxed mb-4">
            After watching hundreds of hackathon pitches, these are the patterns that separate finalist teams from everyone else:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { mistake: 'Scope creep', detail: 'Adding features at Hour 18. Each new feature is a new bug. Lock scope at Hour 14 and build the demo.' },
              { mistake: 'Ignoring the theme', detail: 'Many hackathons judge specifically on theme alignment. Read the problem statement and tie your pitch back to it explicitly.' },
              { mistake: 'No sleep', detail: 'Cognitive performance drops 40% after 24 hours without sleep. A 90-minute nap at Hour 20 produces a better pitch than 90 minutes of panicked polishing.' },
              { mistake: 'One person pitching nervously', detail: 'The whole team should present different sections. It shows collaboration and is more engaging for judges.' },
              { mistake: 'Starting the demo at slide 8', detail: 'Judges want to see the product, not 7 problem-framing slides. Demo by slide 3 at the latest.' },
              { mistake: 'Overcomplicating the tech stack', detail: 'Choosing microservices, Kubernetes, or Rust in a 24-hour hackathon. Use boring, fast tech: React + Node + PostgreSQL or Firebase.' },
            ].map((item) => (
              <div key={item.mistake} className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="font-semibold text-red-700 text-sm mb-1">✗ {item.mistake}</p>
                <p className="text-red-600 text-xs leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </PostSection>

        <FindEventsCTA
          category="Hackathon"
          label="Browse Upcoming Hackathons Across India"
        />

        {/* ── Section 9 ── */}
        <PostSection id="after-hackathon" title="What Winners Do Next">
          <p className="text-gray-600 leading-relaxed mb-4">
            Winning the hackathon is the beginning, not the end. What you do in the 48 hours after the event determines whether it appears on your resume as a trophy or as a transformational experience.
          </p>
          <ul className="space-y-3 text-sm text-gray-600 mb-5">
            <li className="flex gap-3">
              <span className="text-indigo-500 font-bold mt-0.5">1</span>
              <div><strong className="text-gray-800">Deploy it</strong> — even if it's broken, push it to Vercel/Render. A live URL on your resume is 10x more powerful than a GitHub link nobody visits.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 font-bold mt-0.5">2</span>
              <div><strong className="text-gray-800">Write a Devpost/Medium post</strong> — document what you built, the problem you solved, and lessons learned. This gets indexed by Google and shows up when recruiters search your name.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 font-bold mt-0.5">3</span>
              <div><strong className="text-gray-800">Post on LinkedIn</strong> — tag your teammates, mention the college, describe the problem. College hackathon wins regularly go viral in tech circles and attract recruiter DMs.</div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 font-bold mt-0.5">4</span>
              <div><strong className="text-gray-800">Decide if it's worth continuing</strong> — if 3 real people outside your team would pay ₹500/month for this, continue building. If not, file it under "experience" and move to the next hackathon.</div>
            </li>
          </ul>
        </PostSection>

        {/* ── Section 10 ── */}
        <PostSection id="checklist" title="The Complete Hackathon Checklist">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Before the hackathon</h3>
          <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
            {[
              'Confirm team of 3–4, with clear role assignments',
              'Agree on tech stack in advance (no debates during event)',
              'Do a 4-hour dry run sprint at least once',
              'Set up shared Git repo and invite all members',
              'Download all required SDKs, fonts, and assets offline',
              'Pack: chargers, extension cord, earphones, snacks, water',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gray-300 font-bold">□</span> {item}
              </li>
            ))}
          </ul>
          <h3 className="text-base font-semibold text-gray-700 mb-3">During the hackathon</h3>
          <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
            {[
              'Spend Hour 0–2 on ideation, NOT coding',
              'Lock problem and MVP scope in writing at Hour 2',
              'Feature freeze at Hour 14–16',
              'Start slide deck no later than Hour 16',
              'Record backup demo video at Hour 20',
              'Sleep at least 90 minutes',
              'Rehearse full pitch 3 times',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gray-300 font-bold">□</span> {item}
              </li>
            ))}
          </ul>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Pitch day</h3>
          <ul className="space-y-1.5 mb-5 text-sm text-gray-600">
            {[
              'Confirm demo works on the judging device/connection',
              'Backup demo video accessible on phone and laptop',
              'All team members know which slides they present',
              'Know your numbers (market size, users, cost, impact)',
              'Research who the judges are beforehand if possible',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gray-300 font-bold">□</span> {item}
              </li>
            ))}
          </ul>
          <Callout type="success">
            The teams that consistently win aren't always the most technically skilled — they're the most prepared. Use this checklist, run the dry run, and plan your 24 hours before you arrive. That's your real edge.
          </Callout>
        </PostSection>
      </BlogLayout>
    </>
  );
}
