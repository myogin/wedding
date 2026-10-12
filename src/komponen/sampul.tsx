"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Gambar } from "@/konten/skema";
import { bacaKonteksTamu } from "@/tamu/konteks-tamu";

const SAPAAN_UMUM = "Bapak/Ibu/Saudara/i";

type Props = {
  judul: string;
  namaMempelai: string;
  tanggal: string;
  catatanMaaf: string;
  foto: Gambar;
};

export function Sampul({ judul, namaMempelai, tanggal, catatanMaaf, foto }: Props) {
  const { namaTamu } = bacaKonteksTamu(useSearchParams());

  return (
    <section className="sampul" aria-label="Sampul">
      <Image className="sampul__foto" src={foto.src} alt={foto.alt} fill priority sizes="100vw" />
      <div className="sampul__isi">
        <p className="sampul__judul">{judul}</p>
        <h1 className="sampul__mempelai">{namaMempelai}</h1>
        <p className="sampul__tanggal">{tanggal}</p>

        <div className="sampul__tamu">
          <p className="sampul__kepada">Kepada Yth.</p>
          <p className="sampul__nama-tamu">{namaTamu ?? SAPAAN_UMUM}</p>
          <p className="sampul__maaf">{catatanMaaf}</p>
        </div>

        <button type="button" className="sampul__buka">
          Buka Undangan
        </button>
      </div>
    </section>
  );
}
