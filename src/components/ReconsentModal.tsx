import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, FileText, Globe, ArrowRight } from 'lucide-react';
import { LegalDocument, Language } from '../types';
import { NyumbaGoService } from '../lib/supabase';

interface ReconsentModalProps {
  document: LegalDocument;
  userId: string;
  lang: Language;
  onAccepted: () => void;
  onOpenFullDoc: (docId: string) => void;
}

export const ReconsentModal: React.FC<ReconsentModalProps> = ({
  document,
  userId,
  lang,
  onAccepted,
  onOpenFullDoc,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmReconsent = async () => {
    setLoading(true);
    await NyumbaGoService.grantReconsent(userId, document);
    setLoading(false);
    onAccepted();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              Mandatory Legal Update · Version {document.version}
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Important Updates to Our {document.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We have updated our <strong>{document.title}</strong> (Effective Date: {document.effective_date}) to maintain strict compliance with the Kenya Data Protection Act, 2019 and platform safety standards. You must review and re-accept these terms to continue using NyumbaGO.
        </p>

        {/* English & Swahili Summary Cards */}
        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Summary of Changes (English)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {document.summary_en}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Muhtasari wa Mabadiliko (Kiswahili)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {document.summary_sw}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => onOpenFullDoc(document.id)}
            className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read Full Document Text</span>
          </button>
          <span className="text-slate-500 text-[11px]">
            Governed by the Laws of Kenya
          </span>
        </div>

        {/* Unpre-ticked Re-acceptance Checkbox */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
            />
            <span className="text-xs text-white font-bold leading-normal">
              I have read, understood, and agree to the updated {document.title} (v{document.version}).
            </span>
          </label>
        </div>

        <div>
          <button
            type="button"
            onClick={handleConfirmReconsent}
            disabled={!accepted || loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs shadow-xl transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Recording Consent...' : 'Accept & Proceed to NyumbaGO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
