import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Ophthalmology"
  code: { type: String, required: true, unique: true, uppercase: true } // e.g., "EYE"
}, { timestamps: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);