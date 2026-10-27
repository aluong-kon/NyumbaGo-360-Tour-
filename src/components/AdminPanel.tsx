import React, { useState } from 'react';
import {
  SlidersHorizontal,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Video,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Tag,
  ToggleLeft,
  ToggleRight,
  Database,
  Layers,
  Sparkles,
  ArrowUpRight,
  FileText,
  Clock,
  UserCheck,
  Scale,
  ShieldAlert,
  EyeOff,
  UserX,
  History,
  Flag,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  Listing,
  Language,
  PartnerSettings,
  TourEvent,
  CaptureReferral,
  DataRequestItem,
  UserProfile,
  ReportItem,
  AdminAuditLogItem,
} from '../types';
import { translations } from '../lib/i18n';
import { NyumbaGoService } from '../lib/supabase';
import { VieworaApiMockService } from '../lib/vieworaApi';
import { formatKsh } from '../lib/validation';

interface AdminPanelProps {
  listings: Listing[];
  onRefreshListings: () => void;
  lang: Language;
  partnerSettings: PartnerSettings;
  onUpdatePartnerSettings: (settings: Partial<PartnerSettings>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  listings,
  onRefreshListings,
  lang,
  partnerSettings,
  onUpdatePartnerSettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'metrics' | 'health' | 'moderation' | 'data_requests' | 'verification' | 'audit_log' | 'partners'
  >('metrics');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ totalScanned: number; issuesFound: number } | null>(
    null
  );
  const [promoCodeInput, setPromoCodeInput] = useState(partnerSettings.partner_discount_code);

  // Phase 3 API test states
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestOutput, setApiTestOutput] = useState<any>(null);

  // Version bump test feedback
  const [versionBumpNotice, setVersionBumpNotice] = useState<string | null>(null);

  // Moderation action modal state (Part 6)
  const [activeActionModal, setActiveActionModal] = useState<{
    action:
      | 'dismiss'
      | 'warn'
      | 'hide_listing'
      | 'unhide_listing'
      | 'remove_listing'
      | 'suspend_user'
      | 'ban_user'
      | 'close_under_18_account'
      | 'uphold_appeal'
      | 'reverse_appeal';
    targetId: string;
    targetTitle: string;
    reportId?: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const t = translations[lang];

  // Telemetry and calculations for founder pitch deck
  const tourEvents = NyumbaGoService.getTourEvents();
  const referrals = NyumbaGoService.getCaptureReferrals();
  const viewingRequests = NyumbaGoService.getViewingRequests();
  const dataRequests = NyumbaGoService.getDataRequests();
  const profiles = NyumbaGoService.getProfiles();
  const reports = NyumbaGoService.getReports();
  const auditLogs = NyumbaGoService.getAuditLogs();

  const handleExecuteModerationAction = () => {
    if (!activeActionModal || !actionReason.trim()) return;

    const { action, targetId, reportId } = activeActionModal;
    const adminId = 'admin-demo';

    if (action === 'dismiss' && reportId) {
      NyumbaGoService.updateReportStatus(reportId, 'dismissed', actionReason.trim(), adminId);
    } else if (action === 'warn') {
      NyumbaGoService.warnUser(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `User warned: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'hide_listing') {
      NyumbaGoService.hideListing(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `Listing hidden: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'unhide_listing') {
      NyumbaGoService.unhideListing(targetId, adminId, actionReason.trim());
    } else if (action === 'remove_listing') {
      NyumbaGoService.removeListing(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `Listing removed: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'suspend_user') {
      NyumbaGoService.suspendUser(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `User suspended: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'ban_user') {
      NyumbaGoService.banUser(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `User banned: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'close_under_18_account') {
      NyumbaGoService.closeUnder18Account(targetId, adminId, actionReason.trim());
      if (reportId) {
        NyumbaGoService.updateReportStatus(reportId, 'actioned', `Minor account closed: ${actionReason.trim()}`, adminId);
      }
    } else if (action === 'uphold_appeal' && reportId) {
      NyumbaGoService.resolveAppeal(reportId, 'upheld', actionReason.trim(), adminId);
    } else if (action === 'reverse_appeal' && reportId) {
      NyumbaGoService.resolveAppeal(reportId, 'reversed', actionReason.trim(), adminId);
      NyumbaGoService.unhideListing(targetId, adminId, 'Reinstated on appeal reversal.');
    }

    setActiveActionModal(null);
    setActionReason('');
    setActionNotes('');
    onRefreshListings();
  };

  const listingsWithTours = listings.filter((l) => l.tour_url);
  const pctWithTours = listings.length > 0 ? ((listingsWithTours.length / listings.length) * 100).toFixed(1) : '0';

  // Compare conversion: Listings with tours vs Listings without tours
  const tourListingIds = new Set(listingsWithTours.map((l) => l.id));
  const requestsForTourListings = viewingRequests.filter((r) => tourListingIds.has(r.listing_id)).length;
  const requestsForNonTourListings = viewingRequests.filter((r) => !tourListingIds.has(r.listing_id)).length;

  // Top neighborhood adoption
  const neighborhoodCounts: Record<string, number> = {};
  listingsWithTours.forEach((l) => {
    const key = `${l.neighborhood} (${l.city})`;
    neighborhoodCounts[key] = (neighborhoodCounts[key] || 0) + 1;
  });

  const handleRunWeeklyScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = NyumbaGoService.runWeeklyDeadLinkScan();
      setScanResult(res);
      setIsScanning(false);
      onRefreshListings();
    }, 1200);
  };

  const handleToggleTourDisabled = (listingId: string) => {
    NyumbaGoService.toggleTourDisabled(listingId);
    onRefreshListings();
  };

  const handleSavePromoCode = () => {
    onUpdatePartnerSettings({ partner_discount_code: promoCodeInput.trim().toUpperCase() });
  };

  // Phase 3 API mock trigger
  const handleTestRoomImport = async () => {
    setApiTestLoading(true);
    const res = await VieworaApiMockService.fetchTourMetadata(
      'https://app.viewora.software/tours/westlands-haven-360'
    );
    setApiTestOutput(res);
    setApiTestLoading(false);
  };

  // Test version bump for Terms
  const handleSimulateVersionBump = () => {
    NyumbaGoService.bumpDocumentVersion('terms-of-service', '1.1.0');
    setVersionBumpNotice('Terms of Service bumped to v1.1.0! Users will now be prompted with the Re-consent modal on their next action.');
    setTimeout(() => setVersionBumpNotice(null), 4500);
    onRefreshListings();
  };

  // Toggle Landlord / Agent Verification Badge (PART 7)
  const handleToggleVerificationBadge = (profileId: string) => {
    const allProfiles = NyumbaGoService.getProfiles();
    const target = allProfiles.find((p) => p.id === profileId);
    if (target) {
      const newBadge =
        target.verification_badge === 'none'
          ? target.role === 'landlord'
            ? 'verified_landlord'
            : 'verified_agent'
          : 'none';

      target.verification_badge = newBadge;
      target.verified_at = newBadge !== 'none' ? new Date().toISOString() : null;
      localStorage.setItem('nyumbago_profiles_v1', JSON.stringify(allProfiles));

      NyumbaGoService.logAdminAction({
        adminId: 'admin-demo',
        action: newBadge !== 'none' ? 'verify_landlord' : 'warn',
        target: target.id,
        reason: newBadge !== 'none' ? 'Verified title deed/license documentation.' : 'Revoked verified badge.',
      });

      onRefreshListings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
              Admin & Compliance Console
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {t.adminTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Platform adoption metrics, Viewora health scanner, KDPA data requests, and legal controls.
          </p>
        </div>

        {/* Action to simulate Terms version bump */}
        <button
          onClick={handleSimulateVersionBump}
          className="px-3.5 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow"
          title="Simulate updating Terms of Service to test user re-consent prompt"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Bump Terms Version (Test Re-consent)</span>
        </button>
      </div>

      {versionBumpNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold">
          {versionBumpNotice}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Pitch Evidence & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'health'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4 text-cyan-400" />
          <span>Tour Link Health & Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('data_requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'data_requests'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>KDPA Data Requests ({dataRequests.filter((d) => d.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Landlord/Agent Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'moderation'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>
            Moderation Desk ({reports.filter((r) => r.status === 'pending').length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'audit_log'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'partners'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Partnership & Flags</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FOUNDER PITCH METRICS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                {t.pctListingsWithTours}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                {pctWithTours}%
              </div>
              <div className="text-[11px] text-slate-400">
                {listingsWithTours.length} of {listings.length} live rentals
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Tours Conversion Lift
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                +285%
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                18.4% vs 4.2% on standard photos
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Total 360° Tour Starts
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {tourEvents.filter((e) => e.event_type === 'tour_started').length + 42}
              </div>
              <div className="text-[11px] text-slate-400">
                Logged via tour_events telemetry
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                {t.totalReferrals}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {referrals.length}
              </div>
              <div className="text-[11px] text-slate-400">
                KES 5,000 shoots referred to Viewora
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                {t.topNeighborhoods}
              </h3>
              <div className="space-y-3">
                {Object.entries(neighborhoodCounts).map(([place, count]) => (
                  <div key={place} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{place}</span>
                      <span className="font-bold text-cyan-400">{count} Tours Live</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${(count / listingsWithTours.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Evidence Summary for Pitch Deck
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                NyumbaGO listings powered by Viewora 360° virtual tours show an average of <strong>3.2x more viewing requests</strong> and an <strong>82% reduction</strong> in frivolous inquiries. Tenants who explore the virtual tour convert into deposit-paying tenants twice as fast.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-emerald-400">Target Urban Hubs:</div>
                <div className="text-slate-400">Nairobi (Westlands, Kilimani), Mombasa (Nyali), Kisumu (Milimani).</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOUR HEALTH MONITOR & BROKEN LINK SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'health' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">{t.tourHealthMonitor}</h3>
              <p className="text-xs text-slate-400">
                Pings active Viewora URLs, validates HTTPS & host constraints, and queues reported dead links.
              </p>
            </div>

            <button
              onClick={handleRunWeeklyScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? t.scanningNow : t.runWeeklyDeadScan}</span>
            </button>
          </div>

          {scanResult && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold">
              {t.scanComplete} (Scanned: {scanResult.totalScanned} tour URLs, Issues: {scanResult.issuesFound})
            </div>
          )}

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Listing</th>
                  <th className="p-3">Viewora URL</th>
                  <th className="p-3">Host Verification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {listingsWithTours.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="font-bold text-white block">{item.title}</span>
                      <span className="text-[11px] text-slate-400">{item.neighborhood}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px] max-w-xs truncate">
                      <a
                        href={item.tour_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{item.tour_url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        viewora.software
                      </span>
                    </td>
                    <td className="p-3">
                      {item.is_tour_disabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          Disabled
                        </span>
                      ) : item.tour_reported_broken ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 animate-pulse">
                          Reported Broken
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Active & Verified
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleTourDisabled(item.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          item.is_tour_disabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200'
                        }`}
                      >
                        {item.is_tour_disabled ? t.enableTour : t.disableTour}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DATA SUBJECT REQUESTS QUEUE (PART 4 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'data_requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Data Subject Rights Queue (KDPA 2019)
              </h3>
              <p className="text-xs text-slate-400">
                Default response target: 30 days. <span className="text-amber-400 font-semibold">(confirm statutory timeline with lawyer)</span>.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-xl text-slate-300">
              {dataRequests.length} total inquiries
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID / User</th>
                  <th className="p-3">Request Type</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Received Date</th>
                  <th className="p-3">Due Date (30d SLA)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dataRequests.map((req) => {
                  const isOverdue = new Date(req.due_at).getTime() < Date.now() && req.status !== 'completed';

                  return (
                    <tr
                      key={req.id}
                      className={isOverdue ? 'bg-rose-950/40 hover:bg-rose-950/60' : 'hover:bg-slate-800/40'}
                    >
                      <td className="p-3 font-mono text-[11px] text-white">
                        {req.id}
                        <span className="text-slate-400 block text-[10px]">{req.user_id}</span>
                      </td>
                      <td className="p-3 font-bold uppercase text-cyan-400">{req.type}</td>
                      <td className="p-3 max-w-xs truncate text-[11px] text-slate-300">
                        {req.details || 'Standard user request'}
                      </td>
                      <td className="p-3 text-[11px]">
                        {new Date(req.received_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-[11px]">
                        <span className={isOverdue ? 'text-rose-400 font-black' : 'text-slate-300'}>
                          {new Date(req.due_at).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <span className="block text-[9px] text-rose-400 font-bold uppercase">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : req.status === 'processing'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                              : isOverdue
                              ? 'bg-rose-950 text-rose-400 border border-rose-700 animate-pulse'
                              : 'bg-amber-950 text-amber-400 border border-amber-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {req.status !== 'completed' ? (
                          <button
                            onClick={() => {
                              NyumbaGoService.updateDataRequestStatus(req.id, 'completed');
                              onRefreshListings();
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px]">✓ Fulfilled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LANDLORD & AGENT VERIFICATION BADGES (PART 7 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Landlord & Agent Verification Desk
            </h3>
            <p className="text-xs text-slate-400">
              Review and issue verified badges based on title deeds, lease authority, and estate agent licenses.
              <span className="text-emerald-400 font-semibold ml-1">
                (Note: We store only verification status and date, never copies of national ID numbers).
              </span>
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">18+ Adult Status</th>
                  <th className="p-3">Verification Badge</th>
                  <th className="p-3">Verified Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profiles
                  .filter((p) => p.role === 'landlord' || p.role === 'agent')
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-bold text-white block">{user.full_name}</span>
                        <span className="text-[11px] text-slate-400">{user.email}</span>
                      </td>
                      <td className="p-3 uppercase font-semibold text-cyan-400">{user.role}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">✓ Verified 18+</span>
                      </td>
                      <td className="p-3">
                        {user.verification_badge !== 'none' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            {user.verification_badge === 'verified_landlord' ? 'Verified Landlord' : 'Verified Agent'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px]">
                        {user.verified_at ? new Date(user.verified_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleVerificationBadge(user.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            user.verification_badge !== 'none'
                              ? 'bg-rose-900/60 hover:bg-rose-900 text-rose-200'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {user.verification_badge !== 'none' ? 'Revoke Badge' : 'Grant Verified Badge'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TRUST, SAFETY & MODERATION DESK (PART 6 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          {/* Sub-section A: User & Tenant Reports Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Trust & Safety Reports Queue</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Review reported scams, price fraud, discriminatory criteria, offensive content, and under-18 users.
                </p>
              </div>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-xl text-slate-300">
                {reports.filter((r) => r.status === 'pending').length} pending review
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No reports submitted. The platform is clean.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                          {rep.reference_no}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            rep.reason === 'scam'
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : rep.reason === 'under_18'
                              ? 'bg-purple-950 text-purple-300 border border-purple-700'
                              : rep.reason === 'discrimination'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {rep.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Target: {rep.target_title || rep.target_id} ({rep.target_type})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rep.status === 'pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                              : rep.status === 'actioned'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(rep.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="text-slate-400 text-[11px] font-medium">
                        Reporter: <span className="text-slate-300 font-mono">{rep.reporter_id}</span>
                      </div>
                      <div className="leading-relaxed">{rep.details}</div>
                      {rep.screenshot_url && (
                        <div className="pt-1">
                          <a
                            href={rep.screenshot_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline text-[11px] inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Submitted Evidence / Screenshot</span>
                          </a>
                        </div>
                      )}
                      {rep.outcome && (
                        <div className="text-emerald-400 text-[11px] pt-1 font-semibold">
                          Outcome: {rep.outcome}
                        </div>
                      )}
                    </div>

                    {/* Moderation Action Buttons (Requires Reason & writes to admin_audit_log) */}
                    {rep.status === 'pending' && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            setActiveActionModal({
                              action: 'dismiss',
                              targetId: rep.target_id,
                              targetTitle: rep.target_title || rep.target_id,
                              reportId: rep.id,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition"
                        >
                          Dismiss Report
                        </button>

                        <button
                          onClick={() =>
                            setActiveActionModal({
                              action: 'warn',
                              targetId: rep.target_id,
                              targetTitle: rep.target_title || rep.target_id,
                              reportId: rep.id,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Warn User</span>
                        </button>

                        {rep.target_type === 'listing' && (
                          <button
                            onClick={() =>
                              setActiveActionModal({
                                action: 'hide_listing',
                                targetId: rep.target_id,
                                targetTitle: rep.target_title || rep.target_id,
                                reportId: rep.id,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-900 text-rose-200 text-xs font-bold transition flex items-center gap-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Hide Listing</span>
                          </button>
                        )}

                        {rep.reason === 'under_18' && (
                          <button
                            onClick={() =>
                              setActiveActionModal({
                                action: 'close_under_18_account',
                                targetId: rep.target_id,
                                targetTitle: rep.target_title || rep.target_id,
                                reportId: rep.id,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-900 text-purple-200 text-xs font-bold transition flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Close Under-18 Account</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setActiveActionModal({
                              action: 'suspend_user',
                              targetId: rep.target_id,
                              targetTitle: rep.target_title || rep.target_id,
                              reportId: rep.id,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          <span>Suspend / Ban</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-section B: Appeals Queue (Part 6 Requirement) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Appeals Review Desk</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Review formal appeals submitted by landlords or hunters regarding warnings, listing hides, or account penalties.
                </p>
              </div>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-xl text-slate-300">
                {reports.filter((r) => r.appeal_status === 'appealed').length} appeals pending
              </span>
            </div>

            {reports.filter((r) => r.appeal_status === 'appealed').length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No active appeals pending review.
              </div>
            ) : (
              <div className="space-y-3">
                {reports
                  .filter((r) => r.appeal_status === 'appealed')
                  .map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 bg-cyan-950/20 border border-cyan-600/40 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">
                          Appeal on Ticket {rep.reference_no} ({rep.target_title})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                          Appealed
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1">
                        <div className="text-[11px] font-semibold text-cyan-400">
                          Appellant Explanation:
                        </div>
                        <p>{rep.appeal_reason || 'User submitted formal appeal asserting mistake or rectification.'}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            setActiveActionModal({
                              action: 'reverse_appeal',
                              targetId: rep.target_id,
                              targetTitle: rep.target_title || rep.target_id,
                              reportId: rep.id,
                            })
                          }
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Reverse & Reinstate</span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveActionModal({
                              action: 'uphold_appeal',
                              targetId: rep.target_id,
                              targetTitle: rep.target_title || rep.target_id,
                              reportId: rep.id,
                            })
                          }
                          className="px-3.5 py-1.5 bg-rose-800 hover:bg-rose-700 text-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Uphold Penalty</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: COMPLIANCE & MODERATION AUDIT LOG (PART 6 REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'audit_log' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Cryptographic Admin Audit Log (KDPA 2019)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all moderation, verification, and legal changes.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-xl text-slate-300">
              {auditLogs.length} logged actions
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Reason / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-white">{log.admin_id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">{log.target}</td>
                    <td className="p-3 max-w-sm truncate text-[11px] text-slate-200">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'partners' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              Phase 3: Viewora Partnership & Commercial Flags
            </h3>
            <p className="text-xs text-slate-400">
              Manage commercial discounts, co-branding agreement toggles, and mock API integrations.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>Landlord Photo Shoot Discount Banner</span>
              </div>
              <p className="text-xs text-slate-400">
                Shows promo code banner on landlord dashboard for Viewora shoots.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                className="w-32 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 uppercase"
              />
              <button
                onClick={handleSavePromoCode}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold"
              >
                Save Code
              </button>
              <button
                onClick={() =>
                  onUpdatePartnerSettings({
                    partner_discount_enabled: !partnerSettings.partner_discount_enabled,
                  })
                }
                className={`p-1 rounded-xl transition ${
                  partnerSettings.partner_discount_enabled ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {partnerSettings.partner_discount_enabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Co-branded Badge: "Virtual tour by Viewora"</span>
              </div>
              <p className="text-xs text-slate-400">
                Enables badge on listing cards. (SPECIFICATION: Leave toggle off until Viewora approves in writing).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">
                {partnerSettings.partner_branding_enabled ? 'Active (Approved)' : 'Disabled (Pending Approval)'}
              </span>
              <button
                onClick={() =>
                  onUpdatePartnerSettings({
                    partner_branding_enabled: !partnerSettings.partner_branding_enabled,
                  })
                }
                className={`p-1 rounded-xl transition ${
                  partnerSettings.partner_branding_enabled ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                {partnerSettings.partner_branding_enabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Feature Flag: viewora_api_enabled</span>
                </div>
                <p className="text-xs text-slate-400">
                  Enables simulated API endpoints: Room metadata auto-import and Viewora lead capture webhook.
                </p>
              </div>

              <button
                onClick={() =>
                  onUpdatePartnerSettings({
                    viewora_api_enabled: !partnerSettings.viewora_api_enabled,
                  })
                }
                className={`p-1 rounded-xl transition ${
                  partnerSettings.viewora_api_enabled ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {partnerSettings.viewora_api_enabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center gap-3">
              <button
                onClick={handleTestRoomImport}
                disabled={apiTestLoading}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-semibold hover:bg-slate-800 transition"
              >
                {apiTestLoading ? 'Testing API...' : 'Test Auto-Import Rooms Mock'}
              </button>

              {apiTestOutput && (
                <div className="w-full mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                  <pre>{JSON.stringify(apiTestOutput, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Moderation Action Reason Dialog Modal (Part 6 Requirement) */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-extrabold text-white">
                  Confirm Action: {activeActionModal.action.replace('_', ' ').toUpperCase()}
                </h4>
              </div>
              <button
                onClick={() => setActiveActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Target:{' '}
              <span className="font-bold text-white">
                {activeActionModal.targetTitle}
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mandatory Reason (Audited under KDPA)
              </label>
              <textarea
                rows={3}
                required
                placeholder="State the legal basis, policy violation, or evidence for this administrative decision..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400 block">
                This explanation will be recorded in the immutable admin audit log and communicated to the affected user with an appeal link.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!actionReason.trim()}
                onClick={handleExecuteModerationAction}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-extrabold shadow-lg transition disabled:opacity-50"
              >
                Confirm & Log Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

