import path from "node:path";
import sharp from "sharp";
import type { Gambar } from "./skema";

/**
 * Urutan foto untuk kilasan film di layar loading: dari yang paling gelap ke yang paling terang.
 *
 * Foto berganti beberapa kali per detik. Bila urutannya acak, layar berkedip gelap-terang bolak-balik,
 * yang tidak nyaman dan berisiko bagi Tamu yang peka terhadap kedipan. Diurutkan menurut kecerahan,
 * cahaya naik bertahap dan hanya ada satu lompatan (terang ke gelap) di setiap putaran.
 * Dihitung saat build, karena halaman Undangan statis.
 */
export async function urutkanKilasan(foto: Gambar[]): Promise<Gambar[]> {
  const kecerahan = await Promise.all(
    foto.map(async (gambar) => {
      const berkas = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", gambar.src);
      const { channels } = await sharp(berkas).greyscale().stats();
      return channels[0]?.mean ?? 0;
    }),
  );
  return foto
    .map((gambar, i) => ({ gambar, kecerahan: kecerahan[i] ?? 0 }))
    .sort((a, b) => a.kecerahan - b.kecerahan)
    .map(({ gambar }) => gambar);
}
