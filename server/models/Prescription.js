import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  dosage: { type: String, required: true, trim: true, maxlength: 80 },
  frequency: { type: String, required: true, trim: true, maxlength: 100 },
  duration: { type: String, required: true, trim: true, maxlength: 80 },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  diagnosis: { type: String, required: true, trim: true, maxlength: 500 },
  medicines: { type: [medicineSchema], validate: value => value.length > 0 },
  instructions: { type: String, trim: true, maxlength: 2000 },
  prescribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);