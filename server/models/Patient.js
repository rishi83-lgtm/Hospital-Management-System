import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Female', 'Male', 'Other', 'Prefer not to say'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: { type: String, trim: true, maxlength: 500 },
  emergencyContact: { type: String, trim: true, maxlength: 120 },
  allergies: [{ type: String, trim: true, maxlength: 100 }],
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);