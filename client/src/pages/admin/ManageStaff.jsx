import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import { createReceptionist, getStaff } from '../../services/staffService.js';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStaff = useCallback(async () => {
    try {
      setStaff(await getStaff());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createReceptionist(form);
      setForm(emptyForm);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Administration</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Manage hospital staff</h1>
        <p className="mt-2 text-sm text-slate-500">Create receptionist accounts and review active clinical staff.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2"><UserPlus size={19} className="text-blue-600" /><h2 className="font-bold">Create receptionist account</h2></div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <label className="block text-sm font-medium">Full name<input required name="name" autoComplete="name" value={form.name} onChange={update} className="mt-1 w-full rounded-lg border p-2.5 dark:bg-slate-700" /></label>
          <label className="block text-sm font-medium">Email<input required type="email" name="email" autoComplete="email" value={form.email} onChange={update} className="mt-1 w-full rounded-lg border p-2.5 dark:bg-slate-700" /></label>
          <label className="block text-sm font-medium">Phone<input name="phone" value={form.phone} onChange={update} className="mt-1 w-full rounded-lg border p-2.5 dark:bg-slate-700" /></label>
          <label className="block text-sm font-medium">Temporary password<input required minLength={8} type="password" name="password" autoComplete="new-password" value={form.password} onChange={update} className="mt-1 w-full rounded-lg border p-2.5 dark:bg-slate-700" /></label>
          <button disabled={saving} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create receptionist account'}</button>
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2"><Users size={19} className="text-blue-600" /><h2 className="font-bold">Active staff</h2></div>
          {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading staff...</p> : staff.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {staff.map(member => <div key={member._id || member.id} className="flex items-center justify-between gap-3 py-4">
                <div><p className="font-semibold">{member.name}</p><p className="text-sm text-slate-500">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p></div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><ShieldCheck size={13} />{member.role}</span>
              </div>)}
            </div>
          ) : <p className="py-8 text-center text-sm text-slate-500">No active staff accounts yet.</p>}
        </div>
      </div>
      <p className="rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">Doctor accounts are created from the Doctors roster, where each account is connected to its clinical profile and department.</p>
    </section>
  );
}