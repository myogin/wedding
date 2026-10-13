"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LABEL_KEHADIRAN } from "@/buku-tamu/rsvp";
import type { HalamanUcapan } from "@/buku-tamu/ucapan";
import { ambilJson } from "./ambil-json";

const MENIT = 60_000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
/** Dari satuan terbesar: selisih dinyatakan dengan satuan terbesar yang muat paling sedikit sekali. */
const SATUAN_WAKTU: [ms: number, nama: string][] = [
  [365 * HARI, "tahun"],
  [30 * HARI, "bulan"],
  [7 * HARI, "minggu"],
  [HARI, "hari"],
  [JAM, "jam"],
  [MENIT, "menit"],
];

/**
 * Waktu relatif berbahasa Indonesia: "baru saja", "5 menit lalu", "2 jam lalu", "3 hari lalu", dan seterusnya
 * sampai tahun. Ditulis sendiri, bukan Intl.RelativeTimeFormat, karena keluarannya ("2 jam yang lalu",
 * "5 mnt lalu") berbeda antarbrowser. Waktu dari masa depan (jam perangkat yang terlambat) juga "baru saja".
 */
function waktuRelatif(dibuat: Date, sekarang: Date): string {
  const selisih = sekarang.getTime() - dibuat.getTime();
  for (const [ms, nama] of SATUAN_WAKTU) {
    if (selisih >= ms) return `${Math.floor(selisih / ms)} ${nama} lalu`;
  }
  return "baru saja";
}


/**
 * Halaman Buku Tamu yang sedang tampil. Halaman lama tetap tampil selama halaman berikutnya dimuat, dan hanya
 * permintaan terakhir yang dipakai, jadi klik beruntun tidak menampilkan halaman yang salah.
 */
export function useDaftarUcapan() {
  const [isi, setIsi] = useState<HalamanUcapan | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [gagal, setGagal] = useState(false);
  const permintaanTerakhir = useRef(0);

  /** Memuat halaman itu. Hasilnya true bila halaman itu yang kini tampil. */
  const keHalaman = useCallback(async (halaman: number) => {
    const nomor = ++permintaanTerakhir.current;
    const terbaru = () => nomor === permintaanTerakhir.current;
    setMemuat(true);
    try {
      const baru = await ambilJson<HalamanUcapan>(`/api/wishes?page=${halaman}`);
      if (!terbaru()) return false;
      setIsi(baru);
      setGagal(false);
      return true;
    } catch {
      if (terbaru()) setGagal(true);
      return false;
    } finally {
      if (terbaru()) setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void keHalaman(1);
  }, [keHalaman]);

  return { isi, memuat, gagal, keHalaman };
}

type Props = ReturnType<typeof useDaftarUcapan>;

/**
 * Buku Tamu: Ucapan dari Tamu lain, terbaru dulu, dengan nama, status kehadiran, dan waktu relatif.
 * Setelah berpindah halaman, fokus pindah ke judul, yang juga menyebut halamannya untuk pembaca layar,
 * supaya Tamu membaca halaman baru dari atas. Waktu relatif dihitung saat daftar dirender.
 */
export function DaftarUcapan({ isi, memuat, gagal, keHalaman }: Props) {
  const judul = useRef<HTMLHeadingElement>(null);
  const sekarang = new Date();

  async function pindah(halaman: number) {
    if (await keHalaman(halaman)) judul.current?.focus();
  }

  return (
    <section className="buku-tamu" aria-labelledby="buku-tamu-judul" aria-busy={memuat}>
      <h3 ref={judul} id="buku-tamu-judul" className="buku-tamu__judul" tabIndex={-1}>
        Buku Tamu
        {isi && isi.totalHalaman > 1 && (
          <span className="sr-only">
            {" "}
            halaman {isi.halaman} dari {isi.totalHalaman}
          </span>
        )}
      </h3>
      {isi?.item.length === 0 && <p className="buku-tamu__catatan">Belum ada Ucapan. Jadilah yang pertama menitipkan doa.</p>}
      {gagal && (
        <p className="buku-tamu__catatan" role="status">
          {isi ? "Halaman itu belum bisa dimuat. Coba lagi." : "Buku Tamu belum bisa dimuat. Coba muat ulang halaman ini."}
        </p>
      )}
      {isi && isi.item.length > 0 && (
        <ol className="buku-tamu__daftar">
          {isi.item.map((u, i) => (
            <li key={`${isi.halaman}-${i}`} className="ucapan">
              <p className="ucapan__nama">{u.nama}</p>
              <p className="ucapan__meta">
                {LABEL_KEHADIRAN[u.kehadiran]}
                <span aria-hidden="true"> · </span>
                <time dateTime={u.dibuat}>{waktuRelatif(new Date(u.dibuat), sekarang)}</time>
              </p>
              <blockquote className="ucapan__isi">{u.ucapan}</blockquote>
            </li>
          ))}
        </ol>
      )}
      {isi && isi.totalHalaman > 1 && (
        <nav className="buku-tamu__halaman" aria-label="Halaman Buku Tamu">
          <button
            type="button"
            className="tombol-garis"
            disabled={isi.halaman <= 1}
            onClick={() => pindah(isi.halaman - 1)}
          >
            Sebelumnya
          </button>
          {/* "Halaman" hanya untuk pembaca layar, supaya posisi muat satu baris di antara kedua tombol di ponsel. */}
          <p className="buku-tamu__posisi">
            <span className="sr-only">Halaman </span>
            {isi.halaman} dari {isi.totalHalaman}
          </p>
          <button
            type="button"
            className="tombol-garis"
            disabled={isi.halaman >= isi.totalHalaman}
            onClick={() => pindah(isi.halaman + 1)}
          >
            Berikutnya
          </button>
        </nav>
      )}
    </section>
  );
}
