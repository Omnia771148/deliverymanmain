import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose
import connectionToDatabase from "../../../../lib/db";
import AcceptedByDelivery from "../../../../models/AcceptedByDelivery";
// ✅ Add OrderStatus model definition
const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }),
    "orderstatuses"
  );

export async function GET(req) {
  try {
    await connectionToDatabase();

    // Get query parameters
    const url = new URL(req.url);
    const deliveryBoyId = url.searchParams.get("deliveryBoyId");

    let query = {};
   
    // If deliveryBoyId is provided in query, filter by it
    if (deliveryBoyId) {
      query.deliveryBoyId = deliveryBoyId;
    }

    // Execute query with or without filter
    const deliveries = await AcceptedByDelivery.find(query)
      .sort({ acceptedAt: -1 })
      .lean();

      return NextResponse.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Fetch deliveries error:", error);
   
    // Return both error messages from both codes
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        message2: "Error fetching data"
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectionToDatabase();
   
    const body = await req.json();
    const { orderId, deliveryBoyId } = body;

    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { success: false, message: "Order ID and Delivery Boy ID are required" },
        { status: 400 }
      );
    }
    // 1. Check if the boy is busy
    const boyIsBusy = await AcceptedByDelivery.findOne({
      deliveryBoyId: deliveryBoyId,
      status: { $ne: "Delivered" }
    });

    if (boyIsBusy) {
      return NextResponse.json(
        { success: false, message: "You already have an active delivery!" },
        { status: 400 }
      );
    }

    // 2. Check if order is already accepted (ADDED THIS CHECK)
    const orderAlreadyAccepted = await AcceptedByDelivery.findOne({
      orderId: orderId
    });

    if (orderAlreadyAccepted) {
      return NextResponse.json(
        {
          success: false,
          message: "Too late! Another delivery boy just accepted this order."
        },
        { status: 409 }
      );
    }

    // 3. Try to save the order
    try {
      const newAcceptedOrder = new AcceptedByDelivery({
        ...body,
        acceptedAt: new Date(),
        status: "Accepted by Delivery"
      });

      // This triggers the Unique Index wall
      await newAcceptedOrder.save();

      // ✅ NEW: Update OrderStatus collection
      await OrderStatus.updateOne(
        { orderId: orderId },
        {
          $set: {
            status: "will be delivered soon" // Update status in orderstatuses
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: "Order accepted successfully!"
      });

    } catch (dbError) {
      // ✅ FIX: Catch the 11000 Duplicate error and return "Too Late"
      if (dbError.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            message: "Too late! Another delivery boy just accepted this order."
          },
          { status: 409 } // Conflict Status
        );
      }
     
      // If it's another DB error, return a specific message
      return NextResponse.json(
        { success: false, message: "Database rejected the order." },
        { status: 500 }
      );
    }

  } catch (error) {
    // ✅ FIX: Handle the outer catch block
    console.error("Server Logic Error:", error);
    return NextResponse.json(
      { success: false, message: "Server connection error." },
      { status: 500 }
    );
  }
}