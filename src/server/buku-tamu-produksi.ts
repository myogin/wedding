import { getDb } from "@/db";
import { kontenUndangan } from "@/konten";
import { buatBukuTamuHandler } from "./api-buku-tamu";

/** Handler Buku Tamu dengan dependensi asli: Postgres produksi, jam sistem, dan Konten Undangan. */
export function handlerBukuTamu() {
  return buatBukuTamuHandler({ db: getDb(), sekarang: () => new Date(), kontenUndangan });
}
