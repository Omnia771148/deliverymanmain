import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectionToDatabase();
    
    const { searchParams } = new URL(request.url);
    const deliveryBoyId = searchParams.get("deliveryBoyId");

    if (!deliveryBoyId) {
      return NextResponse.json({ success: false, message: "Delivery Boy ID is required" }, { status: 400 });
    }

    // Since we don't have a model, we fetch directly from the collection
    const reviews = await mongoose.connection.db
      .collection("orderreviews")
      .find({ deliveryBoyId: deliveryBoyId })
      .toArray();

    return NextResponse.json({ success: true, data: reviews });
  } catch (err) {
    console.error("Fetch reviews error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
