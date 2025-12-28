import mongoose from "mongoose";

const AcceptedByDeliverySchema = new mongoose.Schema(
  {
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcceptedOrder",
      required: true,
    },

    orderId: String,
    deliveryBoyId: String,

    userId: String,
    restaurantId: String,

    items: Array,
    totalCount: Number,
    totalPrice: Number,

    status: {
      type: String,
      default: "Accepted by Delivery",
    },

    acceptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AcceptedByDelivery ||
  mongoose.model("AcceptedByDelivery", AcceptedByDeliverySchema);
