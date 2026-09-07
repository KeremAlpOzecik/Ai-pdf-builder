import { ImageResponse } from "next/og";

export const alt = "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "space-between",
          background: "#111827",
          color: "white",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#c4b5fd",
            fontWeight: 600,
          }}
        >
          AI CV Builder
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700, maxWidth: 920 }}>
            Ücretsiz PDF düzenle, ATS uyumlu CV oluştur
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.72)", maxWidth: 860 }}>
            LinkedIn özgeçmişini tarayıcıda düzelt. Hesap yok, dosya sende kalır.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
