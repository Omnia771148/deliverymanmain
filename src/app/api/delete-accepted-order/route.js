import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedOrder from "../../../../models/AcceptedOrder";
import AcceptedByRestorent from "../../../../models/AcceptedByRestorent";

export async function POST(req) {
    try {
        await connectionToDatabase();

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { message: "Order ID is required" },
                { status: 400 }
            );
        }

        // 1. Find the order in AcceptedOrder
        const orderToDelete = await AcceptedOrder.findById(orderId);

        if (!orderToDelete) {
            return NextResponse.json(
                { message: "Order not found in acceptedorders" },
                { status: 404 }
            );
        }

        // 2. Insert into AcceptedByRestorent (Archive it)
        try {
            const archiveData = orderToDelete.toObject();
            delete archiveData._id; // Remove _id to avoid collision if auto-generated or same ID logic differs

            await AcceptedByRestorent.create(archiveData);
        } catch (archiveError) {
            // If duplicate key error (already archived), we can safely ignore and proceed to delete
            if (archiveError.code === 11000) {
                console.log("Order already exists in archive, proceeding to delete.");
            } else {
                console.error("Error archiving order:", archiveError);
                return NextResponse.json(
                    { message: "Failed to archive order", error: archiveError.message },
                    { status: 500 }
                );
            }
        }

        // 3. Delete from AcceptedOrder
        await AcceptedOrder.findByIdAndDelete(orderId);

        // 4. Update AcceptedByDelivery to mark as picked up
        // We need to find the document in AcceptedByDelivery that corresponds to this original order
        // The Delivery Boy's collection uses 'originalOrderId' to link back.
        const AcceptedByDelivery = (await import("../../../../models/AcceptedByDelivery")).default;

        await AcceptedByDelivery.findOneAndUpdate(
            { originalOrderId: orderId },
            { $set: { orderPickedUp: true } }
        );

        return NextResponse.json({
            message: "Order moved to AcceptedByRestorent and removed from acceptedorders",
            success: true,
        });

    } catch (error) {
        console.error("Delete accepted order error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
