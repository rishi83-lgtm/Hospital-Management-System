import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export default function Register() {
  const { register, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
    } catch {
      // AuthContext exposes the API error beside the form.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Patient registration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your account will securely access your appointments and records.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Full name<input required name="name" autoComplete="name" value={form.name} onChange={update} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700" /></label>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email<input required type="email" name="email" autoComplete="email" value={form.email} onChange={update} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700" /></label>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Phone<input name="phone" autoComplete="tel" value={form.phone} onChange={update} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700" /></label>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password (at least 8 characters)<input required minLength={8} autoComplete="new-password" type="password" name="password" value={form.password} onChange={update} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700" /></label>
      <button disabled={submitting} className="w-full rounded-xl bg-blue-600 p-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Creating account...' : 'Create patient account'}</button>
    </form>
  );
}