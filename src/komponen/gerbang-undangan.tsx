"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bacaKonteksTamu } from "@/tamu/konteks-tamu";
import { TombolMusik, useMusik } from "./musik";
import { useUndangan } from "./rangka-undangan";
import { Sampul } from "./sampul";

type Props = {
  judul: string;
  namaMempelai: string;
  tanggal: string;
  catatanMaaf: string;
  musik: { src: string; judul: string };
};

/** Setelah layar loading: Sampul dengan nama Tamu, lalu Undangan terbuka dengan tombol musik. */
export function GerbangUndangan({ judul, namaMempelai, tanggal, catatanMaaf, musik }: Props) {
  const { namaTamu } = bacaKonteksTamu(useSearchParams());
  const { siap, terbuka, buka } = useUndangan();
  const pemutar = useMusik();
  const [sampulSelesai, setSampulSelesai] = useState(false);

  function bukaUndangan() {
    // Musik harus dimulai di dalam handler klik ini, karena browser hanya mengizinkan audio setelah gestur.
    pemutar.putar();
    buka();
  }

  return (
    <>
      <audio ref={pemutar.ref} src={musik.src} loop preload="none" />
      {siap && !sampulSelesai && (
        <Sampul
          judul={judul}
          namaMempelai={namaMempelai}
          tanggal={tanggal}
          catatanMaaf={catatanMaaf}
          namaTamu={namaTamu}
          keluar={terbuka}
          onBuka={bukaUndangan}
          onSelesaiKeluar={() => setSampulSelesai(true)}
        />
      )}
      {terbuka && <TombolMusik memutar={pemutar.memutar} judul={musik.judul} onAlihkan={pemutar.alihkan} />}
    </>
  );
}
