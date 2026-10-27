import React, { useState } from 'react';
import { AlertCircle, Compass, Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { signInWithEmail } from '../lib/auth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onRegister: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmail(email, password);
      if (!result.success) {
        setError(result.error || 'Unable to sign in.');
        return;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md space-y-5 rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <button onClick={onClose} aria-label="Close sign in" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600"><Compass className="h-6 w-6" /></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Welcome back</p><h2 className="text-xl font-black text-white">Sign in to NyumbaGO</h2></div>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">Sign in to save homes, request viewings and manage your account.</p>
        {error && <div role="alert" className="flex gap-2 rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">Email address
            <span className="relative mt-1 block"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500" /></span>
          </label>
          <label className="block text-xs font-semibold text-slate-300">Password
            <span className="relative mt-1 block"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-11 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
          </label>
          <button disabled={loading} type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 text-sm font-extrabold text-white transition hover:from-emerald-500 hover:to-teal-400 disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
        <p className="text-center text-sm text-slate-400">New to NyumbaGO? <button onClick={onRegister} className="font-bold text-cyan-300 hover:text-cyan-200">Create an account</button></p>
      </div>
    </div>
  );
};
