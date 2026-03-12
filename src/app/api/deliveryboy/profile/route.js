import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function GET(req) {
    try {
        await connectionToDatabase();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "Missing userId" }, { status: 400 });
        }

        const user = await DeliveryBoyUser.findById(userId).select("mobileConnected fcmToken isActive");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            mobileConnected: user.mobileConnected || false,
            hasToken: !!user.fcmToken,
            isActive: user.isActive,
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
