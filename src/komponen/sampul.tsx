"use client";

import { useEffect, useEffectEvent, useRef } from "react";

const SAPAAN_UMUM = "Bapak/Ibu/Saudara/i";
/** Batas aman bila transitionend tidak datang (mis. tab di latar belakang). */
const BATAS_KELUAR_MS = 1500;

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
  const akhiri = useEffectEvent(() => onSelesaiKeluar());

  useEffect(() => {
    if (!keluar) return;
    const el = akar.current;
    const padaTransisi = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === "opacity") akhiri();
    };
    el?.addEventListener("transitionend", padaTransisi);
    const cadangan = setTimeout(() => akhiri(), BATAS_KELUAR_MS);
    return () => {
      el?.removeEventListener("transitionend", padaTransisi);
      clearTimeout(cadangan);
    };
  }, [keluar]);

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
