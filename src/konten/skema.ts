import { z } from "zod";
import { PILIHAN_FONT_DISPLAY, PILIHAN_FONT_TEKS } from "@/tema/pilihan-font";

/** Aset atau blok teks yang masih berisi data contoh dari website referensi. */
const penandaPlaceholder = { placeholder: z.boolean().optional() };

const waktuLokal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "format waktu harus YYYY-MM-DDTHH:mm (waktu setempat Acara)");

const skemaId = z.string().regex(/^[a-z0-9-]+$/, "id hanya huruf kecil, angka, dan tanda hubung");

const warnaHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "warna harus hex 6 digit, mis. #1A1613");

const skemaGambar = z.object({
  src: z.string().startsWith("/", "path gambar harus diawali / (relatif ke folder public)"),
  alt: z.string().min(1),
  lebar: z.number().int().positive(),
  tinggi: z.number().int().positive(),
  /**
   * Titik yang harus tetap terlihat saat foto dipotong ke bingkai lain (0..1 dari kiri dan dari atas).
   * Bawaannya tengah. Mis. { x: 1, y: 0.5 } memotong dari kiri saja.
   */
  fokus: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
});

const skemaMempelai = z.object({
  ...penandaPlaceholder,
  panggilan: z.string().min(1),
  namaLengkap: z.string().min(1),
  /** Mis. "pertama" untuk "Putri pertama dari". Kosongkan bila tidak ingin ditampilkan. */
  urutanAnak: z.string().min(1).optional(),
  ayah: z.string().min(1),
  ibu: z.string().min(1),
  instagram: z.url().optional(),
  foto: skemaGambar,
});

export const ZONA_WAKTU = {
  "Asia/Jakarta": "WIB",
  "Asia/Pontianak": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
} as const;

const skemaAcara = z.object({
  ...penandaPlaceholder,
  id: skemaId,
  nama: z.string().min(1),
  mulai: waktuLokal,
  /** Kosong berarti tampil "Selesai". */
  selesai: waktuLokal.optional(),
  zonaWaktu: z.enum(Object.keys(ZONA_WAKTU) as [keyof typeof ZONA_WAKTU, ...(keyof typeof ZONA_WAKTU)[]]),
  tempat: z.string().min(1).optional(),
  alamat: z.string().min(1),
  peta: z.url(),
});

const skemaRekening = z.object({
  ...penandaPlaceholder,
  id: skemaId,
  bank: z.string().min(1),
  nomor: z.string().regex(/^[0-9 ]+$/, "nomor rekening hanya angka dan spasi"),
  pemilik: z.string().min(1),
});

export const skemaKontenUndangan = z
  .object({
    mempelai: z.object({ wanita: skemaMempelai, pria: skemaMempelai }),
    sampul: z.object({
      ...penandaPlaceholder,
      judul: z.string().min(1),
      catatanMaaf: z.string().min(1),
    }),
    /**
     * Lapisan Hero yang dipotong dari satu foto: latar, subjek, depan (masing-masing terang dan gelap),
     * poster, dan hero.json. Isi folder dibuat oleh alat di scrollcraft/builds/undangan (RENCANA.md §8).
     * Sampul memakai keadaan gelap dari lapisan yang sama.
     */
    hero: z.object({
      ...penandaPlaceholder,
      folder: z
        .string()
        .regex(/^\/[^\s]*[^/]$/, "folder harus diawali / (relatif ke folder public) dan tanpa / di akhir"),
      alt: z.string().min(1),
    }),
    pembuka: z.object({
      ...penandaPlaceholder,
      salam: z.string().min(1),
      gambar: skemaGambar.optional(),
      kutipan: z.object({
        /** Satu baris per baris ayat, dipisah "\n". */
        teksAsli: z.string().min(1).optional(),
        /** Kode bahasa BCP 47 teks asli untuk pembaca layar, mis. "sa-Latn" atau "ar". */
        bahasaAsli: z.string().min(2).optional(),
        terjemahan: z.string().min(1),
        sumber: z.string().min(1),
      }),
    }),
    acara: z.array(skemaAcara).min(1, "minimal satu Acara"),
    /** Id Acara yang menjadi target hitung mundur dan tanggal di Sampul. */
    acaraUtama: z.string(),
    kisahCinta: z
      .array(
        z.object({
          ...penandaPlaceholder,
          tanggal: z.string().min(1),
          judul: z.string().min(1),
          cerita: z.string().min(1),
          foto: skemaGambar.optional(),
        }),
      )
      .optional(),
    galeri: z.array(skemaGambar).min(1),
    amplop: z.object({
      rekening: z.array(skemaRekening).min(1),
      alamatKado: z
        .object({
          ...penandaPlaceholder,
          penerima: z.string().min(1),
          alamat: z.string().min(1),
          telepon: z.string().min(1).optional(),
        })
        .optional(),
    }),
    musik: z.object({
      ...penandaPlaceholder,
      src: z.string().startsWith("/"),
      judul: z.string().min(1),
    }),
    tema: z.object({
      ...penandaPlaceholder,
      /** Warna dan font dipetakan ke token --sc-* scroll-craft. */
      font: z.object({
        display: z.enum(PILIHAN_FONT_DISPLAY),
        teks: z.enum(PILIHAN_FONT_TEKS),
      }),
      warna: z.object({
        canvas: warnaHex,
        surface: warnaHex,
        ink: warnaHex,
        inkSoft: warnaHex,
        accent: warnaHex,
        accentInk: warnaHex,
      }),
    }),
    rsvp: z.object({
      ...penandaPlaceholder,
      batasWaktu: z.iso.datetime({ offset: true }),
      batasPax: z.number().int().min(1).max(20).default(2),
      tampilkanRingkasan: z.boolean().default(true),
    }),
    teksWhatsApp: z.object({
      ...penandaPlaceholder,
      template: z
        .string()
        .refine((t) => t.includes("{nama}") && t.includes("{link}"), "template harus memuat {nama} dan {link}"),
    }),
    metadata: z.object({
      ...penandaPlaceholder,
      judul: z.string().min(1),
      deskripsi: z.string().min(1),
      gambarOg: z.string().startsWith("/"),
    }),
  })
  .superRefine((konten, ctx) => {
    const idAcara = konten.acara.map((a) => a.id);
    if (!idAcara.includes(konten.acaraUtama)) {
      ctx.addIssue({
        code: "custom",
        path: ["acaraUtama"],
        message: `harus salah satu id Acara: ${idAcara.join(", ")}`,
      });
    }
    const duplikat = idAcara.filter((id, i) => idAcara.indexOf(id) !== i);
    if (duplikat.length > 0) {
      ctx.addIssue({ code: "custom", path: ["acara"], message: `id Acara ganda: ${duplikat.join(", ")}` });
    }
  });

export type KontenUndangan = z.infer<typeof skemaKontenUndangan>;
export type KontenUndanganMentah = z.input<typeof skemaKontenUndangan>;
export type Acara = KontenUndangan["acara"][number];
export type Gambar = z.infer<typeof skemaGambar>;
