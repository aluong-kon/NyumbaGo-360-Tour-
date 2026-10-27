import { realSupabase, isRealSupabaseConfigured } from './supabase';
import type { UserProfile, UserRole } from '../types';

const PROFILE_CACHE = 'nyumbago_profiles_v1';
const CURRENT_USER_KEY = 'nyumbago_current_user_id_v1';

type AuthProfileRow = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  age_verified: boolean;
  age_verified_at: string | null;
  status: 'active' | 'suspended' | 'banned';
  verification_badge: 'none' | 'verified_landlord' | 'verified_agent';
  verified_at?: string | null;
  two_factor_enabled?: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
};

function cacheProfile(row: AuthProfileRow): UserProfile {
  const profile: UserProfile = {
    id: row.id,
    email: row.email || '',
    phone: row.phone || '',
    full_name: row.full_name || row.email || 'NyumbaGO member',
    role: row.role,
    age_verified: Boolean(row.age_verified),
    age_verified_at: row.age_verified_at || '',
    status: row.status || 'active',
    verification_badge: row.verification_badge || 'none',
    verified_at: row.verified_at || null,
    two_factor_enabled: Boolean(row.two_factor_enabled),
    failed_login_attempts: row.failed_login_attempts || 0,
    locked_until: row.locked_until || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  const profiles = JSON.parse(localStorage.getItem(PROFILE_CACHE) || '[]') as UserProfile[];
  localStorage.setItem(PROFILE_CACHE, JSON.stringify([...profiles.filter((p) => p.id !== profile.id), profile]));
  localStorage.setItem(CURRENT_USER_KEY, profile.id);
  return profile;
}

async function loadProfile(userId: string): Promise<UserProfile | null> {
  if (!realSupabase) return null;
  const { data, error } = await realSupabase
    .from('profiles')
    .select('id,email,phone,full_name,role,age_verified,age_verified_at,status,verification_badge,verified_at,two_factor_enabled,failed_login_attempts,locked_until,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return cacheProfile(data as AuthProfileRow);
}

export async function restoreAuthSession(): Promise<UserProfile | null> {
  if (!isRealSupabaseConfigured || !realSupabase) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
  const { data, error } = await realSupabase.auth.getUser();
  if (error || !data.user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
  return loadProfile(data.user.id);
}

export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  if (!isRealSupabaseConfigured || !realSupabase) {
    return { success: false, error: 'Authentication is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the deployment environment.' };
  }
  const { data, error } = await realSupabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return { success: false, error: error?.message || 'Unable to sign in.' };
  const profile = await loadProfile(data.user.id);
  if (!profile) {
    await realSupabase.auth.signOut();
    return { success: false, error: 'Your account profile is not ready. Confirm your email or contact support.' };
  }
  if (profile.status !== 'active') {
    await realSupabase.auth.signOut();
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: false, error: 'This account is not active. Contact NyumbaGO support.' };
  }
  return { success: true, user: profile };
}

export async function signOutNyumbaGo(): Promise<void> {
  if (realSupabase) await realSupabase.auth.signOut();
  localStorage.removeItem(CURRENT_USER_KEY);
}

export async function registerWithSupabase(params: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
  ageVerified: boolean;
}): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> {
  if (!isRealSupabaseConfigured || !realSupabase) {
    return { success: false, error: 'Registration requires a configured Supabase project. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before creating real accounts.' };
  }
  const { data, error } = await realSupabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: params.fullName.trim(),
        phone: params.phone.trim(),
        requested_role: params.role,
        age_verified: params.ageVerified,
        age_verified_at: params.ageVerified ? new Date().toISOString() : null,
      },
    },
  });
  if (error) return { success: false, error: error.message };
  if (data.session && data.user) {
    const profile = await loadProfile(data.user.id);
    if (!profile) {
      return { success: false, error: 'Your account was created, but its profile is not ready yet. Please sign in again shortly.' };
    }
    return { success: true };
  }
  return { success: true, requiresEmailConfirmation: true };
}
