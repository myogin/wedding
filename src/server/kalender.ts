import { namaMempelai } from "@/konten";
import { berkasIcs, isiIcs } from "@/konten/kalender";
import type { KontenUndangan } from "@/konten/skema";

type Dependensi = {
  kontenUndangan: KontenUndangan;
  /** Jam untuk DTSTAMP (waktu berkas dibuat). Tes menyuntikkan jam tetap. */
  sekarang: () => Date;
};

/** GET /kalender/:berkas: berkas .ics satu Acara, mis. /kalender/resepsi.ics. Nama berkas lain berarti 404. */
export function buatKalenderHandler({ kontenUndangan, sekarang }: Dependensi) {
  return async function GET(_request: Request, { params }: { params: Promise<{ berkas: string }> }): Promise<Response> {
    const { berkas } = await params;
    const acara = kontenUndangan.acara.find((a) => berkasIcs(a) === berkas);
    if (!acara) return new Response(null, { status: 404 });

    return new Response(isiIcs(acara, namaMempelai(kontenUndangan), sekarang()), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${berkas}"`,
      },
    });
  };
}
