import mongoose from "mongoose";
import AcceptedByDelivery from "../../../../models/AcceptedByDelivery";
import FinalCompletedOrder from "../../../../models/FinalCompletedOrder";
import AcceptedOrder from "../../../../models/AcceptedOrder";

import DeliveryBoyUser from "../../../../models/DeliveryBoyUser";

// ✅ ADD THIS (OrderStatus model)
const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model(
    "OrderStatus",
    new mongoose.Schema({}, { strict: false }),
    "orderstatuses"
  );

// ✅ ADD THIS (PendingPaymentOfDeliveryBoy model)
const PendingPaymentOfDeliveryBoy =
  mongoose.models.PendingPaymentOfDeliveryBoy ||
  mongoose.model(
    "PendingPaymentOfDeliveryBoy",
    new mongoose.Schema({}, { strict: false }),
    "pendingpaymentsofdeliveryboy"
  );

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    await connectDB();

    // 1. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { orderId } = body;

    if (!orderId) {
      return Response.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format to prevent CastError 500
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return Response.json(
        { success: false, message: "Invalid Order ID format" },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting order completion for ID: ${orderId}`);

    // 2. Fetch the accepted order
    const order = await AcceptedByDelivery.findById(orderId).lean();

    if (!order) {
      console.log(`⚠️ Order ${orderId} not found. Likely already processed.`);
      return Response.json(
        { success: false, message: "Order not found. It may have already been completed." },
        { status: 404 }
      );
    }

    // 3. Fetch Delivery Boy details to ensure we have bank/contact info
    let deliveryBoyName = order.deliveryBoyName || "Delivery Boy";
    let deliveryBoyPhone = order.deliveryBoyPhone || "";
    let accountNumber = "";
    let ifscCode = "";

    if (order.deliveryBoyId && mongoose.Types.ObjectId.isValid(order.deliveryBoyId)) {
      try {
        const deliveryBoy = await DeliveryBoyUser.findById(order.deliveryBoyId).lean();
        if (deliveryBoy) {
          deliveryBoyName = deliveryBoy.name || deliveryBoyName;
          deliveryBoyPhone = deliveryBoy.phone || deliveryBoyPhone;
          accountNumber = deliveryBoy.accountNumber || "";
          ifscCode = deliveryBoy.ifscCode || "";
        }
      } catch (dbError) {
        console.error("Non-critical error fetching delivery boy details:", dbError);
      }
    }

    // 4. Prepare data for FinalCompletedOrder
    const orderDataForCompletion = {
      ...order,
      completedAt: new Date(),
      status: "Completed",
      paymentStatus: "Completed",
      verificationStatus: "verified",
      verificationTime: new Date(),
      originalAcceptedOrderId: orderId.toString(),
      deliveryBoyName,
      deliveryBoyPhone,
    };
    
    // Remove the original _id from the lean object so FinalCompletedOrder gets its own
    delete orderDataForCompletion._id;

    // 5. Save to FinalCompletedOrder
    let completedOrder;
    try {
      completedOrder = new FinalCompletedOrder(orderDataForCompletion);
      await completedOrder.save();
      console.log(`✅ Success: Moved to FinalCompletedOrder: ${completedOrder._id}`);
    } catch (saveError) {
      console.error("Critical error saving final order:", saveError);
      throw new Error(`Failed to save completed order: ${saveError.message}`);
    }

    // 6. Async update PendingPaymentOfDeliveryBoy (Atomic update)
    if (order.deliveryBoyId) {
      try {
        const chargeToAdd = parseFloat(order.deliveryCharge) || 0;
        await PendingPaymentOfDeliveryBoy.findOneAndUpdate(
          {
            deliveryBoyId: order.deliveryBoyId,
            status: "Pending"
          },
          {
            $inc: { deliveryCharge: chargeToAdd },
            $set: {
              deliveryBoyName,
              deliveryBoyPhone,
              accountNumber,
              ifscCode,
              lastCompletedOrderId: completedOrder._id,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
        console.log(`💰 Delivery charge updated: +${chargeToAdd}`);
      } catch (paymentError) {
        console.error("Non-critical error updating payments:", paymentError);
        // We don't fail the whole request for a payment update error
      }
    }

    // 7. Cleanup tasks
    try {
      const cleanupPromises = [];
      
      // Delete from orderstatuses
      if (order.orderId) {
        cleanupPromises.push(OrderStatus.deleteOne({ orderId: order.orderId }));
      }
      
      // Delete from AcceptedOrder
      if (order.originalOrderId) {
        cleanupPromises.push(AcceptedOrder.findByIdAndDelete(order.originalOrderId));
      }
      
      // Delete from AcceptedByDelivery (The item being processed)
      cleanupPromises.push(AcceptedByDelivery.findByIdAndDelete(orderId));
      
      await Promise.all(cleanupPromises);
      console.log("🧹 Cleanup complete.");
    } catch (cleanupError) {
      console.error("Error during cleanup (non-critical):", cleanupError);
      // Even if cleanup fails, the order is already saved to FinalCompletedOrder
    }

    return Response.json(
      {
        success: true,
        message: "Order completed successfully",
        data: {
          newOrderId: completedOrder._id,
          status: "Completed"
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ CRITICAL API ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong while completing the order. Please try again.",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const deliveryBoyId = searchParams.get("deliveryBoyId");

    let query = {};
    if (deliveryBoyId) {
      query.deliveryBoyId = deliveryBoyId;
    }

    const completedOrders = await FinalCompletedOrder.find(query)
      .sort({ completedAt: -1 })
      .lean();

    return Response.json(
      {
        success: true,
        count: completedOrders.length,
        data: completedOrders,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
