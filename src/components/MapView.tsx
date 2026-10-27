import React, { useState } from 'react';
import { MapPin, Video, CheckCircle, Navigation, Layers, Compass, ArrowRight } from 'lucide-react';
import { Listing, Language, PartnerSettings } from '../types';
import { translations } from '../lib/i18n';
import { formatKsh } from '../lib/validation';

interface MapViewProps {
  listings: Listing[];
  userBudgetKsh: number;
  lang: Language;
  onSelectListing: (listing: Listing, openTour?: boolean) => void;
  partnerSettings: PartnerSettings;
}

export const MapView: React.FC<MapViewProps> = ({
  listings,
  userBudgetKsh,
  lang,
  onSelectListing,
}) => {
  const [selectedPinListing, setSelectedPinListing] = useState<Listing | null>(
    listings[0] || null
  );
  const t = translations[lang];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Map Header Toolbar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Kenya Interactive Rental Map
          </span>
          <span className="text-xs text-slate-400">
            ({listings.length} properties displayed)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Has 360° Viewora Tour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Within Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Over Budget</span>
          </div>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative w-full h-[540px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-4 overflow-hidden select-none">
        {/* Subtle Map Graphic Background Grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Kenya Regional Hub Badges */}
        <div className="absolute top-8 left-12 text-slate-500 text-xs font-bold tracking-widest uppercase">
          Western Kenya / Kisumu Hub (Lake Victoria)
        </div>
        <div className="absolute top-1/2 left-1/3 text-slate-500 text-xs font-bold tracking-widest uppercase">
          Nairobi Metro / Central Hub
        </div>
        <div className="absolute bottom-10 right-16 text-slate-500 text-xs font-bold tracking-widest uppercase">
          Mombasa Coastal Hub (Indian Ocean)
        </div>

        {/* Compass Rose */}
        <div className="absolute top-4 right-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-700/60 text-slate-400 flex flex-col items-center shadow-lg">
          <Compass className="w-6 h-6 text-emerald-400" />
          <span className="text-[9px] font-black mt-0.5">KENYA</span>
        </div>

        {/* Map Pins for each Listing */}
        {listings.map((listing) => {
          const isSelected = selectedPinListing?.id === listing.id;
          const hasTour = Boolean(listing.tour_url && !listing.is_tour_disabled);
          const isWithin = listing.rent_ksh <= userBudgetKsh;

          return (
            <button
              key={listing.id}
              onClick={() => setSelectedPinListing(listing)}
              style={{
                left: `${listing.location_coordinates.x}%`,
                top: `${listing.location_coordinates.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 flex flex-col items-center focus:outline-none group ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115'
              }`}
            >
              {/* Pin Bubble */}
              <div
                className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-xl flex items-center gap-1 border transition ${
                  isSelected
                    ? 'bg-white text-slate-950 border-white ring-4 ring-cyan-500/50'
                    : hasTour
                    ? 'bg-slate-900 text-cyan-300 border-cyan-400 shadow-cyan-900/40'
                    : isWithin
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-amber-600 text-white border-amber-400'
                }`}
              >
                {hasTour && <Video className="w-3 h-3 text-cyan-400 animate-pulse" />}
                <span>{formatKsh(listing.rent_ksh)}</span>
              </div>

              {/* Pin Needle */}
              <div
                className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-0.5 ${
                  isSelected
                    ? 'border-t-white'
                    : hasTour
                    ? 'border-t-cyan-400'
                    : isWithin
                    ? 'border-t-emerald-600'
                    : 'border-t-amber-600'
                }`}
              />

              {/* Ping Ring for 360° Tour Properties */}
              {hasTour && (
                <span className="absolute -inset-1 rounded-xl bg-cyan-400 opacity-25 animate-ping pointer-events-none" />
              )}
            </button>
          );
        })}

        {/* Floating Selected Listing Card on Bottom */}
        {selectedPinListing && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur z-20 transition">
            <div className="flex gap-3">
              <img
                src={selectedPinListing.photos[0]}
                alt={selectedPinListing.title}
                className="w-24 h-24 object-cover rounded-xl border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">
                    {selectedPinListing.neighborhood}, {selectedPinListing.city}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-0.5">
                  {selectedPinListing.title}
                </h4>
                <div className="text-base font-black text-emerald-400 mt-1">
                  {formatKsh(selectedPinListing.rent_ksh)}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">/ mo</span>
                </div>

                {selectedPinListing.tour_url && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 mt-1">
                    <Video className="w-3 h-3 text-cyan-400" />
                    Viewora 360° Tour Available
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              {selectedPinListing.tour_url ? (
                <button
                  onClick={() => onSelectListing(selectedPinListing, true)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{t.startTour}</span>
                </button>
              ) : (
                <button
                  onClick={() => onSelectListing(selectedPinListing, false)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onSelectListing(selectedPinListing, false)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Full Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
