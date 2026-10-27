import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  ExternalLink,
  Wifi,
  Calendar,
  Share2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Bed,
  Bath,
  Copy,
  MessageCircle,
  Phone,
  Bookmark,
  ShieldAlert,
  Loader2,
  Maximize2,
  Info,
  Flag,
  UserX,
  Lock,
  Shield,
} from 'lucide-react';
import { Listing, Language, PartnerSettings, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { formatKsh, isSafeVieworaIframe } from '../lib/validation';
import { NyumbaGoService } from '../lib/supabase';
import { ReportModal } from './ReportModal';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
  lang: Language;
  onOpenViewingRequest: (listing: Listing, touredOnline: boolean) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  partnerSettings: PartnerSettings;
  autoStartTour?: boolean;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  lang,
  onOpenViewingRequest,
  isSaved,
  onToggleSave,
  partnerSettings,
  autoStartTour = false,
}) => {
  const [tourStarted, setTourStarted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showSlowFallback, setShowSlowFallback] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reportedBroken, setReportedBroken] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<'listing' | 'tour' | 'user'>('listing');
  const [reportTargetTitle, setReportTargetTitle] = useState(listing.title);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const currentUser = NyumbaGoService.getCurrentUser();
  const phoneAccess = NyumbaGoService.canUserViewPhoneNumber(currentUser, listing);
  const isOwnerBlocked = currentUser ? NyumbaGoService.isUserBlocked(currentUser.id, listing.owner_id) : false;

  const handleBlockLandlord = () => {
    if (!currentUser) return;
    NyumbaGoService.blockUser(currentUser.id, listing.owner_id, `Blocked from listing ${listing.title}`);
    setBlockMessage('Landlord has been blocked. They will not receive your requests or messages.');
    setTimeout(() => setBlockMessage(null), 4000);
  };

  const tourSectionRef = useRef<HTMLDivElement>(null);
  const startTourBtnRef = useRef<HTMLButtonElement>(null);
  const t = translations[lang];

  const hasTour = Boolean(listing.tour_url && !listing.is_tour_disabled);
  const isSafeHost = isSafeVieworaIframe(listing.tour_url);

  // Jump to tour section if autoStartTour requested
  useEffect(() => {
    if (autoStartTour && hasTour && tourSectionRef.current) {
      tourSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoStartTour, hasTour]);

  // Handle Start 360 Tour tap
  const handleStartTour = () => {
    setTourStarted(true);
    NyumbaGoService.logTourEvent(listing.id, 'tour_started');

    // 8-second slow fallback timer
    const timer = setTimeout(() => {
      setShowSlowFallback(true);
      NyumbaGoService.logTourEvent(listing.id, 'tour_fallback_shown');
    }, 8000);

    return () => clearTimeout(timer);
  };

  const handleOpenInNewTab = () => {
    if (!listing.tour_url) return;
    NyumbaGoService.logTourEvent(listing.id, 'tour_opened_new_tab');
    window.open(listing.tour_url, '_blank', 'noopener,noreferrer');
  };

  const handleReportBroken = () => {
    NyumbaGoService.reportBrokenTour(listing.id);
    setReportedBroken(true);
  };

  const handleRequestViewingAfterTour = () => {
    NyumbaGoService.logTourEvent(listing.id, 'viewing_requested_after_tour');
    onOpenViewingRequest(listing, true);
  };

  // Share handlers
  const shareUrl = `${window.location.origin}?listing=${listing.id}&tour=1`;
  const shareMessage = `Check out this rental on NyumbaGO: ${listing.title} in ${listing.neighborhood}, Nairobi! Rent: ${formatKsh(listing.rent_ksh)}/mo. View the 360° virtual tour here: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareSms = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.location.href = smsUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100 my-auto">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {listing.title}
            </span>
            {hasTour && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500">
                <Video className="w-3 h-3 text-cyan-400" />
                360° Tour
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(listing.id)}
              className={`p-2 rounded-xl transition ${
                isSaved
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Save listing"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
              title={t.shareTour}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[85vh]">
          {/* Hero Action Jump Button */}
          {hasTour && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/90 to-cyan-950/90 border border-cyan-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-cyan-200">
                    Full 360° Viewora Virtual Tour Available
                  </h4>
                  <p className="text-xs text-slate-300">
                    Walk through the entire house, rooms and balconies online before scheduling a visit.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  tourSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  if (!tourStarted) handleStartTour();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Video className="w-4 h-4" />
                <span>Take the 360° Tour</span>
              </button>
            </div>
          )}

          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={listing.photos[activePhotoIndex]}
                alt={`${listing.title} view ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200">
                Photo {activePhotoIndex + 1} of {listing.photos.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-20 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Key Facts & Pricing Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Monthly Rent
              </span>
              <div className="text-xl font-black text-emerald-400">
                {formatKsh(listing.rent_ksh)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Security Deposit
              </span>
              <div className="text-base font-bold text-slate-200">
                {formatKsh(listing.deposit_ksh)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Bedrooms / Type
              </span>
              <div className="text-base font-bold text-slate-200">
                {listing.bedrooms === 0 ? 'Bedsitter' : `${listing.bedrooms} Bedroom`}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Location
              </span>
              <div className="text-base font-bold text-slate-200 truncate">
                {listing.neighborhood}, {listing.city}
              </div>
            </div>
          </div>

          {/* Description & Amenities */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">About this Property</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'sw' && listing.description_sw ? listing.description_sw : listing.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Included Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PHASE 1 & 2: 360° VIEWORA VIRTUAL TOUR SECTION */}
          {/* ========================================================================= */}
          <div
            ref={tourSectionRef}
            id="viewora-tour-section"
            className="pt-6 border-t border-slate-800 space-y-4 scroll-mt-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Viewora 360° Virtual Tour
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Interactive 360° Walkthrough
                  </h3>
                </div>
                {/* Low bandwidth note (Requirement: "Tours use more data. Best on WiFi.") */}
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{t.tourDisclaimer}</span>
                </div>
              </div>

              {/* Co-branded badge if Phase 3 active */}
              {partnerSettings.partner_branding_enabled && (
                <div className="text-xs font-bold text-cyan-400 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.partnerBrandingBadge}</span>
                </div>
              )}
            </div>

            {hasTour ? (
              <div className="space-y-4">
                {/* 360 Tour Viewer Container: 16:9 ratio, full width responsive */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-2xl">
                  {!tourStarted ? (
                    /* Still Photo Poster with "Start 360° Tour" Tap Button */
                    <div className="relative w-full h-full group">
                      <img
                        src={
                          listing.tour_poster_url ||
                          listing.photos[0] ||
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
                        }
                        alt="360° Virtual tour preview poster"
                        className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                        <button
                          ref={startTourBtnRef}
                          onClick={handleStartTour}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-cyan-500/40 flex items-center gap-3 transition transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-400"
                          aria-label="Start 360 virtual tour walkthrough"
                        >
                          <Video className="w-6 h-6 animate-pulse" />
                          <span>{t.startTour}</span>
                        </button>
                        <p className="text-xs text-slate-300 mt-3 font-medium">
                          Pan 360°, inspect ceilings, floors, room layouts and views.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Sandboxed Iframe (Embedded ONLY after tap, 16:9 ratio) */
                    <div className="relative w-full h-full bg-slate-950">
                      {!iframeLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-950/90 z-10 gap-3">
                          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                          <span className="text-xs font-semibold">{t.loadingTour}</span>
                        </div>
                      )}

                      {isSafeHost ? (
                        <iframe
                          src={listing.tour_url!}
                          title={`360 Virtual Tour for ${listing.title}`}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-fullscreen"
                          allow="fullscreen; gyroscope; accelerometer"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onLoad={() => setIframeLoaded(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-amber-400">
                          <ShieldAlert className="w-8 h-8 mb-2" />
                          <p className="text-sm font-bold">
                            Security check blocked this external link. Only links from viewora.software are embedded.
                          </p>
                        </div>
                      )}

                      {/* 8-second slow fallback banner */}
                      {showSlowFallback && (
                        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-cyan-500/60 p-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2 z-20 backdrop-blur">
                          <div className="flex items-center gap-2 text-xs text-slate-200">
                            <Info className="w-4 h-4 text-cyan-400" />
                            <span>{t.tourFallback}</span>
                          </div>
                          <button
                            onClick={handleOpenInNewTab}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{t.openInNewTab}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sticky Action Bar inside Tour Section (Phase 2 Requirement) */}
                <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white block">Done touring online?</span>
                    Take the next step to secure this house before someone else does.
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Sticky Button: Request an In-Person Viewing */}
                    <button
                      onClick={handleRequestViewingAfterTour}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t.requestViewingAfterTour}</span>
                    </button>

                    {/* Share this tour button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{t.shareTour}</span>
                    </button>

                    {/* Open in new tab helper */}
                    <button
                      onClick={handleOpenInNewTab}
                      className="p-2.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title={t.openInNewTab}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Accessibility Text Fallback & Report Broken Link */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                  <span>
                    {t.deviceFallback}{' '}
                    <button
                      onClick={handleOpenInNewTab}
                      className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-1 ml-1"
                    >
                      {t.openDirectly} <ExternalLink className="w-3 h-3" />
                    </button>
                  </span>

                  <button
                    onClick={handleReportBroken}
                    disabled={reportedBroken}
                    className="text-slate-400 hover:text-amber-400 transition"
                  >
                    {reportedBroken ? '✓ Reported to Admin' : t.reportBroken}
                  </button>
                </div>
              </div>
            ) : (
              /* If listing doesn't have a tour yet */
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                <Video className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  This listing does not have a 360° virtual tour yet.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Landlords can upload Viewora tour links from their dashboard or book a shoot from KES 5,000.
                </p>
              </div>
            )}
          </div>

          {/* Landlord Contact Card & Phone Protection (PART 6) */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            {blockMessage && (
              <div className="p-3 bg-amber-950/80 border border-amber-600 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{blockMessage}</span>
              </div>
            )}

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Listed by</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {listing.is_verified_listing ? 'Verified Partner' : 'Owner'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{listing.owner_name}</div>

                {/* Phone Number Protection (Part 6 Requirement) */}
                <div className="pt-1">
                  {phoneAccess.canView ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <a
                        href={`tel:${listing.owner_phone}`}
                        className="text-xs text-emerald-400 font-mono font-bold hover:underline"
                      >
                        {listing.owner_phone}
                      </a>
                      <span className="text-[10px] text-emerald-500 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Verified Contact
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-slate-400 font-mono tracking-wider">
                          {phoneAccess.maskedPhone}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-300/90 leading-tight">
                        Direct phone protected: Send viewing request to reveal landlord contact.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOpenViewingRequest(listing, tourStarted)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.requestViewingTitle}</span>
                </button>
              </div>
            </div>

            {/* Trust, Safety, Report & Block Action Strip */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 px-1 gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setReportTargetType('listing');
                    setReportTargetTitle(listing.title);
                    setReportModalOpen(true);
                  }}
                  className="hover:text-rose-400 transition flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Listing</span>
                </button>

                {hasTour && (
                  <button
                    onClick={() => {
                      setReportTargetType('tour');
                      setReportTargetTitle(`360° Tour on ${listing.title}`);
                      setReportModalOpen(true);
                    }}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Report 360° Tour</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleBlockLandlord}
                className="hover:text-rose-400 transition flex items-center gap-1 text-[11px]"
                title="Prevent messages and requests from this user"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{isOwnerBlocked ? 'Landlord Blocked' : 'Block Landlord'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Universal Safety Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          targetType={reportTargetType}
          targetId={listing.id}
          targetTitle={reportTargetTitle}
          onClose={() => setReportModalOpen(false)}
          lang={lang}
        />

        {/* Share Modal Dialog (Phase 2: WhatsApp, SMS, Copy Link - Points to NyumbaGO) */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  {t.shareTour}
                </h4>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Share this NyumbaGO listing with friends or housemates so they can take the 360° tour.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.shareViaWhatsapp}</span>
                </button>

                <button
                  onClick={handleShareSms}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.shareViaSms}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copySuccess ? t.linkCopied : t.copyShareLink}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg text-[10px] text-slate-400 font-mono truncate">
                {shareUrl}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
