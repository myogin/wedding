import { ZONA_WAKTU, type Acara, type Gambar, type KontenUndangan } from "./skema";

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

/** "15.00" dari "2026-10-21T15:00": jam setempat Acara dengan pemisah titik seperti kebiasaan id-ID. */
function formatJam(waktuLokal: string): string {
  return waktuLokal.slice(11, 16).replace(":", ".");
}

/** "15.00 – 17.00 WITA", atau "15.00 WITA – Selesai" bila waktu selesai tidak diisi. */
export function formatJamAcara(acara: Pick<Acara, "mulai" | "selesai" | "zonaWaktu">): string {
  const zona = ZONA_WAKTU[acara.zonaWaktu].label;
  return acara.selesai
    ? `${formatJam(acara.mulai)} – ${formatJam(acara.selesai)} ${zona}`
    : `${formatJam(acara.mulai)} ${zona} – Selesai`;
}
