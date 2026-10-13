import { buatBukuTamu, type DependensiBukuTamu } from "./buku-tamu";

/** Body JSON berupa objek, atau undefined bila bukan. */
async function bacaObjekJson(request: Request): Promise<Record<string, unknown> | undefined> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

const permintaanTidakValid = () => Response.json({ galat: "Body harus berupa objek JSON" }, { status: 400 });

/**
 * Route handler HTTP API Buku Tamu (spec Modul 3). Dibangun dari dependensinya, jadi tes menyuntikkan
 * Postgres tes, jam tetap, dan konten fixture.
 */
export function buatBukuTamuHandler(dependensi: DependensiBukuTamu) {
  const bukuTamu = buatBukuTamu(dependensi);

  return {
    /** POST /api/rsvp: 201 berisi RSVP yang tersimpan, atau 422 berisi galat per field. */
    async kirimRsvp(request: Request): Promise<Response> {
      const body = await bacaObjekJson(request);
      if (!body) return permintaanTidakValid();
      const hasil = await bukuTamu.kirimRsvp(body);
      if (!hasil.ok) return Response.json({ galat: hasil.galat }, { status: 422 });
      return Response.json(hasil.rsvp, { status: 201 });
    },

    /**
     * GET /api/rsvp/summary: total respons, hadir, tidak hadir, dan total pax. 404 bila Mempelai mematikan
     * ringkasan publik, supaya angkanya juga tidak bisa dibaca lewat API.
     */
    async ringkasanRsvp(): Promise<Response> {
      if (!dependensi.kontenUndangan.rsvp.tampilkanRingkasan) return new Response(null, { status: 404 });
      return Response.json(await bukuTamu.ringkasan(), { headers: { "Cache-Control": "no-store" } });
    },

    /**
     * GET /api/wishes?page=n: Ucapan halaman n (bawaannya 1). 400 bila n bukan bilangan bulat 1..999999
     * (batas atas mencegah offset raksasa; halaman sejauh itu toh kosong).
     */
    async daftarUcapan(request: Request): Promise<Response> {
      const page = new URL(request.url).searchParams.get("page") ?? "1";
      if (!/^[1-9]\d{0,5}$/.test(page)) {
        return Response.json({ galat: "page harus bilangan bulat mulai dari 1" }, { status: 400 });
      }
      return Response.json(await bukuTamu.daftarUcapan(Number(page)), { headers: { "Cache-Control": "no-store" } });
    },
  };
}
