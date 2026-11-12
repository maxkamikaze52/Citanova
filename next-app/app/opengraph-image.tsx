import { ImageResponse } from "next/og";

export const alt = "Citanova – recepcionistas con IA para cualquier negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: 72, borderLeft: "16px solid #1d3b5c" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#16191d" }}>Citanova</div>
        <div style={{ display: "flex", fontSize: 72, lineHeight: 1.1, color: "#16191d", maxWidth: 920, fontFamily: "serif" }}>
          An assistant that books your patients while you work.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#5a6370" }}>AI receptionist for dental practices</div>
      </div>
    ),
    size,
  );
}
