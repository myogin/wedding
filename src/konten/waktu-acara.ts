import { ZONA_WAKTU, type Acara } from "./skema";

const SEHARI_MS = 24 * 60 * 60 * 1000;

/** Instan (ms sejak epoch) dari waktu setempat Acara, mis. "2026-10-21T15:00" di Asia/Makassar. */
function instanSetempat(waktuLokal: string, acara: Pick<Acara, "zonaWaktu">): number {
  return Date.parse(`${waktuLokal}:00${ZONA_WAKTU[acara.zonaWaktu].selisihUtc}`);
}

/**
 * Kapan Acara mulai dan berakhir. Tanpa waktu selesai, Acara berakhir di akhir hari mulainya
 * (tengah malam waktu setempat).
 */
export function rentangAcara(acara: Pick<Acara, "mulai" | "selesai" | "zonaWaktu">): { mulai: number; akhir: number } {
  const mulai = instanSetempat(acara.mulai, acara);
  const akhir = acara.selesai
    ? instanSetempat(acara.selesai, acara)
    : instanSetempat(`${acara.mulai.slice(0, 10)}T00:00`, acara) + SEHARI_MS;
  return { mulai, akhir };
}
