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

    const order = await AcceptedByDelivery.findById(orderId);

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found in accepted deliveries" },
        { status: 404 }
      );
    }

    // ✅ FETCH DELIVERY BOY DETAILS (Use existing if available, else fetch)
    let deliveryBoyName = order.deliveryBoyName || "";
    let deliveryBoyPhone = order.deliveryBoyPhone || "";

    if ((!deliveryBoyName || !deliveryBoyPhone) && order.deliveryBoyId) {
      const deliveryBoy = await DeliveryBoyUser.findById(order.deliveryBoyId);
      if (deliveryBoy) {
        deliveryBoyName = deliveryBoyName || deliveryBoy.name;
        deliveryBoyPhone = deliveryBoyPhone || deliveryBoy.phone;
      }
    }

    const orderData = order.toObject();
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
