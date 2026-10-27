import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  FileText,
  Upload,
  Link,
  Info,
  Scale,
} from 'lucide-react';
import { ReportReason, Language } from '../types';
import { NyumbaGoService } from '../lib/supabase';

interface ReportModalProps {
  targetType: 'listing' | 'tour' | 'user' | 'message';
  targetId: string;
  targetTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted?: (refNo: string) => void;
  lang?: Language;
}

const REPORT_REASONS: { id: ReportReason; label: string; desc: string }[] = [
  {
    id: 'scam',
    label: 'Scam or Fraud Suspicion',
    desc: 'Asking for rent or deposit before viewing, impersonation, or fake owner claims.',
  },
  {
    id: 'fake_unavailable',
    label: 'Fake or Unavailable Listing',
    desc: 'Property does not exist, was already leased, or photos do not match reality.',
  },
  {
    id: 'wrong_price',
    label: 'Wrong Price or Hidden Fees',
    desc: 'Advertised price differs from caretaker quote or undisclosed mandatory charges.',
  },
  {
    id: 'offensive',
    label: 'Offensive or Illegal Content',
    desc: 'Profanity, abusive conduct, illegal activity, or defamatory statements.',
  },
  {
    id: 'discrimination',
    label: 'Discrimination',
    desc: 'Exclusionary tenancy criteria based on tribe, religion, marital status, gender, or race.',
  },
  {
    id: 'under_18',
    label: 'Suspected Minor (Under 18)',
    desc: 'User or listing uploader appears to be a minor without legal capacity to contract.',
  },
  {
    id: 'other',
    label: 'Other Policy Violation',
    desc: 'Infringement of community rules, spam, copyright infringement, or broken tour links.',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  isOpen,
  onClose,
  onReportSubmitted,
  lang = 'en',
}) => {
  const [reason, setReason] = useState<ReportReason>('scam');
  const [details, setDetails] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [confirmedTruthful, setConfirmedTruthful] = useState(false);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = NyumbaGoService.getCurrentUser();
  const reporterId = currentUser ? currentUser.id : 'anon_reporter';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || details.trim().length < 15) {
      setError('Please provide at least 15 characters of specific details to help our safety team investigate.');
      return;
    }
    if (!confirmedTruthful) {
      setError('You must confirm that this report is submitted in good faith and is accurate.');
      return;
    }

    try {
      const rep = NyumbaGoService.createReport(
        reporterId,
        targetType,
        targetId,
        reason,
        details.trim(),
        screenshotUrl.trim() || undefined,
        targetTitle
      );

      setSubmittedRef(rep.reference_no);
      if (onReportSubmitted) {
        onReportSubmitted(rep.reference_no);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRef(null);
    setDetails('');
    setScreenshotUrl('');
    setConfirmedTruthful(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Report {targetType === 'listing' ? 'Listing' : targetType === 'tour' ? '360° Virtual Tour' : 'User'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                Target: <span className="text-slate-200 font-semibold">{targetTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRef ? (
          /* Confirmation Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Report Received</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Thank you for protecting the NyumbaGO community. Our Trust & Safety team reviews high-priority safety tickets within 24 hours.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-xs mx-auto space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Official Reference Number
              </span>
              <span className="font-mono text-base font-black text-cyan-400 tracking-wider">
                {submittedRef}
              </span>
              <span className="text-[10px] text-slate-400 block pt-1">
                Save this reference number for follow-up communications.
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Violation Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Violation Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {REPORT_REASONS.find((r) => r.id === reason)?.desc}
              </p>
            </div>

            {/* Specific Details */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Detailed Explanation
                </label>
                <span className="text-[11px] text-slate-400">
                  {details.length} chars (min 15)
                </span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Describe what occurred, quotes given, unauthorized fees demanded, or specific discrepancies..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Optional Screenshot / Evidence Link */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-slate-400" />
                <span>Evidence Screenshot / Link (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/screenshot.png or image link"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Upload image to Cloud storage or paste a link to M-Pesa transaction screenshot, chat transcript, etc.
              </span>
            </div>

            {/* Mandatory False Reporting Disclaimer */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex items-start gap-2 text-slate-300 text-xs">
                <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Notice:</strong> Submitting false, malicious, or retaliatory reports violates NyumbaGO Terms of Service and Kenyan consumer protection laws. All submissions are tied to your device hash and audit-logged.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedTruthful}
                  onChange={(e) => setConfirmedTruthful(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-500 focus:ring-rose-400 accent-rose-500 cursor-pointer"
                />
                <span className="text-xs text-slate-200 font-semibold select-none">
                  I confirm that this report is submitted in good faith and is accurate to the best of my knowledge.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!confirmedTruthful || details.trim().length < 15}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Submit Safety Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
