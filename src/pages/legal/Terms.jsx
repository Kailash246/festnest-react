// src/pages/legal/Terms.jsx
import { useEffect } from 'react';
import {
  ClipboardList, Landmark, Lock, Scale, Ticket, Copyright,
  FileText, Calculator, DoorOpen, Gavel, MessageCircle, Inbox,
  GraduationCap, Building2,
} from 'lucide-react';
import LegalLayout, { Section, List, Callout, DualList, RoleCard, ContactCard } from './_LegalLayout';

const SECTIONS = [
  { id: 'about',         label: '1. About These Terms' },
  { id: 'platform-role', label: "2. What FestNest Is (and Isn't)" },
  { id: 'eligibility',   label: '3. Who Can Use FestNest' },
  { id: 'accounts',      label: '4. Your Account' },
  { id: 'roles',         label: '5. Roles & Permissions' },
  { id: 'organizer',     label: '6. Organizer Obligations' },
  { id: 'attendee',      label: '7. Attending Events' },
  { id: 'prohibited',    label: '8. Prohibited Use' },
  { id: 'content',       label: '9. Content & Takedown' },
  { id: 'ip',            label: '10. Intellectual Property' },
  { id: 'disclaimer',    label: '11. Disclaimers' },
  { id: 'liability',     label: '12. Limitation of Liability' },
  { id: 'indemnity',     label: '13. Indemnification' },
  { id: 'availability',  label: '14. Availability & Changes' },
  { id: 'termination',   label: '15. Suspension & Termination' },
  { id: 'disputes',      label: '16. Disputes & Grievances' },
  { id: 'law',           label: '17. Governing Law' },
  { id: 'updates',       label: '18. Changes to Terms' },
  { id: 'contact',       label: '19. Contact' },
];

export default function Terms() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Terms of Service — FestNest';
    return () => { document.title = prev; };
  }, []);

  return (
    <LegalLayout
      kind="Legal · Terms"
      title="Terms of Service"
      subtitle="The agreement between you and FestNest. We've kept it plain-spoken and highlighted the parts that matter most. Please read it before you use FestNest."
      effectiveDate="6 Apr 2026"
      lastUpdated="Jun 2026"
      sections={SECTIONS}>

      <Callout type="info" icon={ClipboardList} title="The short version">
        FestNest is a <strong>discovery platform</strong> — a noticeboard that helps students find college events and helps organizers list them. We do not run, fund, host, or guarantee any event. Anything you register for or host happens directly between you and the organizing party, at your own risk. The sections below explain this in full.
      </Callout>

      <Section num="1" id="about" title="About These Terms">
        <p>These Terms of Service ("Terms") form a legally binding agreement between you and FestNest ("FestNest", "we", "us", "our") governing your access to and use of our website, applications, and services (collectively, the "Platform").</p>
        <p>By creating an account, listing an event, registering interest in an event, or simply browsing, you confirm that you have read, understood, and agree to these Terms together with our <strong>Privacy Policy</strong>. If you do not agree, please do not use FestNest.</p>
        <p>These Terms are an electronic record under the Information Technology Act, 2000 and the rules thereunder, and do not require any physical or digital signature to be binding.</p>
      </Section>

      <Section num="2" id="platform-role" title="What FestNest Is (and Isn't)">
        <p>Understanding our role is the single most important part of these Terms.</p>
        <Callout type="legal" icon={Landmark} title="FestNest is an intermediary, not an organizer">
          FestNest is an <strong>information and discovery platform</strong>. We aggregate and display event listings submitted by third-party organizers (colleges, clubs, societies, and individuals). We act as an "intermediary" within the meaning of the Information Technology Act, 2000. We are <strong>not</strong> the organizer, host, sponsor, or co-host of any event listed on the Platform.
        </Callout>
        <p><strong className="text-text-1">This means FestNest does not:</strong></p>
        <List items={[
          'Organize, fund, manage, or run any event listed on the Platform.',
          "Collect registration fees, sell tickets, or process payments for events (registration happens on the organizer's own external page or form).",
          'Verify, endorse, or guarantee the accuracy, quality, safety, legality, or actual occurrence of any event.',
          'Guarantee that any prize, certificate, internship, perk, or benefit advertised by an organizer will actually be awarded or delivered.',
          'Control the conduct of organizers or attendees before, during, or after any event.',
        ]} />
        <p>FestNest simply provides the technology to connect students with events. Your dealings with any organizer — and your decision to attend, register for, pay for, or participate in any event — are solely between you and that organizer.</p>
      </Section>

      <Section num="3" id="eligibility" title="Who Can Use FestNest">
        <List items={[
          'You must be at least 18 years of age. FestNest is intended for college students and organizers and is not directed at anyone under 18.',
          'You must be enrolled in, employed by, or genuinely affiliated with an Indian college, university, or educational institution.',
          'You must provide accurate, complete, and current information, and keep it up to date.',
          'You must have the legal capacity to enter into a binding contract under the Indian Contract Act, 1872.',
          'You must not be a person previously suspended or removed from FestNest for a Terms violation.',
        ]} />
        <p>By using FestNest, you represent and warrant that you meet all of the above. We may verify eligibility and suspend accounts that do not comply.</p>
      </Section>

      <Section num="4" id="accounts" title="Your Account">
        <List items={[
          'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.',
          'You agree to notify us immediately at support@festnest.in if you suspect any unauthorized use of your account.',
          'You may not share your account, create multiple accounts for the same person, or create an account to evade a suspension.',
          'You are responsible for ensuring the information you submit is truthful and lawful.',
        ]} />
        <Callout type="warning" icon={Lock} title="Keep your credentials safe">
          FestNest is not liable for any loss arising from your failure to safeguard your password. We use industry-standard security, but account security is a shared responsibility.
        </Callout>
      </Section>

      <Section num="5" id="roles" title="Roles & Permissions">
        <p>FestNest uses a role-based system that determines what you can do:</p>
        <div className="grid sm:grid-cols-2 gap-3 my-4">
          <RoleCard icon={GraduationCap} title="Student" badge="Default" items={[
            'Browse and search approved events',
            'Save events for later',
            'Register interest in events',
            'Manage your profile',
          ]} />
          <RoleCard icon={Building2} title="Organizer" badge="Event Creator" items={[
            'Everything a student can do, plus:',
            'Submit events for review',
            'Upload posters & brochures',
            'Manage and delete own listings',
            'Access the organizer dashboard',
          ]} />
        </div>
        <p>The <strong>Admin</strong> role is reserved for FestNest personnel and cannot be requested. Attempting to gain unauthorized access or misrepresenting your role is a serious breach of these Terms.</p>
      </Section>

      <Section num="6" id="organizer" title="Organizer Obligations">
        <p>If you list an event on FestNest, you are the "Organizer" of that event and you alone are responsible for it. By submitting an event, you represent and agree that:</p>
        <List items={[
          'You have the authority to represent the institution, club, or body organizing the event.',
          'All information you provide — dates, venue, fees, prizes, eligibility, rules, and contact details — is accurate, current, and not misleading.',
          'The event is genuine, lawful, and a real academic or extracurricular activity.',
          'You own or have a valid license to use every poster, image, logo, and document you upload.',
          'You will honour everything you advertise, including any prizes, certificates, or perks.',
          'You will promptly update or remove the listing if the event is cancelled, postponed, or materially changed.',
          'You will comply with all applicable laws, including venue safety, permissions, and tax obligations.',
        ]} />
        <Callout type="danger" icon={Scale} title="Organizers are fully responsible for their events">
          You agree that <strong>you, the Organizer, are solely and fully responsible</strong> for your event and everything connected to it — including its conduct, safety, legality, registrations, collection and refund of any fees, delivery of prizes, and any dispute, loss, injury, or damage suffered by any attendee or third party. FestNest bears no responsibility whatsoever for your event. You agree to indemnify FestNest for any claim arising from it (see Section 13).
        </Callout>
      </Section>

      <Section num="7" id="attendee" title="Attending & Registering for Events">
        <Callout type="warning" icon={Ticket} title="You participate at your own risk">
          When you register for or attend any event you find on FestNest, you do so <strong>entirely at your own risk and discretion</strong>. Your agreement is with the Organizer, not with FestNest.
        </Callout>
        <p>Specifically, you understand and agree that:</p>
        <List items={[
          "FestNest does not collect registration fees or sell tickets — any payment is made directly to the Organizer through their own channel.",
          "Refunds, cancellations, rescheduling, and prize disbursement are governed solely by the Organizer's own policies. FestNest has no control over and no responsibility for them.",
          'FestNest does not verify event details and is not responsible if an event is cancelled, changed, fraudulent, unsafe, or simply does not happen.',
          'FestNest is not responsible for any loss, cost, injury, or damage — including travel, accommodation, registration fees, or other expenses — you may incur in connection with any event.',
          'Any dispute about an event must be raised with the Organizer directly. You may report the listing to us and we will act on it under Section 9, but we are not a party to the dispute.',
        ]} />
      </Section>

      <Section num="8" id="prohibited" title="Prohibited Use">
        <p>The following is strictly forbidden. Violations may lead to immediate removal, suspension, and where appropriate, referral to law enforcement.</p>
        <DualList
          leftTitle="Allowed"
          leftItems={[
            'Genuine college & campus events',
            'Academic competitions & fests',
            'Workshops & seminars',
            'Open hackathons',
            'Cultural & literary festivals',
            'Inter-college sports meets',
          ]}
          rightTitle="Not allowed"
          rightItems={[
            'Fake, misleading or fraudulent events',
            'Anything promoting illegal activity',
            'Spam or duplicate listings',
            'Commercial sales, MLM or get-rich schemes',
            'Offensive, hateful or discriminatory content',
            'Political propaganda or rallies',
          ]}
        />
        <p>You also agree not to: use bots, scrapers, or automated tools on the Platform; attempt to breach or interfere with our security or infrastructure; impersonate any person or organization; upload malware; or do anything that violates Indian law or the rights of others.</p>
      </Section>

      <Section num="9" id="content" title="Content Moderation & Takedown">
        <p>All event submissions are reviewed by FestNest before publication. We may approve, reject, edit, or request changes to any submission at our discretion, and we are not obliged to give reasons.</p>
        <p>Consistent with our obligations as an intermediary under the Information Technology Act, 2000 and the Intermediary Guidelines:</p>
        <List items={[
          'We will remove or disable access to content that we are required to act upon by a court order or by a competent government authority, within the timelines prescribed by law.',
          'If you believe a listing is unlawful, fraudulent, infringing, or otherwise violates these Terms, report it to support@festnest.in with details, and we will review and act expeditiously.',
          'We do not actively monitor every listing and are not liable for third-party content, but we will act once we have actual knowledge of a genuine violation.',
        ]} />
        <Callout type="legal" icon={Copyright} title="Reporting IP or unlawful content">
          For intellectual-property complaints or unlawful content, email legal@festnest.in with the listing details, your contact information, and the basis of your complaint. We respond promptly.
        </Callout>
      </Section>

      <Section num="10" id="ip" title="Intellectual Property">
        <p><strong className="text-text-1">Our IP.</strong> The FestNest name, logo, design, software, and database are our exclusive property, protected under the Copyright Act, 1957 and other Indian laws. You may not copy, modify, or commercially exploit them without our written permission.</p>
        <p><strong className="text-text-1">Your content.</strong> You keep ownership of everything you submit. By submitting, you grant FestNest a non-exclusive, royalty-free, worldwide licence to host, display, and distribute that content <em>within the Platform</em> solely to operate the service. This licence ends when you delete the content or your account, subject to legal retention requirements.</p>
      </Section>

      <Section num="11" id="disclaimer" title="Disclaimers">
        <Callout type="legal" icon={FileText} title='Provided "as is"'>
          The Platform is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis, without warranties of any kind, whether express or implied. To the fullest extent permitted by law, FestNest disclaims all warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.
        </Callout>
        <p>FestNest does not warrant that the Platform will be uninterrupted, secure, or error-free, that listings are accurate or genuine, or that any event will take place as described. Any reliance you place on a listing is at your own risk.</p>
      </Section>

      <Section num="12" id="liability" title="Limitation of Liability">
        <p>To the maximum extent permitted under Indian law, FestNest and its founders, directors, employees, and affiliates shall <strong>not</strong> be liable for:</p>
        <List items={[
          'Any indirect, incidental, special, punitive, or consequential loss or damage.',
          'Loss of data, revenue, opportunity, or goodwill.',
          'The acts, omissions, conduct, cancellations, fraud, or failures of any Organizer or attendee.',
          'Any event being cancelled, postponed, changed, unsafe, fraudulent, or not occurring.',
          'Failure of any Organizer to deliver prizes, refunds, certificates, or other promised benefits.',
          'Any loss, injury, or damage suffered at, during, travelling to, or in connection with any event.',
          'Content submitted by users, or failures of third-party services (Cloudinary, email providers, hosting, etc.).',
          'Unauthorized access to your account caused by your failure to keep credentials secure.',
        ]} />
        <Callout type="danger" icon={Calculator} title="Liability cap">
          If, despite the above, FestNest is found liable for any claim, our total aggregate liability to you for all claims combined shall not exceed <strong>₹1,000 (Indian Rupees One Thousand)</strong>, or the total amount (if any) you paid directly to FestNest in the three months before the claim — whichever is lower. FestNest does not currently charge students or organizers to use the Platform, so this amount will typically be nil.
        </Callout>
        <p className="text-[13px] text-text-3">Nothing in these Terms excludes liability that cannot be excluded under applicable Indian law, including your rights under the Consumer Protection Act, 2019.</p>
      </Section>

      <Section num="13" id="indemnity" title="Indemnification">
        <p>You agree to indemnify, defend, and hold harmless FestNest and its founders, directors, officers, employees, and agents from and against any claim, demand, loss, liability, cost, or expense (including reasonable legal fees) arising out of or relating to:</p>
        <List items={[
          'An event you organize, host, or list on the Platform, and anything that happens in connection with it.',
          'Your use of FestNest in breach of these Terms.',
          'Any content you submit, post, or transmit.',
          'Your violation of any law or the rights of any third party.',
          'Any misrepresentation made by you.',
        ]} />
        <p>This means if a claim is brought against FestNest because of your event or your conduct, you will cover our costs and losses.</p>
      </Section>

      <Section num="14" id="availability" title="Platform Availability & Changes">
        <List items={[
          'We may take the Platform offline for maintenance, upgrades, or emergency fixes, with or without notice.',
          'We may add, modify, suspend, or remove features at any time.',
          'We are not responsible for any loss resulting from downtime, planned or unplanned.',
          'We will make reasonable efforts to announce significant planned maintenance in advance.',
        ]} />
      </Section>

      <Section num="15" id="termination" title="Suspension & Termination">
        <p><strong className="text-text-1">By you.</strong> You may close your account anytime by emailing support@festnest.in. We process closures and associated data deletion as described in our Privacy Policy.</p>
        <p><strong className="text-text-1">By us.</strong> We may suspend or terminate your account — with or without notice — if we reasonably believe you have breached these Terms, posted fraudulent or unlawful content, behaved abusively, or put the Platform or its users at risk.</p>
        <Callout type="legal" icon={DoorOpen} title="What survives termination">
          Provisions that by their nature should survive — including intellectual property, disclaimers, limitation of liability, indemnification, and dispute resolution — continue to apply after your account ends.
        </Callout>
      </Section>

      <Section num="16" id="disputes" title="Disputes & Grievance Redressal">
        <p>We would rather resolve things amicably. Please contact us first at support@festnest.in and we will make a good-faith effort to resolve your concern within 30 days.</p>
        <p>If a dispute cannot be resolved informally, it shall be referred to binding arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be in India and the language shall be English.</p>
        <Callout type="info" icon={Gavel} title="Your statutory rights are protected">
          Nothing here limits your rights under the Consumer Protection Act, 2019, the Information Technology Act, 2000, or the Digital Personal Data Protection Act, 2023. You may always approach the appropriate consumer forum or authority.
        </Callout>
      </Section>

      <Section num="17" id="law" title="Governing Law & Jurisdiction">
        <p>These Terms are governed by and construed in accordance with the laws of India, including the Indian Contract Act 1872, the Information Technology Act 2000, the Digital Personal Data Protection Act 2023, the Consumer Protection Act 2019, and the Copyright Act 1957.</p>
        <p>Subject to the arbitration clause above, the courts of India shall have exclusive jurisdiction over any matter arising out of these Terms.</p>
      </Section>

      <Section num="18" id="updates" title="Changes to These Terms">
        <List items={[
          'The "Effective" and "Updated" dates at the top reflect the current version.',
          'For material changes affecting your rights, we will notify you by email at least 14 days before they take effect.',
          'For minor changes, we will update this page and notify you on your next login.',
          'Continued use after changes take effect means you accept the updated Terms. If you disagree, you may close your account before the effective date.',
        ]} />
      </Section>

      <Section num="19" id="contact" title="Contact Us">
        <div className="grid sm:grid-cols-3 gap-3 my-4">
          <ContactCard icon={MessageCircle} title="General Support" email="support@festnest.in" desc="Accounts, listings, and platform help." />
          <ContactCard icon={Scale} title="Legal & IP" email="legal@festnest.in" desc="IP claims, legal notices, takedowns." />
          <ContactCard icon={Inbox} title="Grievance Officer" email="grievance@festnest.in" desc="Formal complaints — acknowledged within 48 hours." />
        </div>
      </Section>

    </LegalLayout>
  );
}
