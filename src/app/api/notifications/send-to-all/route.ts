import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK (do this once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, title, body, data, imageUrl } = await request.json();

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json(
        { error: "Tokens array is required" },
        { status: 400 }
      );
    }

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl }), // Note: Changed from imageUrl to image
      },
      data: data || {},
      tokens,
      webpush: {
        notification: {
          icon: "/icons/notification-icon.png",
          badge: "/icons/badge-icon.png",
          requireInteraction: true,
        },
        fcmOptions: {
          link: data?.url || "/",
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("Successfully sent messages:", response);

    return NextResponse.json(
      {
        message: "Notifications sent successfully",
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
