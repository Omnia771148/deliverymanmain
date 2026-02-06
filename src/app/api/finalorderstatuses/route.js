import { NextResponse } from "next/server";

export async function GET() {
    // Return an empty list or success to satisfy legacy/cached clients
    return NextResponse.json([]);
}
