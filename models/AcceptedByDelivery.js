import mongoose from "mongoose";

// Reuse the same schemas for consistency
const ItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
});

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  mapUrl: String,
});

const AcceptedByDeliverySchema = new mongoose.Schema(
  {
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcceptedOrder",
      required: true,
    },

    // ✅ LOGIC ADDED: unique: true stops multiple boys from taking the same orderId
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },

    deliveryBoyId: String,
    deliveryBoyName: String,
    deliveryBoyPhone: String,

    userId: String,
    restaurantId: String,

    userName: String,
    userEmail: String,
    userPhone: String,

    items: [ItemSchema],
    totalCount: Number,
    totalPrice: Number,
    gst: Number,
    deliveryCharge: Number,
    grandTotal: Number,
    aa: String,

    location: LocationSchema,
    deliveryAddress: String,

    paymentStatus: {
      type: String,
      default: "Pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    orderDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Accepted by Delivery",
    },

    acceptedAt: {
      type: Date,
      default: Date.now,
    },

    rest: String,
    restaurantName: String,
    restaurantLocation: {
      lat: Number,
      lng: Number,
    },
    rejectedBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, strict: false }
);

// This ensures the index is created in the database
AcceptedByDeliverySchema.index({ orderId: 1 }, { unique: true });

export default mongoose.models.AcceptedByDelivery ||
  mongoose.model("AcceptedByDelivery", AcceptedByDeliverySchema);