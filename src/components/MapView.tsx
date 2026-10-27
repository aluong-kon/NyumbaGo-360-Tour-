import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, MapPin, Navigation, Video } from 'lucide-react';
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

declare global { interface Window { google?: any; } }

let mapsLoader: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.dataset.nyumbagoGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&region=KE`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load. Check the key, enabled API, billing and website restrictions.'));
    document.head.appendChild(script);
  });
  return mapsLoader;
}
const KENYA_CENTER = { lat: -0.0236, lng: 37.9062 };
const validCoordinates = (listing: Listing) => {
  const p = listing.location_coordinates;
  return Boolean(p && Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
    p.lat >= -5.2 && p.lat <= 5.5 && p.lng >= 33.5 && p.lng <= 42.5 &&
    !(p.lat === 0 && p.lng === 0));
};
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

export const MapView: React.FC<MapViewProps> = ({ listings, userBudgetKsh, lang, onSelectListing }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const infoWindow = useRef<any>(null);
  const [selected, setSelected] = useState<Listing | null>(listings[0] || null);
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const t = translations[lang];

  useEffect(() => {
    if (!apiKey) { setMapError('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your deployment environment.'); return; }
    let cancelled = false;
    loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !mapElement.current || !window.google?.maps) return;
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapElement.current, {
          center: KENYA_CENTER, zoom: 6, mapTypeControl: true, streetViewControl: false,
          fullscreenControl: true, clickableIcons: false, gestureHandling: 'greedy',
        });
        infoWindow.current = new window.google.maps.InfoWindow();
      }
      setMapReady(true);
    }).catch((error: unknown) => { if (!cancelled) setMapError(error instanceof Error ? error.message : 'Google Maps failed to load.'); });
    return () => { cancelled = true; };
  }, [apiKey]);

  useEffect(() => {
    if (!mapReady || !window.google?.maps || !mapInstance.current) return;
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    let visible = 0;
    listings.filter(validCoordinates).forEach((listing) => {
      const position = { lat: listing.location_coordinates.lat, lng: listing.location_coordinates.lng };
      const withinBudget = listing.rent_ksh <= userBudgetKsh;
      const hasTour = Boolean(listing.tour_url && !listing.is_tour_disabled);
      const marker = new window.google.maps.Marker({
        map: mapInstance.current, position, title: `${listing.title} · ${formatKsh(listing.rent_ksh)}/mo`,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: hasTour ? '#06b6d4' : withinBudget ? '#059669' : '#d97706', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2, scale: 8 },
        optimized: true,
      });
      marker.addListener('click', () => {
        setSelected(listing);
        infoWindow.current.setContent(`<div style="font-family:Arial,sans-serif;min-width:160px;color:#0f172a"><strong>${escapeHtml(listing.title)}</strong><br/><span>${escapeHtml(listing.neighborhood)}, ${escapeHtml(listing.city)}</span><br/><strong>${formatKsh(listing.rent_ksh)}/mo</strong></div>`);
        infoWindow.current.open({ anchor: marker, map: mapInstance.current });
      });
      markers.current.push(marker); bounds.extend(position); visible += 1;
    });
    if (visible > 0) { mapInstance.current.fitBounds(bounds); if (visible === 1) mapInstance.current.setZoom(13); }
    else { mapInstance.current.setCenter(KENYA_CENTER); mapInstance.current.setZoom(6); }
    return () => markers.current.forEach((marker) => marker.setMap(null));
  }, [mapReady, listings, userBudgetKsh]);

  useEffect(() => {
    if (!selected && listings.length) setSelected(listings[0]);
    else if (selected && !listings.some((listing) => listing.id === selected.id)) setSelected(listings[0] || null);
  }, [listings, selected]);

  const directionsUrl = selected
    ? validCoordinates(selected)
      ? `https://www.google.com/maps/dir/?api=1&destination=${selected.location_coordinates.lat},${selected.location_coordinates.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.neighborhood}, ${selected.city}, Kenya`)}`
    : 'https://www.google.com/maps/search/?api=1&query=Kenya+rentals';

  return <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
      <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-emerald-400" /><span className="text-xs font-bold uppercase tracking-wider text-white">Google Maps · Kenya rentals</span><span className="text-xs text-slate-400">({listings.length} listings)</span></div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cyan-400" />360° tour</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Within budget</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />Over budget</span></div>
    </div>
    <div className="relative h-[420px] w-full bg-slate-950 sm:h-[540px]">
      <div ref={mapElement} aria-label="Interactive Google map of rental listings in Kenya" role="application" className="h-full w-full" />
      {mapError && <div role="status" className="absolute inset-0 flex items-center justify-center bg-slate-950/95 p-6"><div className="max-w-md rounded-2xl border border-amber-700/70 bg-slate-900 p-5 text-center"><MapPin className="mx-auto mb-2 h-8 w-8 text-amber-400" /><h3 className="font-bold text-white">Map setup required</h3><p className="mt-2 text-sm text-slate-300">{mapError}</p><p className="mt-2 text-xs text-slate-500">Enable Maps JavaScript API and billing in Google Cloud. Restrict this browser key to your production domain and localhost during development.</p><a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Configure Google Maps <ExternalLink className="h-3.5 w-3.5" /></a></div></div>}
      {selected && <div className="absolute bottom-3 left-3 right-3 z-10 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur sm:bottom-4 sm:left-auto sm:right-4 sm:w-96 sm:p-4"><div className="flex gap-3"><img src={selected.photos[0]} alt={selected.title} className="h-20 w-20 rounded-xl border border-slate-700 object-cover sm:h-24 sm:w-24" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3 text-emerald-400" /><span className="truncate">{selected.neighborhood}, {selected.city}</span></div><h4 className="mt-1 truncate text-sm font-bold text-white">{selected.title}</h4><div className="mt-1 text-base font-black text-emerald-400">{formatKsh(selected.rent_ksh)}<span className="ml-1 text-[11px] font-normal text-slate-400">/ mo</span></div>{selected.tour_url && !selected.is_tour_disabled && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300"><Video className="h-3 w-3" />Viewora 360° tour</span>}</div></div><div className="mt-3 flex gap-2 border-t border-slate-800 pt-3"><button onClick={() => onSelectListing(selected, Boolean(selected.tour_url && !selected.is_tour_disabled))} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">{selected.tour_url && !selected.is_tour_disabled ? <Video className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}{selected.tour_url && !selected.is_tour_disabled ? t.startTour : t.viewDetails}</button><a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"><Navigation className="h-3.5 w-3.5" />Directions</a></div></div>}
    </div>
    {listings.length > 0 && !listings.some(validCoordinates) && <p className="border-t border-amber-800/60 bg-amber-950/30 px-4 py-2 text-xs text-amber-200">These listings do not yet have valid latitude/longitude coordinates. Add verified coordinates to show accurate map pins.</p>}
  </div>;
};
