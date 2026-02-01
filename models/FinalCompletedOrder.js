import mongoose from "mongoose";

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

const FinalCompletedOrderSchema = new mongoose.Schema(
  {
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcceptedOrder",
      required: true,
    },

    originalAcceptedOrderId: {
      type: String,
      required: true,
    },

    orderId: String,
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
      default: "Completed",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    orderDate: Date,
    acceptedAt: Date,
    completedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Completed",
    },

    rest: String,
    restaurantName: String,
    rejectedBy: {
      type: [String],
      default: [],
    },

    verificationStatus: {
      type: String,
      default: "verified"
    },

    verificationTime: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true, strict: false }
);

export default mongoose.models.FinalCompletedOrder ||
  mongoose.model("FinalCompletedOrder", FinalCompletedOrderSchema);