import React, { useState } from 'react';
import { X, Copy, CheckCircle, Database, CheckSquare, Terminal, FileCode } from 'lucide-react';

interface DevDocsModalProps {
  onClose: () => void;
}

const MIGRATION_SQL = `-- NyumbaGO Viewora 360 Integration Migration (20261027000000_viewora_integration.sql)
ALTER TABLE IF EXISTS public.listings
  ADD COLUMN IF NOT EXISTS tour_url TEXT,
  ADD COLUMN IF NOT EXISTS tour_provider TEXT NOT NULL DEFAULT 'viewora',
  ADD COLUMN IF NOT EXISTS tour_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tour_added_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tour_poster_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified_listing BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.listings
  ADD CONSTRAINT check_viewora_tour_url
  CHECK (
    tour_url IS NULL OR (
      tour_url ~* '^https:\\/\\/([a-zA-Z0-9\\-]+\\.)*viewora\\.software(\\/.*)?$'
    )
  );

CREATE TABLE IF NOT EXISTS public.tour_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  user_id TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('tour_started', 'tour_opened_new_tab', 'tour_fallback_shown', 'viewing_requested_after_tour')
  ),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.capture_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  area TEXT NOT NULL,
  property_type TEXT NOT NULL,
  preferred_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'clicked' CHECK (status IN ('clicked', 'booked', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.partner_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  partner_discount_enabled BOOLEAN NOT NULL DEFAULT true,
  partner_discount_code TEXT NOT NULL DEFAULT 'NYUMBAGO20',
  partner_discount_percentage INT NOT NULL DEFAULT 15,
  partner_branding_enabled BOOLEAN NOT NULL DEFAULT false,
  viewora_api_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);`;

export const DevDocsModal: React.FC<DevDocsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'checklist' | 'supabase'>('sql');
  const [copied, setCopied] = useState(false);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'valid-link': true,
    'invalid-host': true,
    'empty-field': true,
    'slow-load': true,
    'mobile-view': true,
    'tour-filter': true,
    'viewing-request': true,
    'bulk-upload': true,
    'broken-link': true,
    'swahili-labels': true,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Viewora Integration Deliverables & Specs
              </h3>
              <p className="text-xs text-slate-400">
                Migration SQL, verification checklists, and Supabase execution instructions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>1. Migration SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>2. Test Checklist (10 Items)</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Supabase Dashboard Steps</span>
          </button>
        </div>

        {/* Tab 1: Migration SQL */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                File located at: <code className="text-cyan-400">supabase/migrations/20261027000000_viewora_integration.sql</code>
              </span>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'SQL Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
              {MIGRATION_SQL}
            </pre>
          </div>
        )}

        {/* Tab 2: Test Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Complete test verification checklist across Phase 1, Phase 2, and Phase 3:
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'valid-link', label: '1. Valid link test: Pasting https://app.viewora.software/... renders green check and live preview.' },
                { id: 'invalid-host', label: '2. Invalid host test: Non-viewora links (e.g. youtube.com or http://) are rejected with plain language error.' },
                { id: 'empty-field', label: '3. Empty field test: Listings without tour_url save and publish seamlessly without error.' },
                { id: 'slow-load', label: '4. Slow load fallback: 8-second timer triggers "Open tour in a new tab" option.' },
                { id: 'mobile-view', label: '5. Mobile responsive view: 16:9 ratio, full-width embed, touch controls.' },
                { id: 'tour-filter', label: '6. Tour filter: "Has 360° tour" toggle correctly updates list and map pins alongside budget.' },
                { id: 'viewing-request', label: '7. Viewing request after tour: Sticky CTA inside tour logs telemetry and marks "Toured online" in landlord inbox.' },
                { id: 'bulk-upload', label: '8. Bulk upload: Agent batch tool parses multiple rows and identifies invalid lines.' },
                { id: 'broken-link', label: '9. Broken link check: Scheduled weekly scan pings tour links and queues broken items.' },
                { id: 'swahili-labels', label: '10. Swahili labels: Language switch toggles all new tour and Kenya rental copy.' },
              ].map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedItems[item.id])}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span className={checkedItems[item.id] ? 'text-white font-medium' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Supabase Dashboard Steps */}
        {activeTab === 'supabase' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h4 className="text-sm font-bold text-white">
              Manual Steps in the Supabase Dashboard
            </h4>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Run Migration SQL in SQL Editor:</strong> Go to your Supabase Project &gt; <em>SQL Editor</em>. Click <em>New Query</em>, paste the contents of <code className="text-cyan-400">supabase/migrations/20261027000000_viewora_integration.sql</code>, and click <strong>Run</strong>.
              </li>
              <li>
                <strong>Verify Table Columns:</strong> Navigate to <em>Table Editor &gt; listings</em> and verify that <code className="text-emerald-400">tour_url</code>, <code className="text-emerald-400">tour_provider</code>, <code className="text-emerald-400">tour_verified</code>, and <code className="text-emerald-400">tour_poster_url</code> are present.
              </li>
              <li>
                <strong>Check Table tour_events & capture_referrals:</strong> Confirm both tables are created with default RLS policies enabled.
              </li>
              <li>
                <strong>Deploy Edge Functions (Optional for scheduled scan):</strong> In your terminal with Supabase CLI, run:
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 mt-1">
                  supabase functions deploy check-broken-tours<br />
                  supabase functions deploy validate-tour-url
                </div>
              </li>
              <li>
                <strong>Configure Cron Schedule:</strong> In Supabase &gt; <em>Database &gt; Cron (pg_cron)</em> or GitHub Actions, configure a weekly cron to ping <code className="text-cyan-400">check-broken-tours</code> every Monday at 00:00 UTC.
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
