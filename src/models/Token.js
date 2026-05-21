import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  patient_id: { type: String, required: true }, // Link to Patient.patientId
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  mobile: { type: String, required: true },
  symptoms: { type: String, required: true },
  assigned_department: { type: String, required: true },
  token_number: { type: Number, required: true },
  unique_token_id: { type: String, required: true, unique: true },
  status: { type: String, default: 'Pending' }, // Pending, Checked_In, Completed
  date: { type: Date, required: true }, // Store as Date object for better querying
  ip_address: { type: String }
}, { timestamps: true });

// Next.js ke serverless behavior ki wajah se hume check karna padta hai ki model pehle se bana hai ya nahi
export default mongoose.models.Token || mongoose.model('Token', TokenSchema);