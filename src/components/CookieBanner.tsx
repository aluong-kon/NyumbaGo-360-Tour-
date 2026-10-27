import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, Sliders, Info } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../lib/i18n';
import { NyumbaGoService } from '../lib/supabase';

interface CookieBannerProps {
  lang: Language;
  onOpenPolicy: (docId: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ lang, onOpenPolicy }) => {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const prefs = NyumbaGoService.getCookiePreferences();
    if (!prefs.decided) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    await NyumbaGoService.saveCookiePreferences(true);
    setVisible(false);
  };

  const handleRejectNonEssential = async () => {
    await NyumbaGoService.saveCookiePreferences(false);
    setVisible(false);
  };

  const handleSavePreferences = async () => {
    await NyumbaGoService.saveCookiePreferences(analyticsEnabled);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-8 lg:max-w-xl z-50 bg-slate-900 border-2 border-cyan-500/80 rounded-3xl p-5 shadow-2xl backdrop-blur-lg animate-slideUp text-slate-100 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">
              Cookie & Tracking Preferences (KDPA 2019)
            </h4>
            <p className="text-[11px] text-slate-400">
              We respect your right to privacy under the Kenya Data Protection Act.
            </p>
          </div>
        </div>

        <button
          onClick={handleRejectNonEssential}
          className="text-slate-400 hover:text-white p-1"
          title="Dismiss and reject non-essential cookies"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        NyumbaGO uses strictly necessary cookies for authentication and security. Non-essential analytics and 360° tour performance metrics are only activated with your explicit permission.{' '}
        <button
          onClick={() => onOpenPolicy('cookie-policy')}
          className="text-cyan-400 hover:underline font-semibold"
        >
          Read Cookie Policy
        </button>
        .
      </p>

      {/* Granular Management Drawer */}
      {showManage && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="font-bold text-white block">Strictly Necessary Cookies</span>
              <span className="text-[11px] text-slate-400">Required for session security and adult age gate verification.</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">
              Always Active
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="font-bold text-white block">Analytics & 360° Tour Telemetry</span>
              <span className="text-[11px] text-slate-400">Measures tour loading speed and device responsiveness.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons: Accept All, Reject Non-Essential, Manage Choices */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={handleAcceptAll}
          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow"
        >
          Accept All
        </button>

        <button
          onClick={handleRejectNonEssential}
          className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
        >
          Reject Non-Essential
        </button>

        <button
          onClick={() => {
            if (showManage) {
              handleSavePreferences();
            } else {
              setShowManage(true);
            }
          }}
          className="py-2.5 px-3 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showManage ? 'Save Preferences' : 'Manage Choices'}</span>
        </button>
      </div>
    </aside>
  );
};
