import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    // NEW: Firebase UID to link the authenticated phone user
    firebaseUid: { type: String, required: true },
    // NEW: Document URLs and Numbers from Firebase Storage
    aadharUrl: { type: String, required: true },
    aadharNumber: { type: String, required: true }, // Number on Aadhar
    rcUrl: { type: String, required: true },
    rcNumber: { type: String, required: true }, // Number on RC
    licenseUrl: { type: String, required: true },
    licenseNumber: { type: String, required: true }, // Number on License
    isActive: { type: Boolean, default: true },
  },
  {
    collection: "deliveryboyusers",
    timestamps: true // Added this to automatically track when they joined
  }
);

export default mongoose.models.DeliveryBoyUser ||
  mongoose.model("DeliveryBoyUser", deliveryBoySchema);