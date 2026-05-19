import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        await connectDB();
        const { masterKey, username, password, name } = await req.json();

        // 1. Security Check: .env wali key se match karna
        if (!process.env.MASTER_ADMIN_KEY || masterKey !== process.env.MASTER_ADMIN_KEY) {
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid Master Key" }, { status: 403 });
        }

        if (!username || !password || !name) {
            return NextResponse.json({ success: false, error: "Saari details bharna zaroori hai." }, { status: 400 });
        }

        // 2. Password Hash karna
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Upsert Admin: Agar username pehle se hai toh update karega, nahi toh naya banayega
        const updatedAdmin = await Staff.findOneAndUpdate(
            { username: username.toLowerCase().trim() },
            { 
                name, 
                password: hashedPassword, 
                role: 'Admin' 
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ 
            success: true, 
            message: `Admin '${username}' has been configured/reset successfully!` 
        });

    } catch (error) {
        console.error("Setup API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}