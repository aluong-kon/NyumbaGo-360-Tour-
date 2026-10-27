import React, { useState } from 'react';
import { X, Trash2, ShieldAlert, CheckCircle, Mail, Phone, Info } from 'lucide-react';
import { NyumbaGoService } from '../lib/supabase';

interface PublicAccountDeletionModalProps {
  onClose: () => void;
}

export const PublicAccountDeletionModal: React.FC<PublicAccountDeletionModalProps> = ({ onClose }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [reason, setReason] = useState('');
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmUnderstood) return;

    // Log public deletion request in data_requests queue
    NyumbaGoService.createDataRequest(
      'public_' + Math.random().toString(36).substring(2, 7),
      'deletion',
      `Public App Store deletion request for: ${emailOrPhone.trim()}. Reason: ${reason || 'User self-request'}`
    );

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-black text-white">
              Public Account & Data Deletion Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">
              Deletion Request Received
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              We have scheduled the account associated with <strong>{emailOrPhone}</strong> for permanent deletion under Section 40 of the Kenya Data Protection Act, 2019. Confirmation has been logged.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              As required by Google Play, Apple App Store, and the Kenya Data Protection Act, 2019, any registered user can request permanent deletion of their account without retaining active app access.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
              <span className="font-bold text-cyan-300 block flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                What happens to your data:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Your profile, contact details, saved homes, and active listings are permanently deleted.</li>
                <li>Fraud prevention logs, audit logs, and transaction dispute records are retained for statutory limitation periods (up to 3 years) before cryptographic shredding.</li>
                <li>The deletion process completes within 30 days of request.</li>
              </ul>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Registered Email Address or Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. yourname@example.com or 0712 345 678"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reason for Leaving (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Help us improve NyumbaGO..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={confirmUnderstood}
                onChange={(e) => setConfirmUnderstood(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-500 accent-rose-500"
              />
              <span className="text-[11px] text-slate-300">
                I understand this action is permanent and cannot be undone once processed.
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!confirmUnderstood}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow"
              >
                Submit Permanent Deletion Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
