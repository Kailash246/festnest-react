// src/pages/legal/Privacy.jsx
import Seo from '../../components/Seo';
import {
  ShieldCheck, Info, Lock, PartyPopper, FolderOpen, Mail,
  BarChart3, Ban, Scale, Inbox, Users, Bell, MessageCircle, Landmark,
} from 'lucide-react';
import LegalLayout, { Section, List, Callout, ContactCard, InfoTable } from './_LegalLayout';

const SECTIONS = [
  { id: 'intro',      label: '1. Introduction' },
  { id: 'collect',    label: '2. Data We Collect' },
  { id: 'use',        label: '3. How We Use It' },
  { id: 'basis',      label: '4. Legal Basis (DPDP)' },
  { id: 'consent',    label: '5. Consent & Withdrawal' },
  { id: 'sharing',    label: '6. Who We Share With' },
  { id: 'retention',  label: '7. How Long We Keep It' },
  { id: 'rights',     label: '8. Your Rights' },
  { id: 'security',   label: '9. How We Protect It' },
  { id: 'children',   label: "10. Children's Data" },
  { id: 'breach',     label: '11. Breach Notification' },
  { id: 'updates',    label: '12. Policy Updates' },
  { id: 'contact',    label: '13. Contact & Grievance' },
];

const DATA_USE = [
  [Lock,        'Accounts & login',   'Creating and securing your account, managing sessions, recovery.'],
  [PartyPopper, 'Event operations',   'Reviewing submissions, publishing approved events, enabling discovery.'],
  [FolderOpen,  'File handling',      'Storing and serving posters and brochures via Cloudinary.'],
  [Mail,        'Communications',     'Transactional emails — verification, approval status, password reset — and key announcements.'],
  [ShieldCheck, 'Safety & trust',     'Reviewing flagged content, preventing fraud and abuse.'],
  [BarChart3,   'Improvement',        'Aggregated, anonymized usage to fix issues and improve features — never individual profiling.'],
];

const Right = ({ section, title, children }) => (
  <div className="bg-white border border-border rounded-lg p-4">
    <div className="inline-block text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded mb-2">{section}</div>
    <div className="font-display font-bold text-[14px] text-text-1 mb-1">{title}</div>
    <div className="text-[13px] text-text-2 leading-relaxed">{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How FestNest collects, uses, and protects your data, and the rights you hold under India's Digital Personal Data Protection Act, 2023."
        canonical="/privacy"
      />
    <LegalLayout
      kind="Legal · Privacy"
      title="Privacy Policy"
      subtitle="What we collect, why, how we protect it, and the rights you hold under India's Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025."
      effectiveDate="6 Apr 2026"
      lastUpdated="Jun 2026"
      sections={SECTIONS}>

      <Callout type="info" icon={ShieldCheck} title="Our promise in one line">
        We collect only what we need to run FestNest, we never sell your data, and you stay in control of it. Everything below explains exactly how.
      </Callout>

      <Section num="1" id="intro" title="Introduction">
        <p>FestNest ("we", "us", "our") is India's campus event discovery platform. This Privacy Policy explains how we handle your personal data when you use our website and services (the "Platform").</p>
        <p>We are the "Data Fiduciary" for the personal data you provide, and we process it in line with the Digital Personal Data Protection Act, 2023 (the "DPDP Act") and the Digital Personal Data Protection Rules, 2025 (the "DPDP Rules"), along with other applicable Indian laws.</p>
        <Callout type="info" icon={Info} title="Who this applies to">
          This Policy covers all visitors and registered users — students, organizers, and administrators — whether you use FestNest on our website or any future app. By using FestNest, you confirm you have read this Policy.
        </Callout>
      </Section>

      <Section num="2" id="collect" title="Data We Collect">
        <p>We follow <strong>data minimisation</strong> — we only collect what is genuinely needed.</p>
        <p><strong className="text-text-1">2.1 Account & profile.</strong> Students: name, email, college, course/branch, year of study, and optionally phone and profile photo. Organizers: organization/college name, department, city, contact email and phone, and optionally a logo or photo.</p>
        <p><strong className="text-text-1">2.2 Event & activity.</strong></p>
        <List items={[
          'Event details organizers submit: title, description, category, dates, venue, prizes, fees, eligibility, rules, and contact info.',
          'Posters and brochures uploaded via Cloudinary.',
          'Events you save, and registration-interest actions you take.',
        ]} />
        <p><strong className="text-text-1">2.3 Technical & usage (collected automatically).</strong></p>
        <List items={[
          'IP address and approximate city/region-level location.',
          'Browser, device, and operating system.',
          'Pages visited, features used, and searches made.',
          'Session duration and error logs for stability.',
        ]} />
        <p><strong className="text-text-1">2.4 Authentication.</strong> We never store your raw password — it is hashed. Session tokens (JWT) are stored in your browser's localStorage to keep you logged in.</p>
        <p><strong className="text-text-1">2.5 Cookies & local storage.</strong> We use browser localStorage for your session and preferences. We do <strong>not</strong> use third-party advertising cookies or tracking pixels. Clearing local storage logs you out.</p>
      </Section>

      <Section num="3" id="use" title="How We Use Your Data">
        <div className="grid sm:grid-cols-2 gap-3 my-4">
          {DATA_USE.map(([DataIcon, t, d]) => (
            <div key={t} className="bg-surface-2 rounded-lg p-4">
              <div className="mb-1.5 text-primary"><DataIcon className="w-5 h-5" /></div>
              <div className="font-display font-bold text-[13px] text-text-1 mb-1">{t}</div>
              <div className="text-[12px] text-text-3 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
        <Callout type="success" icon={Ban} title="What we never do">
          We never sell your personal data. We never share it with advertisers. We never use it for profiling unrelated to FestNest's core features. We do not transfer it outside India except to service providers under adequate safeguards.
        </Callout>
      </Section>

      <Section num="4" id="basis" title="Legal Basis for Processing">
        <p>Under the DPDP Act, we rely on these lawful grounds:</p>
        <List items={[
          'Consent (§ 6) — the explicit, informed consent you give at registration. You can withdraw it anytime.',
          'Legitimate use / contractual necessity — processing needed to deliver the service you signed up for, such as account creation and event publishing.',
          'Legal obligation — where we must retain or disclose data under Indian law, a court order, or a competent authority.',
        ]} />
      </Section>

      <Section num="5" id="consent" title="Consent & Withdrawal">
        <p>As required by Section 6 of the DPDP Act, your consent is free, specific, informed, unconditional, and unambiguous, given by a clear affirmative action at registration.</p>
        <List items={[
          'You actively accept this Policy when you create an account.',
          'If we introduce new uses not covered here, we will ask for fresh consent first.',
          'You can withdraw consent anytime by requesting account deletion at support@festnest.in. Withdrawing is as easy as giving consent.',
          'Withdrawal does not affect processing already carried out lawfully before withdrawal.',
          'After withdrawal, we stop processing and delete your data within the timelines in Section 7, unless retention is legally required.',
        ]} />
      </Section>

      <Section num="6" id="sharing" title="Who We Share Data With">
        <p>We share data only with the following processors, strictly to run the service, under data-processing agreements:</p>
        <InfoTable rows={[
          { label: 'Cloudinary', desc: 'Hosting event posters & brochures', value: 'Processor' },
          { label: 'MongoDB Atlas', desc: 'Database for profiles, events, saves', value: 'Processor' },
          { label: 'Resend', desc: 'Transactional & verification emails', value: 'Processor' },
          { label: 'Render', desc: 'Backend application hosting', value: 'Processor' },
        ]} />
        <Callout type="legal" icon={Scale} title="Legal disclosures">
          We may disclose data to Indian authorities or courts when legally compelled. Where the law permits, we will inform you of such disclosure.
        </Callout>
      </Section>

      <Section num="7" id="retention" title="How Long We Keep Data">
        <p>We keep personal data only as long as needed for the purpose collected, or as required by law:</p>
        <InfoTable rows={[
          { label: 'Active account data', desc: 'Kept while your account is active', value: 'Until deletion' },
          { label: 'Event submissions', desc: 'For integrity & dispute history', value: '2 years post-event' },
          { label: 'Auth & session logs', desc: 'Security & abuse detection', value: '90 days' },
          { label: 'Data after deletion request', desc: 'Grace window, then purged', value: '30 days' },
          { label: 'Anonymized analytics', desc: 'No personal identifiers', value: 'Indefinite' },
          { label: 'Legally mandated records', desc: 'Statutory compliance only', value: 'As law requires' },
        ]} />
      </Section>

      <Section num="8" id="rights" title="Your Rights Under the DPDP Act">
        <p>As a "Data Principal", you hold the following enforceable rights, which we honour within legally mandated timeframes.</p>
        <Callout type="info" icon={Inbox} title="How to exercise any right">
          Email support@festnest.in with the subject "Data Rights Request — [type]". We respond within 30 days and may first verify your identity.
        </Callout>
        <div className="grid sm:grid-cols-2 gap-3 my-4">
          <Right section="§ 11" title="Access">Get a summary of the personal data we hold and how we process it.</Right>
          <Right section="§ 12" title="Correction & Erasure">Correct inaccurate data or request permanent deletion of your data and account.</Right>
          <Right section="§ 6(6)" title="Withdraw Consent">Withdraw consent anytime, as easily as you gave it, without penalty.</Right>
          <Right section="§ 13" title="Grievance Redressal">Raise a complaint with our Grievance Officer; escalate to the Data Protection Board if unresolved.</Right>
          <Right section="§ 14" title="Nominate">Nominate someone to exercise your rights if you die or become incapacitated.</Right>
          <Right section="Rules 2025" title="Easy Requests">Exercise all rights through the contact channels published in this Policy.</Right>
        </div>
      </Section>

      <Section num="9" id="security" title="How We Protect Your Data">
        <List items={[
          'All data in transit is encrypted with TLS 1.2+ (HTTPS) — never plain HTTP.',
          'Passwords are hashed with bcrypt at a high cost factor; we never store plain-text passwords.',
          'Sessions use signed JWT tokens with defined expiry.',
          'Database access is restricted to authorized personnel with role-based controls.',
          'Uploaded files are stored in Cloudinary with access controls.',
          'Admin capabilities are isolated and cannot be reached by student or organizer accounts.',
        ]} />
        <p>We take reasonable security safeguards as required under Section 8 of the DPDP Act, though no system can be guaranteed 100% secure.</p>
      </Section>

      <Section num="10" id="children" title="Children's Data">
        <p>FestNest is built for college students and organizers and is <strong>not</strong> intended for anyone under 18.</p>
        <p>Under Section 9 of the DPDP Act, processing a child's data requires verifiable parental consent, and we do not knowingly collect it. We do not undertake tracking, behavioural monitoring, or targeted advertising directed at children. If we learn a minor has registered without parental consent, we will delete that account and its data promptly.</p>
        <Callout type="info" icon={Users} title="For parents & guardians">
          If you believe a minor has created a FestNest account, contact support@festnest.in and we will resolve it quickly.
        </Callout>
      </Section>

      <Section num="11" id="breach" title="Breach Notification">
        <Callout type="warning" icon={Bell} title="If something goes wrong">
          If we become aware of a personal-data breach, we will notify each affected Data Principal and the Data Protection Board of India without undue delay, with the details required by the DPDP Rules, 2025, and take immediate steps to contain and remedy it.
        </Callout>
      </Section>

      <Section num="12" id="updates" title="Policy Updates">
        <List items={[
          'The "Effective" and "Updated" dates at the top reflect the current version.',
          'For material changes to how we process data or your rights, we will notify you by email at least 14 days in advance.',
          'For minor changes, we will update this page and notify you on your next login.',
          'Continued use after changes take effect constitutes acceptance. You may request deletion before the effective date if you disagree.',
        ]} />
      </Section>

      <Section num="13" id="contact" title="Contact & Grievance Redressal">
        <div className="grid sm:grid-cols-2 gap-3 my-4">
          <ContactCard icon={MessageCircle} title="Privacy Queries" email="support@festnest.in" desc="Questions about this Policy or your data." />
          <ContactCard icon={Inbox} title="Grievance Officer" email="grievance@festnest.in" desc="Formal DPDP complaints — acknowledged within 48 hours, resolved within 30 days." />
        </div>
        <Callout type="legal" icon={Landmark} title="Escalation to the Data Protection Board">
          If you are not satisfied after contacting our Grievance Officer, you may escalate your complaint to the Data Protection Board of India under the DPDP Act, 2023.
        </Callout>
      </Section>

    </LegalLayout>
    </>
  );
}
