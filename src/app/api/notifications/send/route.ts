// src/app/api/notifications/send/route.ts
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK with better error handling
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error(
        "Missing Firebase Admin credentials in environment variables"
      );
    }

    // Better private key handling
    let formattedPrivateKey = privateKey;

    // Handle different private key formats
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      // Remove surrounding quotes if they exist
      formattedPrivateKey = privateKey.slice(1, -1);
    }

    // Replace escaped newlines with actual newlines
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n");

    // Ensure the key starts and ends correctly
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      throw new Error("Invalid private key format - missing BEGIN marker");
    }

    if (!formattedPrivateKey.includes("-----END PRIVATE KEY-----")) {
      throw new Error("Invalid private key format - missing END marker");
    }

    const credential = admin.credential.cert({
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey: formattedPrivateKey,
    });

    return admin.initializeApp({
      credential,
      projectId: projectId.trim(),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();

    // Parse request body
    const body = await request.json();
    const { token, title, body: messageBody, data, imageUrl } = body;

    console.log("Received notification request:", {
      token: token?.substring(0, 20) + "...",
      title,
      body: messageBody,
    });

    // Validate required fields
    if (!token || !title || !messageBody) {
      console.error("Missing required fields:", {
        hasToken: !!token,
        hasTitle: !!title,
        hasBody: !!messageBody,
      });
      return NextResponse.json(
        { error: "Token, title, and body are required" },
        { status: 400 }
      );
    }

    // Prepare message payload
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(imageUrl && { imageUrl }),
      },
      data: {
        ...data,
        // Ensure all data values are strings (FCM requirement)
        url: data?.url || "/",
        timestamp: data?.timestamp || new Date().toISOString(),
      },
      token,
      webpush: {
        notification: {
          icon: "/icons/notification-icon.png",
          badge: "/icons/badge-icon.png",
          requireInteraction: true,
          actions: [
            {
              action: "view",
              title: "View",
              icon: "/icons/view-icon.png",
            },
            {
              action: "dismiss",
              title: "Dismiss",
              icon: "/icons/dismiss-icon.png",
            },
          ],
        },
        fcmOptions: {
          link: data?.url || "/",
        },
      },
    };

    console.log("Sending message payload:", JSON.stringify(message, null, 2));

    // Send the message
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    return NextResponse.json(
      {
        success: true,
        message: "Notification sent successfully",
        messageId: response,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in notification API:", error);

    // Handle specific Firebase errors
    if (error.code) {
      switch (error.code) {
        case "messaging/registration-token-not-registered":
          return NextResponse.json(
            { error: "Invalid or expired FCM token" },
            { status: 400 }
          );
        case "messaging/invalid-argument":
          return NextResponse.json(
            { error: "Invalid message format" },
            { status: 400 }
          );
        case "app/invalid-credential":
          return NextResponse.json(
            {
              error:
                "Invalid Firebase credentials - check your private key format",
            },
            { status: 500 }
          );
        default:
          console.error("Firebase error code:", error.code);
          return NextResponse.json(
            { error: `Firebase error: ${error.code}` },
            { status: 500 }
          );
      }
    }

    // Handle initialization errors
    if (error.message?.includes("Missing Firebase Admin credentials")) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Firebase credentials" },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
