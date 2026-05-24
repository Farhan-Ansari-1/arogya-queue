import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export const dynamic = 'force-dynamic';

// 🩺 GET Route: Doctor ke liye saare pending patients ki list lana
export async function GET(req) {
    try {
        await connectDB();

        // Aaj ki date nikalna
        const todayStr = new Date().toISOString().split('T')[0];
        const todayDateObj = new Date(todayStr);

        // Database se aaj ke sirf 'Pending' aur 'Checked_In' patients nikalna order wise
        const activeTokens = await Token.find({
            date: todayDateObj,
            status: { $in: ['Pending', 'Checked_In'] }
        }).sort({ token_number: 1 }); // 1, 2, 3 ke serial order mein sorting

        return NextResponse.json({ success: true, data: activeTokens });
    } catch (error) {
        console.error("💥 Doctor GET Error:", error);
        const isDBError = error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError';
        
        return NextResponse.json({ 
            success: false, 
            maintenance: isDBError, 
            error: "Queue data is currently unavailable." 
        }, { status: isDBError ? 503 : 500 });
    }
}

// 🔄 PUT Route: Jab doctor 'Next' dabaye toh patient ka status 'Completed' ya 'Checked_In' karna
export async function PUT(req) {
    try {
        await connectDB();
        const { token_id, new_status } = await req.json();

        if (!token_id || !new_status) {
            return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
        }

        // Patient ka status update karna
        await Token.findOneAndUpdate(
            { unique_token_id: token_id },
            { status: new_status }
        );

        return NextResponse.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        console.error("💥 Doctor PUT Error:", error);
        const isDBError = error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError';
        
        return NextResponse.json({ 
            success: false, 
            maintenance: isDBError, 
            error: "Failed to update patient status." 
        }, { status: isDBError ? 503 : 500 });
    }
}