"use client";

import { useEffect, type RefObject } from "react";
import type { InstansScrollCraft } from "@/scrollcraft/scrollcraft.js";
import { pasangLenteraStasiun } from "./lentera-stasiun";
import { geseranRel, pasangFokusRel, pasangMuatAwalRel } from "./rel-pan";

const muatEngine = () => import("@/scrollcraft/scrollcraft.js");

/** Panjang scroll per piksel geseran rel pada act `pan` bertanda `data-span-otomatis`. */
const SCROLL_PER_GESERAN = 1.1;
/** Jeda setelah lebar layar berubah (mis. ponsel diputar) sebelum span dihitung ulang. */
const JEDA_UKUR_ULANG_MS = 250;

/** Dengan gerakan dikurangi, act ber-pin memakai span statisnya: komposisi diam tanpa ruang scroll kosong. */
function pakaiSpanStatis(akar: HTMLElement) {
  akar.querySelectorAll<HTMLElement>("[data-span-statis]").forEach((act) => {
    act.dataset.scSpan = act.dataset.spanStatis;
  });
}

/**
 * Act `pan` bertanda `data-span-otomatis` mendapat span sesuai panjang relnya di layar ini, paling banyak
 * `data-span-maks` bila diisi (mis. supaya peak tetap punya ruang scroll terbesar). Rel yang lebih panjang
 * dari batas itu bergeser sedikit lebih cepat.
 */
function hitungSpanOtomatis(akar: HTMLElement) {
  akar.querySelectorAll<HTMLElement>('[data-sc-act="pan"][data-span-otomatis]').forEach((act) => {
    const rel = act.querySelector<HTMLElement>("[data-sc-pan]");
    if (!rel) return;
    const span = 1 + (geseranRel(rel) * SCROLL_PER_GESERAN) / innerHeight;
    const maks = parseFloat(act.dataset.spanMaks ?? "") || Infinity;
    act.dataset.scSpan = Math.min(span, maks).toFixed(2);
  });
}

/**
 * Memasang engine scroll-craft pada akar saat Undangan dibuka. Sampul adalah gerbang sebelum engine
 * bekerja: tata letak diukur setelah kunci scroll dilepas (scrollbar desktop muncul tanpa event resize),
 * dan device yang terpicu saat tampil tidak berjalan diam-diam di belakang Sampul.
 *
 * Engine membaca span hanya saat dipasang, jadi saat lebar layar berubah dan ada span otomatis,
 * engine dipasang ulang dengan span baru. Lentera yang sudah menyala tetap menyala (atribut DOM).
 * Modul engine dimuat dinamis supaya hanya berjalan di browser dan hanya di halaman Undangan.
 */
export function useMesinScroll(akar: RefObject<HTMLElement | null>, terbuka: boolean) {
  useEffect(() => {
    // Muat lebih awal, supaya pemasangan saat "Buka Undangan" tidak menunggu jaringan.
    void muatEngine();
  }, []);

  useEffect(() => {
    if (!terbuka) return;
    let instans: InstansScrollCraft | undefined;
    let lepasLentera: (() => void) | undefined;
    let lepasFokusRel: (() => void) | undefined;
    let lepasMuatAwal: (() => void) | undefined;
    let pengatur: ReturnType<typeof setTimeout> | undefined;
    let lebarTerakhir = innerWidth;
    let batal = false;

    const pasang = (el: HTMLElement) => {
      const engine = window.ScrollCraft;
      if (!engine) return;
      if (engine.reduce) pakaiSpanStatis(el);
      else hitungSpanOtomatis(el);
      instans = engine.mount(el);
      lepasLentera = pasangLenteraStasiun(el);
      lepasMuatAwal = pasangMuatAwalRel(el);
      if (!engine.reduce) lepasFokusRel = pasangFokusRel(el);
    };
    const lepas = () => {
      lepasLentera?.();
      lepasMuatAwal?.();
      lepasFokusRel?.();
      instans?.destroy();
    };

    const padaResize = () => {
      if (innerWidth === lebarTerakhir) return;
      lebarTerakhir = innerWidth;
      clearTimeout(pengatur);
      pengatur = setTimeout(() => {
        const el = akar.current;
        if (!el?.querySelector("[data-span-otomatis]") || window.ScrollCraft?.reduce) return;
        lepas();
        pasang(el);
      }, JEDA_UKUR_ULANG_MS);
    };

    void muatEngine().then(() => {
      const el = akar.current;
      if (batal || !el) return;
      pasang(el);
      addEventListener("resize", padaResize, { passive: true });
    });

    return () => {
      batal = true;
      clearTimeout(pengatur);
      removeEventListener("resize", padaResize);
      lepas();
    };
  }, [akar, terbuka]);
}
