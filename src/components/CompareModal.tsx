import React from 'react';
import { X, CheckCircle, Video, Trash2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Listing, Language } from '../types';
import { translations } from '../lib/i18n';
import { formatKsh } from '../lib/validation';

interface CompareModalProps {
  listings: Listing[];
  userBudgetKsh: number;
  onClose: () => void;
  lang: Language;
  onRemoveFromCompare: (id: string) => void;
  onSelectListing: (listing: Listing, openTour?: boolean) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  listings,
  userBudgetKsh,
  onClose,
  lang,
  onRemoveFromCompare,
  onSelectListing,
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">{t.compareUpTo}</h3>
            <p className="text-xs text-slate-400">
              Evaluate price, location, budget match %, and 360° tour availability side-by-side.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No properties selected for comparison yet.</p>
            <p className="text-xs">Click "+ Compare" on any listing card to add up to 3 properties.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[640px]">
              {listings.map((item) => {
                const budgetDiff = userBudgetKsh - item.rent_ksh;
                const isWithin = budgetDiff >= 0;
                const hasTour = Boolean(item.tour_url && !item.is_tour_disabled);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow"
                  >
                    <div className="space-y-3">
                      {/* Photo & Remove */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950">
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveFromCompare(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Neighborhood */}
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>
                            {item.neighborhood}, {item.city}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5">
                          {item.title}
                        </h4>
                      </div>

                      {/* Price & Deposit */}
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Monthly Rent
                        </span>
                        <div className="text-lg font-black text-emerald-400">
                          {formatKsh(item.rent_ksh)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Deposit: {formatKsh(item.deposit_ksh)}
                        </div>
                      </div>

                      {/* Budget Match Status */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Budget Alignment (vs {formatKsh(userBudgetKsh)})
                        </span>
                        <div>
                          {isWithin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              Within Budget ({formatKsh(budgetDiff)} left)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              +{formatKsh(Math.abs(budgetDiff))} over budget
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Viewora Tour Status Badge */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          360° Tour Status
                        </span>
                        <div>
                          {hasTour ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-cyan-950 text-cyan-300 border border-cyan-500">
                              <Video className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                              Interactive 360° Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                              Photos Only (No Tour)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                        <div className="bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-500 block text-[10px]">Bedrooms</span>
                          <span className="font-bold">
                            {item.bedrooms === 0 ? 'Bedsitter' : `${item.bedrooms} Bed`}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-500 block text-[10px]">Bathrooms</span>
                          <span className="font-bold">{item.bathrooms} Bath</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2">
                      {hasTour ? (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectListing(item, true);
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Take 360° Tour</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectListing(item, false);
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <span>{t.viewDetails}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
