import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch {
      // AuthContext exposes the API error beside the form.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to MedCare</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Access your secure hospital workspace.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700" placeholder="you@hospital.com" /></label>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700" placeholder="Enter your password" /></label>
      <button disabled={submitting} className="w-full rounded-xl bg-blue-600 p-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in securely'}</button>
    </form>
  );
}