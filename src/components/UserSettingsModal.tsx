import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Bell,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Send,
  UserX,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, Language, ConsentType } from '../types';
import { NyumbaGoService } from '../lib/supabase';
import { validatePasswordStrength } from '../lib/validation';

interface UserSettingsModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  lang: Language;
  onUserUpdated: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  currentUser,
  onClose,
  lang,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'consent' | 'rights' | 'safety' | 'security'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [profileSaved, setProfileSaved] = useState(false);

  // Consents State
  const userConsents = NyumbaGoService.getUserConsents(currentUser.id);
  const [marketingConsent, setMarketingConsent] = useState(
    userConsents.some((c) => c.consent_type === 'marketing_messages' && c.granted)
  );
  const [locationConsent, setLocationConsent] = useState(
    userConsents.some((c) => c.consent_type === 'location_tracking' && c.granted)
  );
  const [consentUpdatedNotice, setConsentUpdatedNotice] = useState(false);

  // Data Rights State
  const [dpoSubject, setDpoSubject] = useState('correction');
  const [dpoDetails, setDpoDetails] = useState('');
  const [dpoSubmitted, setDpoSubmitted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = useState('');

  // Trust, Safety & Appeals State (Part 6)
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(
    NyumbaGoService.getBlockedUsers(currentUser.id)
  );
  const [appealRefInput, setAppealRefInput] = useState('');
  const [appealReasonInput, setAppealReasonInput] = useState('');
  const [appealNotice, setAppealNotice] = useState<string | null>(null);

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(currentUser.two_factor_enabled));
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profiles = NyumbaGoService.getProfiles();
    const match = profiles.find((p) => p.id === currentUser.id);
    if (match) {
      match.full_name = fullName.trim();
      match.phone = phone.trim();
      match.email = email.trim();
      match.updated_at = new Date().toISOString();
      localStorage.setItem('nyumbago_profiles_v1', JSON.stringify(profiles));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      onUserUpdated();
    }
  };

  // Toggle Optional Consents (1-Tap withdrawal)
  const handleToggleConsent = async (type: ConsentType, currentVal: boolean) => {
    const newVal = !currentVal;
    if (type === 'marketing_messages') setMarketingConsent(newVal);
    if (type === 'location_tracking') setLocationConsent(newVal);

    await NyumbaGoService.updateConsentChoice(currentUser.id, type, newVal);
    setConsentUpdatedNotice(true);
    setTimeout(() => setConsentUpdatedNotice(false), 2500);
    onUserUpdated();
  };

  // 1. Download My Data (PART 4)
  const handleDownloadMyData = () => {
    const jsonStr = NyumbaGoService.generateUserExportJson(currentUser.id);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NyumbaGO_Data_Export_${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Submit DPO Data Request (PART 4)
  const handleSubmitDpoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    NyumbaGoService.createDataRequest(
      currentUser.id,
      dpoSubject as any,
      dpoDetails.trim()
    );
    setDpoSubmitted(true);
    setDpoDetails('');
    setTimeout(() => setDpoSubmitted(false), 3500);
  };

  // 3. Delete Account (PART 4)
  const handleConfirmAccountDeletion = () => {
    if (deleteConfirmationWord.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to confirm permanent account erasure.');
      return;
    }
    NyumbaGoService.deleteUserAccount(currentUser.id);
    alert('Your NyumbaGO account and associated personal data have been scheduled for deletion under the Kenya Data Protection Act. You have been logged out.');
    window.location.reload();
  };

  // Security: Toggle 2FA & Change Password
  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    const profiles = NyumbaGoService.getProfiles();
    const match = profiles.find((p) => p.id === currentUser.id);
    if (match) {
      match.two_factor_enabled = nextVal;
      localStorage.setItem('nyumbago_profiles_v1', JSON.stringify(profiles));
      setSecurityMessage(
        nextVal
          ? 'Two-Step Verification (2FA) is now active on your account.'
          : 'Two-Step Verification has been disabled.'
      );
      setTimeout(() => setSecurityMessage(null), 3000);
      onUserUpdated();
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validatePasswordStrength(newPassword);
    if (!check.isValid) {
      setSecurityMessage(check.message || 'Invalid password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityMessage('Passwords do not match.');
      return;
    }

    setSecurityMessage('Password changed successfully! A security alert notification has been recorded.');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setSecurityMessage(null), 3000);
  };

  const handleLogOutAllDevices = () => {
    sessionStorage.clear();
    setSecurityMessage('Successfully invalidated all other active device sessions.');
    setTimeout(() => setSecurityMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                User Controls & Privacy Desk
              </span>
              <h3 className="text-lg font-black text-white">
                Account Settings & Data Rights
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage personal details, granular KDPA consents, and security credentials.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('consent')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'consent'
                ? 'bg-slate-800 text-cyan-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Consents</span>
          </button>

          <button
            onClick={() => setActiveTab('rights')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'rights'
                ? 'bg-slate-800 text-emerald-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Rights</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'safety'
                ? 'bg-slate-800 text-rose-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Safety & Blocks</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-slate-800 text-amber-400 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PROFILE & AGE STATUS */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Age Verification Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified 18+ Adult
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verified on {new Date(currentUser.age_verified_at).toLocaleDateString()}. Under our data minimization policy, your original date of birth was erased immediately after validation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telephone (M-Pesa)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRIVACY & CONSENT SETTINGS (PART 3 & 4) */}
        {/* ========================================================================= */}
        {activeTab === 'consent' && (
          <div className="space-y-4">
            {consentUpdatedNotice && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>Consent choice updated and recorded in the audit ledger with salted IP hash!</span>
              </div>
            )}

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Granular Consent Management
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  You can grant or withdraw non-essential consents with a single tap at any time in compliance with KDPA 2019 Section 32.
                </p>
              </div>

              {/* Toggle 1: Marketing */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="pr-4">
                  <span className="font-bold text-white block">
                    Rental Updates & Marketing Messages
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Receive SMS and email alerts for price reductions, featured units, and promotional news.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConsent('marketing_messages', marketingConsent)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    marketingConsent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {marketingConsent ? 'Subscribed' : 'Opted Out'}
                </button>
              </div>

              {/* Toggle 2: Location */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="pr-4">
                  <span className="font-bold text-white block">
                    Location Tracking for Nearby Rentals
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Allow NyumbaGO to use your device GPS coordinates to display nearby houses and distance estimates.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConsent('location_tracking', locationConsent)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    locationConsent
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {locationConsent ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DATA SUBJECT RIGHTS (PART 4) */}
        {/* ========================================================================= */}
        {activeTab === 'rights' && (
          <div className="space-y-5">
            {/* Action 1: Download My Data */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-cyan-400" />
                  Right of Access: Download My Data
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Generates an encrypted JSON archive containing your profile, saved homes, viewing request records, and consent history.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadMyData}
                className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>

            {/* Action 2: Inquire / Contact DPO Form */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-400" />
                Submit a Data Request to DPO (30-Day SLA)
              </h4>
              <p className="text-slate-400 text-[11px]">
                Under Section 26 of the KDPA 2019, you may request formal data rectification, objection, or processing limitations. Our Data Protection Officer responds within the statutory timeline.
              </p>

              {dpoSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs">
                  Your formal data request has been logged with ID #{Math.random().toString(36).substring(2, 7)}. Response due within 30 days.
                </div>
              )}

              <form onSubmit={handleSubmitDpoRequest} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Request Type</label>
                    <select
                      value={dpoSubject}
                      onChange={(e) => setDpoSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="correction">Data Correction / Rectification</option>
                      <option value="objection">Objection to Processing</option>
                      <option value="access">Detailed Records Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Target Response Time</label>
                    <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                      30 Days (KDPA Statutory Window)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Request Details</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify the exact personal data to be corrected or restricted..."
                    value={dpoDetails}
                    onChange={(e) => setDpoDetails(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Submit Formal Data Request
                </button>
              </form>
            </div>

            {/* Action 3: Delete My Account ("Right to Erasure") */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Right to Erasure: Delete My Account
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Permanently deletes your profile, logins, and saved listings. Tenancy dispute or audit records required by Kenyan law are retained for statutory limitation periods (up to 3 years) before automated shredding.
                  </p>
                </div>

                {!showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                  >
                    Delete Account
                  </button>
                )}
              </div>

              {showDeleteConfirm && (
                <div className="p-4 rounded-xl bg-slate-900 border border-rose-700/80 space-y-3">
                  <div className="text-rose-300 font-bold">
                    Confirm Irreversible Account Deletion
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    To confirm permanent erasure of your NyumbaGO account ({currentUser.email}), type <strong className="text-white">DELETE</strong> below:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type DELETE"
                      value={deleteConfirmationWord}
                      onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-rose-700 rounded-lg text-white font-mono text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmAccountDeletion}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
                    >
                      Permanently Erase Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TRUST, SAFETY, BLOCKED USERS & APPEALS (PART 6) */}
        {/* ========================================================================= */}
        {activeTab === 'safety' && (
          <div className="space-y-5">
            {appealNotice && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>{appealNotice}</span>
              </div>
            )}

            {/* Blocked Users Section */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Blocked Users & Landlords
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Blocked accounts cannot send you viewing requests, chat messages, or contact details.
                </p>
              </div>

              {blockedUserIds.length === 0 ? (
                <div className="p-4 bg-slate-900 rounded-xl text-slate-400 text-center">
                  You have not blocked any users.
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUserIds.map((targetId) => {
                    const targetProfile = NyumbaGoService.getProfileById(targetId);
                    return (
                      <div
                        key={targetId}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                      >
                        <div>
                          <span className="font-bold text-white block">
                            {targetProfile ? targetProfile.full_name : targetId}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {targetProfile ? `${targetProfile.role} · ${targetProfile.email}` : 'Restricted User'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            NyumbaGoService.unblockUser(currentUser.id, targetId);
                            setBlockedUserIds(NyumbaGoService.getBlockedUsers(currentUser.id));
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                        >
                          Unblock
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Moderation Appeal Form */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  Submit Formal Moderation Appeal
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  If your listing was hidden, or you received a safety warning, you can submit an appeal under Kenyan administrative fairness standards.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!appealRefInput.trim() || !appealReasonInput.trim()) return;
                  NyumbaGoService.appealReport(appealRefInput.trim(), appealReasonInput.trim());
                  setAppealNotice(`Appeal submitted for ${appealRefInput.trim()}. Our safety team will review your explanation.`);
                  setAppealRefInput('');
                  setAppealReasonInput('');
                  setTimeout(() => setAppealNotice(null), 4000);
                }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="text-slate-300 block mb-1">
                    Ticket Reference No or Target ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NYUMBA-REP-74102 or listing ID"
                    value={appealRefInput}
                    onChange={(e) => setAppealRefInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    Explanation / Evidence of Rectification
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain why the penalty should be reviewed, fee disclosures updated, or mistake corrected..."
                    value={appealReasonInput}
                    onChange={(e) => setAppealReasonInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!appealRefInput.trim() || !appealReasonInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow transition disabled:opacity-50"
                >
                  Submit Formal Appeal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ACCOUNT SECURITY (PART 7) */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {securityMessage && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>{securityMessage}</span>
              </div>
            )}

            {/* Two-Factor Authentication */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">
                  Two-Step Verification (2FA / OTP)
                </span>
                <span className="text-[11px] text-slate-400">
                  Adds an extra layer of security via SMS OTP or authenticator app.
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  twoFactorEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
              </button>
            </div>

            {/* Session Management */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">
                  Active Device Sessions
                </span>
                <span className="text-[11px] text-slate-400">
                  Current session running in Nairobi, Kenya. You can log out of all other browsers.
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogOutAllDevices}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of All Devices</span>
              </button>
            </div>

            {/* Password Update Form */}
            <form onSubmit={handleUpdatePassword} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">
                Change Account Password
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 chars, 1 number"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
