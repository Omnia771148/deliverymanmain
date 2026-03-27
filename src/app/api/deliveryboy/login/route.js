export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function GET() {
  try {
    await connectionToDatabase();

    // Fetch ALL users so the frontend can filter them
    const users = await DeliveryBoyUser.find({});

    return NextResponse.json(users); 
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}