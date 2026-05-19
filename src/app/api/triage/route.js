import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import Staff from '@/models/Staff';
import Department from '@/models/Department'; // Load dynamic departments
import RateLimit from '@/models/RateLimit';

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
        const { symptoms, name, age, gender, mobile } = await req.json();

        if (!symptoms || !mobile) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 🛡️ RATE LIMITING (Prevent Spam)
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";

        // Limit: 5 per hour per IP
        if (!(await checkRateLimit(`IP_${ip}`, 5, 60 * 60 * 1000))) {
            return NextResponse.json({ success: false, error: "Too many requests. Please try again after an hour." }, { status: 429 });
        }

        // Limit: 2 per hour per Mobile Number
        if (!(await checkRateLimit(`MOB_${mobile}`, 2, 60 * 60 * 1000))) {
            return NextResponse.json({ success: false, error: "Spam detected: Too many tokens for this number. Try later." }, { status: 429 });
        }

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
                const systemInstruction = `You are a medical triage system. Your strict job is to analyze symptoms and reply with EXACTLY ONE department name from this dynamically allowed list: ${departmentNames.join(', ')}. 
                Do not write full sentences, punctuation, or reasoning. If symptoms don't perfectly match specialized departments, default strictly to '${predictedDepartment}'.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Patient Symptoms: "${symptoms}"`,
                    config: { systemInstruction, temperature: 0.1 }
                });

                const aiText = response.text ? response.text.trim() : "";
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
        uniqueTokenId = `AQ-${deptCode}-${nextTokenNumber}`;

        // Double check for duplicate ID just in case of rapid clicks
        const checkCollision = await Token.findOne({ unique_token_id: uniqueTokenId });
        if (checkCollision) {
            nextTokenNumber += 1;
            uniqueTokenId = `AQ-${deptCode}-${nextTokenNumber}`;
        }

        // 5. CLOUD STORAGE SAVE
        const newToken = new Token({
            name, age: Number(age), gender, mobile, symptoms,
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