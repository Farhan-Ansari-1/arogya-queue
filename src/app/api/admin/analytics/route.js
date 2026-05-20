// d:\arogya-queue\src\app\api\admin\analytics\route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get('timeframe') || 'daily'; // default to daily
        const department = searchParams.get('department'); // optional department filter

        let startDate;
        const endDate = new Date(); // Today
        endDate.setHours(23, 59, 59, 999); // End of today

        switch (timeframe) {
            case 'daily':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0); // Start of today
                break;
            case 'weekly':
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case '6month':
                startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yearly':
                startDate = new Date();
                startDate.setFullYear(endDate.getFullYear() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'overall':
                startDate = new Date(0); // Epoch time for overall data
                break;
            default:
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
        }

        let matchQuery = {
            date: { $gte: startDate, $lte: endDate }
        };
        if (department && department !== 'All') {
            matchQuery.assigned_department = department;
        }

        let groupStage;
        let sortStage = { _id: 1 }; // Default sort for chronological order

        if (timeframe === 'daily' || timeframe === 'weekly') {
            groupStage = {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" },
                    department: "$assigned_department"
                },
                count: { $sum: 1 }
            };
        } else if (timeframe === 'monthly' || timeframe === '6month' || timeframe === 'yearly') {
            groupStage = {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    department: "$assigned_department"
                },
                count: { $sum: 1 }
            };
        } else { // overall
            groupStage = {
                _id: {
                    department: "$assigned_department"
                },
                count: { $sum: 1 }
            };
        }

        const pipeline = [
            { $match: matchQuery },
            { $group: groupStage },
            { $sort: sortStage }
        ];

        const analyticsData = await Token.aggregate(pipeline);

        return NextResponse.json({ success: true, data: analyticsData });

    } catch (error) {
        console.error("Admin Analytics API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch analytics data" }, { status: 500 });
    }
}
