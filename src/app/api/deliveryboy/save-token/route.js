import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function POST(req) {
    try {
        await connectionToDatabase();
        const { userId, fcmToken } = await req.json();

        if (!userId || !fcmToken) {
            return NextResponse.json({ message: "Missing userId or fcmToken" }, { status: 400 });
        }

        const updatedUser = await DeliveryBoyUser.findByIdAndUpdate(
            userId,
            { fcmToken },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Token updated successfully", success: true });
    } catch (err) {
        console.error("Error saving token:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
