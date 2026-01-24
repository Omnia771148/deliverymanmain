import mongoose from "mongoose";

const deliveryBoyNewAddSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        // Firebase UID to link the authenticated phone user
        firebaseUid: { type: String, required: true },
        // Document URLs and Numbers from Firebase Storage
        aadharUrl: { type: String, required: true },
        aadharNumber: { type: String, required: true }, // Number on Aadhar
        rcUrl: { type: String, required: true },
        rcNumber: { type: String, required: true }, // Number on RC
        licenseUrl: { type: String, required: true },
        licenseNumber: { type: String, required: true }, // Number on License
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        collection: "Deliveryboynewadd",
        timestamps: true
    }
);

export default mongoose.models.DeliveryBoyNewAdd ||
    mongoose.model("DeliveryBoyNewAdd", deliveryBoyNewAddSchema);
