"use client";

import Image from "next/image";
import { memo, useEffect, useRef } from "react";
import type { Gambar } from "@/konten/skema";

/**
 * Jeda antarfoto: sangat cepat, seperti film yang dipercepat. Kedipan gelap-terang tetap jarang
 * (satu lompatan per putaran, ±1,7 kali per detik untuk 10 foto) karena fotonya sudah diurutkan
 * menurut kecerahan (lihat urutkanKilasan).
 */
const JEDA_MS = 60;
/** Dengan gerakan dikurangi, foto tetap berganti tetapi pelan dan tanpa efek proyektor. */
const JEDA_TENANG_MS = 1600;

/**
 * Kilasan foto Mempelai di layar loading, berganti cepat dengan potongan keras seperti film.
 * Hanya foto yang sudah termuat yang ikut diputar, jadi tidak ada bingkai kosong.
 * Foto aktif ditandai langsung di DOM: berganti belasan kali per detik, jadi tidak lewat state React.
 */
export const FilmKilasan = memo(function FilmKilasan({ foto }: { foto: Gambar[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const termuat = useRef(new Set<number>());

  useEffect(() => {
    const gambar = Array.from(wadah.current?.querySelectorAll("img") ?? []);
    const tenang = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let aktif = 0;

    const pemutar = setInterval(() => {
      for (let langkah = 1; langkah <= gambar.length; langkah++) {
        const berikut = (aktif + langkah) % gambar.length;
        if (!termuat.current.has(berikut)) continue;
        gambar[aktif]?.removeAttribute("data-aktif");
        gambar[berikut]?.setAttribute("data-aktif", "");
        aktif = berikut;
        return;
      }
    }, tenang ? JEDA_TENANG_MS : JEDA_MS);
    return () => clearInterval(pemutar);
  }, [foto.length]);

  return (
    <div className="film" role="img" aria-label="Kilasan foto Mempelai">
      <div ref={wadah} className="film__gambar">
        {foto.map((gambar, i) => (
          <Image
            key={gambar.src}
            className="film__foto"
            src={gambar.src}
            alt=""
            fill
            sizes="(min-width: 900px) 224px, 48vw"
            loading="eager"
            data-aktif={i === 0 || undefined}
            onLoad={() => termuat.current.add(i)}
          />
        ))}
      </div>
      <div className="film__butir" aria-hidden="true" />
      <div className="film__vinyet" aria-hidden="true" />
    </div>
  );
});
