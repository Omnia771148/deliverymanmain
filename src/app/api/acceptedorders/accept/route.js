import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/db";
import AcceptedOrder from "../../../../../models/AcceptedOrder";
import AcceptedByDelivery from "../../../../../models/AcceptedByDelivery";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

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

    let { orderId, deliveryBoyId, deliveryBoyName, deliveryBoyPhone } = await req.json();

    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // Fetch delivery boy details if not provided
    if (!deliveryBoyName || !deliveryBoyPhone) {
      try {
        const deliveryBoy = await DeliveryBoyUser.findById(deliveryBoyId);
        if (deliveryBoy) {
          deliveryBoyName = deliveryBoyName || deliveryBoy.name;
          deliveryBoyPhone = deliveryBoyPhone || deliveryBoy.phone;
        }
      } catch (error) {
        console.error("Error fetching delivery boy details:", error);
        // Continue without details if fetch fails, or handle as error?
        // Proceeding allows the order to be accepted at least.
      }
    }

    // 1️⃣ Find order from acceptedorders (YOUR EXISTING LOGIC)
    // Use .lean() to get a plain JavaScript object, avoiding schema strictness issues
    const order = await AcceptedOrder.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Processing Accept Order. Restaurant Name found:", order.restaurantName);

    let rName = order.restaurantName;

    // Fallback: If restaurantName is missing, try to fetch from 'restaurants' collection
    if (!rName && order.restaurantId) {
      try {
        console.log("Restaurant name missing in order. Fetching from 'restaurants' collection for ID:", order.restaurantId);
        const restColl = mongoose.connection.db.collection("restaurants");
        // Try matching by _id (string) or id or restaurantId
        let restDoc = await restColl.findOne({ _id: order.restaurantId });
        if (!restDoc) restDoc = await restColl.findOne({ id: order.restaurantId });
        if (!restDoc) restDoc = await restColl.findOne({ restaurantId: order.restaurantId });

        // Try numeric conversion if string lookup failed
        if (!restDoc && !isNaN(order.restaurantId)) {
          const numId = parseInt(order.restaurantId);
          restDoc = await restColl.findOne({ _id: numId });
          if (!restDoc) restDoc = await restColl.findOne({ id: numId });
        }

        if (restDoc) {
          // Check common name fields
          rName = restDoc.name || restDoc.restaurantName || restDoc.title || "Unknown Restaurant";
          console.log("✅ Fetched Restaurant Name from DB:", rName);
        } else {
          console.log("⚠️ Restaurant details not found in DB.");
          rName = "Unknown Restaurant";
        }
      } catch (err) {
        console.error("❌ Error fetching restaurant details:", err);
        rName = "Unknown Restaurant";
      }
    }

    console.log("Processing Accept Order. Final Restaurant Name:", rName);

    // 2️⃣ Insert into acceptedbydeliveries (YOUR EXISTING LOGIC - UNCHANGED)
    await AcceptedByDelivery.create({
      originalOrderId: order._id,
      orderId: order.orderId,
      deliveryBoyId,
      deliveryBoyName,
      deliveryBoyPhone,

      userId: order.userId,
      restaurantId: order.restaurantId,

      userName: order.userName,
      userEmail: order.userEmail,
      userPhone: order.userPhone,

      items: order.items,
      totalCount: order.totalCount,
      totalPrice: order.totalPrice,
      gst: order.gst,
      deliveryCharge: order.deliveryCharge,
      grandTotal: order.grandTotal,
      aa: order.aa,

      location: order.location,
      deliveryAddress: order.deliveryAddress,

      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,

      orderDate: order.orderDate,
      rest: order.rest,
      restaurantName: rName, // Use the resolved name
      rejectedBy: order.rejectedBy,

      status: "Accepted by Delivery", // YOUR EXISTING STATUS - UNCHANGED
    });

    // ✅ 3️⃣ ONLY ADD THIS: Update orderstatuses collection (NEW ADDITION)
    await OrderStatus.updateOne(
      { orderId: order.orderId },
      {
        $set: {
          status: "will be delivered soon", // ONLY CHANGE STATUS HERE
          deliveryBoyId,
          deliveryBoyName,
          deliveryBoyPhone
        }
      }
    );

    // 4️⃣ UPDATE AcceptedOrder to mark as accepted
    await AcceptedOrder.findByIdAndUpdate(orderId, {
      deliveryBoyId,
      status: "Accepted by Delivery"
    });

    return NextResponse.json({
      message: "Order accepted",
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