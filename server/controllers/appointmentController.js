import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export async function listAppointments(req, res) {
  const filter = {};
  if (req.user.role === 'Patient') {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json({ appointments: [] });
    filter.patient = patient.id;
  } else if (req.user.role === 'Doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.json({ appointments: [] });
    filter.doctor = doctor.id;
  }
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
    .populate('department', 'name')
    .sort({ date: 1, time: 1 });
  return res.json({ appointments });
}

export async function createAppointment(req, res) {
  const { doctor: doctorId, department, date, time, reason } = req.body;
  const patient = req.user.role === 'Patient'
    ? await Patient.findOne({ user: req.user.id })
    : await Patient.findById(req.body.patient);
  if (!patient) return res.status(404).json({ message: 'Patient profile not found.' });

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || doctor.status !== 'Active') {
    return res.status(404).json({ message: 'The selected doctor is not available.' });
  }
  if (department && !doctor.department.equals(department)) {
    return res.status(400).json({ message: 'The selected doctor does not belong to that department.' });
  }
  const today = new Date();
  const todayKey = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  const appointmentDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00.000Z`)
    : new Date(Number.NaN);
  if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.toISOString().slice(0, 10) !== date || date < todayKey) {
    return res.status(400).json({ message: 'Appointment date must be today or later.' });
  }
  if (typeof time !== 'string' || !time.trim() || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ message: 'Appointment time and reason are required.' });
  }
  const appointment = await Appointment.create({
    patient: patient.id,
    doctor: doctor.id,
    department: department || doctor.department,
    date,
    time,
    reason,
    fee: doctor.consultationFee,
  });
  await appointment.populate([
    { path: 'patient', populate: { path: 'user', select: 'name email phone' } },
    { path: 'doctor', populate: { path: 'user', select: 'name email' } },
    { path: 'department', select: 'name' },
  ]);
  return res.status(201).json({ appointment });
}

export async function updateAppointmentStatus(req, res) {
  const allowed = ['Confirmed', 'Completed', 'Cancelled'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: 'Status must be Confirmed, Completed, or Cancelled.' });
  }

  const filter = { _id: req.params.id };
  const validFrom = {
    Confirmed: ['Pending'],
    Completed: ['Confirmed'],
    Cancelled: ['Pending', 'Confirmed'],
  };
  filter.status = { $in: validFrom[req.body.status] };
  if (req.user.role === 'Patient') {
    if (req.body.status !== 'Cancelled') {
      return res.status(403).json({ message: 'Patients may only cancel their own appointments.' });
    }
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found.' });
    filter.patient = patient.id;
  } else if (req.user.role === 'Doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(403).json({ message: 'A doctor profile is required.' });
    filter.doctor = doctor.id;
  }
  const appointment = await Appointment.findOneAndUpdate(
    filter,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!appointment) return res.status(409).json({ message: 'Appointment not found or its status no longer allows this change.' });
  return res.json({ appointment });
}