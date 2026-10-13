import type { CSSProperties } from "react";
import type { DataHero, PasanganAsetHero } from "@/konten/hero";
import { PanggungHero } from "./panggung-hero";
import type { ModeHero } from "./pemuatan-hero";

type Props = {
  hero: DataHero;
  alt: string;
  mempelai: { pria: string; wanita: string };
  tanggal: string;
};

type Ukuran = { lebar: number; tinggi: number };

/** Pecahan (0..1) sebagai nilai persen CSS. */
const cssPersen = (pecahan: number) => `${(pecahan * 100).toFixed(3)}%`;

/**
 * Satu lapisan dalam dua keadaan: gelap (lentera padam, di belakang Sampul) di bawah, terang di atasnya.
 * `data-aset-hero` dan `data-bytes` dibaca pemantau pemuatan untuk persentase dan pilihan mode Hero.
 */
function GambarLapisan({ aset, mode, ukuran }: { aset: PasanganAsetHero; mode: ModeHero; ukuran: Ukuran }) {
  return (
    <>
      <img
        className="hero__gelap"
        src={aset.gelap.src}
        alt=""
        width={ukuran.lebar}
        height={ukuran.tinggi}
        decoding="async"
        draggable={false}
        fetchPriority="high"
        data-aset-hero={mode}
        data-bytes={aset.gelap.bytes}
      />
      <img
        className="hero__terang"
        src={aset.terang.src}
        alt=""
        width={ukuran.lebar}
        height={ukuran.tinggi}
        decoding="async"
        draggable={false}
        data-aset-hero={mode}
        data-bytes={aset.terang.bytes}
      />
    </>
  );
}

/**
 * Act Gerbang: Hero berlapis (RENCANA.md §7). Semua lapisan berada di ruang bingkai foto dan
 * diskalakan dari titik kontak kaki, jadi Mempelai tetap berpijak saat kamera "melangkah masuk".
 * Gerak dihitung di CSS dari `--sc-p` yang ditulis engine pada act ini.
 */
export function Hero({ hero, alt, mempelai, tanggal }: Props) {
  const { geometri, aset } = hero;
  const { bingkai, subjek, depan } = geometri;

  const tata = {
    "--rasio-bingkai": bingkai.tinggi / bingkai.lebar,
    "--fokus-x": geometri.fokus.x,
    "--kontak-x": cssPersen(subjek.kontak.x / bingkai.lebar),
    "--kontak-y": cssPersen(subjek.kontak.y / bingkai.tinggi),
    "--rasio-depan": depan.tinggi / depan.lebar,
  } as CSSProperties;

  const kotakSubjek = {
    left: cssPersen(subjek.x / bingkai.lebar),
    top: cssPersen(subjek.y / bingkai.tinggi),
    width: cssPersen(subjek.lebar / bingkai.lebar),
    height: cssPersen(subjek.tinggi / bingkai.tinggi),
    transformOrigin: `${cssPersen((subjek.kontak.x - subjek.x) / subjek.lebar)} ${cssPersen((subjek.kontak.y - subjek.y) / subjek.tinggi)}`,
  } satisfies CSSProperties;

  return (
    <section
      id="hero"
      className="hero"
      data-sc-act="pin"
      data-sc-span="3"
      data-span-statis="1"
      data-menyala-saat-dibuka=""
      aria-labelledby="hero-judul"
      style={tata}
    >
      <PanggungHero>
        <div className="hero__ruang">
          <div className="hero__adegan" role="img" aria-label={alt}>
            <div className="hero__bingkai">
              <div className="hero__poster">
                <GambarLapisan aset={aset.poster} mode="poster" ukuran={bingkai} />
              </div>
              <div className="hero__jauh">
                <GambarLapisan aset={aset.latar} mode="lapisan" ukuran={bingkai} />
                {geometri.lentera.map((lentera, urutan) => (
                  <span
                    key={urutan}
                    className="hero__pendar"
                    style={
                      {
                        left: cssPersen(lentera.x - lentera.r),
                        top: cssPersen(lentera.y - (lentera.r * bingkai.lebar) / bingkai.tinggi),
                        width: cssPersen(lentera.r * 2),
                        "--urutan": urutan,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <div className="hero__subjek" style={kotakSubjek}>
                <GambarLapisan aset={aset.subjek} mode="lapisan" ukuran={subjek} />
              </div>
              <div className="hero__debu" />
            </div>
          </div>

          <div className="hero__scrim" aria-hidden="true" />
          {/* Di atas scrim: di ponsel sedap malam tetap terlihat di sudut, di luar pita teks. */}
          <div className="hero__depan">
            <GambarLapisan aset={aset.depan} mode="lapisan" ukuran={depan} />
          </div>
          <div className="hero__teks">
            <h1 id="hero-judul" className="hero__nama" tabIndex={-1}>
              <span className="hero__baris">{mempelai.pria}</span>{" "}
              <span className="hero__baris">
                <span className="hero__dan">&amp;</span> {mempelai.wanita}
              </span>
            </h1>
            <p className="hero__tanggal label-tanggal">{tanggal}</p>
          </div>
        </div>
      </PanggungHero>
    </section>
  );
}
