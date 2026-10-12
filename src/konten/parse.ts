import { z } from "zod";
import { skemaKontenUndangan, type KontenUndangan } from "./skema";

export function parseKontenUndangan(mentah: unknown): KontenUndangan {
  const hasil = skemaKontenUndangan.safeParse(mentah);
  if (!hasil.success) {
    throw new Error(`Konten Undangan tidak valid:\n${z.prettifyError(hasil.error)}`);
  }
  return hasil.data;
}
