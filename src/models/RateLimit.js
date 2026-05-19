import mongoose from 'mongoose';

const RateLimitSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true }, // Format: IP_xxx or MOB_xxx
  count: { type: Number, default: 0 },
  resetTime: { type: Date, required: true }
});

export default mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);