// Font yang bisa dipilih lewat Konten Undangan. Menambah font: tambahkan kuncinya di sini,
// lalu daftarkan loader next/font-nya di font.ts (TypeScript menagih bila terlewat).
export const PILIHAN_FONT_DISPLAY = ["bodoni-moda", "playfair-display"] as const;
export const PILIHAN_FONT_TEKS = ["jost", "poppins", "inter"] as const;

export type FontDisplay = (typeof PILIHAN_FONT_DISPLAY)[number];
export type FontTeks = (typeof PILIHAN_FONT_TEKS)[number];
