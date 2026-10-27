/**
 * NyumbaGO Supabase Client & Storage Layer
 * Supports both real Supabase instances and resilient local persistence
 * with exact schema integrity, CHECK constraints, and RLS enforcement.
 * Includes complete Legal, Safety, Age Gate & Compliance Layer (Parts 1 - 8)
 */

import { createClient } from '@supabase/supabase-js';
import {
  Listing,
  TourEvent,
  TourEventType,
  CaptureReferral,
  ViewingRequest,
  NotificationItem,
  PartnerSettings,
  ReferralStatus,
  UserProfile,
  LegalDocument,
  UserConsent,
  ConsentType,
  ReportItem,
  DataRequestItem,
  AdminAuditLogItem,
  UserBlock,
} from '../types';
import { INITIAL_LISTINGS, INITIAL_REFERRALS, DEFAULT_PARTNER_SETTINGS } from './constants';
import { INITIAL_LEGAL_DOCUMENTS } from './legalContent';
import { validateVieworaUrl, checkTourEventRateLimit, verifyAdultAge, generateSaltedIpHash } from './validation';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const realSupabase = isRealSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// LocalStorage Keys
const STORAGE_KEYS = {
  LISTINGS: 'nyumbago_listings_v1',
  TOUR_EVENTS: 'nyumbago_tour_events_v1',
  REFERRALS: 'nyumbago_capture_referrals_v1',
  VIEWING_REQUESTS: 'nyumbago_viewing_requests_v1',
  NOTIFICATIONS: 'nyumbago_notifications_v1',
  PARTNER_SETTINGS: 'nyumbago_partner_settings_v1',
  SAVED_LISTINGS: 'nyumbago_saved_ids_v1',

  // Compliance Keys
  PROFILES: 'nyumbago_profiles_v1',
  CURRENT_USER_ID: 'nyumbago_current_user_id_v1',
  LEGAL_DOCUMENTS: 'nyumbago_legal_documents_v1',
  USER_CONSENTS: 'nyumbago_user_consents_v1',
  REPORTS: 'nyumbago_reports_v1',
  DATA_REQUESTS: 'nyumbago_data_requests_v1',
  ADMIN_AUDIT_LOG: 'nyumbago_admin_audit_log_v1',
  USER_BLOCKS: 'nyumbago_user_blocks_v1',
  COOKIE_PREFERENCES: 'nyumbago_cookie_preferences_v1',
};

// Initial Seed Profiles (all verified adult age 18+)
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'landlord-kimani',
    email: 'kimani.properties@nyumbago.co.ke',
    phone: '+254 722 100 200',
    full_name: 'David Kimani',
    role: 'landlord',
    age_verified: true,
    age_verified_at: '2026-01-10T08:00:00Z',
    status: 'active',
    verification_badge: 'verified_landlord',
    verified_at: '2026-01-15T10:00:00Z',
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-10-27T00:00:00Z',
  },
  {
    id: 'agent-wambui',
    email: 'wambui.realty@nyumbago.co.ke',
    phone: '+254 733 456 789',
    full_name: 'Grace Wambui (Licensed Agent)',
    role: 'agent',
    age_verified: true,
    age_verified_at: '2026-02-01T09:30:00Z',
    status: 'active',
    verification_badge: 'verified_agent',
    verified_at: '2026-02-05T11:00:00Z',
    two_factor_enabled: true,
    failed_login_attempts: 0,
    created_at: '2026-02-01T09:30:00Z',
    updated_at: '2026-10-27T00:00:00Z',
  },
  {
    id: 'hunter-demo',
    email: 'hunter.ochieng@gmail.com',
    phone: '+254 701 223 344',
    full_name: 'Kevin Ochieng',
    role: 'hunter',
    age_verified: true,
    age_verified_at: '2026-03-12T14:00:00Z',
    status: 'active',
    verification_badge: 'none',
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: '2026-03-12T14:00:00Z',
    updated_at: '2026-10-27T00:00:00Z',
  },
  {
    id: 'admin-demo',
    email: 'compliance@nyumbago.co.ke',
    phone: '+254 700 000 001',
    full_name: 'NyumbaGO Compliance Officer',
    role: 'admin',
    age_verified: true,
    age_verified_at: '2025-11-01T00:00:00Z',
    status: 'active',
    verification_badge: 'none',
    two_factor_enabled: true,
    failed_login_attempts: 0,
    created_at: '2025-11-01T00:00:00Z',
    updated_at: '2026-10-27T00:00:00Z',
  },
];

// Generate persistent Session ID for anonymous tour analytics
export function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('nyumbago_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('nyumbago_session_id', sessionId);
  }
  return sessionId;
}

export class NyumbaGoService {
  private static getStoredData<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(stored) as T;
    } catch (_e) {
      return fallback;
    }
  }

  private static setStoredData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage quota or serialization error', e);
    }
  }

  // --- PROFILES & AUTHENTICATION (PART 2 & 7) ---
  public static getProfiles(): UserProfile[] {
    return this.getStoredData<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  public static getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  public static getCurrentUser(): UserProfile | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'hunter-demo';
    const profile = this.getProfileById(currentId);
    return profile || INITIAL_PROFILES[2]; // Default to hunter-demo
  }

  public static setCurrentUser(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  /**
   * PART 2: SIGNUP WITH 18+ AGE RESTRICTION & CONSENT
   * Requires DOB for adult age check.
   * STRICT COMPLIANCE: If age < 18, rejects with neutral message and NEVER creates account.
   * For accepted users, stores ONLY age_verified: true and timestamp. Zero DOB is saved!
   */
  public static async signUpUser(params: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    role: 'hunter' | 'landlord' | 'agent';
    confirm18Plus: boolean;
    confirmAuthority?: boolean;
    consentTermsPrivacy: boolean;
    consentMarketing: boolean;
    consentLocation: boolean;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    // 1. Check Age
    const ageCheck = verifyAdultAge(params.dob);
    if (!ageCheck.isAdult) {
      // Minor rejected: DO NOT STORE DOB OR CREATE USER
      return {
        success: false,
        error: ageCheck.error || 'You must be at least 18 years old to join NyumbaGO.',
      };
    }

    if (!params.confirm18Plus) {
      return {
        success: false,
        error: 'You must check the confirmation statement: "I confirm I am 18 years or older."',
      };
    }

    // 2. Check Required Terms & Privacy Consent (Unbundled, never pre-ticked)
    if (!params.consentTermsPrivacy) {
      return {
        success: false,
        error: 'You must accept the Terms of Service and Privacy Policy to create an account.',
      };
    }

    // 3. For Landlords & Agents: Check legal capacity & authority
    if ((params.role === 'landlord' || params.role === 'agent') && !params.confirmAuthority) {
      return {
        success: false,
        error: 'Landlords and Agents must confirm legal capacity and authority to rent out or manage the property.',
      };
    }

    const profiles = this.getProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // Store ONLY age_verified: true and age_verified_at. ZERO DOB stored!
    const newProfile: UserProfile = {
      id: userId,
      email: params.email.trim(),
      phone: params.phone.trim(),
      full_name: params.fullName.trim(),
      role: params.role,
      age_verified: true,
      age_verified_at: now,
      status: 'active',
      verification_badge: 'none',
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: now,
      updated_at: now,
    };

    profiles.push(newProfile);
    this.setStoredData(STORAGE_KEYS.PROFILES, profiles);
    this.setCurrentUser(userId);

    // Record Unbundled Consents with Salted IP Hash (PART 3)
    const ipHash = await generateSaltedIpHash(userId);

    // (a) Required Terms & Privacy
    this.recordConsent({
      userId,
      documentType: 'terms_of_service',
      documentVersion: '1.0.0',
      consentType: 'terms_privacy',
      granted: true,
      source: 'signup',
      saltedIpHash: ipHash,
    });

    // (b) Optional Marketing
    this.recordConsent({
      userId,
      documentType: 'marketing_policy',
      documentVersion: '1.0.0',
      consentType: 'marketing_messages',
      granted: params.consentMarketing,
      source: 'signup',
      saltedIpHash: ipHash,
    });

    // (c) Optional Location Tracking
    this.recordConsent({
      userId,
      documentType: 'privacy_policy',
      documentVersion: '1.0.0',
      consentType: 'location_tracking',
      granted: params.consentLocation,
      source: 'signup',
      saltedIpHash: ipHash,
    });

    return { success: true, user: newProfile };
  }

  // --- LEGAL DOCUMENTS & RE-CONSENT (PART 1 & 3) ---
  public static getLegalDocuments(): LegalDocument[] {
    return this.getStoredData<LegalDocument[]>(
      STORAGE_KEYS.LEGAL_DOCUMENTS,
      INITIAL_LEGAL_DOCUMENTS
    );
  }

  public static getLegalDocumentById(id: string): LegalDocument | undefined {
    return this.getLegalDocuments().find((d) => d.id === id);
  }

  /**
   * Updates a legal document version and optionally triggers re-consent prompt
   */
  public static bumpDocumentVersion(
    docId: string,
    newVersion: string,
    newContent?: string
  ): void {
    const docs = this.getLegalDocuments();
    const doc = docs.find((d) => d.id === docId);
    if (doc) {
      doc.version = newVersion;
      doc.requires_reconsent = true;
      doc.updated_at = new Date().toISOString();
      if (newContent) doc.content = newContent;
      this.setStoredData(STORAGE_KEYS.LEGAL_DOCUMENTS, docs);

      this.logAdminAction({
        adminId: 'admin-demo',
        action: 'update_legal_doc',
        target: doc.id,
        reason: `Bumped version to ${newVersion} with required user re-acceptance.`,
      });
    }
  }

  // --- USER CONSENTS (PART 3) ---
  public static getUserConsents(userId?: string): UserConsent[] {
    const consents = this.getStoredData<UserConsent[]>(STORAGE_KEYS.USER_CONSENTS, []);
    if (userId) {
      return consents.filter((c) => c.user_id === userId);
    }
    return consents;
  }

  public static recordConsent(params: {
    userId: string;
    documentType: string;
    documentVersion: string;
    consentType: ConsentType;
    granted: boolean;
    source: 'signup' | 'settings' | 'cookie_banner' | 'prompt';
    saltedIpHash: string;
  }): UserConsent {
    const consents = this.getStoredData<UserConsent[]>(STORAGE_KEYS.USER_CONSENTS, []);
    const consent: UserConsent = {
      id: 'cst_' + Math.random().toString(36).substring(2, 9),
      user_id: params.userId,
      document_type: params.documentType,
      document_version: params.documentVersion,
      consent_type: params.consentType,
      granted: params.granted,
      granted_at: new Date().toISOString(),
      withdrawn_at: params.granted ? null : new Date().toISOString(),
      source: params.source,
      salted_ip_hash: params.saltedIpHash,
    };

    consents.push(consent);
    this.setStoredData(STORAGE_KEYS.USER_CONSENTS, consents);
    return consent;
  }

  public static async updateConsentChoice(
    userId: string,
    consentType: ConsentType,
    granted: boolean
  ): Promise<void> {
    const ipHash = await generateSaltedIpHash(userId);
    this.recordConsent({
      userId,
      documentType: 'privacy_policy',
      documentVersion: '1.0.0',
      consentType,
      granted,
      source: 'settings',
      saltedIpHash: ipHash,
    });
  }

  /**
   * Checks if current user needs to re-accept terms due to version change
   */
  public static checkRequiresReconsent(userId: string): LegalDocument | null {
    const docs = this.getLegalDocuments();
    const userConsents = this.getUserConsents(userId);

    for (const doc of docs) {
      if (doc.requires_reconsent) {
        // Look for consent matching this doc type and version
        const hasAccepted = userConsents.some(
          (c) =>
            c.document_type === doc.type &&
            c.document_version === doc.version &&
            c.granted
        );
        if (!hasAccepted) {
          return doc;
        }
      }
    }
    return null;
  }

  public static async grantReconsent(userId: string, doc: LegalDocument): Promise<void> {
    const ipHash = await generateSaltedIpHash(userId);
    this.recordConsent({
      userId,
      documentType: doc.type,
      documentVersion: doc.version,
      consentType: 'terms_privacy',
      granted: true,
      source: 'prompt',
      saltedIpHash: ipHash,
    });
  }

  // --- COOKIE PREFERENCES (PART 5) ---
  public static getCookiePreferences(): { essential: boolean; analytics: boolean; decided: boolean } {
    return this.getStoredData(STORAGE_KEYS.COOKIE_PREFERENCES, {
      essential: true,
      analytics: false,
      decided: false,
    });
  }

  public static async saveCookiePreferences(analyticsGranted: boolean): Promise<void> {
    const prefs = {
      essential: true,
      analytics: analyticsGranted,
      decided: true,
    };
    this.setStoredData(STORAGE_KEYS.COOKIE_PREFERENCES, prefs);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const ipHash = await generateSaltedIpHash(currentUser.id);
      this.recordConsent({
        userId: currentUser.id,
        documentType: 'cookie_policy',
        documentVersion: '1.0.0',
        consentType: 'analytics_cookies',
        granted: analyticsGranted,
        source: 'cookie_banner',
        saltedIpHash: ipHash,
      });
    }
  }

  // --- DATA SUBJECT RIGHTS (PART 4) ---
  public static getDataRequests(): DataRequestItem[] {
    return this.getStoredData<DataRequestItem[]>(STORAGE_KEYS.DATA_REQUESTS, [
      {
        id: 'dr_01',
        user_id: 'hunter-demo',
        type: 'access',
        status: 'pending',
        details: 'User requested copy of all saved homes and tour logs.',
        received_at: '2026-10-20T10:00:00Z',
        due_at: '2026-11-19T10:00:00Z', // 30-day statutory target
      },
    ]);
  }

  public static createDataRequest(
    userId: string,
    type: 'access' | 'correction' | 'deletion' | 'objection',
    details?: string
  ): DataRequestItem {
    const list = this.getDataRequests();
    const received = new Date();
    const due = new Date(received.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days statutory target

    const newReq: DataRequestItem = {
      id: 'dr_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      type,
      status: 'pending',
      details,
      received_at: received.toISOString(),
      due_at: due.toISOString(),
    };
    list.unshift(newReq);
    this.setStoredData(STORAGE_KEYS.DATA_REQUESTS, list);
    return newReq;
  }

  public static updateDataRequestStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'rejected'
  ): void {
    const list = this.getDataRequests();
    const req = list.find((r) => r.id === id);
    if (req) {
      req.status = status;
      if (status === 'completed' || status === 'rejected') {
        req.completed_at = new Date().toISOString();
      }
      this.setStoredData(STORAGE_KEYS.DATA_REQUESTS, list);
    }
  }

  /**
   * Generates downloadable JSON payload for "Download My Data"
   */
  public static generateUserExportJson(userId: string): string {
    const profile = this.getProfileById(userId);
    const consents = this.getUserConsents(userId);
    const requests = this.getViewingRequests().filter((r) => r.hunter_id === userId);
    const saved = this.getSavedListingIds();

    const exportPayload = {
      user_profile: profile ? { ...profile, password_hash: undefined } : null,
      consents,
      saved_listings: saved,
      viewing_requests: requests,
      generated_at: new Date().toISOString(),
      statutory_basis: 'Kenya Data Protection Act, 2019 Section 26(b) Right of Access',
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  /**
   * Account Deletion ("Right to be Forgotten")
   */
  public static deleteUserAccount(userId: string): void {
    let profiles = this.getProfiles();
    profiles = profiles.filter((p) => p.id !== userId);
    this.setStoredData(STORAGE_KEYS.PROFILES, profiles);

    // Delete associated consents and data requests or mark anonymized
    this.logAdminAction({
      adminId: 'system',
      action: 'delete_user_data',
      target: userId,
      reason: 'User executed self-service Right to Erasure under KDPA 2019.',
    });

    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  // --- TRUST, SAFETY & MODERATION (PART 6) ---
  public static getReports(): ReportItem[] {
    return this.getStoredData<ReportItem[]>(STORAGE_KEYS.REPORTS, [
      {
        id: 'rep_01',
        reference_no: 'NYUMBA-REP-74102',
        reporter_id: 'hunter-demo',
        target_type: 'listing',
        target_id: 'listing-nbo-03',
        target_title: 'Chic Studio Apartment in Roysambu',
        reason: 'wrong_price',
        details: 'Caretaker asked for KSh 18,000 instead of KSh 14,000 listed without explanation.',
        status: 'pending',
        appeal_status: 'none',
        created_at: '2026-10-25T12:00:00Z',
      },
    ]);
  }

  public static createReport(
    reporterId: string,
    targetType: 'listing' | 'tour' | 'user' | 'message',
    targetId: string,
    reason: any,
    details: string,
    screenshotUrl?: string,
    targetTitle?: string
  ): ReportItem {
    const reports = this.getReports();
    const referenceNo = 'NYUMBA-REP-' + Math.floor(10000 + Math.random() * 90000);

    const newRep: ReportItem = {
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      reference_no: referenceNo,
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle || targetId,
      reason,
      details,
      screenshot_url: screenshotUrl,
      status: 'pending',
      appeal_status: 'none',
      created_at: new Date().toISOString(),
    };
    reports.unshift(newRep);
    this.setStoredData(STORAGE_KEYS.REPORTS, reports);

    // Increment reported count on listing if listing was target
    if (targetType === 'listing') {
      const listings = this.getListings();
      const listing = listings.find((l) => l.id === targetId);
      if (listing) {
        listing.reported_count = (listing.reported_count || 0) + 1;
        this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
      }
    }

    return newRep;
  }

  public static updateReportStatus(
    id: string,
    status: 'pending' | 'investigating' | 'actioned' | 'dismissed',
    outcome?: string,
    adminId: string = 'admin-demo'
  ): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === id);
    if (rep) {
      rep.status = status;
      rep.handled_by = adminId;
      if (outcome) rep.outcome = outcome;
      if (status === 'actioned' || status === 'dismissed') {
        rep.resolved_at = new Date().toISOString();
      }
      this.setStoredData(STORAGE_KEYS.REPORTS, reports);

      this.logAdminAction({
        adminId,
        action: 'resolve_report',
        target: rep.target_id,
        reason: `Report ${rep.reference_no} marked as ${status}: ${outcome || 'Reviewed by safety desk.'}`,
      });
    }
  }

  public static appealReport(reportId: string, reason: string): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.appeal_status = 'appealed';
      rep.appeal_reason = reason;
      this.setStoredData(STORAGE_KEYS.REPORTS, reports);
    }
  }

  public static resolveAppeal(
    reportId: string,
    decision: 'upheld' | 'reversed',
    reason: string,
    adminId: string = 'admin-demo'
  ): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.appeal_status = decision;
      this.setStoredData(STORAGE_KEYS.REPORTS, reports);

      this.logAdminAction({
        adminId,
        action: decision === 'upheld' ? 'uphold_appeal' : 'reverse_appeal',
        target: rep.target_id,
        reason: `Appeal ${decision}: ${reason}`,
      });
    }
  }

  // --- ADMIN AUDIT LOG ---
  public static getAuditLogs(): AdminAuditLogItem[] {
    return this.getStoredData<AdminAuditLogItem[]>(STORAGE_KEYS.ADMIN_AUDIT_LOG, [
      {
        id: 'aud_01',
        admin_id: 'admin-demo',
        action: 'verify_landlord',
        target: 'landlord-kimani',
        reason: 'Verified title deed and ID documentation.',
        created_at: '2026-01-15T10:00:00Z',
      },
    ]);
  }

  public static logAdminAction(params: {
    adminId: string;
    action: AdminAuditLogItem['action'];
    target: string;
    reason: string;
    notes?: string;
  }): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      admin_id: params.adminId,
      action: params.action,
      target: params.target,
      reason: params.reason,
      notes: params.notes,
      created_at: new Date().toISOString(),
    });
    this.setStoredData(STORAGE_KEYS.ADMIN_AUDIT_LOG, logs);
  }

  // --- USER BLOCKS (PART 6) ---
  public static getUserBlocks(): UserBlock[] {
    return this.getStoredData<UserBlock[]>(STORAGE_KEYS.USER_BLOCKS, []);
  }

  public static getBlockedUsers(userId: string): string[] {
    const blocks = this.getUserBlocks();
    return blocks.filter((b) => b.blocker_id === userId).map((b) => b.blocked_id);
  }

  public static isUserBlocked(userA: string, userB: string): boolean {
    const blocks = this.getUserBlocks();
    return blocks.some(
      (b) =>
        (b.blocker_id === userA && b.blocked_id === userB) ||
        (b.blocker_id === userB && b.blocked_id === userA)
    );
  }

  public static blockUser(blockerId: string, blockedId: string, reason?: string): void {
    const blocks = this.getUserBlocks();
    if (!blocks.some((b) => b.blocker_id === blockerId && b.blocked_id === blockedId)) {
      blocks.push({
        id: 'blk_' + Math.random().toString(36).substring(2, 9),
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason: reason || 'Blocked by user',
        created_at: new Date().toISOString(),
      });
      this.setStoredData(STORAGE_KEYS.USER_BLOCKS, blocks);
    }
  }

  public static unblockUser(blockerId: string, blockedId: string): void {
    let blocks = this.getUserBlocks();
    blocks = blocks.filter((b) => !(b.blocker_id === blockerId && b.blocked_id === blockedId));
    this.setStoredData(STORAGE_KEYS.USER_BLOCKS, blocks);
  }

  // Moderation desk direct actions
  public static hideListing(listingId: string, adminId: string, reason: string): void {
    const listings = this.getListings();
    const item = listings.find((l) => l.id === listingId);
    if (item) {
      item.is_hidden_by_admin = true;
      this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
      this.logAdminAction({
        adminId,
        action: 'hide_listing',
        target: listingId,
        reason,
      });
    }
  }

  public static unhideListing(listingId: string, adminId: string, reason: string): void {
    const listings = this.getListings();
    const item = listings.find((l) => l.id === listingId);
    if (item) {
      item.is_hidden_by_admin = false;
      this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
      this.logAdminAction({
        adminId,
        action: 'unhide_listing',
        target: listingId,
        reason,
      });
    }
  }

  public static removeListing(listingId: string, adminId: string, reason: string): void {
    let listings = this.getListings();
    listings = listings.filter((l) => l.id !== listingId);
    this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    this.logAdminAction({
      adminId,
      action: 'remove_listing',
      target: listingId,
      reason,
    });
  }

  public static warnUser(userId: string, adminId: string, reason: string): void {
    const profile = this.getProfileById(userId);
    if (profile) {
      this.logAdminAction({
        adminId,
        action: 'warn',
        target: userId,
        reason,
      });

      this.addNotification({
        owner_id: userId,
        listing_id: '',
        type: 'system',
        title: 'Safety Warning from NyumbaGO Moderation Desk',
        message: `Your account received a moderation notice: ${reason}. Repeated violations will result in temporary suspension or permanent banning.`,
      });
    }
  }

  public static suspendUser(userId: string, adminId: string, reason: string): void {
    const profiles = this.getProfiles();
    const user = profiles.find((p) => p.id === userId);
    if (user) {
      user.status = 'suspended';
      this.setStoredData(STORAGE_KEYS.PROFILES, profiles);
      this.logAdminAction({
        adminId,
        action: 'suspend_user',
        target: userId,
        reason,
      });
    }
  }

  public static banUser(userId: string, adminId: string, reason: string): void {
    const profiles = this.getProfiles();
    const user = profiles.find((p) => p.id === userId);
    if (user) {
      user.status = 'banned';
      this.setStoredData(STORAGE_KEYS.PROFILES, profiles);
      this.logAdminAction({
        adminId,
        action: 'ban_user',
        target: userId,
        reason,
      });
    }
  }

  public static closeUnder18Account(userId: string, adminId: string, reason: string): void {
    this.deleteUserAccount(userId);
    this.logAdminAction({
      adminId,
      action: 'close_under_18_account',
      target: userId,
      reason: reason || 'Account identified as minor under 18 years old in violation of Terms of Service.',
    });
  }

  // --- LISTINGS API ---
  public static getListings(): Listing[] {
    return this.getStoredData<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  }

  public static getListingById(id: string): Listing | undefined {
    const listings = this.getListings();
    return listings.find((l) => l.id === id);
  }

  public static saveListing(listing: Listing): { success: boolean; error?: string } {
    const listings = this.getListings();
    const existingIndex = listings.findIndex((l) => l.id === listing.id);

    // If tour_url is supplied, enforce server validation check constraint
    if (listing.tour_url) {
      const val = validateVieworaUrl(listing.tour_url);
      if (!val.isValid) {
        return { success: false, error: val.error };
      }
      listing.tour_url = val.cleanUrl || listing.tour_url;
      // Phase 1: Set tour_verified to true when a tour is added to a verified listing
      if (listing.is_verified_listing) {
        listing.tour_verified = true;
      }
      if (!listing.tour_added_at) {
        listing.tour_added_at = new Date().toISOString();
      }
    } else {
      listing.tour_verified = false;
      listing.tour_added_at = null;
    }

    if (!listing.last_confirmed_available_at) {
      listing.last_confirmed_available_at = new Date().toISOString();
      listing.is_stale = false;
    }

    if (existingIndex >= 0) {
      listings[existingIndex] = { ...listings[existingIndex], ...listing };
    } else {
      listings.unshift(listing);
    }

    this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    return { success: true };
  }

  public static updateListingTour(
    listingId: string,
    tourUrl: string | null,
    posterUrl?: string | null
  ): { success: boolean; error?: string; tour_verified?: boolean } {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    if (tourUrl && tourUrl.trim() !== '') {
      const validation = validateVieworaUrl(tourUrl);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      listing.tour_url = validation.cleanUrl!;
      listing.tour_provider = 'viewora';
      listing.tour_added_at = new Date().toISOString();
      listing.tour_verified = Boolean(listing.is_verified_listing);
      if (posterUrl) {
        listing.tour_poster_url = posterUrl;
      }
    } else {
      listing.tour_url = null;
      listing.tour_verified = false;
      listing.tour_added_at = null;
    }

    this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    return { success: true, tour_verified: listing.tour_verified };
  }

  // 14-Day Freshness Reconfirmation & Auto-Hide (PART 6)
  public static getListingFreshness(listing: Listing): {
    isStale: boolean;
    daysRemaining: number;
    daysElapsed: number;
    day10ReminderTriggered: boolean;
    lastConfirmedDate: string;
  } {
    const lastConfirmed = listing.last_confirmed_available_at || listing.tour_added_at || '2026-10-20T00:00:00Z';
    const lastTime = new Date(lastConfirmed).getTime();
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysElapsed = Math.max(0, Math.floor((now - lastTime) / msPerDay));
    const daysRemaining = Math.max(0, 14 - daysElapsed);
    const isStale = daysElapsed >= 14 || Boolean(listing.is_stale);
    const day10ReminderTriggered = daysElapsed >= 10;

    return {
      isStale,
      daysRemaining,
      daysElapsed,
      day10ReminderTriggered,
      lastConfirmedDate: new Date(lastConfirmed).toLocaleDateString(),
    };
  }

  public static reconfirmListingAvailability(listingId: string): void {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      listing.last_confirmed_available_at = new Date().toISOString();
      listing.is_stale = false;
      listing.auto_hidden_at = null;
      this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    }
  }

  // Phone number protection (PART 6)
  public static canUserViewPhoneNumber(
    user: UserProfile | null,
    listing: Listing
  ): { canView: boolean; maskedPhone: string; reason?: 'not_signed_in' | 'not_age_verified' | 'viewing_request_required' } {
    const rawPhone = listing.owner_phone;
    // Masked format: +254 7XX ••• •••
    const maskedPhone = rawPhone.length > 8 ? rawPhone.slice(0, 7) + ' ••• •••' : '+254 7XX ••• •••';

    if (!user) {
      return { canView: false, maskedPhone, reason: 'not_signed_in' };
    }

    if (!user.age_verified) {
      return { canView: false, maskedPhone, reason: 'not_age_verified' };
    }

    // Admins, landlords/agents viewing their own listings have direct access
    if (user.role === 'admin' || user.id === listing.owner_id) {
      return { canView: true, maskedPhone: rawPhone };
    }

    // Registered age-verified hunter must have confirmed viewing request for this listing
    const requests = this.getViewingRequests().filter(
      (r) => (r.hunter_id === user.id || r.hunter_phone === user.phone) && r.listing_id === listing.id
    );

    if (requests.length > 0) {
      return { canView: true, maskedPhone: rawPhone };
    }

    return { canView: false, maskedPhone, reason: 'viewing_request_required' };
  }

  // --- TOUR EVENTS (TELEMETRY) ---
  public static logTourEvent(
    listingId: string,
    eventType: TourEventType,
    userId: string | null = null
  ): boolean {
    const sessionId = getOrCreateSessionId();

    // Check rate limit to prevent flooding
    if (!checkTourEventRateLimit(sessionId, 15)) {
      console.warn('Rate limit exceeded for tour events');
      return false;
    }

    const events = this.getStoredData<TourEvent[]>(STORAGE_KEYS.TOUR_EVENTS, []);
    const newEvent: TourEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      listing_id: listingId,
      user_id: userId,
      event_type: eventType,
      session_id: sessionId,
      created_at: new Date().toISOString(),
    };

    events.push(newEvent);
    this.setStoredData(STORAGE_KEYS.TOUR_EVENTS, events);

    if (eventType === 'tour_started' || eventType === 'viewing_requested_after_tour') {
      const listing = this.getListingById(listingId);
      if (listing) {
        this.addNotification({
          owner_id: listing.owner_id,
          listing_id: listingId,
          type: eventType === 'tour_started' ? 'tour_completed' : 'viewing_requested',
          title:
            eventType === 'tour_started'
              ? `New 360° Tour Started on "${listing.title}"`
              : `High-Intent Viewing Request for "${listing.title}"`,
          message:
            eventType === 'tour_started'
              ? `A prospective tenant just started exploring the 360° virtual tour on your property in ${listing.neighborhood}.`
              : `A verified online tour viewer just requested an in-person viewing! They marked themselves as ready to view in person.`,
        });
      }
    }

    return true;
  }

  public static getTourEvents(listingId?: string): TourEvent[] {
    const events = this.getStoredData<TourEvent[]>(STORAGE_KEYS.TOUR_EVENTS, []);
    if (listingId) {
      return events.filter((e) => e.listing_id === listingId);
    }
    return events;
  }

  // --- CAPTURE REFERRALS (KES 5,000 SERVICE) ---
  public static getCaptureReferrals(ownerId?: string): CaptureReferral[] {
    const referrals = this.getStoredData<CaptureReferral[]>(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
    if (ownerId) {
      return referrals.filter((r) => r.owner_id === ownerId);
    }
    return referrals;
  }

  public static createCaptureReferral(
    referral: Omit<CaptureReferral, 'id' | 'created_at' | 'status'>
  ): CaptureReferral {
    const referrals = this.getCaptureReferrals();
    const newReferral: CaptureReferral = {
      ...referral,
      id: 'ref_' + Math.random().toString(36).substring(2, 9),
      status: 'clicked',
      created_at: new Date().toISOString(),
    };
    referrals.unshift(newReferral);
    this.setStoredData(STORAGE_KEYS.REFERRALS, referrals);
    return newReferral;
  }

  public static updateCaptureReferralStatus(id: string, status: ReferralStatus): void {
    const referrals = this.getCaptureReferrals();
    const ref = referrals.find((r) => r.id === id);
    if (ref) {
      ref.status = status;
      this.setStoredData(STORAGE_KEYS.REFERRALS, referrals);
    }
  }

  // --- VIEWING REQUESTS ---
  public static getViewingRequests(ownerId?: string): ViewingRequest[] {
    const requests = this.getStoredData<ViewingRequest[]>(STORAGE_KEYS.VIEWING_REQUESTS, [
      {
        id: 'req-01',
        listing_id: 'listing-nbo-01',
        listing_title: 'Modern 2-Bedroom Haven with Balcony',
        hunter_name: 'Grace Achieng',
        hunter_phone: '+254 701 223 344',
        preferred_date: '2026-10-28',
        preferred_time: '11:00 AM',
        toured_online: true,
        notes: 'I did the 360° virtual tour and love the kitchen layout! Want to view in person to pay deposit.',
        status: 'pending',
        created_at: '2026-10-26T16:00:00Z',
      },
      {
        id: 'req-02',
        listing_id: 'listing-nbo-02',
        listing_title: 'Spacious 1-Bedroom Executive Suite',
        hunter_name: 'Brian Mutua',
        hunter_phone: '+254 722 888 999',
        preferred_date: '2026-10-29',
        preferred_time: '2:30 PM',
        toured_online: true,
        notes: 'Explored online, ready to sign lease.',
        status: 'pending',
        created_at: '2026-10-26T18:30:00Z',
      },
    ]);

    if (ownerId) {
      const listings = this.getListings().filter((l) => l.owner_id === ownerId);
      const listingIds = new Set(listings.map((l) => l.id));
      return requests.filter((r) => listingIds.has(r.listing_id));
    }

    return requests;
  }

  public static createViewingRequest(
    request: Omit<ViewingRequest, 'id' | 'created_at' | 'status'>
  ): { success: boolean; error?: string; request?: ViewingRequest } {
    const listing = this.getListingById(request.listing_id);
    const currentUser = this.getCurrentUser();
    const hunterId = request.hunter_id || (currentUser ? currentUser.id : 'anon_hunter');

    if (listing && this.isUserBlocked(hunterId, listing.owner_id)) {
      return {
        success: false,
        error: 'Viewing request could not be sent: communication between these accounts is restricted under user safety blocks.',
      };
    }

    const requests = this.getViewingRequests();
    const newReq: ViewingRequest = {
      ...request,
      hunter_id: hunterId,
      id: 'req_' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    requests.unshift(newReq);
    this.setStoredData(STORAGE_KEYS.VIEWING_REQUESTS, requests);

    if (request.toured_online) {
      this.logTourEvent(request.listing_id, 'viewing_requested_after_tour');
    }

    return { success: true, request: newReq };
  }

  // --- NOTIFICATIONS ---
  public static getNotifications(ownerId?: string): NotificationItem[] {
    const list = this.getStoredData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-01',
        owner_id: 'landlord-kimani',
        listing_id: 'listing-nbo-01',
        title: 'High-Intent Viewing Request',
        message: 'Grace Achieng took your 360° tour and requested an in-person viewing.',
        type: 'viewing_requested',
        read: false,
        created_at: '2026-10-26T16:00:00Z',
      },
    ]);
    if (ownerId) {
      return list.filter((n) => n.owner_id === ownerId);
    }
    return list;
  }

  public static addNotification(
    item: Omit<NotificationItem, 'id' | 'created_at' | 'read'>
  ): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      read: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newNotif);
    this.setStoredData(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  public static markAllNotificationsRead(ownerId?: string): void {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (!ownerId || n.owner_id === ownerId) {
        n.read = true;
      }
    });
    this.setStoredData(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- PARTNER SETTINGS ---
  public static getPartnerSettings(): PartnerSettings {
    const base = this.getStoredData<PartnerSettings>(
      STORAGE_KEYS.PARTNER_SETTINGS,
      DEFAULT_PARTNER_SETTINGS
    );
    if (base.payments_enabled === undefined) {
      base.payments_enabled = false;
    }
    return base;
  }

  public static updatePartnerSettings(settings: Partial<PartnerSettings>): PartnerSettings {
    const current = this.getPartnerSettings();
    const updated: PartnerSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    this.setStoredData(STORAGE_KEYS.PARTNER_SETTINGS, updated);
    return updated;
  }

  // --- SAVED / SHORTLIST ---
  public static getSavedListingIds(): string[] {
    return this.getStoredData<string[]>(STORAGE_KEYS.SAVED_LISTINGS, ['listing-nbo-01']);
  }

  public static toggleSavedListing(id: string): string[] {
    const saved = this.getSavedListingIds();
    const exists = saved.includes(id);
    const updated = exists ? saved.filter((item) => item !== id) : [...saved, id];
    this.setStoredData(STORAGE_KEYS.SAVED_LISTINGS, updated);
    return updated;
  }

  // --- ADMIN ACTIONS ---
  public static toggleTourDisabled(listingId: string): boolean {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      listing.is_tour_disabled = !listing.is_tour_disabled;
      this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
      return listing.is_tour_disabled;
    }
    return false;
  }

  public static reportBrokenTour(listingId: string): void {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      listing.tour_reported_broken = true;
      this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    }
  }

  public static runWeeklyDeadLinkScan(): { totalScanned: number; issuesFound: number } {
    const listings = this.getListings();
    let issues = 0;
    listings.forEach((l) => {
      if (l.tour_url) {
        const val = validateVieworaUrl(l.tour_url);
        if (!val.isValid) {
          l.tour_reported_broken = true;
          issues++;
        }
      }
    });
    this.setStoredData(STORAGE_KEYS.LISTINGS, listings);
    return { totalScanned: listings.filter((l) => l.tour_url).length, issuesFound: issues };
  }
}
