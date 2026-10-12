import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

// Nama berkas mengikuti keluaran alat buat-lapisan-hero.mjs (scrollcraft/builds/undangan/alat).
// Setiap lapisan punya keadaan terang dan gelap (lentera padam, dipakai di belakang Sampul).
export const BERKAS_HERO = {
  latar: { terang: "latar.webp", gelap: "latar-gelap.webp" },
  subjek: { terang: "subjek.webp", gelap: "subjek-gelap.webp" },
  depan: { terang: "depan-sedap-malam.webp", gelap: "depan-sedap-malam-gelap.webp" },
  poster: { terang: "poster.webp", gelap: "poster-gelap.webp" },
} as const;

const ukuran = z.number().positive();
const pecahan = z.number().min(0).max(1);
const titik = z.object({ x: z.number(), y: z.number() });

/** Isi hero.json: semua angka berada di ruang bingkai foto (piksel), kecuali `fokus` dan `lentera` (pecahan bingkai). */
const skemaGeometriHero = z.object({
  bingkai: z.object({ lebar: ukuran, tinggi: ukuran }),
  subjek: z.object({ x: z.number(), y: z.number(), lebar: ukuran, tinggi: ukuran, kontak: titik }),
  depan: z.object({ lebar: ukuran, tinggi: ukuran }),
  fokus: z.object({ x: pecahan, y: pecahan }),
  /** Pusat pendar lentera; `r` adalah jari-jari dalam pecahan lebar bingkai. */
  lentera: z.array(z.object({ x: pecahan, y: pecahan, r: pecahan })),
});

export type GeometriHero = z.infer<typeof skemaGeometriHero>;
export type AsetHero = { src: string; bytes: number };
export type PasanganAsetHero = { terang: AsetHero; gelap: AsetHero };
export type DataHero = {
  geometri: GeometriHero;
  aset: Record<keyof typeof BERKAS_HERO, PasanganAsetHero>;
};

/**
 * Membaca lapisan Hero dari folder di `public`. Dipanggil saat build (halaman Undangan statis),
 * jadi berkas yang hilang atau hero.json yang rusak menggagalkan build dengan pesan yang jelas.
 */
export function muatHero(folder: string): DataHero {
  // Hanya dibaca saat build. Tanpa penanda ini Turbopack men-trace seluruh proyek ke output standalone;
  // folder public sendiri sudah disalin ke image oleh Dockerfile.
  const lokasi = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", folder);
  const petunjuk = "Bangun ulang lapisannya (scrollcraft/builds/undangan/RENCANA.md §8).";

  const bacaAset = (berkas: string): AsetHero => {
    const jalur = path.join(lokasi, berkas);
    if (!fs.existsSync(jalur)) {
      throw new Error(`Lapisan Hero tidak lengkap: ${berkas} tidak ada di public${folder}. ${petunjuk}`);
    }
    return { src: `${folder}/${berkas}`, bytes: fs.statSync(jalur).size };
  };
  const aset = {} as DataHero["aset"];
  for (const [kunci, { terang, gelap }] of Object.entries(BERKAS_HERO) as [keyof typeof BERKAS_HERO, { terang: string; gelap: string }][]) {
    aset[kunci] = { terang: bacaAset(terang), gelap: bacaAset(gelap) };
  }

  const jalurGeometri = path.join(lokasi, "hero.json");
  if (!fs.existsSync(jalurGeometri)) {
    throw new Error(`Lapisan Hero tidak lengkap: hero.json tidak ada di public${folder}. ${petunjuk}`);
  }
  const hasil = skemaGeometriHero.safeParse(JSON.parse(fs.readFileSync(jalurGeometri, "utf8")));
  if (!hasil.success) {
    throw new Error(`hero.json di public${folder} tidak valid:\n${z.prettifyError(hasil.error)}`);
  }

  return { geometri: hasil.data, aset };
}
