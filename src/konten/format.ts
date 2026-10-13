import type { Acara, Gambar, KontenUndangan } from "./skema";

/** "gungdde_" dari "https://www.instagram.com/gungdde_"; null bila URL tidak menyebut akun. */
export function namaInstagram(url: string): string | null {
  return new URL(url).pathname.split("/").filter(Boolean)[0] ?? null;
}

/** Baris-baris teks asli kutipan, tanpa baris kosong. */
export function barisTeksAsli(kutipan: KontenUndangan["pembuka"]["kutipan"]): string[] {
  return kutipan.teksAsli?.split("\n").filter((baris) => baris.trim()) ?? [];
}

/** Nilai CSS object-position dari fokus gambar; tengah bila tidak diisi. */
export function posisiFokus(gambar: Pick<Gambar, "fokus">): string {
  const { x, y } = gambar.fokus ?? { x: 0.5, y: 0.5 };
  return `${x * 100}% ${y * 100}%`;
}

/** "Rabu, 21 Oktober 2026" dari tanggal setempat Acara, tanpa konversi zona waktu. */
export function formatTanggalAcara(acara: Pick<Acara, "mulai">): string {
  const [tahun, bulan, hari] = acara.mulai.slice(0, 10).split("-").map(Number);
  const tanggal = new Date(Date.UTC(tahun!, bulan! - 1, hari!));
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(tanggal);
}
