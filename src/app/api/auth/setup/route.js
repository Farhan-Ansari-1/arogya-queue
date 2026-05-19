import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';
import SetupAttempt from '@/models/SetupAttempt';
import nodemailer from 'nodemailer';

// Nodemailer Transporter Config
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendSecurityAlert(subject, message) {
    if (!process.env.OWNER_EMAIL) return;
    try {
        await transporter.sendMail({
            from: `"ArogyaQueue Security" <${process.env.EMAIL_USER}>`,
            to: process.env.OWNER_EMAIL,
            subject: `🚨 Security Alert: ${subject}`,
            text: message,
        });
    } catch (err) {
        console.error("Email Alert Failed:", err);
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const { masterKey, username, password, name } = await req.json();
        
        // Get Client IP
        const ip = req.headers.get('x-forwarded-for') || "unknown";
        
        // 1. Brute Force Check (24 Hour Lockout)
        const attemptRecord = await SetupAttempt.findOne({ ip });
        
        if (attemptRecord && attemptRecord.isBlocked) {
            const now = new Date();
            const waitTime = 24 * 60 * 60 * 1000; // 24 hours
            if (now - attemptRecord.lastAttempt < waitTime) {
                const remainingHours = Math.ceil((waitTime - (now - attemptRecord.lastAttempt)) / (1000 * 60 * 60));
                return NextResponse.json({ 
                    success: false, 
                    error: `Too many failed attempts. Try again after ${remainingHours} hours.` 
                }, { status: 403 });
            } else {
                // Reset after 24 hours
                await SetupAttempt.findOneAndUpdate({ ip }, { attempts: 0, isBlocked: false });
            }
        }

        // 2. Security Check: Master Key Verification
        if (!process.env.MASTER_ADMIN_KEY || masterKey !== process.env.MASTER_ADMIN_KEY) {
            const isBlockedNow = (attemptRecord?.attempts || 0) + 1 >= 5;

            // Log failed attempt
            await SetupAttempt.findOneAndUpdate(
                { ip },
                { 
                    $inc: { attempts: 1 }, 
                    lastAttempt: new Date(),
                    isBlocked: isBlockedNow
                },
                { upsert: true }
            );

            // Send Alert on Failed Attempt
            await sendSecurityAlert(
                "Unauthorized Setup Attempt",
                `Invalid Master Key was used.\n\nIP Address: ${ip}\nStatus: ${isBlockedNow ? 'IP BLOCKED' : 'Logged'}\nTime: ${new Date().toLocaleString()}`
            );
            
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid Master Key" }, { status: 403 });
        }

        if (!username || !password || !name) {
            return NextResponse.json({ success: false, error: "Saari details bharna zaroori hai." }, { status: 400 });
        }

        // 3. Max Admin Check (Limit to 3)
        const adminCount = await Staff.countDocuments({ role: 'Admin' });
        const existingUser = await Staff.findOne({ username: username.toLowerCase().trim() });

        if (adminCount >= 3 && (!existingUser || existingUser.role !== 'Admin')) {
            return NextResponse.json({ 
                success: false, 
                error: "System limit reached: Maximum 3 Admin accounts allowed." 
            }, { status: 400 });
        }

        // 4. Password Hash karna
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Upsert Admin
        const updatedAdmin = await Staff.findOneAndUpdate(
            { username: username.toLowerCase().trim() },
            { 
                name, 
                password: hashedPassword, 
                role: 'Admin' 
            },
            { upsert: true, new: true }
        );

        // Reset attempts on successful setup
        await SetupAttempt.deleteOne({ ip });

        // Send Alert on Successful Setup
        await sendSecurityAlert(
            "Master Setup Used Successfully",
            `An admin account has been configured/reset.\n\nAdmin Name: ${name}\nUsername: ${username}\nIP Address: ${ip}\nTime: ${new Date().toLocaleString()}`
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