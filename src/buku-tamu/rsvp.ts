// Aturan RSVP yang dipakai bersama oleh form di browser dan POST /api/rsvp di server.
import { z } from "zod";
import type { KontenUndangan } from "../konten/skema";
import { PANJANG_MAKS_NAMA_TAMU } from "../tamu/konteks-tamu";

export const KEHADIRAN = ["hadir", "tidak_hadir"] as const;
export type Kehadiran = (typeof KEHADIRAN)[number];

/** Label kehadiran yang dilihat Tamu, di pilihan form maupun di Buku Tamu. */
export const LABEL_KEHADIRAN: Record<Kehadiran, string> = { hadir: "Hadir", tidak_hadir: "Tidak Hadir" };

/** Sama dengan batas nama dari Link Tamu, jadi nama yang terisi otomatis selalu muat. */
export const PANJANG_MAKS_NAMA = PANJANG_MAKS_NAMA_TAMU;
export const PANJANG_MAKS_UCAPAN = 500;

/** Bagian Konten Undangan yang menentukan RSVP mana yang valid. */
export type AturanRsvp = {
  /** Id Acara, berurutan seperti di Konten Undangan. */
  idAcara: string[];
  batasPax: number;
};

export function aturanRsvp(konten: Pick<KontenUndangan, "acara" | "rsvp">): AturanRsvp {
  return { idAcara: konten.acara.map((a) => a.id), batasPax: konten.rsvp.batasPax };
}

/** RSVP yang lolos aturan, siap disimpan. */
export type RsvpValid = {
  nama: string;
  kehadiran: Kehadiran;
  idAcara: string[];
  pax: number;
  ucapan: string | null;
};

export type FieldRsvp = keyof RsvpValid;
/** Satu pesan galat per field, dalam bahasa Indonesia. */
export type GalatRsvp = Partial<Record<FieldRsvp, string>>;

/** Isi GET /api/rsvp/summary. */
export type RingkasanRsvp = {
  totalRespons: number;
  hadir: number;
  tidakHadir: number;
  totalPax: number;
};

export type HasilPeriksaRsvp = { ok: true; rsvp: RsvpValid } | { ok: false; galat: GalatRsvp };

function buatSkemaRsvp({ idAcara, batasPax }: AturanRsvp) {
  const galatPax = `Jumlah orang harus 1 sampai ${batasPax}`;
  const dasar = z.object({
    nama: z
      .string({ error: "Nama wajib diisi" })
      .trim()
      .min(1, "Nama wajib diisi")
      .max(PANJANG_MAKS_NAMA, `Nama paling banyak ${PANJANG_MAKS_NAMA} karakter`),
    kehadiran: z.enum(KEHADIRAN, { error: "Pilih Hadir atau Tidak Hadir" }),
    idAcara: z.array(z.string(), { error: "Pilih minimal satu Acara" }).default([]),
    pax: z.number({ error: galatPax }).optional(),
    ucapan: z
      .string({ error: "Ucapan harus berupa teks" })
      .trim()
      .max(PANJANG_MAKS_UCAPAN, `Ucapan paling banyak ${PANJANG_MAKS_UCAPAN} karakter`)
      .nullish(),
  });

  const hadir = (r: z.output<typeof dasar>) => r.kehadiran === "hadir";
  // Zod melewati refine objek bila ada field yang salah tipe atau tidak dikirim (mis. nama). Aturan Acara dan
  // jumlah orang hanya bergantung pada tiga field ini, jadi tetap diperiksa selama ketiganya bertipe benar:
  // semua galat dikembalikan sekaligus.
  const bagianHadir = dasar.pick({ kehadiran: true, idAcara: true, pax: true });
  const when = (payload: { value: unknown }) => bagianHadir.safeParse(payload.value).success;

  return dasar
    .refine((r) => !hadir(r) || r.idAcara.length > 0, { path: ["idAcara"], message: "Pilih minimal satu Acara", when })
    .refine((r) => !hadir(r) || r.idAcara.every((id) => idAcara.includes(id)), {
      path: ["idAcara"],
      message: "Acara tidak dikenal",
      when,
    })
    .refine((r) => !hadir(r) || (Number.isInteger(r.pax) && r.pax! >= 1 && r.pax! <= batasPax), {
      path: ["pax"],
      message: galatPax,
      when,
    })
    .transform(
      (r): RsvpValid => ({
        nama: r.nama,
        kehadiran: r.kehadiran,
        // Tanpa duplikat, berurutan seperti di Konten Undangan. Tamu yang tidak hadir tidak memilih Acara.
        idAcara: hadir(r) ? idAcara.filter((id) => r.idAcara.includes(id)) : [],
        pax: hadir(r) ? r.pax! : 0,
        ucapan: r.ucapan || null,
      }),
    );
}

/**
 * Memeriksa isian RSVP terhadap aturan Konten Undangan. Bila Tamu tidak hadir, Acara dan jumlah orang
 * diabaikan: disimpan kosong dan 0.
 */
export function periksaRsvp(aturan: AturanRsvp, masukan: unknown): HasilPeriksaRsvp {
  const hasil = buatSkemaRsvp(aturan).safeParse(masukan);
  if (hasil.success) return { ok: true, rsvp: hasil.data };

  const galat: GalatRsvp = {};
  for (const [field, pesan] of Object.entries(z.flattenError(hasil.error).fieldErrors)) {
    if (pesan?.[0]) galat[field as FieldRsvp] = pesan[0];
  }
  return { ok: false, galat };
}
