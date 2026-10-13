"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

/** Batas aman bila transitionend tidak datang (mis. tab di latar belakang). */
const BATAS_KELUAR_MS = 1500;

/**
 * Setelah `keluar` menjadi true, menunggu transisi opacity elemen selesai lalu memanggil `onSelesai`,
 * supaya lapisan yang memudar baru dilepas dari DOM setelah benar-benar hilang.
 */
export function useTransisiKeluar(ref: RefObject<HTMLElement | null>, keluar: boolean, onSelesai: () => void) {
  const selesai = useEffectEvent(onSelesai);

  useEffect(() => {
    if (!keluar) return;
    const el = ref.current;
    const padaTransisi = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === "opacity") selesai();
    };
    el?.addEventListener("transitionend", padaTransisi);
    const cadangan = setTimeout(() => selesai(), BATAS_KELUAR_MS);
    return () => {
      el?.removeEventListener("transitionend", padaTransisi);
      clearTimeout(cadangan);
    };
  }, [ref, keluar]);
}
