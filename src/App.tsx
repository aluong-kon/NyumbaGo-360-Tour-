/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  Language,
  Listing,
  FilterState,
  PartnerSettings,
  NotificationItem,
  UserProfile,
  LegalDocument,
} from './types';
import { Header } from './components/Header';
import { BudgetSearch } from './components/BudgetSearch';
import { ListingCard } from './components/ListingCard';
import { MapView } from './components/MapView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { ViewingRequestModal } from './components/ViewingRequestModal';
import { CompareModal } from './components/CompareModal';
import { LandlordDashboard } from './components/LandlordDashboard';
import { AgentBulkTools } from './components/AgentBulkTools';
import { AdminPanel } from './components/AdminPanel';
import { DevDocsModal } from './components/DevDocsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { SignupModal } from './components/SignupModal';
import { ReconsentModal } from './components/ReconsentModal';
import { LegalDocsViewerModal } from './components/LegalDocsViewerModal';
import { CookieBanner } from './components/CookieBanner';
import { UserSettingsModal } from './components/UserSettingsModal';
import { PublicAccountDeletionModal } from './components/PublicAccountDeletionModal';
import { NyumbaGoService } from './lib/supabase';
import { restoreAuthSession, signOutNyumbaGo } from './lib/auth';
import { AuthModal } from './components/AuthModal';
import { translations } from './lib/i18n';
import { Video, Sparkles, ShieldCheck, Scale, FileText, Lock } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>('hunter');
  const [lang, setLang] = useState<Language>('en');

  // Core Data
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [partnerSettings, setPartnerSettings] = useState<PartnerSettings>(
    NyumbaGoService.getPartnerSettings()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(NyumbaGoService.getSavedListingIds());
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Search & Filters State
  const [filter, setFilter] = useState<FilterState>({
    budget_ksh: 50000,
    city: 'All',
    neighborhood: '',
    bedrooms: 'all',
    has_tour_only: false,
    view_mode: 'list',
    sort_by: 'budget_fit',
  });

  // Modal Dialog States
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [autoStartTourInModal, setAutoStartTourInModal] = useState(false);
  const [viewingRequestTarget, setViewingRequestTarget] = useState<Listing | null>(null);
  const [viewingRequestTouredOnline, setViewingRequestTouredOnline] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDevDocs, setShowDevDocs] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Compliance Modals State (Parts 1 - 7)
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLegalDocsModal, setShowLegalDocsModal] = useState(false);
  const [activeLegalDocId, setActiveLegalDocId] = useState('terms-of-service');
  const [reconsentDoc, setReconsentDoc] = useState<LegalDocument | null>(null);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showPublicDeletionModal, setShowPublicDeletionModal] = useState(false);

  // Load fresh data
  const refreshData = () => {
    const user = NyumbaGoService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setRole(user.role);
    }
    setListings(NyumbaGoService.getListings());
    setPartnerSettings(NyumbaGoService.getPartnerSettings());
    setNotifications(NyumbaGoService.getNotifications());
    setSavedIds(NyumbaGoService.getSavedListingIds());

    // Check if user requires re-consent due to version change
    if (user) {
      const needsReconsent = NyumbaGoService.checkRequiresReconsent(user.id);
      setReconsentDoc(needsReconsent);
    }
  };

  useEffect(() => {
    let mounted = true;
    restoreAuthSession().then((user) => {
      if (!mounted) return;
      setCurrentUser(user);
      if (user) { setRole(user.role); refreshData(); }
      setAuthReady(true);
    }).catch(() => { if (mounted) setAuthReady(true); });
    

    // Check URL query parameters for direct shared links (e.g. ?listing=id&tour=1)
    const urlParams = new URLSearchParams(window.location.search);
    const listingParam = urlParams.get('listing');
    const tourParam = urlParams.get('tour');
    const legalParam = urlParams.get('legal');

    if (listingParam) {
      const match = NyumbaGoService.getListingById(listingParam);
      if (match) {
        setSelectedListing(match);
        if (tourParam === '1') {
          setAutoStartTourInModal(true);
        }
      }
    }

    if (legalParam) {
      setActiveLegalDocId(legalParam);
      setShowLegalDocsModal(true);
    }
    return () => { mounted = false; };
  }, []);

  const t = translations[lang];

  // Open Legal Document Modal
  const handleOpenLegalDoc = (docId: string = 'terms-of-service') => {
    setActiveLegalDocId(docId);
    setShowLegalDocsModal(true);
  };

  // Save / Bookmark handler
  const handleToggleSave = (id: string) => {
    const updated = NyumbaGoService.toggleSavedListing(id);
    setSavedIds(updated);
  };

  // Compare handler (up to 3)
  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 listings at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Filter & Rank Listings
  // SPECIFICATION: "Ranking: budget match stays first. Among equal matches, verified tours rank higher."
  const filteredAndRankedListings = useMemo(() => {
    return listings
      .filter((l) => {
        // City filter
        if (filter.city !== 'All' && l.city !== filter.city) {
          return false;
        }

        // Neighborhood keyword search
        if (
          filter.neighborhood.trim() &&
          !l.neighborhood.toLowerCase().includes(filter.neighborhood.toLowerCase()) &&
          !l.city.toLowerCase().includes(filter.neighborhood.toLowerCase())
        ) {
          return false;
        }

        // Bedrooms filter
        if (filter.bedrooms !== 'all') {
          if (filter.bedrooms === 3) {
            if (l.bedrooms < 3) return false;
          } else if (l.bedrooms !== filter.bedrooms) {
            return false;
          }
        }

        // Exclude admin-hidden listings from public search (Admins can view in Admin Console)
        if (l.is_hidden_by_admin && role !== 'admin') {
          return false;
        }

        // 14-day freshness rule: hide stale listings automatically from public search
        const freshness = NyumbaGoService.getListingFreshness(l);
        if (freshness.isStale && role !== 'admin' && role !== 'landlord' && role !== 'agent') {
          return false;
        }

        // Has 360° Tour filter toggle
        if (filter.has_tour_only) {
          if (!l.tour_url || l.is_tour_disabled) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filter.sort_by === 'price_low_high') {
          return a.rent_ksh - b.rent_ksh;
        }
        if (filter.sort_by === 'price_high_low') {
          return b.rent_ksh - a.rent_ksh;
        }
        if (filter.sort_by === 'newest') {
          return (b.tour_added_at || '').localeCompare(a.tour_added_at || '');
        }

        // Default: 'budget_fit'
        // Rule: Budget match stays first.
        const diffA = Math.abs(filter.budget_ksh - a.rent_ksh);
        const diffB = Math.abs(filter.budget_ksh - b.rent_ksh);

        // Within-budget preference
        const withinA = a.rent_ksh <= filter.budget_ksh;
        const withinB = b.rent_ksh <= filter.budget_ksh;

        if (withinA && !withinB) return -1;
        if (!withinA && withinB) return 1;

        // Compare budget closeness
        if (diffA !== diffB) {
          return diffA - diffB;
        }

        // Among equal matches, verified tours rank higher!
        const scoreTourA = a.tour_verified && a.tour_url && !a.is_tour_disabled ? 2 : a.tour_url ? 1 : 0;
        const scoreTourB = b.tour_verified && b.tour_url && !b.is_tour_disabled ? 2 : b.tour_url ? 1 : 0;

        return scoreTourB - scoreTourA;
      });
  }, [listings, filter]);

  const comparedListings = useMemo(() => {
    return listings.filter((l) => compareIds.includes(l.id));
  }, [listings, compareIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        lang={lang}
        setLang={setLang}
        savedCount={savedIds.length}
        onOpenCompare={() => setShowCompareModal(true)}
        onOpenDevDocs={() => setShowDevDocs(true)}
        onOpenPrivacy={() => setShowPrivacy(true)}
        onOpenSignup={() => setShowSignupModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={() => { signOutNyumbaGo().then(() => { setCurrentUser(null); setRole('hunter'); setShowAuthModal(false); }); }}
        onOpenLegalDocs={handleOpenLegalDoc}
        onOpenUserSettings={() => setShowUserSettingsModal(true)}
        notifications={notifications}
        onRefreshNotifications={refreshData}
        currentUser={currentUser}
        onUserChanged={refreshData}
      />

      {/* Main Content Area based on User Role */}
      <main className="flex-1 flex flex-col">
        {!authReady ? (
          <div className="flex min-h-[55vh] items-center justify-center text-sm text-slate-400">Checking your secure session…</div>
        ) : !currentUser ? (
          <section className="mx-auto flex min-h-[65vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-300"><Lock className="h-8 w-8" /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Secure access · 18+ only</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Find your next home with confidence.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Sign in to explore affordable rentals across Kenya, save properties, compare options and request viewings. New here? Create an account to get started.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={() => setShowAuthModal(true)} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-500">Sign in</button><button onClick={() => setShowSignupModal(true)} className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-white hover:bg-slate-700">Create account (18+)</button></div>
            <p className="mt-5 text-xs text-slate-500">Authentication is handled by your configured Supabase project. Demo role switching is disabled.</p>
          </section>
        ) : (
        <>
        {/* ========================================================================= */}
        {/* ROLE: HUNTER (HOME RENTAL SEARCH) */}
        {/* ========================================================================= */}
        {role === 'hunter' && (
          <div className="flex-1 flex flex-col">
            {/* Budget Search Filter Bar */}
            <BudgetSearch
              filter={filter}
              setFilter={setFilter}
              totalMatches={filteredAndRankedListings.length}
              lang={lang}
            />

            {/* List / Map View Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
              {filter.view_mode === 'list' ? (
                <div>
                  {filteredAndRankedListings.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                      <Video className="w-10 h-10 text-slate-600 mx-auto" />
                      <h3 className="text-base font-bold text-white">
                        No properties found matching your criteria.
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Try adjusting your monthly budget, relaxing the bedroom filter, or turning off the "Has 360° tour" filter.
                      </p>
                      <button
                        onClick={() =>
                          setFilter((prev) => ({
                            ...prev,
                            budget_ksh: 60000,
                            city: 'All',
                            bedrooms: 'all',
                            has_tour_only: false,
                            neighborhood: '',
                          }))
                        }
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAndRankedListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          userBudgetKsh={filter.budget_ksh}
                          lang={lang}
                          isSaved={savedIds.includes(listing.id)}
                          onToggleSave={handleToggleSave}
                          isCompared={compareIds.includes(listing.id)}
                          onToggleCompare={handleToggleCompare}
                          onSelectListing={(l, openTour) => {
                            setSelectedListing(l);
                            setAutoStartTourInModal(Boolean(openTour));
                          }}
                          partnerSettings={partnerSettings}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Map View */
                <MapView
                  listings={filteredAndRankedListings}
                  userBudgetKsh={filter.budget_ksh}
                  lang={lang}
                  onSelectListing={(l, openTour) => {
                    setSelectedListing(l);
                    setAutoStartTourInModal(Boolean(openTour));
                  }}
                  partnerSettings={partnerSettings}
                />
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE: LANDLORD */}
        {/* ========================================================================= */}
        {role === 'landlord' && (
          <LandlordDashboard
            listings={listings}
            onRefreshListings={refreshData}
            lang={lang}
            partnerSettings={partnerSettings}
            ownerId={currentUser?.id || 'landlord-kimani'}
            isAgent={false}
          />
        )}

        {/* ========================================================================= */}
        {/* ROLE: PROPERTY AGENT */}
        {/* ========================================================================= */}
        {role === 'agent' && (
          <div className="space-y-8">
            <AgentBulkTools
              listings={listings}
              onRefreshListings={refreshData}
              lang={lang}
            />
            <div className="border-t border-slate-800">
              <LandlordDashboard
                listings={listings}
                onRefreshListings={refreshData}
                lang={lang}
                partnerSettings={partnerSettings}
                ownerId={currentUser?.id || 'agent-wambui'}
                isAgent={true}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE: ADMIN (PITCH METRICS, HEALTH MONITOR, PARTNER FLAGS) */}
        {/* ========================================================================= */}
        {role === 'admin' && (
          <AdminPanel
            listings={listings}
            onRefreshListings={refreshData}
            lang={lang}
            partnerSettings={partnerSettings}
            onUpdatePartnerSettings={(newSettings) => {
              const updated = NyumbaGoService.updatePartnerSettings(newSettings);
              setPartnerSettings(updated);
            }}
          />
        )}
        </>
        )}
      </main>

      {/* Floating Compare Action Bar if items selected */}
      {compareIds.length > 0 && !showCompareModal && (
        <aside aria-label="Comparison dock" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900 border border-emerald-500/80 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur animate-slideUp">
          <span className="text-xs font-bold text-white">
            {compareIds.length} properties selected to compare
          </span>
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow transition"
          >
            Compare Now
          </button>
          <button
            onClick={() => setCompareIds([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* PART 1 & PART 9: COMPLIANCE FOOTER WITH LINKS TO ALL 14 POLICIES */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Column 1: Terms & Eligibility */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Terms & Roles
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegalDoc('terms-of-service')} className="hover:text-emerald-400">
                    Terms of Service (18+)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('landlord-agent-terms')} className="hover:text-emerald-400">
                    Landlord & Agent Terms
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('hunter-terms')} className="hover:text-emerald-400">
                    Hunter Terms
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('acceptable-use')} className="hover:text-emerald-400">
                    Acceptable Use Guidelines
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Privacy & Data Protection (KDPA 2019) */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Privacy & Data
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegalDoc('privacy-policy')} className="hover:text-cyan-400">
                    Privacy Policy (KDPA 2019)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('cookie-policy')} className="hover:text-cyan-400">
                    Cookie & Tracking Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowPrivacy(true)} className="hover:text-cyan-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>KDPA 2019 Notice</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowPublicDeletionModal(true)} className="hover:text-rose-400">
                    Account & Data Deletion
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust, Safety & Disputes */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Trust & Safety
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegalDoc('listing-policy')} className="hover:text-amber-400">
                    Listing & Content Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('safety-anti-fraud')} className="hover:text-amber-400">
                    Safety & Anti-Fraud Guide
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('complaints-disputes')} className="hover:text-amber-400">
                    Complaints & Disputes
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('copyright-takedown')} className="hover:text-amber-400">
                    Copyright & Takedown
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Company & Standards */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                About & Standards
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegalDoc('about-contact')} className="hover:text-white">
                    About & Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('accessibility-statement')} className="hover:text-white">
                    Accessibility Statement
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalDoc('open-source-notices')} className="hover:text-white">
                    Open Source Notices
                  </button>
                </li>
                {partnerSettings.payments_enabled && (
                  <li>
                    <button onClick={() => handleOpenLegalDoc('payments-refunds')} className="hover:text-emerald-400">
                      Payments & Refunds
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={() => setShowDevDocs(true)} className="text-cyan-400 hover:underline">
                    Supabase SQL & Docs
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">
                Nyumba<span className="text-emerald-400">GO</span>
              </span>
              <span>·</span>
              <span>Operated by [LEGAL ENTITY NAME]</span>
              <span>·</span>
              <span>ODPC Registration: [ODPC REGISTRATION NUMBER]</span>
            </div>

            <div>
              Governing Law: Laws of the Republic of Kenya · Strictly 18+ Adults Only
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS & COOKIE BANNER */}
      {/* ========================================================================= */}

      {/* Cookie Consent Banner (Part 5) */}
      <CookieBanner lang={lang} onOpenPolicy={handleOpenLegalDoc} />

      {/* User Settings Modal (Part 4 Data Rights & Part 7 Security) */}
      {showUserSettingsModal && currentUser && (
        <UserSettingsModal
          currentUser={currentUser}
          onClose={() => setShowUserSettingsModal(false)}
          lang={lang}
          onUserUpdated={refreshData}
        />
      )}

      {/* Public Account Deletion Modal (App Stores & KDPA Part 4) */}
      {showPublicDeletionModal && (
        <PublicAccountDeletionModal onClose={() => setShowPublicDeletionModal(false)} />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={refreshData} onRegister={() => { setShowAuthModal(false); setShowSignupModal(true); }} />}

      {/* Signup Modal (18+ Age Gate & Unbundled Consents) */}
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          lang={lang}
          onSuccess={refreshData}
          onOpenLegalDoc={handleOpenLegalDoc}
        />
      )}

      {/* Legal Documents Viewer (All 14 Documents with Summaries) */}
      {showLegalDocsModal && (
        <LegalDocsViewerModal
          initialDocId={activeLegalDocId}
          onClose={() => setShowLegalDocsModal(false)}
          lang={lang}
          currentRole={role}
        />
      )}

      {/* Mandatory Version Re-Consent Interceptor (Part 3) */}
      {reconsentDoc && currentUser && (
        <ReconsentModal
          document={reconsentDoc}
          userId={currentUser.id}
          lang={lang}
          onAccepted={() => {
            setReconsentDoc(null);
            refreshData();
          }}
          onOpenFullDoc={handleOpenLegalDoc}
        />
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => {
            setSelectedListing(null);
            setAutoStartTourInModal(false);
          }}
          lang={lang}
          onOpenViewingRequest={(l, touredOnline) => {
            setViewingRequestTarget(l);
            setViewingRequestTouredOnline(touredOnline);
          }}
          isSaved={savedIds.includes(selectedListing.id)}
          onToggleSave={handleToggleSave}
          partnerSettings={partnerSettings}
          autoStartTour={autoStartTourInModal}
        />
      )}

      {/* Viewing Request Modal */}
      {viewingRequestTarget && (
        <ViewingRequestModal
          listing={viewingRequestTarget}
          initialTouredOnline={viewingRequestTouredOnline}
          onClose={() => setViewingRequestTarget(null)}
          lang={lang}
          onSuccess={refreshData}
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          listings={comparedListings}
          userBudgetKsh={filter.budget_ksh}
          onClose={() => setShowCompareModal(false)}
          lang={lang}
          onRemoveFromCompare={(id) => setCompareIds((prev) => prev.filter((item) => item !== id))}
          onSelectListing={(l, openTour) => {
            setSelectedListing(l);
            setAutoStartTourInModal(Boolean(openTour));
          }}
        />
      )}

      {/* Dev Docs & Supabase Migration Modal */}
      {showDevDocs && <DevDocsModal onClose={() => setShowDevDocs(false)} />}

      {/* Kenya Data Protection Act Privacy Modal */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} lang={lang} />}
    </div>
  );
}
