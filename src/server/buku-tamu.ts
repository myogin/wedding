import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { aturanRsvp, periksaRsvp, type GalatRsvp, type RingkasanRsvp, type RsvpValid } from "@/buku-tamu/rsvp";
import { UCAPAN_PER_HALAMAN, type HalamanUcapan, type Ucapan } from "@/buku-tamu/ucapan";
import type { Db } from "@/db";
import { rsvp } from "@/db/tabel";
import type { KontenUndangan } from "@/konten/skema";

export type DependensiBukuTamu = {
  db: Db;
  /** Jam untuk waktu dibuat. Tes menyuntikkan jam tetap. */
  sekarang: () => Date;
  kontenUndangan: KontenUndangan;
};

/** RSVP seperti yang dikembalikan ke Tamu setelah tersimpan. */
export type RsvpTersimpan = RsvpValid & { id: string; dibuat: Date };

export type HasilKirimRsvp = { ok: true; rsvp: RsvpTersimpan } | { ok: false; galat: GalatRsvp };

/** Halaman Buku Tamu dari database. `dibuat` menjadi string ISO saat dikirim sebagai JSON. */
export type HalamanUcapanTersimpan = Omit<HalamanUcapan, "item"> & {
  item: (Omit<Ucapan, "dibuat"> & { dibuat: Date })[];
};

/** Ucapan publik: RSVP yang ucapannya terisi dan tidak disembunyikan Mempelai. */
const ucapanPublik = and(isNotNull(rsvp.ucapan), eq(rsvp.tersembunyi, false));

/**
 * Buku Tamu (spec Modul 3): menyimpan RSVP dan Ucapan, menghitung ringkasannya, dan menyusun daftar Ucapan.
 * Route handler hanya lapisan tipis di atas modul ini.
 */
export function buatBukuTamu({ db, sekarang, kontenUndangan }: DependensiBukuTamu) {
  const aturan = aturanRsvp(kontenUndangan);

  return {
    async kirimRsvp(masukan: unknown): Promise<HasilKirimRsvp> {
      const hasil = periksaRsvp(aturan, masukan);
      if (!hasil.ok) return hasil;
      const [baris] = await db
        .insert(rsvp)
        .values({ ...hasil.rsvp, dibuat: sekarang() })
        // Kolom dipilih satu per satu: kolom internal (tersembunyi, nanti hash IP) tidak ikut ke Tamu.
        .returning({
          id: rsvp.id,
          nama: rsvp.nama,
          kehadiran: rsvp.kehadiran,
          idAcara: rsvp.idAcara,
          pax: rsvp.pax,
          ucapan: rsvp.ucapan,
          dibuat: rsvp.dibuat,
        });
      return { ok: true, rsvp: baris! };
    },

    /** Semua RSVP dihitung, termasuk yang Ucapannya disembunyikan. */
    async ringkasan(): Promise<RingkasanRsvp> {
      const [hasil] = await db
        .select({
          totalRespons: sql<number>`count(*)`.mapWith(Number),
          hadir: sql<number>`count(*) filter (where ${rsvp.kehadiran} = 'hadir')`.mapWith(Number),
          tidakHadir: sql<number>`count(*) filter (where ${rsvp.kehadiran} = 'tidak_hadir')`.mapWith(Number),
          totalPax: sql<number>`coalesce(sum(${rsvp.pax}), 0)`.mapWith(Number),
        })
        .from(rsvp);
      return hasil!;
    },

    /** Ucapan publik, terbaru dulu, per halaman (mulai dari 1). Halaman di luar jangkauan berisi kosong. */
    async daftarUcapan(halaman: number): Promise<HalamanUcapanTersimpan> {
      const [hasil] = await db
        .select({ jumlah: sql<number>`count(*)`.mapWith(Number) })
        .from(rsvp)
        .where(ucapanPublik);
      const baris = await db
        .select({ nama: rsvp.nama, kehadiran: rsvp.kehadiran, ucapan: rsvp.ucapan, dibuat: rsvp.dibuat })
        .from(rsvp)
        .where(ucapanPublik)
        // id memecah urutan Ucapan yang dibuat pada saat yang sama, jadi paginasinya stabil.
        .orderBy(desc(rsvp.dibuat), desc(rsvp.id))
        .limit(UCAPAN_PER_HALAMAN)
        .offset((halaman - 1) * UCAPAN_PER_HALAMAN);
      // ucapanPublik hanya memuat RSVP yang ucapannya terisi.
      const item = baris.map((u) => ({ ...u, ucapan: u.ucapan! }));
      return { item, halaman, totalHalaman: Math.max(1, Math.ceil(hasil!.jumlah / UCAPAN_PER_HALAMAN)) };
    },
  };
}
