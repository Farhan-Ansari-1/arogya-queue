import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
    patientId: { 
        type: String, 
        unique: true, 
        required: true 
    }, // Format: FA199505201234
    name: { 
        type: String, 
        required: true 
    },
    dob: { 
        type: Date, 
        required: true 
    },
    gender: { 
        type: String, 
        required: true 
    },
    mobile: { 
        type: String, 
        required: true 
    },
    aadhaarHash: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Hashed version of Aadhaar
    aadhaarLastFour: { 
        type: String, 
        required: true 
    }, // Stored for display and ID generation
}, { 
    timestamps: true 
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);