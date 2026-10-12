"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Panggung act Hero (yang di-pin engine). Menandai dirinya `data-di-layar` selama terlihat,
 * supaya animasi ambien (kedip lentera, debu) berhenti saat Hero sudah lewat.
 * Atribut ditulis langsung ke DOM, bukan lewat state, agar act tidak pernah di-render ulang karena scroll.
 */
export function PanggungHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pengamat = new IntersectionObserver(([entri]) => {
      el.toggleAttribute("data-di-layar", entri?.isIntersecting ?? false);
    });
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  return (
    // Kelas sc-stage sudah ada sejak HTML awal (engine juga menambahkannya saat mount), karena engine baru
    // dipasang setelah "Buka Undangan": panggung harus sudah setinggi layar di belakang Sampul.
    <div ref={ref} className="hero__panggung sc-stage" data-sc-stage="" data-di-layar="">
      {children}
    </div>
  );
}
