import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, error: "Username aur password zaroori hain." }, { status: 400 });
        }

        // 1. Username se Staff member dhoondhna
        const user = await Staff.findOne({ username: username.toLowerCase().trim() });

        if (!user) {
            return NextResponse.json({ success: false, error: "Galat username ya password." }, { status: 401 });
        }

        // 2. Diye gaye password ko database mein stored hashed password se compare karna
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: "Galat username ya password." }, { status: 401 });
        }

        // 3. Agar password sahi hai, toh user details return karna (password exclude karke)
        const userWithoutPassword = {
            _id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            department: user.department,
            roomNumber: user.roomNumber,
        };

        // 4. Create JWT Token (jose is Edge-compatible for middleware)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'arogya_secret_key_123');
        const token = await new SignJWT({ ...userWithoutPassword })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json({ success: true, user: userWithoutPassword });

        // 5. Set HTTP-Only Cookie (Security Best Practice)
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: 'lax', // Add SameSite attribute for CSRF protection
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ success: false, error: "Login mein kuch gadbad ho gayi." }, { status: 500 });
    }
}