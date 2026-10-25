import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';

export async function listPrescriptions(req, res) {
  const filter = {};
  if (req.user.role === 'Patient') {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json({ prescriptions: [] });
    const appointments = await Appointment.find({ patient: patient.id }).distinct('_id');
    filter.appointment = { $in: appointments };
  } else if (req.user.role === 'Doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.json({ prescriptions: [] });
    const appointments = await Appointment.find({ doctor: doctor.id }).distinct('_id');
    filter.appointment = { $in: appointments };
  }

  const prescriptions = await Prescription.find(filter)
    .populate({
      path: 'appointment',
      populate: [
        { path: 'patient', populate: { path: 'user', select: 'name' } },
        { path: 'doctor', populate: { path: 'user', select: 'name' } },
      ],
    })
    .sort({ prescribedAt: -1 });
  return res.json({ prescriptions });
}

export async function createPrescription(req, res) {
  const { appointment: appointmentId, diagnosis, medicines, instructions } = req.body;
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  const doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor || !appointment.doctor.equals(doctor.id)) {
    return res.status(403).json({ message: 'You can only prescribe for your own appointments.' });
  }
  const prescription = await Prescription.create({ appointment: appointment.id, diagnosis, medicines, instructions });
  return res.status(201).json({ prescription });
}