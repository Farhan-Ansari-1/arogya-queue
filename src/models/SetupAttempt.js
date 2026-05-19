import mongoose from 'mongoose';

const SetupAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.SetupAttempt || mongoose.model('SetupAttempt', SetupAttemptSchema);