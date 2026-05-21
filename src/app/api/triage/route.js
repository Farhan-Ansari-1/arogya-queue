import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import Staff from '@/models/Staff';
import Department from '@/models/Department'; // Load dynamic departments
import RateLimit from '@/models/RateLimit';
import Patient from '@/models/Patient';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMERGENCY_KEYWORDS = ["chest pain", "heart attack", "dil me dard", "saans nahi aa rahi", "heavy bleeding", "khoon beh raha hai", "accident", "unconscious", "behoshi"];

async function checkRateLimit(id, limit, windowMs) {
    const now = new Date();
    let record = await RateLimit.findOne({ identifier: id });

    if (!record || now > record.resetTime) {
        await RateLimit.findOneAndUpdate(
            { identifier: id },
            { count: 1, resetTime: new Date(now.getTime() + windowMs) },
            { upsert: true }
        );
        return true;
    }

    if (record.count >= limit) return false;

    await RateLimit.updateOne({ identifier: id }, { $inc: { count: 1 } });
    return true;
}

export async function POST(req) {
    try {
        await connectDB();
        const { symptoms, name, dob, gender, mobile, aadhaar } = await req.json();

        if (!symptoms || !mobile || !aadhaar || !dob) {
            return NextResponse.json({ success: false, error: "Zaroori jaankari gayab hai!" }, { status: 400 });
        }

        // 🛡️ RATE LIMITING (Prevent Spam)
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";

        // Limit: 5 per hour per IP
        if (!(await checkRateLimit(`IP_${ip}`, 5, 60 * 60 * 1000))) {
            return NextResponse.json({ success: false, error: "Too many requests. Please try again after an hour." }, { status: 429 });
        }

        // Limit: 2 per hour per Mobile Number
        if (!(await checkRateLimit(`MOB_${mobile}`, 10, 60 * 60 * 1000))) {
            return NextResponse.json({ success: false, error: "Spam detected: Too many tokens for this number. Try later." }, { status: 429 });
        }

        // 🔐 PATIENT IDENTIFICATION (Aadhaar Hashing & Unique ID)
        const aadhaarHash = crypto.createHash('sha256').update(aadhaar).digest('hex');
        let patient = await Patient.findOne({ aadhaarHash });

        if (!patient) {
            // Naya Patient - Generate Unique ID
            // Logic: Name(2) + YYYYMMDD + AadhaarLast4
            const dobDate = new Date(dob);
            const dobFormatted = dobDate.toISOString().split('T')[0].replace(/-/g, '');
            const namePart = name.substring(0, 2).toUpperCase();
            const aadhaarLastFour = aadhaar.slice(-4);
            const generatedId = `${namePart}${dobFormatted}${aadhaarLastFour}`;

            patient = new Patient({
                patientId: generatedId,
                name,
                dob: dobDate,
                gender,
                mobile,
                aadhaarHash,
                aadhaarLastFour
            });
            await patient.save();
            console.log("🆕 New Patient Registered:", generatedId);
        } else {
            // Update existing patient if details changed
            patient.name = name;
            patient.mobile = mobile;
            patient.dob = new Date(dob);
            patient.gender = gender;
            await patient.save();
            console.log("🏠 Returning Patient Info Updated:", patient.patientId);
        }

        // Calculate age from DOB for triage logic
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const calculatedAge = currentYear - birthYear;

        // 1. EMERGENCY GUARDRAIL
        const lowerSymptoms = symptoms.toLowerCase();
        const hasEmergency = EMERGENCY_KEYWORDS.some(keyword => lowerSymptoms.includes(keyword));

        if (hasEmergency) {
            return NextResponse.json({
                success: true, is_emergency: true,
                message: "EMERGENCY: Proceed directly to Casualty immediately!",
                assigned_department: "EMERGENCY", unique_token_id: "EMERGENCY-NOW"
            });
        }

        // 🚀 2. DYNAMIC DEPARTMENTS FETCH
        // Database se un saare departments ki list nikalna jo admin ne banaye hain
        const dbDepartments = await Department.find({});
        const departmentNames = dbDepartments.map(d => d.name);
        
        // Dynamic shortcode indexing build karna loop ke liye
        const deptCodesMap = {};
        dbDepartments.forEach(d => { deptCodesMap[d.name] = d.code; });

        // Default route setup agar koi list na mile
        let predictedDepartment = departmentNames[0] || "General Medicine";

        if (departmentNames.length > 0) {
            try {
                // Gemini ko live system instructions dena aaj ki current department list ke sath
                const systemInstruction = `You are a medical triage system. Analyze symptoms and reply with EXACTLY ONE department name from this list: ${departmentNames.join(', ')}. 
                Do not write full sentences, punctuation, or reasoning. If symptoms don't perfectly match specialized departments, default strictly to '${predictedDepartment}'.`;

                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
                const result = await model.generateContent(`Patient Symptoms: "${symptoms}"`);
                const aiText = result.response.text().trim();

                if (departmentNames.includes(aiText)) {
                    predictedDepartment = aiText;
                }
            } catch (aiError) {
                console.warn("⚠️ Gemini busy or limit reached. Falling back to default department.");
            }
        }

        // 3. DOCTOR ROUTING
        const assignedDoctor = await Staff.findOne({ role: 'Doctor', department: predictedDepartment, isAvailable: true });
        const doctorName = assignedDoctor ? assignedDoctor.name : "On Duty Consultant";
        const roomNumber = assignedDoctor ? assignedDoctor.roomNumber : "Check Screen";

        // 4. SEQUENTIAL DAILY TOKEN GENERATION
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDateObj = new Date(todayStr); // Ensure query matches the Date object in DB

        // Atomic increment logic (Simplified for development)
        let nextTokenNumber;
        let uniqueTokenId;
        const deptCode = deptCodesMap[predictedDepartment] || "MED";

        // Fetch the latest token number for this department today to avoid duplicates
        const latestToken = await Token.findOne({ 
            assigned_department: predictedDepartment, 
            date: todayDateObj 
        }).sort({ token_number: -1 });

        nextTokenNumber = latestToken ? latestToken.token_number + 1 : 1;
        
        const dateStrShort = todayStr.replace(/-/g, ''); // e.g., 20260520
        uniqueTokenId = `AQ-${deptCode}-${dateStrShort}-${nextTokenNumber}`;

        // Loop ensures we find the absolute next available ID even if multiple are taken
        while (await Token.findOne({ unique_token_id: uniqueTokenId })) {
            nextTokenNumber += 1;
            uniqueTokenId = `AQ-${deptCode}-${dateStrShort}-${nextTokenNumber}`;
        }

        // 5. CLOUD STORAGE SAVE
        const newToken = new Token({
            patient_id: patient.patientId, // Link to Patient Unique ID
            name: name, // Use current form name
            age: calculatedAge, 
            gender: gender, 
            mobile: mobile, 
            symptoms,
            assigned_department: predictedDepartment, 
            token_number: nextTokenNumber,
            unique_token_id: uniqueTokenId, 
            date: todayDateObj, 
            ip_address: ip
        });
        await newToken.save();

        return NextResponse.json({ 
            success: true, is_emergency: false,
            assigned_department: predictedDepartment,
            token_number: nextTokenNumber, unique_token_id: uniqueTokenId,
            doctor_name: doctorName, room_number: roomNumber
        });

    } catch (error) {
        console.error("Global Triage Architecture Failure:", error);
        return NextResponse.json({ success: false, error: "Server Processing Error" }, { status: 500 });
    }
}