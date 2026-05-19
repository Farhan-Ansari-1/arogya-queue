import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import Staff from '@/models/Staff';
import Department from '@/models/Department'; // Load dynamic departments

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMERGENCY_KEYWORDS = ["chest pain", "heart attack", "dil me dard", "saans nahi aa rahi", "heavy bleeding", "khoon beh raha hai", "accident", "unconscious", "behoshi"];

export async function POST(req) {
    try {
        await connectDB();
        const { symptoms, name, age, gender, mobile } = await req.json();

        if (!symptoms || !mobile) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
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
                console.error("Gemini runtime error:", aiError);
            }
        }

        // 3. DOCTOR ROUTING
        const assignedDoctor = await Staff.findOne({ role: 'Doctor', department: predictedDepartment, isAvailable: true });
        const doctorName = assignedDoctor ? assignedDoctor.name : "On Duty Consultant";
        const roomNumber = assignedDoctor ? assignedDoctor.roomNumber : "Check Screen";

        // 4. SEQUENTIAL DAILY TOKEN GENERATION
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTokensCount = await Token.countDocuments({ assigned_department: predictedDepartment, date: todayStr });

        const nextTokenNumber = todayTokensCount + 1;
        const deptCode = deptCodesMap[predictedDepartment] || "MED";
        const uniqueTokenId = `AQ-${deptCode}-${nextTokenNumber}`;

        // 5. CLOUD STORAGE SAVE
        const newToken = new Token({
            name, age: Number(age), gender, mobile, symptoms,
            assigned_department: predictedDepartment, token_number: nextTokenNumber,
            unique_token_id: uniqueTokenId, date: new Date(todayStr) // Convert to Date object
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