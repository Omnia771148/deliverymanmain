import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});

const AcceptedOrderSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  restaurantId: String,

  items: [ItemSchema],
  totalCount: Number,
  totalPrice: Number,

  orderDate: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    default: "Accepted by Restaurant",
  },

  deliveryBoyId: {
    type: String, // can be ObjectId later
    default: null,
  },

  rejectedBy: {
    type: [String], // deliveryBoy IDs
    default: [],
  },

  rest: String,
});

export default mongoose.models.AcceptedOrder ||
  mongoose.model("AcceptedOrder", AcceptedOrderSchema);
