import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function POST(req) {
    try {
        await connectDB();
        const { aadhaar } = await req.json();

        if (!aadhaar || aadhaar.length !== 12) {
            return NextResponse.json({ success: false, error: "Invalid Aadhaar" }, { status: 400 });
        }

        // Hash the input aadhaar to match our DB
        const aadhaarHash = crypto.createHash('sha256').update(aadhaar).digest('hex');
        const patient = await Patient.findOne({ aadhaarHash });

        if (patient) {
            return NextResponse.json({ success: true, exists: true, data: patient });
        } else {
            return NextResponse.json({ success: true, exists: false, message: "New Patient" });
        }
    } catch (error) {
        console.error("Lookup API Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}