import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";
import admin from "../../../../../lib/firebaseAdmin";

export async function POST(req) {
    try {
        await connectionToDatabase();

        // 1. Get the message details from the request
        const { title, body } = await req.json();

        // 2. Find ALL Active Delivery Boys who have an FCM Token
        const activeUsers = await DeliveryBoyUser.find({
            isActive: true,
            fcmToken: { $exists: true, $ne: null }
        });

        if (activeUsers.length === 0) {
            return NextResponse.json({ message: "No active delivery boys found with tokens." });
        }

        // 3. Extract Tokens
        const tokens = activeUsers.map(user => user.fcmToken);

        // 4. Send Multicast Notification
        // Note: 'tokens' array can have up to 500 tokens. If more, need to batch.
        const message = {
            notification: {
                title: title || "New Order Available!",
                body: body || "A new order is ready for pickup. Tap to view.",
            },
            data: {
                screen: "OrdersPage" // Deep link instruction
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendMulticast(message);

        return NextResponse.json({
            success: true,
            message: `Sent to ${response.successCount} users`,
            failures: response.failureCount,
            failedTokens: response.responses
                .map((res, idx) => (!res.success ? tokens[idx] : null))
                .filter(t => t)
        });

    } catch (err) {
        console.error("Notification Error:", err);
        return NextResponse.json({ message: "Server Error", error: err.message }, { status: 500 });
    }
}
