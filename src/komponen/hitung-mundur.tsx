"use client";

import { useEffect, useState } from "react";

type Props = {
  namaAcara: string;
  /** Instan mulai dan akhir Acara (ms sejak epoch), sudah termasuk zona waktunya. */
  mulai: number;
  akhir: number;
};

const SATUAN = ["Hari", "Jam", "Menit", "Detik"] as const;
type Satuan = (typeof SATUAN)[number];

type Keadaan = { tahap: "menuju"; sisa: Record<Satuan, number> } | { tahap: "berlangsung" } | { tahap: "selesai" };

/** Dua figure space selebar dua angka: tempat angka sebelum jam browser terbaca, tanpa geser tata letak. */
const ANGKA_KOSONG = "\u2007\u2007";

const PESAN = { berlangsung: "Acara sedang berlangsung", selesai: "Acara telah berlangsung" } as const;

/**
 * Selama Acara berlangsung, jam diperiksa paling lambat sekali semenit. Timer browser tidak berjalan
 * saat ponsel tidur, jadi menunggu satu timeout panjang sampai akhir Acara bisa terlambat.
 */
const DETAK_BERLANGSUNG_MAKS_MS = 60_000;

/** Sisa hari, jam, menit, dan detik dibulatkan ke atas, jadi angka nol semua tidak pernah tampil. */
function keadaanPada(sekarang: number, mulai: number, akhir: number): Keadaan {
  if (sekarang >= akhir) return { tahap: "selesai" };
  if (sekarang >= mulai) return { tahap: "berlangsung" };
  const detik = Math.ceil((mulai - sekarang) / 1000);
  return {
    tahap: "menuju",
    sisa: {
      Hari: Math.floor(detik / 86400),
      Jam: Math.floor(detik / 3600) % 24,
      Menit: Math.floor(detik / 60) % 60,
      Detik: detik % 60,
    },
  };
}

/**
 * Hitung mundur menuju Acara utama. Dihitung di browser setelah halaman dimuat, karena halaman di-render
 * statis; sebelum itu angkanya kosong (lebar tetap), tertutup layar loading.
 */
export function HitungMundur({ namaAcara, mulai, akhir }: Props) {
  const [sekarang, setSekarang] = useState<number | null>(null);

  useEffect(() => {
    let pengatur: ReturnType<typeof setTimeout> | undefined;
    const detak = () => {
      const kini = Date.now();
      setSekarang(kini);
      // Detak berikutnya tepat saat angka detik berganti, atau saat Acara berakhir.
      if (kini < mulai) pengatur = setTimeout(detak, (mulai - kini) % 1000 || 1000);
      else if (kini < akhir) pengatur = setTimeout(detak, Math.min(akhir - kini, DETAK_BERLANGSUNG_MAKS_MS));
    };
    detak();
    return () => clearTimeout(pengatur);
  }, [mulai, akhir]);

  const keadaan = sekarang === null ? null : keadaanPada(sekarang, mulai, akhir);

  return (
    <div className="hitung" role="timer" aria-label={`Hitung mundur menuju ${namaAcara}`}>
      {keadaan && keadaan.tahap !== "menuju" ? (
        <p className="hitung__pesan">{PESAN[keadaan.tahap]}</p>
      ) : (
        SATUAN.map((satuan) => (
          <span key={satuan} className="hitung__unit">
            <span className="hitung__angka">{keadaan ? String(keadaan.sisa[satuan]).padStart(2, "0") : ANGKA_KOSONG}</span>{" "}
            <span className="hitung__satuan">{satuan}</span>{" "}
          </span>
        ))
      )}
    </div>
  );
}
