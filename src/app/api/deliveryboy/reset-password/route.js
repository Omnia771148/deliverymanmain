import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { phone, newPassword } = await request.json();

        if (!phone || !newPassword) {
            return NextResponse.json({ success: false, message: "Phone and new password are required" }, { status: 400 });
        }

        // Find and update. Handle both +91 and raw phone formats just to be safe, 
        // though the frontend should send consistent format.
        // Find and update using findOneAndUpdate to avoid strict schema validation issues on other fields
        let user = await DeliveryBoyUser.findOneAndUpdate(
            { phone: phone },
            { $set: { password: newPassword } }
        );

        if (!user) {
            // Try without +91
            const rawPhone = phone.replace('+91', '');
            user = await DeliveryBoyUser.findOneAndUpdate(
                { phone: rawPhone },
                { $set: { password: newPassword } }
            );

            if (!user) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("RESET PASSWORD API ERROR:", err);
        return NextResponse.json({ success: false, message: "Server error: " + err.message }, { status: 500 });
    }
}
