import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import Department from '@/models/Department';

// 📋 GET: Receptionist ko saare aaj ke tokens dikhane ke liye
export async function GET() {
    try {
        await connectDB();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDateObj = new Date(todayStr);

        const tokens = await Token.find({ date: todayDateObj }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: tokens });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Fetch Failed" }, { status: 500 });
    }
}

// 🔄 PUT: Department Manual Override Logic
export async function PUT(req) {
    try {
        await connectDB();
        const { token_id, new_department } = await req.json();

        if (!token_id || !new_department) {
            return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
        }

        // 1. Naye department ka details fetch karna
        const dept = await Department.findOne({ name: new_department });
        if (!dept) return NextResponse.json({ success: false, error: "Invalid Department" }, { status: 400 });

        const todayStr = new Date().toISOString().split('T')[0];
        const todayDateObj = new Date(todayStr);

        // 2. Naye department ke liye next sequential token number nikalna
        const latestToken = await Token.findOne({ 
            assigned_department: new_department, 
            date: todayDateObj 
        }).sort({ token_number: -1 });

        const nextNumber = latestToken ? latestToken.token_number + 1 : 1;
        const newUniqueId = `AQ-${dept.code}-${nextNumber}`;

        // 3. Token update karna
        const updatedToken = await Token.findOneAndUpdate(
            { unique_token_id: token_id },
            { 
                assigned_department: new_department,
                token_number: nextNumber,
                unique_token_id: newUniqueId
            },
            { new: true }
        );

        return NextResponse.json({ success: true, message: "Department overridden successfully", data: updatedToken });
    } catch (error) {
        console.error("Override API Error:", error);
        return NextResponse.json({ success: false, error: "Update Failed" }, { status: 500 });
    }
}