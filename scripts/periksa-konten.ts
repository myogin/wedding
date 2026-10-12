// Dijalankan sebelum `next build`: memvalidasi Konten Undangan beserta lapisan Hero-nya,
// lalu mencetak Placeholder yang masih aktif.
import { muatHero } from "@/konten/hero";
import { daftarPlaceholder } from "@/konten/placeholder";
import { kontenMentah } from "@/konten/undangan";
import { parseKontenUndangan } from "@/konten/parse";

let konten;
try {
  konten = parseKontenUndangan(kontenMentah);
  muatHero(konten.hero.folder);
} catch (error) {
  console.error(`\n✖ ${(error as Error).message}\n`);
  process.exit(1);
}

const jalurPlaceholder = daftarPlaceholder(konten);
if (jalurPlaceholder.length === 0) {
  console.log("✓ Konten Undangan valid, tidak ada Placeholder.");
} else {
  // galeri[0].src, galeri[1].src, ... diringkas menjadi "galeri[].src (10 item)".
  const jumlahPerJalur = new Map<string, number>();
  for (const jalur of jalurPlaceholder) {
    const jalurRingkas = jalur.replace(/\[\d+\]/g, "[]");
    jumlahPerJalur.set(jalurRingkas, (jumlahPerJalur.get(jalurRingkas) ?? 0) + 1);
  }
  console.warn(
    `\n⚠ Konten Undangan masih memakai ${jalurPlaceholder.length} Placeholder dari website referensi.\n` +
      `  Ganti sebelum link dibagikan ke tamu:\n` +
      [...jumlahPerJalur].map(([jalur, jumlah]) => `  - ${jalur}${jumlah > 1 ? ` (${jumlah} item)` : ""}`).join("\n") +
      "\n",
  );
}
