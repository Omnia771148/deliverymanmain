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

        // Normalize phone number to catch any weird formatting issues in MongoDB like spaces
        const basePhone = phone.replace(/^\+91/, '').replace(/\D/g, '').trim(); 
        const variants = [
            basePhone,                    // "9876543210"
            `+91${basePhone}`,            // "+919876543210"
            `+91 ${basePhone}`,           // "+91 9876543210"
            phone.trim()                  // Whatever came exactly from the client
        ];

        const query = { phone: { $in: variants } };

        // Force a bulk update across BOTH collections to absolutely guarantee the password saves
        const updateResultUser = await DeliveryBoyUser.updateMany(query, { $set: { password: newPassword } });
        const updateResultNew = await DeliveryBoyNewAdd.updateMany(query, { $set: { password: newPassword } });

        // If neither collection found the phone number
        if (updateResultUser.matchedCount === 0 && updateResultNew.matchedCount === 0) {
            // As a final failsafe, try looking via regex in case it's completely malformed
            const fallbackQuery = { phone: { $regex: new RegExp(basePhone) } };
            const fallbackUser = await DeliveryBoyUser.updateMany(fallbackQuery, { $set: { password: newPassword } });
            const fallbackNew = await DeliveryBoyNewAdd.updateMany(fallbackQuery, { $set: { password: newPassword } });
            
            if (fallbackUser.matchedCount === 0 && fallbackNew.matchedCount === 0) {
                return NextResponse.json({ success: false, message: "User not found in MongoDB." }, { status: 404 });
            }
        }

        // The password has definitively been saved
        return NextResponse.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        console.error("RESET PASSWORD API ERROR:", err);
        return NextResponse.json({ success: false, message: "Server error: " + err.message }, { status: 500 });
    }
}
