// app/api/noti/route.ts
import { NextRequest } from "next/server";
import WebSocket from "ws";

export async function GET(request: NextRequest) {
  // Get token from URL parameters (since EventSource has limited header support)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  console.log("server, token", token);

  if (!token) {
    return new Response("Unauthorized: Token required", { status: 401 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      let ws: WebSocket | null = null;

      try {
        // Connect to your WebSocket server with the dynamic token
        console.log("server token", token);
        ws = new WebSocket("wss://www.api.sync360.africa/ws/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        ws.on("open", () => {
          console.log("WebSocket connected to backend");
          // Send initial SSE message to confirm connection
          const data = `data: ${JSON.stringify({
            type: "connection",
            status: "connected",
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        });

        ws.on("message", (rawData) => {
          try {
            // Convert buffer to string if needed
            const messageData = rawData.toString();
            console.log("Received WebSocket message:", messageData);
            // Format as SSE and send to client
            const data = `data: ${messageData}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        });

        ws.on("close", (code, reason) => {
          console.log("WebSocket closed:", code, reason.toString());
          const data = `data: ${JSON.stringify({
            type: "connection",
            status: "disconnected",
            code,
            reason: reason.toString(),
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          controller.close();
        });

        ws.on("error", (error) => {
          console.error("WebSocket error:", error);
          const data = `data: ${JSON.stringify({
            type: "error",
            message: error.message,
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          controller.error(new Error("WebSocket error: " + error.message));
        });
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        controller.error(new Error("Failed to create WebSocket connection"));
      }

      // Handle client disconnect
      return () => {
        console.log("SSE client disconnected, closing WebSocket");
        if (ws) {
          ws.close();
        }
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
