import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  roomNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);