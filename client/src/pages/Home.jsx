import { Activity, CalendarCheck, HeartPulse, Stethoscope } from 'lucide-react';

const highlights = [
  { icon: CalendarCheck, title: 'Appointments', text: 'Coordinate visits and keep schedules up to date.' },
  { icon: Stethoscope, title: 'Care teams', text: 'Connect patients with the right specialists.' },
  { icon: Activity, title: 'Clinical records', text: 'Keep important care information organized.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800 dark:bg-slate-900 dark:text-white">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <HeartPulse size={18} /> MedCare Hospital
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Healthcare operations, in one place.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Manage appointments, teams, patients, and clinical workflows through a clear, role-based dashboard.</p>
          <a className="mt-8 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700" href="/dashboard">Open dashboard</a>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <Icon className="text-blue-600" size={24} />
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}