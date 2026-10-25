import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { generateToken } from '../utils/generateToken.js';

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone,
    passwordHash,
    role: 'Patient',
  });
  try {
    await Patient.create({ user: user._id });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  return res.status(201).json({
    token: generateToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password)) || user.status !== 'Active') {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    token: generateToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function currentUser(req, res) {
  return res.json({ user: req.user });
}

export async function listStaff(req, res) {
  const staff = await User.find({ role: { $in: ['Doctor', 'Receptionist'] }, status: 'Active' })
    .select('name email phone role status createdAt')
    .sort({ role: 1, name: 1 });
  return res.json({ staff });
}

export async function createReceptionist(req, res) {
  const { name, email, phone, password } = req.body;
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
    role: 'Receptionist',
  });
  return res.status(201).json({
    staff: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
  });
}