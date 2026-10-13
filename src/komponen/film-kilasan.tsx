"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Gambar } from "@/konten/skema";

/**
 * Jeda antarfoto: cepat seperti film yang dipercepat. Kedipan gelap-terang tetap jarang karena
 * fotonya sudah diurutkan menurut kecerahan (lihat urutkanKilasan).
 */
const JEDA_MS = 180;
/** Dengan gerakan dikurangi, foto tetap berganti tetapi pelan dan tanpa efek proyektor. */
const JEDA_TENANG_MS = 1600;

/**
 * Kilasan foto Mempelai di layar loading, berganti cepat dengan potongan keras seperti film.
 * Hanya foto yang sudah termuat yang ikut diputar, jadi tidak ada bingkai kosong.
 */
export function FilmKilasan({ foto }: { foto: Gambar[] }) {
  const [aktif, setAktif] = useState(0);
  const termuat = useRef(new Set<number>());

  useEffect(() => {
    const tenang = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pemutar = setInterval(
      () =>
        setAktif((kini) => {
          for (let langkah = 1; langkah <= foto.length; langkah++) {
            const berikut = (kini + langkah) % foto.length;
            if (termuat.current.has(berikut)) return berikut;
          }
          return kini;
        }),
      tenang ? JEDA_TENANG_MS : JEDA_MS,
    );
    return () => clearInterval(pemutar);
  }, [foto.length]);

  return (
    <div className="film" role="img" aria-label="Kilasan foto Mempelai">
      <div className="film__gambar">
        {foto.map((gambar, i) => (
          <Image
            key={gambar.src}
            className="film__foto"
            src={gambar.src}
            alt=""
            fill
            sizes="(min-width: 900px) 224px, 48vw"
            loading="eager"
            data-aktif={i === aktif || undefined}
            onLoad={() => termuat.current.add(i)}
          />
        ))}
      </div>
      <div className="film__butir" aria-hidden="true" />
      <div className="film__vinyet" aria-hidden="true" />
    </div>
  );
}
