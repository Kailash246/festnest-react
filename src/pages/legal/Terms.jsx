// src/pages/legal/Terms.jsx
import { useEffect } from 'react';
import LegalLayout, { Section, List, Callout, DualList, RoleCard, ContactCard } from './_LegalLayout';

const SECTIONS = [
  { id: 'acceptance',    label: '1. Acceptance of Terms' },
  { id: 'eligibility',   label: '2. User Eligibility' },
  { id: 'account',       label: '3. Account Responsibilities' },
  { id: 'roles',         label: '4. Roles & Permissions' },
  { id: 'posting',       label: '5. Event Posting Rules' },
  { id: 'prohibited',    label: '6. Prohibited Content' },
  { id: 'ip',            label: '7. Intellectual Property' },
  { id: 'availability',  label: '8. Platform Availability' },
  { id: 'liability',     label: '9. Limitation of Liability' },
  { id: 'indemnity',     label: '10. Indemnification' },
  { id: 'termination',   label: '11. Termination' },
  { id: 'disputes',      label: '12. Dispute Resolution' },
  { id: 'law',           label: '13. Governing Law' },
  { id: 'modifications', label: '14. Modifications' },
  { id: 'contact',       label: '15. Contact' },
];

export default function Terms() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Terms of Service — FestNest';
    return () => { document.title = prev; };
  }, []);

  return (
    <LegalLayout
      kind="Legal"
      title="Terms of Service"
      subtitle="A legally binding agreement between you and FestNest. Key obligations are highlighted throughout. If you do not agree, please do not use FestNest."
      effectiveDate="6 April 2026"
      sections={SECTIONS}>

      <Callout type="info" icon="📋" title="Plain-English Notice">
        These Terms are a legally binding agreement between you and FestNest. We've highlighted the key obligations throughout so they're easy to spot. If you do not agree with them, please do not use FestNest.
      </Callout>

      <Section num="1" id="acceptance" title="Acceptance of Terms">
        <p>By accessing, registering on, or using FestNest in any way — whether as a student, event organizer, or visitor — you enter into a legally binding agreement with FestNest and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines we publish.</p>
        <p>These Terms are governed by the Indian Contract Act, 1872, the Information Technology Act, 2000, and all other applicable Indian laws. Your use of FestNest constitutes valid and binding acceptance.</p>
        <Callout type="info" icon="📅" title="Effective Date">
          These Terms are effective from 6 April 2026. Using FestNest on or after this date means you accept the current version.
        </Callout>
      </Section>

      <Section num="2" id="eligibility" title="User Eligibility">
        <p>To use FestNest, you must meet all of the following criteria:</p>
        <List items={[
          'You must be at least 18 years of age. FestNest is not intended for persons under 18.',
          'You must be enrolled in, employed by, or affiliated with an Indian college, university, or educational institution.',
          'You must provide accurate, complete, and current registration information.',
          'You must not have had a previous FestNest account suspended or terminated for a Terms violation.',
          'You must have the legal capacity to enter into a binding contract under Indian law.',
        ]} />
        <p>By registering, you represent and warrant that you meet all of the above. FestNest reserves the right to verify eligibility and suspend non-compliant accounts.</p>
      </Section>

      <Section num="3" id="account" title="Account Responsibilities">
        <p>When you create a FestNest account, you agree to:</p>
        <List items={[
          'Provide truthful, accurate, and complete information and keep it updated.',
          'Maintain the security and confidentiality of your login credentials. Do not share your password.',
          'Accept full responsibility for all activity under your account, whether or not you authorized it.',
          'Immediately notify us at support@festnest.in if you suspect unauthorized access.',
          'Not create multiple accounts for the same person, or create accounts to circumvent a suspension.',
        ]} />
        <Callout type="warning" icon="⚠️" title="Account Security">
          FestNest is not liable for any loss or damage arising from your failure to keep your credentials secure. If you lose access due to sharing credentials, we cannot guarantee full recovery.
        </Callout>
      </Section>

      <Section num="4" id="roles" title="User Roles & Permissions">
        <p>FestNest operates a role-based system. Your role determines what you can do on the platform:</p>
        <div className="grid md:grid-cols-2 gap-4 my-4">
          <RoleCard icon="🎓" title="Student" badge="Default Role" items={[
            'Browse and search approved events',
            'Save (bookmark) events for later',
            'Register interest in events',
            'Manage your personal profile',
          ]} />
          <RoleCard icon="🏢" title="Organizer" badge="Event Creator" items={[
            'All Student permissions, plus:',
            'Submit events for admin review',
            'Upload event posters & PDFs',
            'Manage and delete own listings',
            'Access organizer dashboard',
          ]} />
        </div>
        <p>A third role — <strong>Admin</strong> — is reserved exclusively for FestNest personnel and cannot be requested by users. Misrepresenting your role to gain unauthorized access is a material breach of these Terms.</p>
      </Section>

      <Section num="5" id="posting" title="Event Posting Rules">
        <p>Organizers who submit events agree that every submission must:</p>
        <List items={[
          'Be a genuine, real college or campus event — hackathons, workshops, cultural fests, sports meets, seminars, or similar activities.',
          'Contain accurate, verifiable information — dates, venues, prize amounts, eligibility, and contact details.',
          'Be submitted by someone with authority to represent the organizing institution, club, or body.',
          'Use only original or properly licensed poster images and brochures.',
        ]} />
        <Callout type="legal" icon="🔍" title="Review & Approval Process">
          All event submissions are reviewed by FestNest administrators before being published. We reserve the right to approve, reject, or request changes to any submission at our sole discretion, without being required to give reasons.
        </Callout>
        <Callout type="warning" icon="📣" title="Material Changes to Events">
          If a published event is cancelled, postponed, or materially changes (venue, date, prizes), you must update FestNest immediately. Failure to do so may result in event removal and account suspension.
        </Callout>
      </Section>

      <Section num="6" id="prohibited" title="Prohibited Content & Conduct">
        <p>The following is strictly prohibited on FestNest. Violations may result in immediate account suspension and legal action:</p>
        <DualList
          leftTitle="Permitted"
          leftItems={[
            'Genuine college & campus events',
            'Academic competitions & fests',
            'Student workshop listings',
            'Open-source hackathons',
            'Cultural & literary festivals',
            'Inter-college sports events',
          ]}
          rightTitle="Prohibited"
          rightItems={[
            'Fake, misleading, or fraudulent events',
            'Events promoting illegal activity',
            'Spam or duplicate listings',
            'Commercial sales or MLM schemes',
            'Offensive or discriminatory content',
            'Political rallies or propaganda',
          ]}
        />
        <p>You also agree not to use automated bots or scrapers, interfere with FestNest's infrastructure, impersonate any person or organization, or engage in any activity that violates Indian law.</p>
      </Section>

      <Section num="7" id="ip" title="Intellectual Property">
        <p><strong className="text-text-1">FestNest's IP.</strong> The FestNest brand, logo, platform design, software, database structure, and all associated materials are the exclusive property of FestNest, protected under applicable Indian IP laws. You may not copy, reproduce, modify, or commercially exploit them without our written permission.</p>
        <p><strong className="text-text-1">Your content & licenses.</strong> When you submit content — event descriptions, images, PDFs, profile info — you retain ownership. By submitting, you grant FestNest a non-exclusive, royalty-free, worldwide license to host, display, reproduce, and distribute it within FestNest to operate the service. This license ends when you delete the content or close your account, subject to legal retention requirements.</p>
        <Callout type="legal" icon="©️" title="Reporting IP Violations">
          If you believe content on FestNest infringes your IP rights, contact legal@festnest.in with details. We will investigate and respond promptly.
        </Callout>
      </Section>

      <Section num="8" id="availability" title="Platform Availability & Changes">
        <p>FestNest is provided on an "as is" and "as available" basis. We do not warrant that the platform will be available 100% of the time, error-free, or free from interruptions.</p>
        <List items={[
          'We may take FestNest offline for maintenance, upgrades, or emergency fixes — with or without prior notice.',
          'We reserve the right to modify, add, remove, or suspend any feature at any time.',
          'We are not responsible for loss of data or functionality from planned or unplanned downtime.',
          'We will make reasonable efforts to notify users of significant planned maintenance in advance.',
        ]} />
      </Section>

      <Section num="9" id="liability" title="Limitation of Liability">
        <p>To the maximum extent permitted by Indian law, FestNest, its directors, employees, and affiliates shall not be liable for:</p>
        <List items={[
          'Any indirect, incidental, special, punitive, or consequential damages from your use of FestNest.',
          'Loss of data, revenue, opportunities, or goodwill.',
          'Actions or omissions of event organizers — cancellations, fraudulent events, or failure to deliver prizes.',
          'Claims arising from content posted by users (event listings, profiles, uploads).',
          'Third-party service failures (Firebase, Cloudinary, email providers, hosting).',
          'Unauthorized account access resulting from your failure to secure credentials.',
        ]} />
        <Callout type="legal" icon="🏛️" title="FestNest is a Discovery Platform">
          FestNest connects students with events. We are not the organizer of any listed event. We do not verify prize claims, manage registrations, or guarantee any event will take place. Your participation in any event is at your own risk.
        </Callout>
        <p>Our maximum aggregate liability for any claim shall not exceed the amount you have paid to FestNest in the 3 months preceding the claim, or ₹1,000 (Indian Rupees One Thousand), whichever is lower.</p>
      </Section>

      <Section num="10" id="indemnity" title="Indemnification">
        <p>You agree to indemnify, defend, and hold harmless FestNest, its directors, officers, employees, and agents from any claims, damages, losses, costs, and expenses (including reasonable legal fees) arising out of:</p>
        <List items={[
          'Your use of FestNest in violation of these Terms.',
          'Any content you submit, post, or transmit through FestNest.',
          'Your violation of any applicable law or third-party rights.',
          'Any misrepresentation you make in connection with your use of FestNest.',
        ]} />
      </Section>

      <Section num="11" id="termination" title="Termination & Suspension">
        <p><strong className="text-text-1">Termination by you.</strong> You may close your account anytime by emailing support@festnest.in. We process it within 30 days and delete your personal data per our Privacy Policy.</p>
        <p><strong className="text-text-1">By FestNest.</strong> We may suspend or permanently terminate your account — with or without notice — if we reasonably believe you violated these Terms, submitted fraudulent content, engaged in abusive behavior, or used FestNest for unauthorized purposes.</p>
        <Callout type="danger" icon="🚫" title="Effect of Termination">
          On termination, your right to use FestNest ceases immediately. Provisions that by nature should survive — IP, indemnification, and dispute resolution — continue to apply.
        </Callout>
      </Section>

      <Section num="12" id="disputes" title="Dispute Resolution">
        <p>We prefer to resolve disputes informally. Contact us first at support@festnest.in — we'll make a good-faith effort to resolve the issue within 30 days.</p>
        <p>If informal resolution fails, disputes shall be referred to binding arbitration under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be in India. The language shall be English.</p>
        <Callout type="info" icon="⚖️" title="Consumer Rights">
          Nothing here limits your rights under the Consumer Protection Act, 2019 or the Information Technology Act, 2000. You retain the right to approach appropriate consumer or legal forums under Indian law.
        </Callout>
      </Section>

      <Section num="13" id="law" title="Governing Law">
        <p>These Terms are governed exclusively by the laws of India, including:</p>
        <List items={[
          'Indian Contract Act, 1872',
          'Information Technology Act, 2000 and its amendments',
          'Digital Personal Data Protection Act, 2023',
          'Consumer Protection Act, 2019',
          'Copyright Act, 1957',
          'Bharatiya Nyaya Sanhita (as applicable)',
        ]} />
        <p>For matters not resolved through arbitration, the parties submit to the exclusive jurisdiction of the competent courts in India.</p>
      </Section>

      <Section num="14" id="modifications" title="Modifications to These Terms">
        <List items={[
          'The "Effective Date" at the top reflects the most recent version.',
          'For material changes affecting your rights, we will notify you via email at least 14 days before they take effect.',
          'For non-material changes, we will update the page and notify you on your next login.',
          'Continued use after updated Terms take effect constitutes acceptance. If you disagree, you may close your account before the effective date.',
        ]} />
      </Section>

      <Section num="15" id="contact" title="Contact Information">
        <div className="grid md:grid-cols-3 gap-4 my-4">
          <ContactCard icon="💬" title="General Support" email="support@festnest.in" desc="Questions about your account, event listings, or platform usage." />
          <ContactCard icon="⚖️" title="Legal & IP" email="legal@festnest.in" desc="IP claims, legal notices, and compliance inquiries." />
          <ContactCard icon="📮" title="Grievance Officer" email="grievance@festnest.in" desc="Formal complaints — acknowledged within 48 hours." />
        </div>
      </Section>

    </LegalLayout>
  );
}
