// src/app/api/notifications/token/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Here you would typically save the token to your database
    // associated with the user's account
    console.log("FCM Token received:", token);

    // Example: Save to database
    // await saveTokenToDatabase(userId, token);

    return NextResponse.json(
      { message: "Token saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving token:", error);
    return NextResponse.json(
      { error: "Failed to save token" },
      { status: 500 }
    );
  }
}
