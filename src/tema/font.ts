import { Bodoni_Moda, Inter, Playfair_Display, Poppins } from "next/font/google";
import type { FontDisplay, FontTeks } from "./pilihan-font";

// next/font hanya menerima pemanggilan statis di level modul, jadi setiap pilihan font
// dideklarasikan di sini dan Konten Undangan memilih lewat kuncinya.
const bodoniModa = Bodoni_Moda({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-teks",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-teks", display: "swap" });

export const FONT_DISPLAY: Record<FontDisplay, { variable: string }> = {
  "bodoni-moda": bodoniModa,
  "playfair-display": playfairDisplay,
};

export const FONT_TEKS: Record<FontTeks, { variable: string }> = {
  poppins,
  inter,
};
