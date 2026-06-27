import { useNavigate } from 'react-router-dom';
import {
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoShareSocialOutline,
  IoTrashOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoInformationCircleOutline,
  IoChevronBackOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoServerOutline,
} from 'react-icons/io5';
import { cn } from '../utils/helpers';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">
      {/* Hero */}
      <div className="bg-gradient-brand rounded-2xl p-6 text-white relative overflow-hidden shadow-glow">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-12 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <IoShieldCheckmarkOutline size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-sm opacity-75">SplitMate</p>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            We are committed to protecting your personal information and being transparent about what data we collect and how we use it.
          </p>
          <p className="text-xs opacity-60 mt-3">Last updated: June 24, 2025 · Effective from January 1, 2024</p>
        </div>
      </div>

      {/* Quick nav chips */}
      <div className="flex flex-wrap gap-2">
        {[
          'Data We Collect',
          'How We Use It',
          'Data Sharing',
          'UPI Payments',
          'Your Rights',
          'Security',
          'Contact Us',
        ].map((label) => (
          <span
            key={label}
            className="text-xs px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium border border-primary-100 dark:border-primary-800"
          >
            {label}
          </span>
        ))}
      </div>

      {/* 1. Introduction */}
      <SectionCard icon={<IoDocumentTextOutline size={16} />} title="1. Introduction">
        <p>
          SplitMate ("we", "our", or "us") is a roommate expense-splitting application designed to help people manage shared living costs fairly and transparently. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the SplitMate app.
        </p>
        <p>
          By using SplitMate, you agree to the practices described in this policy. If you do not agree, please discontinue use of the app.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-3 text-amber-700 dark:text-amber-400 text-xs">
          <strong>Note:</strong> SplitMate is currently a demo application. No real data is stored on external servers. All data resides locally in your browser session.
        </div>
      </SectionCard>

      {/* 2. Data We Collect */}
      <SectionCard icon={<IoPersonOutline size={16} />} title="2. Information We Collect">
        <p>We collect the following categories of information to provide our services:</p>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">a) Account Information</p>
            <ul className="space-y-1.5 ml-1">
              <Bullet>Mobile phone number (used for OTP-based login)</Bullet>
              <Bullet>Full name and display preferences</Bullet>
              <Bullet>Email address (optional, for account recovery)</Bullet>
              <Bullet>Profile avatar colour preference</Bullet>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">b) Financial Data</p>
            <ul className="space-y-1.5 ml-1">
              <Bullet>Expense amounts, titles, categories, and dates you enter</Bullet>
              <Bullet>Bill-split configurations (equal, percentage, or custom)</Bullet>
              <Bullet>Settlement records and payment history between roommates</Bullet>
              <Bullet>UPI ID (only if you choose to add one for payments)</Bullet>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">c) Room & Group Data</p>
            <ul className="space-y-1.5 ml-1">
              <Bullet>Room names, invite codes, and member lists</Bullet>
              <Bullet>Group spending summaries and analytics</Bullet>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">d) Device & Usage Data</p>
            <ul className="space-y-1.5 ml-1">
              <Bullet>App preferences such as dark/light mode setting</Bullet>
              <Bullet>Notification preference settings</Bullet>
              <Bullet>Device type and browser information (for compatibility)</Bullet>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* 3. How we use it */}
      <SectionCard icon={<IoEyeOutline size={16} />} title="3. How We Use Your Information">
        <p>Your information is used solely to operate and improve the SplitMate experience:</p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>Authenticate your identity via OTP-based mobile login</Bullet>
          <Bullet>Display your expenses, balances, and settlement history</Bullet>
          <Bullet>Calculate accurate bill splits across roommates</Bullet>
          <Bullet>Enable UPI-based peer-to-peer payments between members</Bullet>
          <Bullet>Send in-app notifications about new expenses or settlements</Bullet>
          <Bullet>Generate spending analytics, trends, and category breakdowns</Bullet>
          <Bullet>Persist your theme and notification preferences across sessions</Bullet>
          <Bullet>Improve app performance and fix bugs based on usage patterns</Bullet>
        </ul>
        <p>
          We do <strong className="text-slate-700 dark:text-slate-300">not</strong> use your data for advertising, profiling, or selling to third parties.
        </p>
      </SectionCard>

      {/* 4. Data Sharing */}
      <SectionCard icon={<IoShareSocialOutline size={16} />} title="4. Data Sharing & Disclosure">
        <p>
          We do not sell, rent, or trade your personal information. Data may be shared only in the following limited circumstances:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">With your roommates:</strong> Expense details, split amounts, and UPI IDs you add are visible to members of the same room by design — that is the core purpose of SplitMate.
          </Bullet>
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Service providers:</strong> We may use trusted third-party services (e.g. hosting, analytics) that process data on our behalf under strict confidentiality agreements.
          </Bullet>
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Legal requirements:</strong> We may disclose information if required by law, court order, or government authority.
          </Bullet>
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Safety:</strong> To protect the rights, property, or safety of SplitMate, our users, or the public.
          </Bullet>
        </ul>
      </SectionCard>

      {/* 5. UPI Payments */}
      <SectionCard icon={<IoPhonePortraitOutline size={16} />} title="5. UPI Payments & Third-Party Apps">
        <p>
          SplitMate allows you to initiate payments through UPI apps such as Google Pay, PhonePe, and Paytm. Please note the following:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>
            Tapping "Pay via UPI" opens the respective UPI app on your device — SplitMate does not process or store payment details.
          </Bullet>
          <Bullet>
            Your UPI ID is shared only with members inside your room to facilitate settlements. You can remove or change it at any time from Profile settings.
          </Bullet>
          <Bullet>
            All actual financial transactions are governed by the terms and privacy policies of the respective UPI payment app (Google Pay, PhonePe, Paytm, etc.).
          </Bullet>
          <Bullet>
            SplitMate is not a payment gateway and does not hold, transfer, or guarantee any funds.
          </Bullet>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-3 text-blue-700 dark:text-blue-400 text-xs">
          Always verify settlement amounts with your roommates before making UPI payments. SplitMate balance figures are based on the expenses entered by room members.
        </div>
      </SectionCard>

      {/* 6. Data Storage */}
      <SectionCard icon={<IoServerOutline size={16} />} title="6. Data Storage & Retention">
        <p>
          SplitMate stores your data as follows:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Local storage:</strong> Preferences (dark mode, notification settings) are stored in your browser's local storage and remain only on your device.
          </Bullet>
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Session data:</strong> Expense and settlement data is held in memory for the current session. In the demo version, this resets on page refresh.
          </Bullet>
          <Bullet>
            <strong className="text-slate-700 dark:text-slate-300">Account data:</strong> In a live production version, account data would be stored on secure, encrypted servers in India in compliance with the Information Technology Act, 2000.
          </Bullet>
        </ul>
        <p>
          We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently erased within 30 days.
        </p>
      </SectionCard>

      {/* 7. Security */}
      <SectionCard icon={<IoLockClosedOutline size={16} />} title="7. Data Security">
        <p>
          We implement industry-standard security measures to protect your information:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>OTP-based authentication — no passwords are stored</Bullet>
          <Bullet>End-to-end encrypted data transmission via HTTPS/TLS</Bullet>
          <Bullet>UPI IDs are never stored in plain text on shared surfaces</Bullet>
          <Bullet>Room access is code-controlled — only invited members can join</Bullet>
          <Bullet>Regular security audits and vulnerability assessments</Bullet>
          <Bullet>Automatic session expiry after periods of inactivity</Bullet>
        </ul>
        <p>
          While we take every precaution, no method of electronic storage or transmission is 100% secure. We encourage you to keep your phone and OTP codes confidential.
        </p>
      </SectionCard>

      {/* 8. Your Rights */}
      <SectionCard icon={<IoShieldCheckmarkOutline size={16} />} title="8. Your Rights">
        <p>
          Under applicable data protection laws (including India's Digital Personal Data Protection Act, 2023), you have the right to:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Access</strong> — request a copy of all personal data we hold about you</Bullet>
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Correction</strong> — update inaccurate or incomplete information via Profile settings</Bullet>
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Deletion</strong> — request permanent erasure of your account and associated data</Bullet>
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Portability</strong> — export your expense history as a CSV from the Reports page</Bullet>
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Withdrawal of consent</strong> — opt out of non-essential data collection at any time</Bullet>
          <Bullet><strong className="text-slate-700 dark:text-slate-300">Grievance redressal</strong> — raise a complaint with our designated Data Protection Officer</Bullet>
        </ul>
        <p>
          To exercise any of these rights, contact us at the email address below. We will respond within 30 days.
        </p>
      </SectionCard>

      {/* 9. Data Deletion */}
      <SectionCard icon={<IoTrashOutline size={16} />} title="9. Account & Data Deletion">
        <p>
          You may delete your SplitMate account at any time. Upon deletion:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>Your profile, UPI ID, and personal data are permanently removed within 30 days</Bullet>
          <Bullet>Expenses you added will show as "Deleted User" for remaining room members</Bullet>
          <Bullet>Settled payment records are retained in anonymised form for accounting integrity</Bullet>
          <Bullet>Local storage preferences are cleared immediately upon logout</Bullet>
        </ul>
        <p>
          To request account deletion, email us at <span className="text-primary-600 dark:text-primary-400 font-medium">privacy@splitmate.app</span> with the subject line "Account Deletion Request".
        </p>
      </SectionCard>

      {/* 10. Children */}
      <SectionCard icon={<IoInformationCircleOutline size={16} />} title="10. Children's Privacy">
        <p>
          SplitMate is intended for users aged <strong className="text-slate-700 dark:text-slate-300">18 years and above</strong>. We do not knowingly collect personal information from minors. If we become aware that a user under 18 has provided personal data, we will delete it promptly.
        </p>
        <p>
          If you believe a minor has created an account, please contact us at <span className="text-primary-600 dark:text-primary-400 font-medium">privacy@splitmate.app</span>.
        </p>
      </SectionCard>

      {/* 11. Policy updates */}
      <SectionCard icon={<IoDocumentTextOutline size={16} />} title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. When we do:
        </p>
        <ul className="space-y-1.5 ml-1">
          <Bullet>The "Last updated" date at the top of this page will be revised</Bullet>
          <Bullet>Significant changes will be communicated via in-app notification</Bullet>
          <Bullet>Continued use of SplitMate after updates constitutes acceptance of the revised policy</Bullet>
        </ul>
        <p>
          We encourage you to review this policy periodically.
        </p>
      </SectionCard>

      {/* 12. Contact */}
      <SectionCard icon={<IoMailOutline size={16} />} title="12. Contact & Grievances">
        <p>
          For any questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out:
        </p>
        <div className="mt-2 space-y-2">
          {[
            { label: 'General enquiries', value: 'hello@splitmate.app' },
            { label: 'Privacy & data requests', value: 'privacy@splitmate.app' },
            { label: 'Data Protection Officer', value: 'dpo@splitmate.app' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
              <a
                href={`mailto:${item.value}`}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {item.value}
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Registered address: SplitMate Technologies Pvt. Ltd., Bangalore, Karnataka, India — 560001
        </p>
      </SectionCard>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © 2025 SplitMate Technologies Pvt. Ltd. · All rights reserved
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
          Governed by the laws of India · Subject to jurisdiction of Bangalore courts
        </p>
      </div>
    </div>
  );
}
