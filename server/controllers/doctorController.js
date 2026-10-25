import bcrypt from 'bcryptjs';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

export async function listDoctors(req, res) {
  const filter = { status: 'Active' };
  if (req.query.department) filter.department = req.query.department;
  if (req.query.search) filter.specialization = { $regex: req.query.search, $options: 'i' };

  const doctors = await Doctor.find(filter)
    .populate('user', 'name email phone')
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  return res.json({ doctors });
}

export async function createDoctor(req, res) {
  const { name, email, phone, password, specialization, department, qualification, experienceYears, consultationFee, workingHours } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 8 || typeof specialization !== 'string' ||
      !specialization.trim() || !department || !Number.isFinite(Number(consultationFee))) {
    return res.status(400).json({ message: 'Name, email, password (8+ characters), specialization, department, and fee are required.' });
  }

  if (!(await Department.exists({ _id: department, status: 'Active' }))) {
    return res.status(400).json({ message: 'Choose an active department.' });
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
    role: 'Doctor',
  });
  try {
    const doctor = await Doctor.create({
      user: user.id,
      specialization: specialization.trim(),
      department,
      qualification,
      experienceYears,
      consultationFee: Number(consultationFee),
      workingHours,
    });
    await doctor.populate([{ path: 'user', select: 'name email phone' }, { path: 'department', select: 'name' }]);
    return res.status(201).json({ doctor });
  } catch (error) {
    await Doctor.deleteOne({ user: user.id });
    await User.findByIdAndDelete(user.id);
    throw error;
  }
}

export async function updateMyAvailability(req, res) {
  const { workingHours } = req.body;
  if (typeof workingHours !== 'string' || !workingHours.trim() || workingHours.length > 100) {
    return res.status(400).json({ message: 'Working hours are required and must be 100 characters or fewer.' });
  }
  const doctor = await Doctor.findOneAndUpdate(
    { user: req.user.id },
    { workingHours: workingHours.trim() },
    { new: true, runValidators: true },
  );
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found.' });
  return res.json({ doctor });
}