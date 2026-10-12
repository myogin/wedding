import type { Acara } from "./skema";

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
