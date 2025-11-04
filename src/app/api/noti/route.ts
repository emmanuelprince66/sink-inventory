// app/api/noti/route.ts
import { NextRequest } from "next/server";
import WebSocket from "ws";

export const config = {
  runtime: "nodejs",
  maxDuration: 900, // Static 15min; works for AWS Lambda/ECS (ignores in EC2)
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  console.log(
    "Server received token:",
    token ? `${token.substring(0, 20)}...` : "none"
  );

  if (!token) {
    return new Response("Unauthorized: Token required", { status: 401 });
  }

  // TransformStream for streaming compat
  const stream = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
  });
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let closed = false;

  const enqueue = (data: string) => {
    if (!closed) writer.write(encoder.encode(data));
  };

  const closeStream = () => {
    if (!closed) {
      writer.close();
      closed = true;
    }
  };

  // IMMEDIATE enqueue to kill "pending"
  enqueue(
    `data: ${JSON.stringify({
      type: "connection",
      status: "connecting",
      timestamp: new Date().toISOString(),
    })}\n\n`
  );
  console.log("SSE: Immediate connecting event sent");

  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  const maxReconnects = 3;

  // Heartbeat every 30s
  const heartbeatInterval = setInterval(() => {
    if (!closed) {
      enqueue(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
    }
  }, 30000);

  const connectWs = async () => {
    if (reconnectAttempts >= maxReconnects) {
      enqueue(
        `data: ${JSON.stringify({
          type: "error",
          message: "Max reconnection attempts reached",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      closeStream();
      return;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      console.log(`WS timeout after 10s (attempt ${reconnectAttempts + 1})`);
      enqueue(
        `data: ${JSON.stringify({
          type: "error",
          message: "WS connect timeout - check network/latency",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      if (ws) ws.close();
      setTimeout(() => {
        reconnectAttempts++;
        connectWs();
      }, 2000 * reconnectAttempts);
    }, 10000);

    try {
      console.log(`WS connect attempt ${reconnectAttempts + 1}...`);
      const wsHeaders = {
        Authorization: `Bearer ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };

      ws = new WebSocket("wss://www.api.sync360.africa/ws/user/", {
        headers: wsHeaders,
        perMessageDeflate: false,
        timeout: 10000,
      });

      clearTimeout(timeoutId);

      ws.on("open", () => {
        console.log("WS connected");
        reconnectAttempts = 0;
        enqueue(
          `data: ${JSON.stringify({
            type: "connection",
            status: "connected",
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
      });

      ws.on("message", (rawData) => {
        const messageData = rawData.toString();
        console.log("WS msg:", messageData);
        enqueue(`data: ${messageData}\n\n`);
      });

      ws.on("close", (code, reason) => {
        console.log("WS closed:", code, reason?.toString());
        enqueue(
          `data: ${JSON.stringify({
            type: "connection",
            status: "disconnected",
            code,
            reason: reason?.toString(),
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
        if (!closed) setTimeout(() => connectWs(), 2000);
      });

      ws.on("error", (error) => {
        console.error("WS error:", error.message);
        const errorMsg = error.message.includes("403")
          ? `${error.message} (token/server issue)`
          : error.message;
        enqueue(
          `data: ${JSON.stringify({
            type: "error",
            message: errorMsg,
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("WS creation failed:", error);
      enqueue(
        `data: ${JSON.stringify({
          type: "error",
          message: `WS init fail: ${(error as Error).message}`,
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
      closeStream();
    }
  };

  connectWs();

  // Cleanup
  request.signal.addEventListener("abort", () => {
    console.log("Client disconnect");
    clearInterval(heartbeatInterval);
    if (ws) ws.close(1000, "Client gone");
    closeStream();
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "X-Accel-Buffering": "no", // Anti-buffer for AWS ALB/Nginx
    },
  });
}
