import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import DeliveryBoyUser from "../../../../../models/DeliveryBoyUser";

export async function POST(req) {
  try {
    // 1. Destructure ALL incoming fields including Firebase UID and Image URLs
    const {
      name,
      email,
      password,
      phone,
      firebaseUid,
      aadharUrl,
      aadharNumber,
      rcUrl,
      rcNumber,
      licenseUrl,
      licenseNumber
    } = await req.json();

    // 2. Updated Validation (Ensure docs and firebaseUid are present)
    if (!name || !email || !password || !phone || !firebaseUid ||
      !aadharUrl || !aadharNumber ||
      !rcUrl || !rcNumber ||
      !licenseUrl || !licenseNumber) {
      return NextResponse.json(
        { message: "All fields, documents, and document numbers are required" },
        { status: 400 }
      );
    }

    await connectionToDatabase();

    // 3. Check if email, phone, OR firebaseUid already exists
    const userExists = await DeliveryBoyUser.findOne({
      $or: [{ email }, { phone }, { firebaseUid }],
    });

    if (userExists) {
      return NextResponse.json(
        { message: "User already exists with this email, phone, or Firebase ID" },
        { status: 409 }
      );
    }

    // 4. Create the full user profile in MongoDB
    await DeliveryBoyUser.create({
      name,
      email,
      password, // Plain text as requested
      phone,
      firebaseUid,
      aadharUrl,
      aadharNumber,
      rcUrl,
      rcNumber,
      licenseUrl,
      licenseNumber,
    });

    return NextResponse.json(
      { message: "Signup successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("MongoDB Signup Error Details:", error);
    return NextResponse.json(
      { message: "Server error during registration: " + (error.message || "Unknown Error") },
      { status: 500 }
    );
  }
}