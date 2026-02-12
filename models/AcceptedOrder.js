import mongoose from "mongoose";

// Schema for individual items
const ItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
});

// Schema for location
const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  mapUrl: String,
  distanceText: String,
});

const AcceptedOrderSchema = new mongoose.Schema({
  orderId: String,
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
    default: "Accepted by Restaurant",
  },

  deliveryBoyId: {
    type: String,
    default: null,
  },

  rejectedBy: {
    type: [String],
    default: [],
  },

  rest: String,
  restaurantName: String,
  restaurantLocation: {
    lat: Number,
    lng: Number,
  },
});

export default mongoose.models.AcceptedOrder ||
  mongoose.model("AcceptedOrder", AcceptedOrderSchema);
