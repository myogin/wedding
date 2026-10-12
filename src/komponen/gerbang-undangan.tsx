"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { bacaKonteksTamu } from "@/tamu/konteks-tamu";
import { LayarLoading } from "./layar-loading";
import { TombolMusik, useMusik } from "./musik";
import { usePemuatanHero } from "./pemuatan-hero";
import { useUndangan } from "./rangka-undangan";
import { Sampul } from "./sampul";

type Props = {
  judul: string;
  namaMempelai: string;
  tanggal: string;
  catatanMaaf: string;
  musik: { src: string; judul: string };
};

/** Urutan pembuka: layar loading (dengan persentase), Sampul, lalu Undangan terbuka dengan tombol musik. */
export function GerbangUndangan({ judul, namaMempelai, tanggal, catatanMaaf, musik }: Props) {
  const { namaTamu } = bacaKonteksTamu(useSearchParams());
  const { akar, modeHero, aturModeHero, terbuka, buka } = useUndangan();
  // Dipantau dari sini (bukan dari kerangka) supaya baru mulai setelah gerbang terpasang di browser:
  // persentase yang sudah berubah sebelum boundary Suspense ini hidrasi akan membuat HTML-nya tidak cocok.
  const { persen, mode } = usePemuatanHero(akar);
  // Sampul baru tampil setelah mode terpasang di <article>, jadi adegan di belakangnya sudah benar.
  const siap = modeHero !== null;
  const pemutar = useMusik();
  const [sampulSelesai, setSampulSelesai] = useState(false);

  useEffect(() => {
    if (mode) aturModeHero(mode);
  }, [mode, aturModeHero]);

  function bukaUndangan() {
    // Musik harus dimulai di dalam handler klik ini, karena browser hanya mengizinkan audio setelah gestur.
    pemutar.putar();
    buka();
  }

  return (
    <>
      <audio ref={pemutar.ref} src={musik.src} loop preload="none" />
      {!siap ? (
        <LayarLoading namaMempelai={namaMempelai} persen={persen} />
      ) : (
        !sampulSelesai && (
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
        )
      )}
      {terbuka && <TombolMusik memutar={pemutar.memutar} judul={musik.judul} onAlihkan={pemutar.alihkan} />}
    </>
  );
}
