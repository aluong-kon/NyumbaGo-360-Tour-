/**
 * NyumbaGO Types & Data Models
 * Supporting Kenya-wide rental house hunting & Viewora 360° tour integration
 * and Legal, Safety & Compliance Layer (Kenya Data Protection Act, 2019)
 */

export type UserRole = 'hunter' | 'landlord' | 'agent' | 'admin';
export type Language = 'en' | 'sw';

export type PropertyType =
  | 'Apartment'
  | 'Bedsitter'
  | 'Townhouse'
  | 'Maisonette'
  | 'Studio'
  | 'Villa';

export type KenyanCity = 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nakuru' | 'Eldoret';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  x: number; // percentage coordinate for visual Kenya map
  y: number; // percentage coordinate for visual Kenya map
}

export interface Listing {
  id: string;
  title: string;
  title_sw?: string;
  description: string;
  description_sw?: string;
  rent_ksh: number;
  deposit_ksh: number;
  bedrooms: number; // 0 for bedsitter / studio
  bathrooms: number;
  property_type: PropertyType;
  city: KenyanCity;
  neighborhood: string;
  location_coordinates: LocationCoordinates;
  photos: string[];
  amenities: string[];
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  is_verified_listing: boolean;
  featured?: boolean;

  // Viewora 360° Virtual Tour Integration Fields (Phase 1)
  tour_url: string | null;
  tour_provider: 'viewora';
  tour_verified: boolean;
  tour_added_at: string | null;
  tour_poster_url: string | null;
  is_tour_disabled?: boolean;
  tour_reported_broken?: boolean;

  // Freshness & Moderation (Compliance Layer)
  last_confirmed_available_at?: string;
  is_stale?: boolean;
  auto_hidden_at?: string | null;
  is_hidden_by_admin?: boolean;
  reported_count?: number;
}

export type TourEventType =
  | 'tour_started'
  | 'tour_opened_new_tab'
  | 'tour_fallback_shown'
  | 'viewing_requested_after_tour';

export interface TourEvent {
  id: string;
  listing_id: string;
  user_id: string | null;
  event_type: TourEventType;
  session_id: string;
  created_at: string;
}

export type ReferralStatus = 'clicked' | 'booked' | 'completed';

export interface CaptureReferral {
  id: string;
  listing_id: string;
  listing_title: string;
  owner_id: string;
  area: string;
  property_type: string;
  preferred_date: string;
  notes?: string;
  status: ReferralStatus;
  created_at: string;
}

export interface ViewingRequest {
  id: string;
  listing_id: string;
  listing_title: string;
  hunter_id?: string;
  hunter_name: string;
  hunter_phone: string;
  preferred_date: string;
  preferred_time: string;
  toured_online: boolean; // "I toured online, I am ready to view in person"
  notes?: string;
  status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  owner_id: string;
  listing_id: string;
  title: string;
  message: string;
  type: 'tour_completed' | 'viewing_requested' | 'system';
  read: boolean;
  created_at: string;
}

export interface PartnerSettings {
  id: string;
  partner_discount_enabled: boolean;
  partner_discount_code: string;
  partner_discount_percentage: number;
  partner_branding_enabled: boolean; // default off until Viewora written agreement
  viewora_api_enabled: boolean;       // default off for Phase 3 API features
  payments_enabled: boolean;          // default off until M-Pesa provider setup
  updated_at: string;
}

export interface FilterState {
  budget_ksh: number;
  city: KenyanCity | 'All';
  neighborhood: string;
  bedrooms: number | 'all';
  has_tour_only: boolean;
  view_mode: 'list' | 'map';
  sort_by: 'budget_fit' | 'price_low_high' | 'price_high_low' | 'newest';
}

// =========================================================================
// LEGAL, SAFETY & COMPLIANCE DATA MODELS (PARTS 1 - 8)
// =========================================================================

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  age_verified: boolean;      // Stores ONLY boolean verification status
  age_verified_at: string;     // Timestamp of adult age verification. NEVER DOB!
  status: 'active' | 'suspended' | 'banned';
  verification_badge: 'none' | 'verified_landlord' | 'verified_agent';
  verified_at?: string | null;
  two_factor_enabled?: boolean;
  failed_login_attempts: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  type: string;
  version: string;
  title: string;
  title_sw?: string;
  content: string;
  summary_en: string;
  summary_sw: string;
  effective_date: string;
  is_current: boolean;
  requires_reconsent: boolean;
  updated_at: string;
}

export type ConsentType =
  | 'terms_privacy'
  | 'marketing_messages'
  | 'location_tracking'
  | 'essential_cookies'
  | 'analytics_cookies';

export interface UserConsent {
  id: string;
  user_id: string;
  document_type: string;
  document_version: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  withdrawn_at: string | null;
  source: 'signup' | 'settings' | 'cookie_banner' | 'prompt';
  salted_ip_hash: string; // SHA-256 with server salt, NEVER plain text IP
}

export type ReportReason =
  | 'scam'
  | 'fake_unavailable'
  | 'wrong_price'
  | 'offensive'
  | 'discrimination'
  | 'under_18'
  | 'other';

export interface ReportItem {
  id: string;
  reference_no: string;
  reporter_id: string;
  target_type: 'listing' | 'tour' | 'user' | 'message';
  target_id: string;
  target_title?: string;
  reason: ReportReason;
  details: string;
  screenshot_url?: string;
  status: 'pending' | 'investigating' | 'actioned' | 'dismissed';
  handled_by?: string;
  outcome?: string;
  appeal_status: 'none' | 'appealed' | 'upheld' | 'reversed';
  appeal_reason?: string;
  created_at: string;
  resolved_at?: string;
}

export type DataRequestType = 'access' | 'correction' | 'deletion' | 'objection';

export interface DataRequestItem {
  id: string;
  user_id: string;
  type: DataRequestType;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  details?: string;
  received_at: string;
  due_at: string; // 30 days statutory target
  completed_at?: string;
}

export interface AdminAuditLogItem {
  id: string;
  admin_id: string;
  action:
    | 'warn'
    | 'hide_listing'
    | 'unhide_listing'
    | 'remove_listing'
    | 'suspend_user'
    | 'ban_user'
    | 'close_under_18_account'
    | 'resolve_report'
    | 'uphold_appeal'
    | 'reverse_appeal'
    | 'verify_landlord'
    | 'verify_agent'
    | 'update_legal_doc'
    | 'delete_user_data';
  target: string;
  reason: string;
  notes?: string;
  created_at: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason?: string;
  created_at: string;
}

// Phase 3 Viewora API Mock Interfaces
export interface VieworaRoomMetadata {
  id: string;
  name: string;
  thumbnail_url: string;
  hotspots_count: number;
}

export interface VieworaTourMetadata {
  tour_id: string;
  title: string;
  cover_url: string;
  rooms: VieworaRoomMetadata[];
  captured_at: string;
}

export interface VieworaLeadPayload {
  lead_id: string;
  source: 'viewora_embed';
  listing_id: string;
  name: string;
  phone: string;
  email?: string;
  timestamp: string;
}
