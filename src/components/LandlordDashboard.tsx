import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Video,
  CheckCircle,
  Clock,
  ExternalLink,
  Tag,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Sparkles,
  AlertCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
  Edit,
  X,
  FileCheck,
} from 'lucide-react';
import {
  Listing,
  Language,
  CaptureReferral,
  ViewingRequest,
  PartnerSettings,
  ReferralStatus,
} from '../types';
import { translations } from '../lib/i18n';
import { formatKsh, validateVieworaUrl } from '../lib/validation';
import { NyumbaGoService } from '../lib/supabase';

interface LandlordDashboardProps {
  listings: Listing[];
  onRefreshListings: () => void;
  lang: Language;
  partnerSettings: PartnerSettings;
  ownerId?: string;
  isAgent?: boolean;
}

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
  listings,
  onRefreshListings,
  lang,
  partnerSettings,
  ownerId = 'landlord-kimani',
  isAgent = false,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'referrals' | 'checklist'>('listings');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureTargetListing, setCaptureTargetListing] = useState<Listing | null>(null);
  const [discountCopied, setDiscountCopied] = useState(false);

  // Form state for Listing Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formRent, setFormRent] = useState(35000);
  const [formDeposit, setFormDeposit] = useState(35000);
  const [formBedrooms, setFormBedrooms] = useState(1);
  const [formBathrooms, setFormBathrooms] = useState(1);
  const [formCity, setFormCity] = useState<'Nairobi' | 'Mombasa' | 'Kisumu'>('Nairobi');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTourUrl, setFormTourUrl] = useState('');
  const [formTourValidationError, setFormTourValidationError] = useState<string | null>(null);
  const [formTourLivePreviewValid, setFormTourLivePreviewValid] = useState(false);

  // Capture referral form state
  const [refArea, setRefArea] = useState('');
  const [refPropType, setRefPropType] = useState('Apartment');
  const [refDate, setRefDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [refNotes, setRefNotes] = useState('');
  const [refCopiedNotice, setRefCopiedNotice] = useState(false);

  const t = translations[lang];

  // Filter listings for this landlord/agent
  const myListings = listings; // Show all or filtered
  const viewingRequests = NyumbaGoService.getViewingRequests(ownerId);
  const captureReferrals = NyumbaGoService.getCaptureReferrals(ownerId);
  const tourEvents = NyumbaGoService.getTourEvents();

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsCreating(false);
    setFormTitle(listing.title);
    setFormRent(listing.rent_ksh);
    setFormDeposit(listing.deposit_ksh);
    setFormBedrooms(listing.bedrooms);
    setFormBathrooms(listing.bathrooms);
    setFormCity(listing.city as any);
    setFormNeighborhood(listing.neighborhood);
    setFormDescription(listing.description);
    setFormTourUrl(listing.tour_url || '');

    if (listing.tour_url) {
      const val = validateVieworaUrl(listing.tour_url);
      setFormTourValidationError(val.isValid ? null : val.error || null);
      setFormTourLivePreviewValid(val.isValid);
    } else {
      setFormTourValidationError(null);
      setFormTourLivePreviewValid(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setIsCreating(true);
    setFormTitle('');
    setFormRent(30000);
    setFormDeposit(30000);
    setFormBedrooms(1);
    setFormBathrooms(1);
    setFormCity('Nairobi');
    setFormNeighborhood('Kilimani');
    setFormDescription('Spacious unit with modern amenities and scenic balcony view.');
    setFormTourUrl('');
    setFormTourValidationError(null);
    setFormTourLivePreviewValid(false);
  };

  // Live Tour URL validation
  const handleTourUrlChange = (value: string) => {
    setFormTourUrl(value);
    if (!value.trim()) {
      setFormTourValidationError(null);
      setFormTourLivePreviewValid(false);
      return;
    }

    const val = validateVieworaUrl(value);
    if (val.isValid) {
      setFormTourValidationError(null);
      setFormTourLivePreviewValid(true);
    } else {
      setFormTourValidationError(lang === 'sw' && val.error_sw ? val.error_sw : val.error!);
      setFormTourLivePreviewValid(false);
    }
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (formTourUrl.trim()) {
      const val = validateVieworaUrl(formTourUrl);
      if (!val.isValid) {
        setFormTourValidationError(lang === 'sw' && val.error_sw ? val.error_sw : val.error!);
        return;
      }
    }

    const baseListing: Listing = editingListing || {
      id: 'listing_' + Math.random().toString(36).substring(2, 9),
      title: formTitle,
      description: formDescription,
      rent_ksh: Number(formRent),
      deposit_ksh: Number(formDeposit),
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      property_type: 'Apartment',
      city: formCity,
      neighborhood: formNeighborhood,
      location_coordinates: { lat: -1.29, lng: 36.82, x: 48, y: 56 },
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: ['Water Backup', 'CCTV Security', 'High-Speed Internet', 'Parking'],
      owner_id: ownerId,
      owner_name: isAgent ? 'Prime Property Agent' : 'David Kimani (Landlord)',
      owner_phone: '+254 722 100 200',
      is_verified_listing: true,
      tour_url: formTourUrl.trim() || null,
      tour_provider: 'viewora',
      tour_verified: Boolean(formTourUrl.trim()),
      tour_added_at: formTourUrl.trim() ? new Date().toISOString() : null,
      tour_poster_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    };

    if (editingListing) {
      baseListing.title = formTitle;
      baseListing.rent_ksh = Number(formRent);
      baseListing.deposit_ksh = Number(formDeposit);
      baseListing.bedrooms = Number(formBedrooms);
      baseListing.bathrooms = Number(formBathrooms);
      baseListing.city = formCity;
      baseListing.neighborhood = formNeighborhood;
      baseListing.description = formDescription;
      baseListing.tour_url = formTourUrl.trim() || null;
      if (formTourUrl.trim()) {
        baseListing.tour_verified = baseListing.is_verified_listing;
        baseListing.tour_added_at = new Date().toISOString();
      } else {
        baseListing.tour_verified = false;
        baseListing.tour_added_at = null;
      }
    }

    NyumbaGoService.saveListing(baseListing);
    onRefreshListings();
    setEditingListing(null);
    setIsCreating(false);
  };

  // Open Capture Service Referral Modal
  const handleOpenCaptureModal = (listing: Listing) => {
    setCaptureTargetListing(listing);
    setRefArea(`${listing.city} - ${listing.neighborhood}`);
    setRefPropType(listing.property_type);
    setShowCaptureModal(true);
    setRefCopiedNotice(false);
  };

  const handleSubmitCaptureReferral = () => {
    if (!captureTargetListing) return;

    // 1. Save referral to table
    NyumbaGoService.createCaptureReferral({
      listing_id: captureTargetListing.id,
      listing_title: captureTargetListing.title,
      owner_id: ownerId,
      area: refArea,
      property_type: refPropType,
      preferred_date: refDate,
      notes: refNotes,
    });

    // 2. Format details and copy to clipboard
    const clipText = `NyumbaGO Viewora Shoot Booking:\nProperty: ${captureTargetListing.title}\nArea: ${refArea}\nType: ${refPropType}\nTarget Date: ${refDate}\nOwner Contact: +254 722 100 200\nNotes: ${refNotes || 'Standard 360 photography shoot'}`;
    navigator.clipboard.writeText(clipText);
    setRefCopiedNotice(true);

    // 3. Open Viewora capture service page in new tab
    setTimeout(() => {
      window.open(
        'https://viewora.software/360-photography-service-kenya',
        '_blank',
        'noopener,noreferrer'
      );
      setShowCaptureModal(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Welcome & Role Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              {isAgent ? 'Property Agent Portal' : 'Landlord Dashboard'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Manage Properties & 360° Viewora Tours
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Boost rental conversion, monitor online tours, and schedule shoots in Nairobi, Mombasa and Kisumu.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addListing}</span>
        </button>
      </div>

      {/* Phase 3 Partner Discount Banner (Visible when partner_discount_enabled is true) */}
      {partnerSettings.partner_discount_enabled && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 flex-shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                Official Viewora Partnership Benefit
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                {t.partnerDiscountBanner}
              </h3>
              <p className="text-xs text-slate-300">
                Save {partnerSettings.partner_discount_percentage}% on professional 360° camera shoots in Nairobi, Mombasa and Kisumu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/60 font-mono text-cyan-300 font-bold text-xs">
              {partnerSettings.partner_discount_code}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(partnerSettings.partner_discount_code);
                setDiscountCopied(true);
                setTimeout(() => setDiscountCopied(false), 2500);
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{discountCopied ? 'Copied!' : t.copyCode}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>My Listings ({myListings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Viewing Requests ({viewingRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'referrals'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-400" />
          <span>Capture Referrals ({captureReferrals.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'checklist'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Tour Readiness Checklists</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LISTINGS WITH PER-LISTING TOUR ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myListings.map((listing) => {
              // Calculate per-listing metrics
              const listingEvents = tourEvents.filter((e) => e.listing_id === listing.id);
              const tourStarts = listingEvents.filter((e) => e.event_type === 'tour_started').length;
              const viewingAfterTour = listingEvents.filter(
                (e) => e.event_type === 'viewing_requested_after_tour'
              ).length;
              const convRate = tourStarts > 0 ? ((viewingAfterTour / tourStarts) * 100).toFixed(1) : '0.0';
              const hasTour = Boolean(listing.tour_url);

              return (
                <div
                  key={listing.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {hasTour ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950/90 text-cyan-300 border border-cyan-400 flex items-center gap-1">
                            <Video className="w-3 h-3 text-cyan-400" />
                            360° Tour Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-700">
                            No Tour
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="text-xs text-slate-400">
                        {listing.neighborhood}, {listing.city} · {formatKsh(listing.rent_ksh)}/mo
                      </div>
                    </div>

                    {/* Per-Listing Analytics Box */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {t.tourStarts}
                        </span>
                        <div className="text-base font-extrabold text-cyan-400">
                          {tourStarts}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {t.tourToViewingRate}
                        </span>
                        <div className="text-base font-extrabold text-emerald-400">
                          {convRate}%
                        </div>
                      </div>
                    </div>

                    {/* 14-Day Freshness Status & 1-Tap Reconfirm (Part 6 Requirement) */}
                    {(() => {
                      const freshness = NyumbaGoService.getListingFreshness(listing);
                      return (
                        <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/90 flex items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock
                              className={`w-3.5 h-3.5 flex-shrink-0 ${
                                freshness.isStale
                                  ? 'text-rose-400'
                                  : freshness.day10ReminderTriggered
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            />
                            <span
                              className={`truncate font-semibold ${
                                freshness.isStale
                                  ? 'text-rose-400'
                                  : freshness.day10ReminderTriggered
                                  ? 'text-amber-300'
                                  : 'text-slate-300'
                              }`}
                            >
                              {freshness.isStale
                                ? 'Stale (Auto-Hidden)'
                                : `Available (${freshness.daysRemaining}d left)`}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              NyumbaGoService.reconfirmListingAvailability(listing.id);
                              onRefreshListings();
                            }}
                            className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold transition flex-shrink-0"
                            title="Reconfirm availability to reset 14-day freshness clock"
                          >
                            Reconfirm Available
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(listing)}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{hasTour ? 'Edit Tour / Info' : 'Add 360° Tour'}</span>
                    </button>

                    {!hasTour && (
                      <button
                        onClick={() => handleOpenCaptureModal(listing)}
                        className="py-2 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Book Viewora 360 photo shoot from KES 5,000"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Shoot (KES 5k)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIEWING REQUESTS INBOX (WITH 'TOURED ONLINE' BADGE) */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Viewing Requests Inbox</h3>
              <p className="text-xs text-slate-400">
                Prospects marked with "Toured Online" have verified intent and already walked through the 360° virtual tour.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-xl text-slate-300">
              {viewingRequests.length} total requests
            </span>
          </div>

          {viewingRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No viewing requests recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {viewingRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    req.toured_online
                      ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/50'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.hunter_name}</span>
                      <span className="text-xs text-emerald-400 font-mono">
                        {req.hunter_phone}
                      </span>
                      {req.toured_online && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">
                          <Video className="w-3 h-3 text-cyan-400" />
                          {t.touredOnlineBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300">
                      Property: <span className="text-white font-medium">{req.listing_title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Scheduled: {req.preferred_date} at {req.preferred_time}</span>
                      {req.notes && <span className="italic">"{req.notes}"</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${req.hunter_phone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      Call Tenant
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAPTURE REFERRALS TRACKER (PHASE 2 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'referrals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Viewora 360° Capture Service Bookings & Referrals
              </h3>
              <p className="text-xs text-slate-400">
                Track status of professional shoots booked in Nairobi, Mombasa and Kisumu.
              </p>
            </div>
          </div>

          {captureReferrals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No capture referrals initiated yet. Click "Shoot (KES 5k)" on any listing to schedule.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Property</th>
                    <th className="p-3">Area / City</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Preferred Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {captureReferrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{ref.listing_title}</td>
                      <td className="p-3">{ref.area}</td>
                      <td className="p-3">{ref.property_type}</td>
                      <td className="p-3">{ref.preferred_date || 'ASAP'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            ref.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : ref.status === 'booked'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                              : 'bg-amber-950 text-amber-400 border border-amber-700'
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={ref.status}
                          onChange={(e) => {
                            NyumbaGoService.updateCaptureReferralStatus(
                              ref.id,
                              e.target.value as ReferralStatus
                            );
                            onRefreshListings();
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                        >
                          <option value="clicked">Clicked / Inquired</option>
                          <option value="booked">Shoot Scheduled</option>
                          <option value="completed">Tour Live</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TOUR READINESS CHECKLISTS (PHASE 2 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">{t.tourChecklistTitle}</h3>
              <p className="text-xs text-slate-400">
                Complete all four milestones to unlock the prestigious "Verified Listing with 360° Tour" badge!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((listing) => {
                const step1Photos = listing.photos && listing.photos.length >= 2;
                const step2Price = listing.rent_ksh > 0;
                const step3Location = Boolean(listing.neighborhood && listing.city);
                const step4Tour = Boolean(listing.tour_url);

                const completedCount = [step1Photos, step2Price, step3Location, step4Tour].filter(
                  Boolean
                ).length;
                const isFullyComplete = completedCount === 4;

                return (
                  <div
                    key={listing.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isFullyComplete
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate max-w-xs">
                        {listing.title}
                      </h4>
                      <span className="text-xs font-bold text-emerald-400">
                        {completedCount} / 4 Done
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(completedCount / 4) * 100}%` }}
                      />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            step1Photos ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {step1Photos ? '✓' : '1'}
                        </span>
                        <span className={step1Photos ? 'text-slate-200' : 'text-slate-500'}>
                          {t.stepPhotos}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            step2Price ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {step2Price ? '✓' : '2'}
                        </span>
                        <span className={step2Price ? 'text-slate-200' : 'text-slate-500'}>
                          {t.stepPrice} ({formatKsh(listing.rent_ksh)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            step3Location ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {step3Location ? '✓' : '3'}
                        </span>
                        <span className={step3Location ? 'text-slate-200' : 'text-slate-500'}>
                          {t.stepLocation} ({listing.neighborhood})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            step4Tour ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {step4Tour ? '✓' : '4'}
                        </span>
                        <span className={step4Tour ? 'text-cyan-300 font-semibold' : 'text-slate-500'}>
                          {t.stepTour}
                        </span>
                      </div>
                    </div>

                    {isFullyComplete && (
                      <div className="pt-2 border-t border-emerald-900/60 flex items-center gap-2 text-xs font-bold text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{t.checklistComplete}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT LISTING WITH OPTIONAL 360° VIEWORA TOUR SECTION */}
      {/* ========================================================================= */}
      {(editingListing || isCreating) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {isCreating ? t.addListing : t.editListing}
              </h3>
              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsCreating(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern 2-Bedroom Haven with Balcony"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Rent (KSh)
                  </label>
                  <input
                    type="number"
                    required
                    value={formRent}
                    onChange={(e) => setFormRent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security Deposit (KSh)
                  </label>
                  <input
                    type="number"
                    required
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Fee Transparency & Kenyan Consumer Protection Safeguard (Part 6 Requirement) */}
              {(formRent >= 60000 || formDeposit > formRent) && (
                <div className="p-3 bg-amber-950/70 border border-amber-600/70 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="block text-amber-100 font-bold mb-0.5">
                      Fee Transparency Reminder (Kenyan Consumer Protection Law):
                    </strong>
                    Disclose all fees upfront. Kenyan consumer law prohibits hidden charges. If service charges, water, garbage, or parking are excluded, detail them explicitly in the description.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / County
                  </label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Neighborhood / Area
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Westlands, Kilimani, Nyali"
                    value={formNeighborhood}
                    onChange={(e) => setFormNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PHASE 1: DEDICATED 360° VIEWORA VIRTUAL TOUR SECTION */}
              {/* ========================================================================= */}
              <div className="bg-slate-950/80 border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-extrabold text-white">
                      {t.tourSectionTitle}
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                    Optional
                  </span>
                </div>

                <p className="text-xs text-slate-400">{t.tourSectionSubtitle}</p>

                {/* Input Field with Client & Server Validation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t.pasteTourUrl}
                  </label>
                  <input
                    type="url"
                    placeholder={t.tourUrlPlaceholder}
                    value={formTourUrl}
                    onChange={(e) => handleTourUrlChange(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none transition ${
                      formTourValidationError
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : formTourLivePreviewValid
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-700'
                    }`}
                  />

                  {/* Error display */}
                  {formTourValidationError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formTourValidationError}</span>
                    </div>
                  )}

                  {/* Success host notice */}
                  {formTourLivePreviewValid && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Valid Viewora secure link confirmed (viewora.software).</span>
                    </div>
                  )}
                </div>

                {/* Live Preview after valid paste */}
                {formTourLivePreviewValid && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      {t.livePreviewTitle}
                    </span>
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-cyan-500/40">
                      <iframe
                        src={formTourUrl}
                        title="Live Tour Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-fullscreen"
                        allow="fullscreen; gyroscope; accelerometer"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{t.livePreviewHelp}</p>
                  </div>
                )}

                {/* Two Helper Links (Opens in new tab) */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href="https://app.viewora.software"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{t.createFreeTourLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <span className="text-slate-600">·</span>

                  <a
                    href="https://viewora.software/360-photography-service-kenya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{t.bookPhotoShootLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingListing(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg"
                >
                  {isCreating ? 'Publish Listing' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CAPTURE SERVICE REFERRAL MODAL (KES 5,000 SERVICE) */}
      {/* ========================================================================= */}
      {showCaptureModal && captureTargetListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {t.captureServiceModalTitle}
              </h3>
              <button
                onClick={() => setShowCaptureModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t.captureServiceDesc}
            </p>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Target Property:</span>
                <span className="font-bold text-white">{captureTargetListing.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{t.selectArea}</label>
                  <input
                    type="text"
                    value={refArea}
                    onChange={(e) => setRefArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t.propertyType}</label>
                  <select
                    value={refPropType}
                    onChange={(e) => setRefPropType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option>Apartment</option>
                    <option>Bedsitter</option>
                    <option>Townhouse</option>
                    <option>Villa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preferred Shoot Date</label>
                <input
                  type="date"
                  value={refDate}
                  onChange={(e) => setRefDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes / Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master bedroom, ocean view balcony, pool area"
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            {refCopiedNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs">
                {t.captureReferralCopied}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitCaptureReferral}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{t.captureSubmitBtn}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
