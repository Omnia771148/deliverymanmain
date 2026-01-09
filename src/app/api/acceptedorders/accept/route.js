import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/db";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import AcceptedByDelivery from "../../../../../models/AcceptedByDelivery";

const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }),
    "orderstatuses"
  );

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

    // 1️⃣ Find order from acceptedorders (YOUR EXISTING LOGIC)
    const order = await AcceptedOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Insert into acceptedbydeliveries (YOUR EXISTING LOGIC - UNCHANGED)
    await AcceptedByDelivery.create({
      originalOrderId: order._id,
      orderId: order.orderId,
      deliveryBoyId,

      userId: order.userId,
      restaurantId: order.restaurantId,

      items: order.items,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      gst: order.gst,
      deliveryCharge: order.deliveryCharge,
      grandTotal: order.grandTotal,
      aa: order.aa,

      location: order.location,

      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,

      orderDate: order.orderDate,
      rest: order.rest,
      rejectedBy: order.rejectedBy,

      status: "Accepted by Delivery", // YOUR EXISTING STATUS - UNCHANGED
    });

    // ✅ 3️⃣ ONLY ADD THIS: Update orderstatuses collection (NEW ADDITION)
    await OrderStatus.updateOne(
      { orderId: order.orderId },
      {
        $set: {
          status: "will be delivered soon" // ONLY CHANGE STATUS HERE
        }
      }
    );

    // 4️⃣ DELETE from acceptedorders (YOUR EXISTING LOGIC - UNCHANGED)
    await AcceptedOrder.findByIdAndDelete(orderId);

    return NextResponse.json({
      message: "Order accepted and removed from acceptedorders",
      success: true,
    });

  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}