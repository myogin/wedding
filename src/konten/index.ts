import { parseKontenUndangan } from "./parse";
import type { KontenUndangan } from "./skema";
import { kontenMentah } from "./undangan";

/** Konten Undangan yang sudah tervalidasi. Data tidak valid menggagalkan build. */
export const kontenUndangan = parseKontenUndangan(kontenMentah);

export function acaraUtama(konten: KontenUndangan) {
  const acara = konten.acara.find((a) => a.id === konten.acaraUtama);
  if (!acara) throw new Error(`acaraUtama "${konten.acaraUtama}" tidak ditemukan`);
  return acara;
}

/** "Agung Dalem & Ayu Oka" */
export function namaMempelai(konten: KontenUndangan): string {
  return `${konten.mempelai.pria.panggilan} & ${konten.mempelai.wanita.panggilan}`;
}
