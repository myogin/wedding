import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { kontenUndangan } from "@/konten";
import { FONT_DISPLAY, FONT_TEKS } from "@/tema/font";
import "./globals.css";

export const metadata: Metadata = {
  title: kontenUndangan.metadata.judul,
  description: kontenUndangan.metadata.deskripsi,
};

const { warna, font } = kontenUndangan.tema;

// Inline di <html>, jadi menang atas nilai bawaan :root di stylesheet mana pun (termasuk engine scroll-craft).
const tokenTema = {
  "--sc-font-display": 'var(--font-display), "Bodoni Moda", Georgia, serif',
  "--sc-font-text": "var(--font-teks), system-ui, sans-serif",
  "--sc-canvas": warna.canvas,
  "--sc-surface": warna.surface,
  "--sc-ink": warna.ink,
  "--sc-ink-soft": warna.inkSoft,
  "--sc-accent": warna.accent,
  "--sc-accent-ink": warna.accentInk,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${FONT_DISPLAY[font.display].variable} ${FONT_TEKS[font.teks].variable}`} style={tokenTema}>
      <body>{children}</body>
    </html>
  );
}
