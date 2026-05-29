import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const alt = "Sink Inventory — Inventory & POS Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image generation (rendered server-side, so social crawlers always see it)
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "#16a34a",
            color: "#ffffff",
            fontSize: 96,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          S
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>
          <span style={{ color: "#ffffff" }}>Sink</span>
          <span style={{ color: "#4ade80" }}>&nbsp;Inventory</span>
        </div>

        {/* Tagline */}
        <div style={{ marginTop: 16, fontSize: 34, color: "#cbd5e1" }}>
          Inventory & POS Management
        </div>
      </div>
    ),
    { ...size }
  );
}
