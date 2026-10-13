"use client";

import { useRef, type CSSProperties } from "react";
import type { Gambar } from "@/konten/skema";
import { FilmKilasan } from "./film-kilasan";
import { useTransisiKeluar } from "./transisi-keluar";

type Props = {
  namaMempelai: string;
  foto: Gambar[];
  persen: number;
  /** Loading selesai: layar memudar dan bingkai film membesar, bersilang dengan Sampul di bawahnya. */
  keluar: boolean;
  onSelesaiKeluar(): void;
};

/**
 * Menutupi Undangan sampai aset kritis Hero termuat (minimal 3 detik), agar Tamu tidak melihat
 * adegan yang setengah jadi. Selama menunggu, kilasan foto Mempelai diputar seperti film yang dipercepat.
 * Di-render di luar boundary Suspense, jadi elemennya tetap sama sejak HTML awal dan animasi masuknya
 * tidak terulang saat halaman selesai dimuat.
 */
export function LayarLoading({ namaMempelai, foto, persen, keluar, onSelesaiKeluar }: Props) {
  const akar = useRef<HTMLDivElement>(null);
  useTransisiKeluar(akar, keluar, onSelesaiKeluar);

  return (
    <div ref={akar} className="gerbang layar-loading" role="status" data-keluar={keluar || undefined}>
      <p className="layar-loading__mempelai">{namaMempelai}</p>
      <div className="layar-loading__proyektor">
        <FilmKilasan foto={foto} />
      </div>
      <div
        className="layar-loading__progres"
        role="progressbar"
        aria-label="Memuat undangan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={persen}
        style={{ "--persen": persen / 100 } as CSSProperties}
      >
        <span className="layar-loading__teks">Memuat undangan</span>
        {/* Angka tidak diumumkan lewat role="status" (terlalu ramai); nilainya ada di aria-valuenow. */}
        <span className="layar-loading__angka" aria-hidden="true">
          {persen}%
        </span>
        <span className="layar-loading__garis" aria-hidden="true" />
      </div>
      <noscript>
        <p className="layar-loading__teks">Aktifkan JavaScript untuk membuka undangan.</p>
      </noscript>
    </div>
  );
}
