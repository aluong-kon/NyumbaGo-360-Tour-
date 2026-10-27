import React from 'react';
import {
  Video,
  CheckCircle,
  MapPin,
  Bed,
  Bath,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Listing, Language, PartnerSettings } from '../types';
import { translations } from '../lib/i18n';
import { formatKsh } from '../lib/validation';

interface ListingCardProps {
  listing: Listing;
  userBudgetKsh: number;
  lang: Language;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onSelectListing: (listing: Listing, openTourImmediately?: boolean) => void;
  partnerSettings: PartnerSettings;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  userBudgetKsh,
  lang,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onSelectListing,
  partnerSettings,
}) => {
  const t = translations[lang];

  // Budget calculations
  const budgetDiff = userBudgetKsh - listing.rent_ksh;
  const isWithinBudget = budgetDiff >= 0;
  const hasActiveTour = Boolean(listing.tour_url && !listing.is_tour_disabled);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-700 transition duration-300 flex flex-col group">
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={listing.photos[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Viewora 360° Tour Badge */}
            {hasActiveTour && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-lg backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                {t.tourBadge}
              </span>
            )}

            {/* Verified Listing Badge */}
            {listing.is_verified_listing && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/85 text-emerald-300 border border-emerald-600 backdrop-blur">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {listing.tour_verified ? 'Verified with Tour' : t.verifiedListing}
              </span>
            )}

            {/* Phase 3 Co-Branded Viewora Badge (if enabled) */}
            {partnerSettings.partner_branding_enabled && hasActiveTour && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-900 text-cyan-100 border border-cyan-500">
                {t.partnerBrandingBadge}
              </span>
            )}
          </div>

          {/* Action buttons: Save & Compare */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleCompare(listing.id)}
              className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur transition ${
                isCompared
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Add to side-by-side comparison"
            >
              {isCompared ? 'Comparing' : '+ Compare'}
            </button>
            <button
              onClick={() => onToggleSave(listing.id)}
              className={`p-2 rounded-full backdrop-blur transition ${
                isSaved
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-rose-400 hover:bg-slate-900'
              }`}
              aria-label="Save listing"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay: Price & Budget Status */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {formatKsh(listing.rent_ksh)}
              <span className="text-xs font-normal text-slate-300 ml-1">{t.perMonth}</span>
            </div>
            <div className="text-[11px] text-slate-300 drop-shadow">
              {t.deposit}: {formatKsh(listing.deposit_ksh)}
            </div>
          </div>

          {/* Budget Match Badge */}
          <div className="text-right">
            {isWithinBudget ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/90 text-slate-950 backdrop-blur shadow">
                <CheckCircle className="w-3 h-3 text-slate-950" />
                {budgetDiff === 0 ? 'Exact Match' : `${t.underBudget} ${formatKsh(budgetDiff)}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/90 text-slate-950 backdrop-blur shadow">
                +{formatKsh(Math.abs(budgetDiff))} over budget
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {listing.neighborhood}, {listing.city}
            </span>
          </div>

          <h3
            onClick={() => onSelectListing(listing)}
            className="text-base font-bold text-white group-hover:text-emerald-400 transition cursor-pointer line-clamp-1"
          >
            {lang === 'sw' && listing.title_sw ? listing.title_sw : listing.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {lang === 'sw' && listing.description_sw ? listing.description_sw : listing.description}
          </p>

          {/* Key Specs */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-300 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>
                {listing.bedrooms === 0 ? 'Bedsitter' : `${listing.bedrooms} Beds`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{listing.bathrooms} Baths</span>
            </div>
            <div className="text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
                {listing.property_type}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 flex items-center gap-2">
          {hasActiveTour ? (
            <button
              onClick={() => onSelectListing(listing, true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/80 transition"
            >
              <Video className="w-4 h-4 text-white animate-pulse" />
              <span>{t.takeTourBtn}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectListing(listing, false)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
            >
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onSelectListing(listing, false)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={t.viewDetails}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
