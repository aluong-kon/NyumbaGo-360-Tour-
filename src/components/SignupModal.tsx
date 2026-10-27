import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Building2,
  Compass,
  Briefcase,
  FileText,
} from 'lucide-react';
import { UserRole, Language } from '../types';
import { translations } from '../lib/i18n';
import { verifyAdultAge, validatePasswordStrength } from '../lib/validation';
import { NyumbaGoService } from '../lib/supabase';

interface SignupModalProps {
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
  onOpenLegalDoc: (docId: string) => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  onClose,
  lang,
  onSuccess,
  onOpenLegalDoc,
}) => {
  const [role, setRole] = useState<'hunter' | 'landlord' | 'agent'>('hunter');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Consent Checkboxes (ALL UNTICKED BY DEFAULT - CRITICAL REQUIREMENT)
  const [confirm18Plus, setConfirm18Plus] = useState(false);
  const [confirmAuthority, setConfirmAuthority] = useState(false);
  const [consentTermsPrivacy, setConsentTermsPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentLocation, setConsentLocation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [under18Blocked, setUnder18Blocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  // Age check as soon as DOB is entered
  const handleDobChange = (val: string) => {
    setDob(val);
    setError(null);
    setUnder18Blocked(false);

    if (val) {
      const check = verifyAdultAge(val);
      if (!check.isAdult) {
        setUnder18Blocked(true);
        setError(lang === 'sw' && check.error_sw ? check.error_sw : check.error!);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Double check Age Restriction (PART 2)
    const check = verifyAdultAge(dob);
    if (!check.isAdult) {
      setUnder18Blocked(true);
      setError(check.error || 'You must be at least 18 years old to join NyumbaGO.');
      return;
    }

    if (!confirm18Plus) {
      setError('You must check the confirmation statement: "I confirm I am 18 years or older."');
      return;
    }

    // 2. Check Required Terms & Privacy
    if (!consentTermsPrivacy) {
      setError('You must read and accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    // 3. For Landlord & Agent: Confirm legal capacity
    if ((role === 'landlord' || role === 'agent') && !confirmAuthority) {
      setError('You must confirm legal authority and capacity to list properties.');
      return;
    }

    // 4. Password validation
    const passCheck = validatePasswordStrength(password);
    if (!passCheck.isValid) {
      setError(passCheck.message || 'Invalid password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await NyumbaGoService.signUpUser({
        fullName,
        email,
        phone,
        dob, // DOB used for check, then IMMEDIATELY DISCARDED by service
        role,
        confirm18Plus,
        confirmAuthority,
        consentTermsPrivacy,
        consentMarketing,
        consentLocation,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Kenya Rental Marketplace · 18+ Only
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Create Your NyumbaGO Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('hunter')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'hunter'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Hunter</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('landlord')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'landlord'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Landlord</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'agent'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Under 18 Block Notice */}
          {under18Blocked && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-600 text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Age Verification Requirement (18+)
              </div>
              <p>
                Under the Laws of Kenya and our platform policy, NyumbaGO is exclusively for adults. No account can be created for anyone under 18 years. Your date of birth has not been saved.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Mutiso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                M-Pesa / Mobile Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="dennis@example.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* PART 2: Date of Birth Input for 18+ Verification */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Birth (18+ Adult Gate)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-800 border rounded-xl text-xs text-white focus:outline-none transition ${
                    under18Blocked
                      ? 'border-rose-500 ring-2 ring-rose-500/40'
                      : 'border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Verified once. We store only verification status, never your full DOB.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PART 2 & PART 3: MANDATORY STATEMENTS & UNTICKED CONSENTS */}
          {/* ========================================================================= */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 pt-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Legal Declarations & Consents
            </h4>

            {/* Statement 1: Required 18+ Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirm18Plus}
                onChange={(e) => setConfirm18Plus(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span className="text-xs text-slate-200 font-semibold">
                I confirm I am 18 years or older. <span className="text-rose-400">*</span>
              </span>
            </label>

            {/* Statement 2: Required Landlord/Agent Legal Capacity */}
            {(role === 'landlord' || role === 'agent') && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmAuthority}
                  onChange={(e) => setConfirmAuthority(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
                <span className="text-xs text-slate-200 font-semibold">
                  I confirm I have full legal capacity and lawful authority (or written owner mandate) to rent out or manage properties under Kenyan law. <span className="text-rose-400">*</span>
                </span>
              </label>
            )}

            {/* Checkbox (a): Required Terms & Privacy (Unticked by default) */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentTermsPrivacy}
                onChange={(e) => setConsentTermsPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span className="text-xs text-slate-300">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc('terms-of-service')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc('privacy-policy')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
                . <span className="text-rose-400">*</span>
              </span>
            </label>

            {/* Checkbox (b): Optional Marketing (Unticked by default) */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span className="text-xs text-slate-400">
                (Optional) Send me rental price updates, new listings matching my budget, and platform announcements.
              </span>
            </label>

            {/* Checkbox (c): Optional Location (Unticked by default) */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentLocation}
                onChange={(e) => setConsentLocation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span className="text-xs text-slate-400">
                (Optional) Use my location to show nearby homes and calculate commute times.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || under18Blocked}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 disabled:opacity-50 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete 18+ Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
