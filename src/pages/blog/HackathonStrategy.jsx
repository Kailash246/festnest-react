// src/pages/blog/posts/HackathonStrategy.jsx
// Route: /blog/hackathon-strategy-guide

import Seo from '../../components/Seo';
import BlogLayout, { Callout, FindEventsCTA, PostSection } from './_BlogLayout';

const META = {
  title: 'Hackathon Strategy: From Registration to Podium',
  description:
    'A complete hour-by-hour strategy for 24 and 48-hour hackathons — pre-event prep, tech stack decisions, scope control, and pitch timing.',
  category: 'Hackathons',
  readTime: '10 min read',
  publishedAt: 'June 2025',
  tags: [
    'hackathon preparation',
    'hackathon planning',
    '24 hour hackathon strategy',
    '48 hour hackathon tips',
    'college competition preparation',
    'hackathon tech stack',
  ],
};

const SECTIONS = [
  { id: 'two-weeks-before', label: '2 Weeks Before' },
  { id: 'day-before', label: 'Day Before the Hackathon' },
  { id: 'foundation-phase', label: 'Hour 0–2: Foundation' },
  { id: 'build-phase', label: 'Hour 2–18: Build Phase' },
  { id: 'polish-phase', label: 'Hour 18–22: Polish' },
  { id: 'pitch-phase', label: 'Hour 22–24: Pitch Prep' },
  { id: 'tech-stack', label: 'Tech Stack Recommendations' },
  { id: 'scope-control', label: 'The Art of Scope Control' },
  { id: '48-hour-differences', label: '48-Hour Hackathon Differences' },
];

export default function HackathonStrategy() {
  return (
    <>
      <Seo
        title="Hackathon Strategy Guide: From Registration to Podium | FestNest"
        description="Complete hour-by-hour hackathon strategy for Indian college students — what to do 2 weeks before, the day before, and every phase of the 24/48-hour event."
        canonical="https://festnest.in/blog/hackathon-strategy-guide"
      />
      <BlogLayout
        meta={META}
        sections={SECTIONS}
        relatedSlugs={['how-to-win-a-hackathon', 'how-to-win-startup-pitch-competition', 'best-colleges-for-inter-college-competitions-india']}
      >
        <p className="text-gray-600 leading-relaxed text-lg mb-8">
          The difference between teams that consistently place in the top 3 and teams that go home empty-handed isn't talent — it's strategy. Winning a hackathon is 40% what you build and 60% how you plan, scope, and present it. This is your hour-by-hour playbook.
        </p>

        {/* ── Section 1 ── */}
        <PostSection id="two-weeks-before" title="2 Weeks Before: The Preparation Window">
          <p className="text-gray-600 leading-relaxed mb-4">
            Most teams treat preparation as "registering on the event platform and waiting." The teams that win use the two weeks before as a serious competitive advantage.
          </p>
          <div className="space-y-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Research the theme (if announced)</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Many hackathons release their theme or problem tracks 1–2 weeks in advance. If yours does, spend 4–5 hours researching the problem space before the event. Read papers, watch YouTube videos, talk to people affected by the problem. Teams that understand the domain deeply always outperform those who learn it on the fly.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Finalize your team and roles</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Have "the roles conversation" explicitly — not implicitly. Who owns backend? Who owns frontend? Who owns the pitch? Unspoken assumptions about who's doing what surface at Hour 14 as arguments, not at Week 2 as a 5-minute discussion.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Run a practice sprint</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Block out one Saturday for a 4-hour sprint. Pick a fake problem, build something minimal, and demo it to each other. You'll discover who gets stuck, who needs help, who communicates well under pressure, and whether your combined tech choices actually work together.
              </p>
            </div>
          </div>
          <Callout type="tip">
            Agree on a tech stack during your practice sprint — not on hackathon day. Nothing wastes more time than a 45-minute "should we use Next.js or Vite?" debate at Hour 1.
          </Callout>
        </PostSection>

        {/* ── Section 2 ── */}
        <PostSection id="day-before" title="Day Before: Logistics + Setup">
          <p className="text-gray-600 leading-relaxed mb-4">
            The evening before the hackathon is not for relaxing — it's for eliminating every preventable technical failure.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-5">
            {[
              'Set up your dev environment: Node, Python, Docker, database — whatever your stack needs. Don\'t debug an npm install in Hour 1.',
              'Clone boilerplate repos and starter templates you plan to use (React+Vite, Express, etc.) so they\'re cached locally.',
              'Download all fonts, icon packs, UI libraries, and any assets that require internet access — venue WiFi is often unreliable.',
              'Create a shared Git repository and have all teammates push/pull to confirm access works.',
              'Set up a shared Notion or Google Doc for real-time notes during the event: ideas, tasks, decisions, issues.',
              'Pack a physical list: chargers, laptop power adapters, extension cord/power strip, earphones for focus, water, snacks.',
              'Sleep 8 hours. This is not optional. You\'re about to run a cognitive marathon.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">→</span> {item}
              </li>
            ))}
          </ul>
          <Callout type="warning">
            Never rely on venue WiFi for API calls, npm installs, or asset downloads during the build phase. Assume you'll have intermittent or slow internet and pre-cache everything critical.
          </Callout>
        </PostSection>

        {/* ── Section 3 ── */}
        <PostSection id="foundation-phase" title="Hour 0–2: The Foundation Phase">
          <p className="text-gray-600 leading-relaxed mb-4">
            The single biggest mistake teams make is opening their code editor at Hour 0. <strong className="text-gray-800">Do not start coding for the first two hours.</strong> Use this time to build a foundation that prevents 10 hours of wasted effort.
          </p>
          <div className="bg-indigo-50 rounded-xl p-5 mb-5 border border-indigo-100">
            <p className="text-indigo-800 font-bold text-sm mb-3">The Hour 0–2 agenda (strictly timed)</p>
            <div className="space-y-2">
              {[
                { time: '0:00–0:30', task: 'Read problem statement/theme thoroughly. Highlight key requirements and judging criteria.' },
                { time: '0:30–1:00', task: 'Rapid brainstorm — everyone suggests 2 ideas. No filtering yet. Write all of them on paper.' },
                { time: '1:00–1:30', task: 'Evaluate top 3 ideas against feasibility, originality, and team skill fit. Vote and lock one idea. No revisiting.' },
                { time: '1:30–1:45', task: 'Define exact MVP — the minimum feature set needed for a compelling demo. Write it down.' },
                { time: '1:45–2:00', task: 'Divide tasks. Everyone must have a clear first task before leaving this meeting.' },
              ].map((item) => (
                <div key={item.time} className="flex gap-3 text-sm">
                  <span className="text-indigo-500 font-mono font-bold shrink-0">{item.time}</span>
                  <span className="text-indigo-800">{item.task}</span>
                </div>
              ))}
            </div>
          </div>
          <Callout type="info">
            Write the agreed MVP definition on paper and tape it somewhere visible. When someone suggests adding a feature at Hour 12, point to the paper. "Is it on the MVP? No? Then it doesn't get built."
          </Callout>
        </PostSection>

        <FindEventsCTA category="Hackathon" label="Find Your Next Hackathon on FestNest" />

        {/* ── Section 4 ── */}
        <PostSection id="build-phase" title="Hour 2–18: The Build Phase">
          <p className="text-gray-600 leading-relaxed mb-4">
            This is where most hackathons are won or lost. The build phase requires two things running simultaneously: disciplined execution and continuous reality-checking.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">Check-in rhythm</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Hold a 10-minute stand-up every 2 hours: What did I build? What's blocking me? What am I doing next? These catch blockers before they become 4-hour rabbit holes and keep everyone aware of overall progress.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">The "cut or ship" decision at Hour 14</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            At Hour 14, pause and audit: what's done, what's partially built, and what hasn't been started. Anything not started gets cut. Anything partially built gets either finished to demo-ready quality or cut. There is no "we'll polish it later" — later doesn't exist in a hackathon.
          </p>
          <h3 className="text-base font-bold text-gray-800 mt-5 mb-3">Start your slides at Hour 16</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Assign one team member to start building slides at Hour 16 while the rest continue building. By Hour 20, slides should be 80% done. Starting at Hour 22 produces panic-deck garbage.
          </p>
          <Callout type="tip">
            Use pre-made slide templates from Canva or Google Slides. A clean, simple 6-slide deck with good fonts looks more professional than 10 slides of custom design made at 3 AM under stress.
          </Callout>
        </PostSection>

        {/* ── Section 5 ── */}
        <PostSection id="polish-phase" title="Hour 18–22: The Polish Phase">
          <p className="text-gray-600 leading-relaxed mb-4">
            Polish means making what exists look and feel complete — not adding new things. The mental shift required here is hard but critical.
          </p>
          <ul className="space-y-3 text-sm text-gray-600 mb-5">
            {[
              { label: 'Feature freeze', desc: 'Nothing new gets added. If it\'s not done, cut it.' },
              { label: 'Fix critical bugs only', desc: 'Bugs that break the demo flow get fixed. Bugs that don\'t affect the demo get noted (not fixed).' },
              { label: 'Clean the UI', desc: 'Remove placeholder text, fix alignment issues on the demo screens, make the primary flow look polished.' },
              { label: 'Record the backup demo video', desc: 'Screen record the entire demo flow with voiceover. Upload to Google Drive. If live demo crashes, play this.' },
              { label: 'Finalize slide deck', desc: 'Review slide order, verify all numbers are correct, replace Lorem Ipsum with real content.' },
            ].map((item) => (
              <li key={item.label} className="flex gap-3">
                <span className="text-teal-500 font-bold shrink-0">✓</span>
                <div><strong className="text-gray-800">{item.label}:</strong> {item.desc}</div>
              </li>
            ))}
          </ul>
        </PostSection>

        {/* ── Section 6 ── */}
        <PostSection id="pitch-phase" title="Hour 22–24: Pitch Preparation">
          <p className="text-gray-600 leading-relaxed mb-4">
            The last 2 hours belong to your presenter, not your developers. If you still have critical bugs at Hour 22, make a decision: fix the bug and reduce pitch rehearsal time, or cut that feature from the demo entirely. Usually, cutting wins.
          </p>
          <div className="space-y-3 mb-5">
            {[
              { title: 'Run the full pitch twice', desc: 'Both rehearsals should be timed. If you\'re over 5 minutes, cut content — never practice going over time.' },
              { title: 'Anticipate 3 hard questions', desc: 'Brainstorm the 3 hardest questions a judge could ask and prepare answers together.' },
              { title: 'Sleep', desc: 'A 90-minute nap at Hour 22 produces a measurably better pitch than 90 minutes of panicked prep. This is backed by neuroscience, not just common sense.' },
              { title: 'Eat something real', desc: 'Venue snacks and energy drinks are not a meal. A proper meal an hour before pitching significantly improves cognitive performance.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-purple-500 font-bold shrink-0 mt-0.5">→</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </PostSection>

        {/* ── Section 7 ── */}
        <PostSection id="tech-stack" title="Tech Stack Recommendations by Track">
          <p className="text-gray-600 leading-relaxed mb-4">
            The best hackathon tech stack is the one your team can ship fastest, not the most impressive one. Here are proven combinations by track:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {[
              {
                track: 'Web App',
                color: 'border-indigo-200 bg-indigo-50',
                label: 'text-indigo-700',
                stack: ['React + Vite + Tailwind (frontend)', 'Node.js + Express (backend)', 'Supabase or Firebase (DB + Auth)', 'Vercel (deploy in 2 min)'],
                why: 'Fastest to ship. Deploy on Vercel with one command.',
              },
              {
                track: 'AI / ML Feature',
                color: 'border-blue-200 bg-blue-50',
                label: 'text-blue-700',
                stack: ['Python Flask or FastAPI (backend)', 'OpenAI / Gemini / HuggingFace API (don\'t train)', 'Streamlit (instant AI UI)', 'React frontend if needed'],
                why: 'Use pre-trained model APIs. Never train from scratch in 24h.',
              },
              {
                track: 'Mobile App',
                color: 'border-teal-200 bg-teal-50',
                label: 'text-teal-700',
                stack: ['React Native + Expo (cross-platform)', 'Firebase (backend + realtime DB)', 'Expo Go (test without build)'],
                why: 'Expo eliminates the build cycle. Demo directly from Expo Go.',
              },
              {
                track: 'Hardware / IoT',
                color: 'border-amber-200 bg-amber-50',
                label: 'text-amber-700',
                stack: ['Arduino or Raspberry Pi (hardware)', 'MQTT or WebSockets (data)', 'React dashboard (visualize data)', 'Python (sensor processing)'],
                why: 'Simple React dashboard impresses more than CLI output.',
              },
            ].map((item) => (
              <div key={item.track} className={`rounded-lg p-4 border ${item.color}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${item.label}`}>{item.track}</p>
                <ul className="space-y-1 mb-3">
                  {item.stack.map((s) => (
                    <li key={s} className="text-xs text-gray-700">• {s}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 italic">{item.why}</p>
              </div>
            ))}
          </div>
          <Callout type="warning">
            Never choose a tech stack you've never used before in a hackathon. "I'll learn X during the event" guarantees 6 lost hours and a broken demo. Boring, familiar tech ships 3x faster than exciting new tech.
          </Callout>
        </PostSection>

        {/* ── Section 8 ── */}
        <PostSection id="scope-control" title="The Art of Scope Control">
          <p className="text-gray-600 leading-relaxed mb-4">
            Scope creep is the number one killer of hackathon projects. It happens because teams conflate "good idea" with "should build now." Here's a simple framework for every feature request during the event:
          </p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-5">
            <p className="font-bold text-gray-800 mb-4 text-sm">The 3-question feature filter</p>
            {[
              { q: '1. Does the judge need to see this in the demo to understand the product?', pass: 'Build it.', fail: 'Cut it.' },
              { q: '2. Does it take less than 30 minutes to add?', pass: 'Add it only after core MVP is complete.', fail: 'Cut it.' },
              { q: '3. Is it on the original MVP list we wrote at Hour 2?', pass: 'Build it.', fail: 'It\'s scope creep. Cut it.' },
            ].map((item) => (
              <div key={item.q} className="mb-4 last:mb-0">
                <p className="text-sm font-semibold text-gray-700 mb-1">{item.q}</p>
                <p className="text-xs text-green-600">✓ Yes → {item.pass}</p>
                <p className="text-xs text-red-500">✗ No → {item.fail}</p>
              </div>
            ))}
          </div>
          <Callout type="tip">
            Add rejected features to a "V2 Roadmap" slide in your deck. It shows judges you've thought beyond the hackathon without wasting time building features you won't demo.
          </Callout>
        </PostSection>

        {/* ── Section 9 ── */}
        <PostSection id="48-hour-differences" title="48-Hour Hackathon: What Changes">
          <p className="text-gray-600 leading-relaxed mb-4">
            48-hour hackathons like Smart India Hackathon give more time but introduce new failure modes. Most teams use the extra 24 hours to add features instead of polishing what they have — and it shows.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="font-bold text-green-700 text-sm mb-2">What to do with extra time</p>
              <ul className="space-y-1.5 text-xs text-green-800">
                <li>• Add a second user flow to the demo</li>
                <li>• Build real backend (not hardcoded) if you hardcoded Day 1</li>
                <li>• Do 4–5 pitch rehearsals instead of 2</li>
                <li>• Sleep a full 6–7 hours on Day 1 night</li>
                <li>• Research judge backgrounds and tailor pitch</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="font-bold text-red-700 text-sm mb-2">What not to do</p>
              <ul className="space-y-1.5 text-xs text-red-800">
                <li>• Add 5 new features on Day 2</li>
                <li>• Rewrite working code "because it's messy"</li>
                <li>• Skip sleep because you have more time</li>
                <li>• Start a new idea if the first one isn't working — pivot, don't restart</li>
              </ul>
            </div>
          </div>

          <FindEventsCTA
            category="Hackathon"
            label="Register for Upcoming Hackathons Across India"
          />
        </PostSection>
      </BlogLayout>
    </>
  );
}
