import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import bcrypt from 'bcryptjs';
import Department from '@/models/Department';
import Staff from '@/models/Staff';

export async function GET(req) {
    try {
        await connectDB();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDateObj = new Date(todayStr);

        const doctors = await Staff.find({ role: 'Doctor' }).sort({ createdAt: -1 }); // No change needed here for date string
        const totalTokensToday = await Token.countDocuments({ date: todayDateObj });
        const departments = await Department.find({}).sort({ name: 1 });
        
        const staffMembers = await Staff.find({ role: { $in: ['Receptionist', 'Doctor'] } })
                                .sort({ role: 1 });

        return NextResponse.json({ success: true, doctors, totalTokensToday, departments, staffMembers });
    } catch (error) {
        console.error("Admin API GET Error:", error);
        return NextResponse.json({ success: false, error: "Database Fetch Failed" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const { username, password, name, role, department, roomNumber, departmentName, departmentCode } = await req.json();

        // Handle Department Creation
        if (departmentName && departmentCode) {
            const existingDept = await Department.findOne({ $or: [{ name: departmentName }, { code: departmentCode }] });
            if (existingDept) {
                return NextResponse.json({ success: false, error: "Department name or code already exists!" }, { status: 400 });
            }
            const newDepartment = new Department({ name: departmentName, code: departmentCode.toUpperCase() });
            await newDepartment.save();
            return NextResponse.json({ success: true, message: "Department added successfully!" });
        }

        // Handle Staff Registration
        if (username && password && name && role) {
            const existingStaff = await Staff.findOne({ username: username.toLowerCase().trim() });
            if (existingStaff) {
                return NextResponse.json({ success: false, error: "Username pehle se maujood hai! Kuch alag rakhein." }, { status: 400 });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newStaff = new Staff({
                username: username.toLowerCase().trim(),
                password: hashedPassword,
                name,
                role,
                department: role === 'Doctor' ? department : null,
                roomNumber: role === 'Doctor' ? roomNumber : null,
                isAvailable: role === 'Doctor' ? true : undefined
            });
            await newStaff.save();
            return NextResponse.json({ success: true, message: `${role} registered successfully!` });
        }

        return NextResponse.json({ success: false, error: "Invalid request data." }, { status: 400 });

    } catch (error) {
        console.error("Admin API POST Error:", error);
        return NextResponse.json({ success: false, error: "Registration/Creation Failed" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { id, ...updateData } = await req.json();

        // 🔐 Agar password update ho raha hai toh use hash karna zaroori hai
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await Staff.findByIdAndUpdate(id, updateData);
        return NextResponse.json({ success: true, message: "Updated successfully!" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update Failed" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { id, type } = await req.json();

        if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
        
        const result = type === 'STAFF' 
            ? await Staff.findByIdAndDelete(id) 
            : await Department.findByIdAndDelete(id);

        console.log(`🗑️ Deleted ${type}: ${id} - Status: ${result ? 'Success' : 'Not Found'}`);

        return NextResponse.json({ success: true, message: `${type} removed successfully!` });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
    }
}