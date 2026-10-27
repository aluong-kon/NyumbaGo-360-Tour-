import React from 'react';
import {
  Search,
  Filter,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  Video,
  Banknote,
  MapPin,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { FilterState, KenyanCity, Language } from '../types';
import { translations } from '../lib/i18n';
import { formatKsh } from '../lib/validation';

interface BudgetSearchProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  lang: Language;
}

export const BudgetSearch: React.FC<BudgetSearchProps> = ({
  filter,
  setFilter,
  totalMatches,
  lang,
}) => {
  const t = translations[lang];

  const BUDGET_PRESETS = [15000, 30000, 45000, 60000, 90000];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Title & Tagline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {t.budgetFirst}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Find Rentals in Kenya within Your Budget
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.tagline}
            </p>
          </div>

          {/* List vs Map Switch & Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-extrabold text-white text-sm">{totalMatches}</span> {t.listingsFound}
            </span>

            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setFilter((prev) => ({ ...prev, view_mode: 'list' }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter.view_mode === 'list'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                {t.listView}
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, view_mode: 'map' }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter.view_mode === 'map'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                {t.mapView}
              </button>
            </div>
          </div>
        </div>

        {/* Primary Budget Filter Box */}
        <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Monthly Budget Slider & Input */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  {t.monthlyBudget}
                </label>
                <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                  {formatKsh(filter.budget_ksh)} / mo
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={120000}
                step={2500}
                value={filter.budget_ksh}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, budget_ksh: Number(e.target.value) }))
                }
                className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BUDGET_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFilter((prev) => ({ ...prev, budget_ksh: amount }))}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition ${
                      filter.budget_ksh === amount
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    KSh {amount / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                City / Mji
              </label>
              <select
                value={filter.city}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, city: e.target.value as KenyanCity | 'All' }))
                }
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="All">{t.allCities}</option>
                <option value="Nairobi">{t.nairobi}</option>
                <option value="Mombasa">{t.mombasa}</option>
                <option value="Kisumu">{t.kisumu}</option>
                <option value="Nakuru">{t.nakuru}</option>
                <option value="Eldoret">{t.eldoret}</option>
              </select>
            </div>

            {/* Bedrooms Selection */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                Bedrooms
              </label>
              <select
                value={filter.bedrooms}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((prev) => ({
                    ...prev,
                    bedrooms: val === 'all' ? 'all' : Number(val),
                  }));
                }}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">{t.allBedrooms}</option>
                <option value="0">{t.bedsitter}</option>
                <option value="1">{t.bed1}</option>
                <option value="2">{t.bed2}</option>
                <option value="3">{t.bed3Plus}</option>
              </select>
            </div>

            {/* Has 360° Tour Toggle (KEY FEATURE) */}
            <div className="md:col-span-2 flex flex-col justify-end">
              <button
                type="button"
                onClick={() =>
                  setFilter((prev) => ({ ...prev, has_tour_only: !prev.has_tour_only }))
                }
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  filter.has_tour_only
                    ? 'bg-gradient-to-r from-cyan-950 to-emerald-950 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Video
                    className={`w-4 h-4 ${
                      filter.has_tour_only ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
                    }`}
                  />
                  <span>{t.hasTourFilter}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                    filter.has_tour_only
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {filter.has_tour_only && '✓'}
                </div>
              </button>
            </div>
          </div>

          {/* Neighborhood search keyword & sort bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search neighborhood (e.g. Westlands, Nyali, Kilimani)..."
                value={filter.neighborhood}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, neighborhood: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 text-xs rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-slate-400">Sort by:</span>
              <select
                value={filter.sort_by}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, sort_by: e.target.value as any }))
                }
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                <option value="budget_fit">Budget Fit (Verified Tours First)</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
