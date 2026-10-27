import React from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../lib/i18n';

interface PrivacyModalProps {
  onClose: () => void;
  lang: Language;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose, lang }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">
              {t.kdpaNotice}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-emerald-950/40 border border-emerald-700/60 p-3.5 rounded-2xl text-emerald-200">
            <strong>Kenya Data Protection Act, 2019 Compliance:</strong>
            <p className="mt-1">{t.kdpaDesc}</p>
          </div>

          <h4 className="text-sm font-bold text-white">360° Tour Telemetry Policy</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>
              <strong>No Media Storage:</strong> NyumbaGO stores only Viewora tour hyperlinks. We never capture, cache, or duplicate 360° photography assets.
            </li>
            <li>
              <strong>Minimal Telemetry:</strong> Tour metrics (e.g. <code>tour_started</code>, <code>viewing_requested_after_tour</code>) are tied to random session tokens or signed-in user IDs solely for conversion rate calculation.
            </li>
            <li>
              <strong>Rate Limiting & Safety:</strong> Strict IP/Session throttles prevent artificial telemetry inflation.
            </li>
            <li>
              <strong>Security Constraints:</strong> Viewora iframes run strictly within sandboxed contexts (<code>allow-scripts allow-same-origin allow-fullscreen</code>) with no access to surrounding user tokens.
            </li>
          </ul>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            For inquiries regarding Kenyan data privacy practices, contact privacy@nyumbago.co.ke.
          </p>
        </div>
      </div>
    </div>
  );
};
