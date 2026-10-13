// Ucapan di Buku Tamu: kontrak GET /api/wishes, dipakai bersama oleh server dan daftar di browser.
import type { Kehadiran } from "./rsvp";

export const UCAPAN_PER_HALAMAN = 10;

/** Satu Ucapan seperti yang tampil di Buku Tamu. */
export type Ucapan = {
  nama: string;
  kehadiran: Kehadiran;
  ucapan: string;
  /** ISO 8601. */
  dibuat: string;
};

/** Isi GET /api/wishes?page=n. */
export type HalamanUcapan = {
  item: Ucapan[];
  halaman: number;
  /** Paling sedikit 1, juga saat belum ada Ucapan. */
  totalHalaman: number;
};
