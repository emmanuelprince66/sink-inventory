// app/api/noti/route.ts
import { NextRequest } from "next/server";
import WebSocket from "ws";

export async function GET(request: NextRequest) {
  // Get token from URL parameters (since EventSource has limited header support)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  console.log(
    "Server received token:",
    token ? `${token.substring(0, 20)}...` : "none"
  ); // Partial log for security

  if (!token) {
    return new Response("Unauthorized: Token required", { status: 401 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      let ws: WebSocket | null = null;
      let isWsConnected = false;

      const connectWs = () => {
        try {
          console.log("Attempting WebSocket connection with token...");
          // Browser-mimicking headers to bypass potential server blocks
          const wsHeaders = {
            Authorization: `Bearer ${token}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // Mimic Chrome
            // Origin: "https://your-frontend-domain.com", // Uncomment if needed; test without first
          };

          ws = new WebSocket("wss://www.api.sync360.africa/ws/user/", {
            headers: wsHeaders,
            perMessageDeflate: false, // Disable compression to simplify handshake
          });

          ws.on("open", () => {
            console.log("WebSocket connected to backend");
            isWsConnected = true;
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
            console.log("WebSocket closed:", code, reason?.toString());
            isWsConnected = false;
            const data = `data: ${JSON.stringify({
              type: "connection",
              status: "disconnected",
              code,
              reason: reason?.toString(),
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
            // Don't close stream here; let it hang for potential reconnect if needed
          });

          ws.on("error", (error) => {
            console.error("WebSocket error:", error.message);
            isWsConnected = false;
            const errorData = {
              type: "error",
              message: error.message,
              timestamp: new Date().toISOString(),
            };
            // Specific handling for 403
            if (error.message.includes("403")) {
              errorData.message +=
                " (Check token validity or server restrictions)";
            }
            const data = `data: ${JSON.stringify(errorData)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
            // Don't call controller.error() here to avoid crashing the stream; instead, close gracefully
            // controller.error(new Error("WebSocket error: " + error.message)); // Commented out to prevent pipe failure
          });
        } catch (error) {
          console.error("Failed to create WebSocket:", error);
          const data = `data: ${JSON.stringify({
            type: "error",
            message:
              "Failed to create WebSocket connection: " +
              (error as Error).message,
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          controller.close(); // Close stream on init failure
        }
      };

      connectWs(); // Initial connection

      // Handle client disconnect
      return () => {
        console.log("SSE client disconnected, closing WebSocket");
        if (ws && isWsConnected) {
          ws.close(1000, "Client disconnected");
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
