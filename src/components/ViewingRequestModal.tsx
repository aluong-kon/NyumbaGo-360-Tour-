import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, User, CheckCircle, Video, ShieldCheck } from 'lucide-react';
import { Listing, Language } from '../types';
import { translations } from '../lib/i18n';
import { NyumbaGoService } from '../lib/supabase';
import { formatKsh } from '../lib/validation';

interface ViewingRequestModalProps {
  listing: Listing;
  initialTouredOnline?: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
}

export const ViewingRequestModal: React.FC<ViewingRequestModalProps> = ({
  listing,
  initialTouredOnline = false,
  onClose,
  lang,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [touredOnline, setTouredOnline] = useState(initialTouredOnline);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }

    const res = NyumbaGoService.createViewingRequest({
      listing_id: listing.id,
      listing_title: listing.title,
      hunter_name: name.trim(),
      hunter_phone: phone.trim(),
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      toured_online: touredOnline,
      notes: notes.trim(),
    });

    if (!res.success) {
      setError(res.error || 'Failed to submit viewing request.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {t.requestViewingTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {listing.title} · {formatKsh(listing.rent_ksh)}/mo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Scam Safeguard Banner (Part 6 Requirement) */}
        <div className="bg-amber-950/80 border border-amber-600/70 p-3.5 rounded-2xl flex items-start gap-3 shadow-md">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-100 block font-bold mb-0.5">Safety & Anti-Fraud Notice:</strong>
            Never pay a deposit or booking fee before viewing the property in person and confirming the landlord's identity. NyumbaGO does not hold money for rentals.
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Request Sent Successfully!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {listing.owner_name} has received your viewing request with your contact details.
              {touredOnline && ' Your "Toured Online" priority status has been marked.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Tour-First Priority Viewing Option (Phase 2 Requirement) */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800 to-cyan-950/60 border border-cyan-500/50 p-4 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={touredOnline}
                  onChange={(e) => setTouredOnline(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    {t.touredOnlineOption}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {t.touredOnlineNotice}
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.yourName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dennis Mutiso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.yourPhone}
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
                  {t.preferredDate}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.preferredTime}
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>09:00 AM</option>
                    <option>10:30 AM</option>
                    <option>11:00 AM</option>
                    <option>01:30 PM</option>
                    <option>03:00 PM</option>
                    <option>04:30 PM</option>
                    <option>05:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Specific questions about parking, water rationing, or pet policy..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.submitViewingRequest}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
