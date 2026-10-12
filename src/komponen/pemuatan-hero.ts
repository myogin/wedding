"use client";

import { useEffect, useState, type RefObject } from "react";

/** "lapisan": semua lapisan Hero termuat. "poster": ada lapisan yang gagal, Hero memakai poster. */
export type ModeHero = "lapisan" | "poster";

/** Setelah batas ini, lapisan yang belum datang dianggap gagal dan Hero memakai poster. */
const BATAS_TUNGGU_LAPISAN_MS = 20_000;

/**
 * Menunggu semua <img data-aset-hero> di dalam akar selesai dimuat dan di-decode.
 * Bobot tiap gambar adalah ukuran berkasnya (data-bytes), jadi persentasenya mengikuti byte.
 * Bila lapisan tidak lengkap, hasilnya baru diumumkan setelah poster sendiri selesai dimuat,
 * supaya Sampul tidak pernah tampil di atas adegan yang setengah jadi.
 */
export function usePemuatanHero(akar: RefObject<HTMLElement | null>) {
  const [persen, setPersen] = useState(0);
  const [mode, setMode] = useState<ModeHero | null>(null);

  useEffect(() => {
    const gambar = Array.from(akar.current?.querySelectorAll<HTMLImageElement>("img[data-aset-hero]") ?? []);
    const bobot = (g: HTMLImageElement) => Number(g.dataset.bytes) || 1;
    const total = gambar.reduce((jumlah, g) => jumlah + bobot(g), 0) || 1;
    const hasil = new Map<HTMLImageElement, boolean>();
    const lepasPendengar: (() => void)[] = [];
    let batal = false;
    let pengatur: ReturnType<typeof setTimeout> | undefined;

    const tunggu = (g: HTMLImageElement) =>
      new Promise<void>((selesai) => {
        const catat = (berhasil: boolean) => {
          hasil.set(g, berhasil);
          const termuat = [...hasil.keys()].reduce((jumlah, h) => jumlah + bobot(h), 0);
          if (!batal) setPersen(Math.floor((termuat / total) * 100));
          selesai();
        };
        if (g.complete) return catat(g.naturalWidth > 0);
        const padaMuat = () => catat(true);
        const padaGalat = () => catat(false);
        g.addEventListener("load", padaMuat, { once: true });
        g.addEventListener("error", padaGalat, { once: true });
        lepasPendengar.push(() => {
          g.removeEventListener("load", padaMuat);
          g.removeEventListener("error", padaGalat);
        });
      });

    const menurutJenis = (mode: ModeHero) => gambar.filter((g) => g.dataset.asetHero === mode);
    const lapisan = Promise.all(menurutJenis("lapisan").map(tunggu));
    const poster = Promise.all(menurutJenis("poster").map(tunggu));
    const habisWaktu = new Promise<void>((selesai) => (pengatur = setTimeout(selesai, BATAS_TUNGGU_LAPISAN_MS)));

    void (async () => {
      await Promise.race([lapisan, habisWaktu]);
      const lapisanLengkap = menurutJenis("lapisan").every((g) => hasil.get(g) === true);
      if (!lapisanLengkap) await poster;
      // Decode sebelum Sampul tampil, supaya penyalaan Hero tidak tersendat di frame pertamanya.
      await Promise.allSettled(gambar.filter((g) => hasil.get(g)).map((g) => g.decode()));
      await document.fonts?.ready;
      if (batal) return;
      setPersen(100);
      setMode(lapisanLengkap ? "lapisan" : "poster");
    })();

    return () => {
      batal = true;
      clearTimeout(pengatur);
      lepasPendengar.forEach((lepas) => lepas());
    };
  }, [akar]);

  return { persen, mode };
}
