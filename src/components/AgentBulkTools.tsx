import React, { useState } from 'react';
import { Briefcase, CheckCircle, AlertTriangle, Play, RefreshCw, FileText } from 'lucide-react';
import { Listing, Language } from '../types';
import { translations } from '../lib/i18n';
import { validateVieworaUrl } from '../lib/validation';
import { NyumbaGoService } from '../lib/supabase';

interface AgentBulkToolsProps {
  listings: Listing[];
  onRefreshListings: () => void;
  lang: Language;
}

interface BulkRowResult {
  rawLine: string;
  listingId: string;
  tourUrl: string;
  foundListingTitle?: string;
  isValid: boolean;
  errorMessage?: string;
}

export const AgentBulkTools: React.FC<AgentBulkToolsProps> = ({
  listings,
  onRefreshListings,
  lang,
}) => {
  const [inputText, setInputText] = useState(
    `listing-nbo-03, https://app.viewora.software/tours/roysambu-student-bedsitter\nlisting-nbo-04, https://viewora.software/tours/lavington-luxury-townhouse\ninvalid-sample, https://other-domain.com/bad-tour`
  );
  const [validatedRows, setValidatedRows] = useState<BulkRowResult[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const t = translations[lang];

  const handleValidate = () => {
    const lines = inputText.split('\n').map((l) => l.trim()).filter(Boolean);
    const results: BulkRowResult[] = [];

    for (const line of lines) {
      // Format can be "listing_id, tour_url" or "listing_id tour_url"
      const parts = line.split(/[,\t ]+/).map((p) => p.trim());
      if (parts.length < 2) {
        results.push({
          rawLine: line,
          listingId: parts[0] || '',
          tourUrl: '',
          isValid: false,
          errorMessage: 'Malformed row. Format must be: listing_id, tour_url',
        });
        continue;
      }

      const listingId = parts[0];
      const tourUrl = parts[1];

      // Check if listing exists in database
      const matchedListing = listings.find(
        (l) => l.id.toLowerCase() === listingId.toLowerCase() || l.title.toLowerCase().includes(listingId.toLowerCase())
      );

      // Validate URL
      const val = validateVieworaUrl(tourUrl);

      if (!matchedListing) {
        results.push({
          rawLine: line,
          listingId,
          tourUrl,
          isValid: false,
          errorMessage: `Listing ID "${listingId}" not found in NyumbaGO database.`,
        });
      } else if (!val.isValid) {
        results.push({
          rawLine: line,
          listingId: matchedListing.id,
          tourUrl,
          foundListingTitle: matchedListing.title,
          isValid: false,
          errorMessage: val.error,
        });
      } else {
        results.push({
          rawLine: line,
          listingId: matchedListing.id,
          tourUrl: val.cleanUrl!,
          foundListingTitle: matchedListing.title,
          isValid: true,
        });
      }
    }

    setValidatedRows(results);
    setHasValidated(true);
    setAppliedCount(null);
  };

  const handleApplyValidTours = () => {
    const validRows = validatedRows.filter((r) => r.isValid);
    let count = 0;

    for (const row of validRows) {
      const res = NyumbaGoService.updateListingTour(row.listingId, row.tourUrl);
      if (res.success) {
        count++;
      }
    }

    setAppliedCount(count);
    onRefreshListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {t.bulkToolsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.bulkSubtitle}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            {t.bulkInstructions}
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Tip: You can use existing listing IDs such as <code className="text-cyan-400">listing-nbo-03</code> or <code className="text-cyan-400">listing-nbo-04</code>.
          </p>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setHasValidated(false);
            }}
            className="w-full p-3 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="listing-nbo-03, https://app.viewora.software/tours/sample"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleValidate}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-700/60 font-bold text-xs flex items-center gap-2 transition"
          >
            <Play className="w-4 h-4" />
            <span>{t.validateBulk}</span>
          </button>

          {hasValidated && (
            <button
              onClick={handleApplyValidTours}
              disabled={validatedRows.filter((r) => r.isValid).length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 disabled:opacity-50 text-white font-black text-xs shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.commitBulk} ({validatedRows.filter((r) => r.isValid).length} Valid)</span>
            </button>
          )}
        </div>

        {/* Applied confirmation banner */}
        {appliedCount !== null && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Successfully updated {appliedCount} listings with verified Viewora 360° virtual tours!</span>
          </div>
        )}

        {/* Validation Results Table */}
        {hasValidated && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Validation Output ({validatedRows.length} rows parsed)
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Listing ID / Title</th>
                    <th className="p-3">Tour URL</th>
                    <th className="p-3">Validation Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {validatedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? 'bg-emerald-950/20' : 'bg-rose-950/20'}
                    >
                      <td className="p-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-700">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{row.listingId}</span>
                        {row.foundListingTitle && (
                          <span className="text-[11px] text-slate-400">
                            {row.foundListingTitle}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] max-w-xs truncate">
                        {row.tourUrl || '<empty>'}
                      </td>
                      <td className="p-3 text-[11px]">
                        {row.isValid ? (
                          <span className="text-emerald-400">Passes viewora.software host rule.</span>
                        ) : (
                          <span className="text-rose-400">{row.errorMessage}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
