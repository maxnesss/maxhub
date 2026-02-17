import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eef2ff 0%, #f9fbff 100%)",
          border: "10px solid #d5e0f3",
          borderRadius: 36,
          color: "#24395f",
          fontSize: 68,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        MH
      </div>
    ),
    {
      ...size,
    },
  );
}
