import { useNavigate } from 'react-router-dom';
import {
  IoDocumentTextOutline,
  IoChevronBackOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoHandLeftOutline,
  IoBanOutline,
  IoRefreshOutline,
  IoMailOutline,
} from 'react-icons/io5';

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

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          <IoChevronBackOutline size={18} />
        </button>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Terms of Use</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <IoDocumentTextOutline size={24} />
          </div>
          <h2 className="text-xl font-bold">Terms of Use</h2>
          <p className="text-sm text-white/80 mt-1">Last updated: June 2025</p>
          <p className="text-sm text-white/80 mt-3">
            By using SplitMate, you agree to these terms. Please read them carefully.
          </p>
        </div>

        <SectionCard icon={<IoHandLeftOutline size={16} />} title="Acceptance of Terms">
          <p>By accessing or using SplitMate, you confirm that you are at least 13 years of age and agree to be bound by these Terms of Use.</p>
          <p>If you are using SplitMate on behalf of an organisation, you represent that you have the authority to bind that organisation to these terms.</p>
        </SectionCard>

        <SectionCard icon={<IoShieldCheckmarkOutline size={16} />} title="Use of the Service">
          <p>SplitMate provides expense-splitting and financial tracking tools for personal, non-commercial use among roommates and groups.</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree not to share your account with others.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={<IoBanOutline size={16} />} title="Prohibited Activities">
          <p>You agree not to:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use the service for any unlawful purpose or in violation of any regulations.</li>
            <li>Attempt to gain unauthorised access to any part of the service.</li>
            <li>Transmit any harmful, offensive, or disruptive content.</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the service.</li>
            <li>Use automated tools to scrape or extract data from the service.</li>
          </ul>
        </SectionCard>

        <SectionCard icon={<IoAlertCircleOutline size={16} />} title="Disclaimer of Warranties">
          <p>SplitMate is provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
          <p>We do not warrant that the service will be uninterrupted, error-free, or completely secure. Financial calculations are provided for convenience only — always verify important figures independently.</p>
        </SectionCard>

        <SectionCard icon={<IoRefreshOutline size={16} />} title="Changes to Terms">
          <p>We may update these Terms of Use from time to time. We will notify you of significant changes by posting a notice in the app or sending an email.</p>
          <p>Your continued use of SplitMate after changes are posted constitutes your acceptance of the revised terms.</p>
        </SectionCard>

        <SectionCard icon={<IoMailOutline size={16} />} title="Contact Us">
          <p>If you have questions about these Terms of Use, please contact us at:</p>
          <a
            href="mailto:support@splitmate.app"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            support@splitmate.app
          </a>
        </SectionCard>

        <p className="text-xs text-slate-400 text-center pb-4">
          &copy; {new Date().getFullYear()} SplitMate. All rights reserved.
        </p>
      </div>
    </div>
  );
}
