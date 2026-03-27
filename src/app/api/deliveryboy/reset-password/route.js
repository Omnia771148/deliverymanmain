import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";
import DeliveryBoyNewAdd from "../../../../../models/DeliveryBoyNewAdd";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { phone, newPassword } = await request.json();

        if (!phone || !newPassword) {
            return NextResponse.json({ success: false, message: "Phone and new password are required" }, { status: 400 });
        }

        const rawPhone = phone.replace('+91', '');

        // 1. First, try updating DeliveryBoyUser
        let user = await DeliveryBoyUser.findOneAndUpdate(
            { phone: phone },
            { $set: { password: newPassword } }
        );

        if (!user) {
            user = await DeliveryBoyUser.findOneAndUpdate(
                { phone: rawPhone },
                { $set: { password: newPassword } }
            );
        }

        // 2. If not found in DeliveryBoyUser, try DeliveryBoyNewAdd (pending approval users)
        if (!user) {
            user = await DeliveryBoyNewAdd.findOneAndUpdate(
                { phone: phone },
                { $set: { password: newPassword } }
            );

            if (!user) {
                user = await DeliveryBoyNewAdd.findOneAndUpdate(
                    { phone: rawPhone },
                    { $set: { password: newPassword } }
                );
            }
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("RESET PASSWORD API ERROR:", err);
        return NextResponse.json({ success: false, message: "Server error: " + err.message }, { status: 500 });
    }
}
