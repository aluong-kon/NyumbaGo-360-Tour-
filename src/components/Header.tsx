import React, { useState } from 'react';
import {
  Compass,
  Globe,
  Bookmark,
  Bell,
  Code2,
  ShieldCheck,
  UserPlus,
  Scale,
  LogOut,
  Lock,
} from 'lucide-react';
import { UserRole, Language, NotificationItem, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { NyumbaGoService } from '../lib/supabase';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  savedCount: number;
  onOpenCompare: () => void;
  onOpenDevDocs: () => void;
  onOpenPrivacy: () => void;
  onOpenSignup: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenLegalDocs: (docId?: string) => void;
  onOpenUserSettings: () => void;
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
  currentUser: UserProfile | null;
  onUserChanged: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  savedCount,
  onOpenCompare,
  onOpenDevDocs,
  onOpenPrivacy,
  onOpenSignup,
  onOpenAuth,
  onSignOut,
  onOpenLegalDocs,
  onOpenUserSettings,
  notifications,
  onRefreshNotifications,
  currentUser,
  onUserChanged,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = translations[lang];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    NyumbaGoService.markAllNotificationsRead();
    onRefreshNotifications();
  };



  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white font-black shadow-md shadow-emerald-900/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Nyumba<span className="text-emerald-400">GO</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  Viewora 360°
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Kenya-wide Rentals · 18+ Verified · KDPA Compliant
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {!currentUser && <button onClick={onOpenAuth} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"><Lock className="h-3.5 w-3.5" />Sign in</button>}

            {/* 18+ Signup Button */}
            <button
              onClick={onOpenSignup}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-md transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register (18+)</span>
            </button>

            {/* Legal Center Quick Button */}
            <button
              onClick={() => onOpenLegalDocs('terms-of-service')}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition"
              title="Legal Policies & Terms (Kenya Data Protection Act 2019)"
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Saved Shortlist button */}
            <button
              onClick={onOpenCompare}
              className="relative p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center gap-1 text-xs"
              title={t.savedListings}
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              {savedCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-lg text-xs ${
                            notif.read
                              ? 'bg-slate-800/40 text-slate-400'
                              : 'bg-emerald-950/40 border border-emerald-800/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-emerald-400">{notif.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(notif.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              title="Switch Language / Badilisha Lugha"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Current User Pill / Profile */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-500/40">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[90px]">
                    {currentUser.full_name}
                  </span>
                  {currentUser.age_verified && (
                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded text-[9px] font-black border border-emerald-600">
                      18+
                    </span>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2">
                    <div className="pb-2 border-b border-slate-800">
                      <div className="font-bold text-white">{currentUser.full_name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                        Role: {currentUser.role.toUpperCase()} · Verified Adult (18+)
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenUserSettings();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-950/70 font-semibold"
                    >
                      Account & Privacy Settings
                    </button>

                    <button
                      onClick={() => {
                        onOpenPrivacy();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Privacy & KDPA Notice
                    </button>

                    <button
                      onClick={() => {
                        onOpenLegalDocs('privacy-policy');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Legal Documents Center
                    </button>

                    <button onClick={() => { onSignOut(); setShowUserMenu(false); }} className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left text-rose-300 hover:bg-slate-800"><LogOut className="h-3.5 w-3.5" />Sign out securely</button>
                  </div>
                )}
              </div>
            )}

            {/* Developer Docs & Migration SQL Modal Trigger */}
            <button
              onClick={onOpenDevDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-semibold transition"
              title="Supabase Migration, Checklist & Integration Docs"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dev & SQL</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
