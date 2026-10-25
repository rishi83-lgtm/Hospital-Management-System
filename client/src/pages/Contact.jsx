export default function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact the hospital</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">For appointments and general enquiries, contact the MedCare reception team.</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p><strong>Reception:</strong> +1 (555) 010-2020</p>
        <p><strong>Email:</strong> hello@medcare.example</p>
        <p><strong>Hours:</strong> Monday–Friday, 8:00 AM–6:00 PM</p>
      </div>
    </main>
  );
}