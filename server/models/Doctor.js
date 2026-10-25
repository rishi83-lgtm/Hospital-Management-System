import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true, trim: true, maxlength: 120 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  qualification: { type: String, trim: true, maxlength: 120 },
  experienceYears: { type: Number, min: 0, max: 80, default: 0 },
  consultationFee: { type: Number, min: 0, required: true },
  workingHours: { type: String, trim: true, maxlength: 100 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);