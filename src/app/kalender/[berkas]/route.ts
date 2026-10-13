import { kontenUndangan } from "@/konten";
import { berkasIcs } from "@/konten/kalender";
import { buatKalenderHandler } from "@/server/kalender";

// Satu berkas .ics per Acara, dibuat saat build dari Konten Undangan. Nama berkas lain berarti 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return kontenUndangan.acara.map((acara) => ({ berkas: berkasIcs(acara) }));
}

export const GET = buatKalenderHandler({ kontenUndangan, sekarang: () => new Date() });
