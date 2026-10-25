import { Calendar, Clock, UserRound } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{appointment.department}</p>
          <h3 className="mt-1 font-bold text-slate-800 dark:text-white">{appointment.doctorName}</h3>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{appointment.status}</span>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><UserRound size={16} />{appointment.patientName}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Calendar size={16} />{appointment.date}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Clock size={16} />{appointment.time}</p>
    </article>
  );
}