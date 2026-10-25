import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password || password.length < 12) {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in the environment.');
}

try {
  await connectDatabase();
  if (await User.exists({ email })) {
    throw new Error('An account already exists for ADMIN_EMAIL. No account was changed.');
  }

  const admin = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'Admin',
  });
  await Department.bulkWrite([
    { updateOne: { filter: { name: 'Cardiology' }, update: { $setOnInsert: { name: 'Cardiology', description: 'Heart and cardiovascular system care' } }, upsert: true } },
    { updateOne: { filter: { name: 'Neurology' }, update: { $setOnInsert: { name: 'Neurology', description: 'Brain, spinal cord, and nerve disorders' } }, upsert: true } },
    { updateOne: { filter: { name: 'Pediatrics' }, update: { $setOnInsert: { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' } }, upsert: true } },
    { updateOne: { filter: { name: 'Orthopedics' }, update: { $setOnInsert: { name: 'Orthopedics', description: 'Bones, joints, muscles, and ligament care' } }, upsert: true } },
    { updateOne: { filter: { name: 'General Medicine' }, update: { $setOnInsert: { name: 'General Medicine', description: 'Primary healthcare and internal medicine' } }, upsert: true } },
  ]);
  console.info(`Administrator account created: ${admin.email}`);
} finally {
  await mongoose.disconnect();
}
