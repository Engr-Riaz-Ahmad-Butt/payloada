import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Payloada - The modern JSON workspace for developers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0A0C0F",
          color: "#E8EAF0",
          border: "1px solid #1E2433",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: "-2px" }}>
          Payload<span style={{ color: "#C07040" }}>a</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 30, color: "#8B92A8" }}>
          The modern JSON workspace for developers
        </div>
        <div
          style={{
            marginTop: 42,
            display: "flex",
            gap: 18,
            fontSize: 18,
            color: "#5A6070",
          }}
        >
          <span>Format</span>
          <span style={{ color: "#1E2433" }}>·</span>
          <span>Validate</span>
          <span style={{ color: "#1E2433" }}>·</span>
          <span>Convert</span>
          <span style={{ color: "#1E2433" }}>·</span>
          <span>AI Assist</span>
          <span style={{ color: "#1E2433" }}>·</span>
          <span>Visualize</span>
        </div>
      </div>
    ),
    size,
  );
}
