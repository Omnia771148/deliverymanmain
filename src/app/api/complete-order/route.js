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

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return Response.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`Processing order completion for ID: ${orderId}`);

    // Use lean() for robustness and raw object access
    const order = await AcceptedByDelivery.findById(orderId).lean();

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found in accepted deliveries" },
        { status: 404 }
      );
    }

    // ✅ FETCH DELIVERY BOY DETAILS (Use existing if available, else fetch)
    // We need account details from the user collection regardless
    let deliveryBoyName = order.deliveryBoyName || "";
    let deliveryBoyPhone = order.deliveryBoyPhone || "";
    let accountNumber = "";
    let ifscCode = "";

    if (order.deliveryBoyId) {
      const deliveryBoy = await DeliveryBoyUser.findById(order.deliveryBoyId);
      if (deliveryBoy) {
        deliveryBoyName = deliveryBoyName || deliveryBoy.name;
        deliveryBoyPhone = deliveryBoyPhone || deliveryBoy.phone;
        accountNumber = deliveryBoy.accountNumber || "";
        ifscCode = deliveryBoy.ifscCode || "";
      }
    }

    const orderData = { ...order };
    delete orderData._id;

    const completedOrderData = {
      ...orderData,
      completedAt: new Date(),
      status: "Completed",
      paymentStatus: "Completed",
      verificationStatus: "verified",
      verificationTime: new Date(),
      originalAcceptedOrderId: orderId,
      deliveryBoyName,
      deliveryBoyPhone,
    };

    const completedOrder = new FinalCompletedOrder(completedOrderData);
    await completedOrder.save();

    console.log(`✅ Order saved to FinalCompletedOrder with ID: ${completedOrder._id}`);

    // ✅ SAVE TO PendingPaymentOfDeliveryBoy
    // ✅ SAVE TO PendingPaymentOfDeliveryBoy
    try {
      // Check if there is already a PENDING payment record for this delivery boy
      // We use findOneAndUpdate with upsert to handle concurrency and atomic updates better

      const chargeToAdd = parseFloat(order.deliveryCharge) || 0;

      const updatedPayment = await PendingPaymentOfDeliveryBoy.findOneAndUpdate(
        {
          deliveryBoyId: order.deliveryBoyId,
          status: "Pending"
        },
        {
          // Atomically increment the charge
          $inc: { deliveryCharge: chargeToAdd },

          // Update these fields if they changed (or set them if new)
          $set: {
            deliveryBoyName: deliveryBoyName,
            deliveryBoyPhone: deliveryBoyPhone,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            lastCompletedOrderId: completedOrder._id,
            updatedAt: new Date()
          },

          // Set these ONLY if creating a new document
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        {
          upsert: true, // Create if not exists
          new: true,    // Return the updated document
          setDefaultsOnInsert: true
        }
      );

      console.log(`✅ Pending payment processed. New Total: ${updatedPayment.deliveryCharge}`);

    } catch (paymentError) {
      console.error("⚠️ Error saving pending payment record:", paymentError);
      // We don't block the main success response if this fails, but logging it is important
    }

    // ✅ ADD THIS: update orderstatuses
    // ✅ CHANGED: Delete from orderstatuses instead of updating
    await OrderStatus.deleteOne({ orderId: order.orderId });
    console.log(`🗑️ Order deleted from orderstatuses: ${order.orderId}`);

    // ✅ DELETE from AcceptedOrder (Clean up the original order now that it's completed)
    if (order.originalOrderId) {
      await AcceptedOrder.findByIdAndDelete(order.originalOrderId);
      console.log(`🗑️ Original order deleted from AcceptedOrder: ${order.originalOrderId}`);
    }

    await AcceptedByDelivery.findByIdAndDelete(orderId);
    console.log(`🗑️ Order deleted from AcceptedByDelivery: ${orderId}`);

    return Response.json(
      {
        success: true,
        message: "Order successfully completed and moved to completed orders",
        data: {
          newOrderId: completedOrder._id,
          originalOrderId: orderId,
          status: "Completed",
          completedAt: completedOrder.completedAt,
          grandTotal: completedOrder.grandTotal,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error completing order:", error);
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
