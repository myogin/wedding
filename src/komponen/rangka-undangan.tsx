"use client";

import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import type { Gambar } from "@/konten/skema";
import { LayarLoading } from "./layar-loading";
import { useMesinScroll } from "./mesin-scroll";
import { usePemuatanHero } from "./pemuatan-hero";

type KeadaanUndangan = {
  /** Loading selesai: aset Hero siap (mode terpasang di <article>) dan waktu minimal sudah lewat. */
  siap: boolean;
  terbuka: boolean;
  buka(): void;
};

const KonteksUndangan = createContext<KeadaanUndangan | null>(null);

export function useUndangan(): KeadaanUndangan {
  const keadaan = use(KonteksUndangan);
  if (!keadaan) throw new Error("useUndangan harus dipakai di dalam <RangkaUndangan>");
  return keadaan;
}

/** Layar loading selalu tampil minimal selama ini, walau aset sudah ada di cache. */
const DURASI_LOADING_MINIMAL_MS = 3000;

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

type Props = {
  namaMempelai: string;
  /** Foto kilasan film di layar loading. */
  kilasan: Gambar[];
  /** Sampul dan tombol musik (bergantung pada Konteks Tamu). Dirender di atas isi Undangan. */
  gerbang: ReactNode;
  children: ReactNode;
};

/**
 * Kerangka halaman Undangan. Isi Undangan terkunci (inert dan tidak bisa di-scroll) sampai Tamu
 * menekan "Buka Undangan". Act-act di dalamnya di-render server; komponen ini hanya mengubah
 * atribut keadaan pada <article>, tidak pernah me-render ulang act saat scroll.
 */
export function RangkaUndangan({ namaMempelai, kilasan, gerbang, children }: Props) {
  const akar = useRef<HTMLElement>(null);
  const { persen: persenAset, mode: modeHero } = usePemuatanHero(akar);
  const persenWaktu = useWaktuMinimal(DURASI_LOADING_MINIMAL_MS);
  const siap = modeHero !== null && persenWaktu === 100;
  const [loadingSelesai, setLoadingSelesai] = useState(false);
  const [terbuka, setTerbuka] = useState(false);
  useMesinScroll(akar, terbuka);

  useEffect(() => {
    // Undangan selalu dibuka dari awal, termasuk saat halaman dimuat ulang di tengah.
    history.scrollRestoration = "manual";
  }, []);

  function buka() {
    window.scrollTo({ top: 0, behavior: "instant" });
    setTerbuka(true);
  }

  useEffect(() => {
    if (terbuka) akar.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [terbuka]);

  return (
    <KonteksUndangan value={{ siap, terbuka, buka }}>
      <article
        ref={akar}
        className="undangan"
        data-hero={modeHero ?? undefined}
        data-terbuka={terbuka || undefined}
        inert={!terbuka}
      >
        {children}
      </article>
      {!loadingSelesai && (
        <LayarLoading
          namaMempelai={namaMempelai}
          foto={kilasan}
          // Yang tampil adalah yang paling lambat dari waktu dan aset: naik halus selama 3 detik,
          // dan baru 100% bila aset juga sudah siap.
          persen={Math.min(persenAset, persenWaktu)}
          keluar={siap}
          onSelesaiKeluar={() => setLoadingSelesai(true)}
        />
      )}
      {gerbang}
    </KonteksUndangan>
  );
}
