import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Token from '@/models/Token';
import Department from '@/models/Department';

// 📋 1. GET: Saare doctors, total tokens aur departments lana
export async function GET() {
    try {
        await connectDB();
        const todayStr = new Date().toISOString().split('T')[0];

        const doctors = await Doctor.find({}).sort({ createdAt: -1 });
        const totalTokensToday = await Token.countDocuments({ date: todayStr });
        const departments = await Department.find({}).sort({ name: 1 });

        return NextResponse.json({ success: true, doctors, totalTokensToday, departments });
    } catch (error) {
        console.error("Admin GET Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch admin data" }, { status: 500 });
    }
}

// ➕ 2. POST: Doctor ya Department add karna
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        if (body.type === 'DEPARTMENT') {
            const { deptName, deptCode } = body;
            if (!deptName || !deptCode) {
                return NextResponse.json({ success: false, error: "Name and Code are required" }, { status: 400 });
            }
            const newDept = new Department({ name: deptName.trim(), code: deptCode.trim().toUpperCase() });
            await newDept.save();
            return NextResponse.json({ success: true, message: "Department added!" });
        }

        const { name, department, roomNumber } = body;
        if (!name || !department || !roomNumber) {
            return NextResponse.json({ success: false, error: "All doctor fields are required" }, { status: 400 });
        }

        const newDoctor = new Doctor({ name, department, roomNumber });
        await newDoctor.save();
        return NextResponse.json({ success: true, message: "Doctor added!" });

    } catch (error) {
        console.error("Admin POST Error:", error);
        return NextResponse.json({ success: false, error: "Duplicate entry or process error." }, { status: 500 });
    }
}

// 🔄 3. PUT: Doctor update logic
export async function PUT(req) {
    try {
        await connectDB();
        const { id, name, department, roomNumber, isAvailable } = await req.json();
        await Doctor.findByIdAndUpdate(id, { name, department, roomNumber, isAvailable });
        return NextResponse.json({ success: true, message: "Updated successfully!" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update Failed" }, { status: 500 });
    }
}

// 🗑️ 4. DELETE: Department ko system se permanently hatana
export async function DELETE(req) {
    try {
        await connectDB();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "Department ID is required" }, { status: 400 });
        }

        await Department.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Department removed successfully!" });
    } catch (error) {
        console.error("Admin DELETE Error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete department" }, { status: 500 });
    }
}