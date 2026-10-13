"use client";

import { useRef } from "react";
import { useTransisiKeluar } from "./transisi-keluar";

const SAPAAN_UMUM = "Bapak/Ibu/Saudara/i";

type Props = {
  judul: string;
  namaMempelai: string;
  tanggal: string;
  catatanMaaf: string;
  namaTamu: string | null;
  /** Sampul sedang memudar setelah "Buka Undangan" ditekan. */
  keluar: boolean;
  onBuka(): void;
  onSelesaiKeluar(): void;
};

/**
 * Sampul melayang di atas Hero yang masih gelap: hanya nama Tamu, nama Mempelai, dan satu tombol.
 * Setelah dibuka, Sampul memudar dan Hero di bawahnya menyala.
 */
export function Sampul({ judul, namaMempelai, tanggal, catatanMaaf, namaTamu, keluar, onBuka, onSelesaiKeluar }: Props) {
  const akar = useRef<HTMLElement>(null);
  useTransisiKeluar(akar, keluar, onSelesaiKeluar);

  return (
    <section ref={akar} className="gerbang sampul" aria-label="Sampul" data-keluar={keluar || undefined} inert={keluar}>
      <div className="sampul__isi">
        <p className="sampul__judul">{judul}</p>
        <p className="sampul__mempelai">{namaMempelai}</p>
        <p className="sampul__tanggal">{tanggal}</p>

        <div className="sampul__tamu">
          <p className="sampul__kepada">Kepada Yth.</p>
          <p className="sampul__nama-tamu">{namaTamu ?? SAPAAN_UMUM}</p>
          <p className="sampul__maaf">{catatanMaaf}</p>
        </div>

        <button type="button" className="sampul__buka" onClick={onBuka}>
          Buka Undangan
        </button>
      </div>
    </section>
  );
}
