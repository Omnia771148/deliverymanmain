import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import AcceptedByDelivery from "../../../../../models/AcceptedByDelivery";

export async function POST(req) {
  try {
    await connectionToDatabase();

    const { orderId, deliveryBoyId } = await req.json();

    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Find order from acceptedorders
    const order = await AcceptedOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Insert into acceptedbydeliveries (NEW COLLECTION)
    await AcceptedByDelivery.create({
      originalOrderId: order._id,
      orderId: order.orderId,
      deliveryBoyId,

      userId: order.userId,
      restaurantId: order.restaurantId,

      items: order.items,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,

      status: "Accepted by Delivery",
    });

    // 3️⃣ Update status in acceptedorders instead of deleting
    order.status = "Accepted by Delivery"; // ✅ change status
    await order.save(); // ✅ save the updated order

    return NextResponse.json({
      message: "Order accepted and status updated successfully",
    });
  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
