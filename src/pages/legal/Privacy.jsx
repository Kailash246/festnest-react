// src/pages/legal/Privacy.jsx
import { useEffect } from 'react';
import LegalLayout, { Section, List, Callout, ContactCard, InfoTable } from './_LegalLayout';

const SECTIONS = [
  { id: 'intro',       label: '1. Introduction' },
  { id: 'collect',     label: '2. Information We Collect' },
  { id: 'use',         label: '3. How We Use Your Data' },
  { id: 'basis',       label: '4. Legal Basis (DPDP Act)' },
  { id: 'consent',     label: '5. Consent & Withdrawal' },
  { id: 'sharing',     label: '6. Third-Party Services' },
  { id: 'retention',   label: '7. Data Retention' },
  { id: 'rights',      label: '8. Your Rights' },
  { id: 'security',    label: '9. Data Security' },
  { id: 'children',    label: '10. Children\'s Privacy' },
  { id: 'updates',     label: '11. Policy Updates' },
  { id: 'contact',     label: '12. Contact & Grievance' },
];

const Right = ({ section, title, children }) => (
  <div className="bg-white border border-border rounded-lg p-4">
    <div className="inline-block text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded mb-2">{section}</div>
    <div className="font-display font-bold text-[14px] text-text-1 mb-1">{title}</div>
    <div className="text-[13px] text-text-2 leading-relaxed">{children}</div>
  </div>
);

export default function Privacy() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Privacy Policy — FestNest';
    return () => { document.title = prev; };
  }, []);

  return (
    <LegalLayout
      kind="Privacy"
      title="Privacy Policy"
      subtitle="What personal data we collect, why we collect it, how we protect it, and the rights you hold under the Digital Personal Data Protection Act, 2023."
      effectiveDate="6 April 2026"
      sections={SECTIONS}>

      <Section num="1" id="intro" title="Introduction">
        <p>Welcome to FestNest ("we", "us", "our"). FestNest is India's centralized campus event discovery platform, connecting students with hackathons, cultural fests, workshops, sports events, and more — and giving organizers powerful tools to reach participants at scale.</p>
        <p>This Privacy Policy explains what personal data we collect, why, how we use and protect it, and what rights you hold under the Digital Personal Data Protection Act, 2023 (DPDP Act) and other applicable Indian laws.</p>
        <Callout type="info" icon="ℹ️" title="Who This Applies To">
          This Policy applies to all visitors and registered users of FestNest — students, organizers, and administrators — whether you access the platform via our website or any future mobile application. By creating an account or using FestNest, you confirm you've read this Policy and consent to the data practices described.
        </Callout>
      </Section>

      <Section num="2" id="collect" title="Information We Collect">
        <p>We apply strict data minimization — we only collect what is genuinely needed to provide FestNest's services.</p>
        <p><strong className="text-text-1">2.1 Account & Profile Data.</strong> Students provide: full name, email, college name, course/branch, year of study, and optionally a phone number and profile photo. Organizers provide: organization/college name, department, city, contact email, contact phone, and optionally an organization photo.</p>
        <p><strong className="text-text-1">2.2 Event & Content Data.</strong></p>
        <List items={[
          'Event details submitted by organizers: title, description, category, date, venue, prize info, registration fee, contact details.',
          'Event poster images and brochure PDFs uploaded via Cloudinary.',
          'Events you save (bookmark) as a student.',
          'Registration interest actions you take on the platform.',
        ]} />
        <p><strong className="text-text-1">2.3 Technical & Usage Data (auto-collected).</strong></p>
        <List items={[
          'IP address and approximate location (city/region level only).',
          'Browser type, device type, and operating system.',
          'Pages visited, features accessed, and search queries entered.',
          'Session duration and error logs for platform stability.',
        ]} />
        <p><strong className="text-text-1">2.4 Authentication Data.</strong> Authentication is handled by our secure backend. We never store your raw password. JWT tokens are stored in your browser's localStorage for session management.</p>
        <p><strong className="text-text-1">2.5 Cookies & Local Storage.</strong> FestNest uses browser localStorage to maintain your login session and preferences. We do not use third-party advertising cookies or tracking pixels. Clearing local storage will log you out.</p>
      </Section>

      <Section num="3" id="use" title="How We Use Your Data">
        <div className="grid md:grid-cols-2 gap-3 my-4">
          {[
            ['🔐', 'Authentication & Accounts', 'Creating and securing your account, managing sessions, verifying identity, enabling recovery.'],
            ['🎉', 'Event Operations', 'Processing submissions, routing through admin review, publishing approved events, enabling discovery.'],
            ['📁', 'File Management', 'Storing and serving event posters and brochures uploaded by organizers via Cloudinary.'],
            ['📧', 'Communications', 'Sending transactional emails (confirmation, approval status, password reset) and platform announcements.'],
            ['🛡️', 'Safety & Trust', 'Reviewing flagged content, preventing fraud and abuse, maintaining a safe community.'],
            ['📊', 'Analytics & Improvement', 'Understanding aggregate usage to improve features. Anonymized data only — never individual profiles.'],
          ].map(([icon, t, d]) => (
            <div key={t} className="bg-surface-2 rounded-lg p-4">
              <div className="text-[20px] mb-1.5">{icon}</div>
              <div className="font-display font-bold text-[13px] text-text-1 mb-1">{t}</div>
              <div className="text-[12px] text-text-3 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
        <Callout type="success" icon="🚫" title="What We Never Do">
          We do not sell your personal data. We do not share it with advertisers. We do not use it for profiling unrelated to FestNest's core features. We do not transfer it outside India without adequate safeguards.
        </Callout>
      </Section>

      <Section num="4" id="basis" title="Legal Basis for Processing (DPDP Act)">
        <p>Under the Digital Personal Data Protection Act, 2023, we process your personal data on these lawful grounds:</p>
        <List items={[
          'Consent (§ 6) — your explicit, informed consent given at registration. You may withdraw anytime.',
          'Contractual Necessity — processing needed to deliver the service you signed up for.',
          'Legitimate Interests — limited usage and security data to prevent abuse and maintain stability.',
          'Legal Obligation (§ 7(b)) — we may retain or disclose data when required by Indian law or courts.',
        ]} />
      </Section>

      <Section num="5" id="consent" title="Consent & Withdrawal">
        <p>Consent on FestNest is free, specific, informed, and unambiguous — as required by Section 6 of the DPDP Act.</p>
        <List items={[
          'At registration, you are presented with this Policy and must affirmatively accept it.',
          'If we introduce new data uses not covered here, we will seek fresh consent first.',
          'You may withdraw consent anytime by submitting an account deletion request to support@festnest.in. We action it within 30 days.',
          'Withdrawal does not affect the lawfulness of processing carried out before withdrawal.',
          'Upon deletion, your data is permanently purged within 30 days, except where retention is legally required.',
        ]} />
      </Section>

      <Section num="6" id="sharing" title="Third-Party Services & Data Sharing">
        <p>We share personal data only with the following providers, strictly for the stated purposes, under data processing agreements:</p>
        <InfoTable rows={[
          { label: 'Cloudinary', desc: 'Hosting and serving event posters and PDF brochures', value: 'Processor' },
          { label: 'MongoDB Atlas', desc: 'Cloud database for profiles, events, saved lists', value: 'Processor' },
          { label: 'Email (Resend)', desc: 'Transactional emails — confirmation, event status', value: 'Processor' },
          { label: 'Render', desc: 'Backend application hosting infrastructure', value: 'Processor' },
        ]} />
        <Callout type="legal" icon="⚖️" title="Government & Legal Disclosures">
          We may disclose personal data to Indian government authorities or courts when legally required. Where legally permitted, we will notify you of such disclosures.
        </Callout>
      </Section>

      <Section num="7" id="retention" title="Data Retention">
        <p>We retain personal data only as long as necessary to provide the service and meet legal obligations:</p>
        <InfoTable rows={[
          { label: 'Active account data', desc: 'Deleted on account deletion request', value: 'Lifetime of account' },
          { label: 'Event submission data', desc: 'For dispute resolution and integrity', value: '2 years post-event' },
          { label: 'Auth & session logs', desc: 'Security monitoring and abuse detection', value: '90 days' },
          { label: 'Data after deletion request', desc: 'Then permanently purged', value: '30 days' },
          { label: 'Anonymized analytics', desc: 'No personal identifiers whatsoever', value: 'Indefinite' },
          { label: 'Legally mandated data', desc: 'Minimum needed for compliance', value: 'As required by law' },
        ]} />
      </Section>

      <Section num="8" id="rights" title="Your Rights Under the DPDP Act 2023">
        <p>As a Data Principal, you hold the following enforceable rights. We honor them within legally mandated timeframes.</p>
        <Callout type="info" icon="📬" title="How to Exercise Any Right">
          Email support@festnest.in with subject "Data Rights Request — [Right Type]". We respond within 30 days. We may verify your identity first.
        </Callout>
        <div className="grid md:grid-cols-2 gap-3 my-4">
          <Right section="§ 12(a)" title="Right to Access">Request a copy of all personal data we hold — profile, saved events, authentication records.</Right>
          <Right section="§ 12(b)" title="Right to Correction">Request correction of inaccurate or outdated data. Most fields are editable in your settings.</Right>
          <Right section="§ 13" title="Right to Erasure">Request permanent deletion of your data and account. Processed within 30 days.</Right>
          <Right section="§ 6(4)" title="Right to Withdraw Consent">Withdraw consent anytime without penalty. Does not affect prior processing.</Right>
          <Right section="§ 23" title="Right to Grievance Redressal">Raise a formal complaint with our Grievance Officer. Escalate to the Data Protection Board of India if unresolved.</Right>
          <Right section="§ 14" title="Right to Nominate">Nominate a trusted individual to exercise your rights in the event of death or incapacity.</Right>
        </div>
      </Section>

      <Section num="9" id="security" title="Data Security">
        <List items={[
          'All data in transit is encrypted via TLS 1.2+ (HTTPS). Never transmitted over plain HTTP.',
          'Passwords are hashed with bcrypt using a high cost factor. We never store plain-text passwords.',
          'Authentication uses signed JWT tokens with defined expiry, stored in browser localStorage.',
          'Production database access is restricted to authorized personnel with role-based access control.',
          'File uploads are stored in Cloudinary with signed access controls.',
          'Admin capabilities cannot be accessed by student or organizer accounts.',
        ]} />
        <Callout type="warning" icon="🔔" title="Breach Notification">
          If we become aware of a security breach that materially compromises your data, we will notify affected users promptly via registered email and take immediate containment steps, per DPDP Act obligations.
        </Callout>
      </Section>

      <Section num="10" id="children" title="Children's Privacy">
        <p>FestNest is designed exclusively for college students and event organizers. Our platform is not intended for anyone under the age of 18.</p>
        <p>Under Section 9 of the DPDP Act, processing children's data requires verifiable parental consent. We do not knowingly collect data from persons under 18. If we discover a minor has registered without parental consent, we will immediately delete that account and all associated data.</p>
        <Callout type="info" icon="👨‍👩‍👧" title="For Parents & Guardians">
          If you believe a minor has created a FestNest account, contact support@festnest.in for prompt resolution.
        </Callout>
      </Section>

      <Section num="11" id="updates" title="Policy Updates">
        <List items={[
          'The "Effective Date" at the top reflects the most recent revision.',
          'For material changes affecting how we process data or your rights, we notify you via email at least 14 days before they take effect.',
          'For minor changes (clarifications, typos), we update the page and notify you on next login.',
          'Continued use after an updated Policy takes effect constitutes acceptance. You may request deletion before the effective date if you disagree.',
        ]} />
      </Section>

      <Section num="12" id="contact" title="Contact & Grievance Redressal">
        <div className="grid md:grid-cols-2 gap-4 my-4">
          <ContactCard icon="💬" title="General Privacy Queries" email="support@festnest.in" desc="Questions about this Policy, your data, or how we handle information." />
          <ContactCard icon="📮" title="Grievance Officer" email="grievance@festnest.in" desc="Formal DPDP complaints — acknowledged within 48 hours, resolved within 30 days." />
        </div>
        <Callout type="legal" icon="🏛️" title="Escalation">
          If you remain unsatisfied after engaging our Grievance Officer, you may escalate your complaint to the Data Protection Board of India once constituted under the DPDP Act, 2023.
        </Callout>
      </Section>

    </LegalLayout>
  );
}
