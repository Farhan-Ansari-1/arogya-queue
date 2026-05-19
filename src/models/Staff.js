import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Password ab bcrypt se hash hoga
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Doctor', 'Receptionist'] },
  department: { type: String, default: null }, // Sirf doctors ke liye zaroori hai
  roomNumber: { type: String, default: null }, // Sirf doctors ke liye
  isAvailable: { type: Boolean, default: true } // Doctor on/off duty status
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);