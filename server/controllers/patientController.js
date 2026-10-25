import bcrypt from 'bcryptjs';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

export async function listPatients(req, res) {
  let patientFilter = {};
  if (req.user.role === 'Doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.json({ patients: [] });
    const patientIds = await Appointment.find({ doctor: doctor.id }).distinct('patient');
    patientFilter = { _id: { $in: patientIds } };
  }

  const patients = await Patient.find(patientFilter)
    .populate('user', 'name email phone status')
    .sort({ createdAt: -1 });
  return res.json({ patients });
}

export async function getMyPatientRecord(req, res) {
  const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email phone');
  if (!patient) return res.status(404).json({ message: 'Patient record not found.' });
  return res.json({ patient });
}

export async function createPatient(req, res) {
  const { name, email, phone, password, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'Patient',
  });
  try {
    const patient = await Patient.create({ user: user.id, dateOfBirth, gender, bloodGroup, address, emergencyContact });
    await patient.populate('user', 'name email phone status');
    return res.status(201).json({ patient });
  } catch (error) {
    await User.findByIdAndDelete(user.id);
    throw error;
  }
}