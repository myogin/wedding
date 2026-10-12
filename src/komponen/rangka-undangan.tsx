"use client";

import { createContext, use, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { ModeHero } from "./pemuatan-hero";

type KeadaanUndangan = {
  /** Akar isi Undangan, tempat aset Hero dicari. */
  akar: RefObject<HTMLElement | null>;
  /** Mode Hero yang sudah terpasang di <article>; null selama aset Hero masih dimuat. */
  modeHero: ModeHero | null;
  aturModeHero(mode: ModeHero): void;
  terbuka: boolean;
  buka(): void;
};

const KonteksUndangan = createContext<KeadaanUndangan | null>(null);

export function useUndangan(): KeadaanUndangan {
  const keadaan = use(KonteksUndangan);
  if (!keadaan) throw new Error("useUndangan harus dipakai di dalam <RangkaUndangan>");
  return keadaan;
}

const muatEngine = () => import("@/scrollcraft/scrollcraft.js");

/**
 * Memasang engine scroll-craft pada akar saat Undangan dibuka. Sampul adalah gerbang sebelum engine
 * bekerja: tata letak diukur setelah kunci scroll dilepas (scrollbar desktop muncul tanpa event resize),
 * dan device yang terpicu saat tampil tidak berjalan diam-diam di belakang Sampul.
 * Modul engine dimuat dinamis supaya hanya berjalan di browser dan hanya di halaman Undangan.
 */
function useMesinScroll(akar: RefObject<HTMLElement | null>, terbuka: boolean) {
  useEffect(() => {
    // Muat lebih awal, supaya pemasangan saat "Buka Undangan" tidak menunggu jaringan.
    void muatEngine();
  }, []);

  useEffect(() => {
    if (!terbuka) return;
    let instans: { destroy(): void } | undefined;
    let batal = false;

    void muatEngine().then(() => {
      const engine = window.ScrollCraft;
      const el = akar.current;
      if (batal || !engine || !el) return;
      // Dengan gerakan dikurangi, act ber-pin memakai span statisnya: komposisi diam tanpa ruang scroll kosong.
      if (engine.reduce) {
        el.querySelectorAll<HTMLElement>("[data-span-statis]").forEach((act) => {
          act.dataset.scSpan = act.dataset.spanStatis;
        });
      }
      instans = engine.mount(el);
    });

    return () => {
      batal = true;
      instans?.destroy();
    };
  }, [akar, terbuka]);
}

type Props = {
  /** Lapisan pembuka (layar loading lalu Sampul). Dirender di atas isi Undangan. */
  gerbang: ReactNode;
  children: ReactNode;
};

/**
 * Kerangka halaman Undangan. Isi Undangan terkunci (inert dan tidak bisa di-scroll) sampai Tamu
 * menekan "Buka Undangan". Act-act di dalamnya di-render server; komponen ini hanya mengubah
 * atribut keadaan pada <article>, tidak pernah me-render ulang act saat scroll.
 */
export function RangkaUndangan({ gerbang, children }: Props) {
  const akar = useRef<HTMLElement>(null);
  const [modeHero, aturModeHero] = useState<ModeHero | null>(null);
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
    <KonteksUndangan value={{ akar, modeHero, aturModeHero, terbuka, buka }}>
      <article
        ref={akar}
        className="undangan"
        data-hero={modeHero ?? undefined}
        data-terbuka={terbuka || undefined}
        inert={!terbuka}
      >
        {children}
      </article>
      {gerbang}
    </KonteksUndangan>
  );
}
