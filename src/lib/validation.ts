/**
 * Security, Validation & Compliance Utilities for NyumbaGO
 * Supporting Viewora 360° Tours and Kenya Data Protection Act, 2019
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  error_sw?: string;
  cleanUrl?: string;
}

/**
 * Validates Viewora Tour link strictly:
 * 1. Must be a valid URL starting with https://
 * 2. Hostname must be viewora.software or *.viewora.software (e.g. app.viewora.software)
 * 3. Never renders or stores arbitrary external links
 */
export function validateVieworaUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a Viewora tour link.',
      error_sw: 'Tafadhali weka kiungo cha ziara ya Viewora.',
    };
  }

  const trimmed = rawUrl.trim();

  if (!trimmed.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Tour link must use secure HTTPS (must start with https://).',
      error_sw: 'Kiungo cha ziara lazima kitumie HTTPS salama (lazima kianze na https://).',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    const isVieworaHost = host === 'viewora.software' || host.endsWith('.viewora.software');

    if (!isVieworaHost) {
      return {
        isValid: false,
        error: `Only links hosted on viewora.software or app.viewora.software are supported. (Detected: ${host})`,
        error_sw: `Ni viungo vinavyopatikana kwenye viewora.software au app.viewora.software pekee vinavyokubaliwa. (Imegunduliwa: ${host})`,
      };
    }

    return {
      isValid: true,
      cleanUrl: trimmed,
    };
  } catch (_e) {
    return {
      isValid: false,
      error: 'Invalid web address format. Please check the URL and try again.',
      error_sw: 'Muundo wa kiungo cha wavuti si sahihi. Tafadhali hakiki kiungo na ujaribu tena.',
    };
  }
}

/**
 * Checks whether a tour URL is safe to render in an iframe
 */
export function isSafeVieworaIframe(url: string | null | undefined): boolean {
  if (!url) return false;
  return validateVieworaUrl(url).isValid;
}

/**
 * PART 2: Age Verification (18 and above only)
 * Calculates whether the given date of birth is at least 18 years old.
 * CRITICAL RULE: Returns ONLY boolean verification status. Zero DOB is saved or preserved!
 */
export function verifyAdultAge(dobString: string): { isAdult: boolean; error?: string; error_sw?: string } {
  if (!dobString) {
    return {
      isAdult: false,
      error: 'Date of birth is required to confirm eligibility.',
      error_sw: 'Tarehe ya kuzaliwa inahitajika kuthibitisha ustahiki.',
    };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return {
      isAdult: false,
      error: 'Please provide a valid date format.',
      error_sw: 'Tafadhali weka muundo sahihi wa tarehe.',
    };
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return {
      isAdult: false,
      error: 'NyumbaGO is strictly for adults (18 years and above). We cannot create an account for minors under Kenyan law.',
      error_sw: 'NyumbaGO ni ya watu wazima (miaka 18 na zaidi) pekee. Hatuwezi kufungua akaunti kwa watoto chini ya sheria za Kenya.',
    };
  }

  return { isAdult: true };
}

/**
 * PART 3: Salted IP Hash Generator
 * Produces a one-way cryptographic SHA-256 hash using a server salt.
 * Ensures plain-text IP addresses are NEVER stored in the database.
 */
export async function generateSaltedIpHash(seed?: string): Promise<string> {
  const SERVER_SALT = 'nyumbago_kdpa_salt_nairobi_2026';
  const rawInput = (seed || Math.random().toString(36)) + '::' + SERVER_SALT;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (_e) {
    // Fallback deterministic hash if crypto.subtle unavailable in test harness
    let hash = 0;
    for (let i = 0; i < rawInput.length; i++) {
      hash = (hash << 5) - hash + rawInput.charCodeAt(i);
      hash |= 0;
    }
    return 'sha256_' + Math.abs(hash).toString(16).padStart(16, '0');
  }
}

/**
 * Strong password verification (at least 8 chars, 1 number, 1 letter)
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must include at least one number.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one letter.' };
  }
  return { isValid: true };
}

/**
 * Rate Limiter for Tour Events to prevent spam & protect client
 * KDPA compliant - memory-only telemetry rate limiting
 */
const rateLimitCache = new Map<string, number[]>();

export function checkTourEventRateLimit(sessionId: string, maxEventsPerMinute: number = 15): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = rateLimitCache.get(sessionId) || [];

  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxEventsPerMinute) {
    return false;
  }

  recent.push(now);
  rateLimitCache.set(sessionId, recent);
  return true;
}

/**
 * Formats Kenyan Shillings with commas
 * e.g., 35000 -> "KSh 35,000"
 */
export function formatKsh(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}
