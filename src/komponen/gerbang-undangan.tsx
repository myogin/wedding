"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Gambar } from "@/konten/skema";
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
  /** Foto kilasan film di layar loading. */
  kilasan: Gambar[];
};

/** Layar loading selalu tampil minimal selama ini, walau aset sudah ada di cache. */
const DURASI_LOADING_MINIMAL_MS = 5000;

/**
 * Persentase waktu loading minimal yang sudah lewat, dihitung sejak navigasi dimulai
 * (performance.now), jadi waktu sebelum hidrasi ikut terhitung.
 */
function useWaktuMinimal(durasiMs: number) {
  const [persen, setPersen] = useState(0);

  useEffect(() => {
    let bingkai = 0;
    const jalan = () => {
      const kini = Math.min(100, Math.floor((performance.now() / durasiMs) * 100));
      setPersen(kini);
      if (kini < 100) bingkai = requestAnimationFrame(jalan);
    };
    jalan();
    return () => cancelAnimationFrame(bingkai);
  }, [durasiMs]);

  return persen;
}

/** Urutan pembuka: layar loading (dengan persentase), Sampul, lalu Undangan terbuka dengan tombol musik. */
export function GerbangUndangan({ judul, namaMempelai, tanggal, catatanMaaf, musik, kilasan }: Props) {
  const { namaTamu } = bacaKonteksTamu(useSearchParams());
  const { akar, modeHero, aturModeHero, terbuka, buka } = useUndangan();
  // Dipantau dari sini (bukan dari kerangka) supaya baru mulai setelah gerbang terpasang di browser:
  // persentase yang sudah berubah sebelum boundary Suspense ini hidrasi akan membuat HTML-nya tidak cocok.
  const { persen: persenAset, mode } = usePemuatanHero(akar);
  const persenWaktu = useWaktuMinimal(DURASI_LOADING_MINIMAL_MS);
  // Persentase yang tampil adalah yang paling lambat dari keduanya, jadi naik halus selama 5 detik
  // dan baru 100% bila aset juga sudah siap.
  const persen = Math.min(persenAset, persenWaktu);
  // Sampul baru tampil setelah mode terpasang di <article>, jadi adegan di belakangnya sudah benar.
  const siap = modeHero !== null && persenWaktu === 100;
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
        <LayarLoading namaMempelai={namaMempelai} foto={kilasan} persen={persen} />
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
