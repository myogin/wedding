import { Suspense } from "react";
import { GerbangUndangan } from "@/komponen/gerbang-undangan";
import { Hero } from "@/komponen/hero";
import { LayarLoading } from "@/komponen/layar-loading";
import { RangkaUndangan } from "@/komponen/rangka-undangan";
import { acaraUtama, kontenUndangan, namaMempelai } from "@/konten";
import { formatTanggalAcara } from "@/konten/format";
import { muatHero } from "@/konten/hero";
import { urutkanKilasan } from "@/konten/kilasan";
// Engine scroll-craft hanya dimuat di halaman ini, dan tema halaman ditulis setelahnya.
import "@/scrollcraft/scrollcraft.css";
import "./undangan.css";

export default async function HalamanUndangan() {
  const { sampul, mempelai, musik, galeri } = kontenUndangan;
  const nama = namaMempelai(kontenUndangan);
  const tanggal = formatTanggalAcara(acaraUtama(kontenUndangan));
  const kilasan = await urutkanKilasan(galeri);

  return (
    <main>
      <RangkaUndangan
        gerbang={
          // Konteks Tamu dibaca di browser; halaman tetap statis dan fallback-nya ikut di HTML awal.
          <Suspense fallback={<LayarLoading namaMempelai={nama} foto={kilasan} />}>
            <GerbangUndangan
              judul={sampul.judul}
              namaMempelai={nama}
              tanggal={tanggal}
              catatanMaaf={sampul.catatanMaaf}
              musik={musik}
              kilasan={kilasan}
            />
          </Suspense>
        }
      >
        <Hero
          hero={muatHero(kontenUndangan.hero.folder)}
          alt={kontenUndangan.hero.alt}
          mempelai={{ pria: mempelai.pria.panggilan, wanita: mempelai.wanita.panggilan }}
          tanggal={tanggal}
        />
        <footer className="kaki">
          <p className="kaki__mempelai">{nama}</p>
          <p className="kaki__tanggal label-tanggal">{tanggal}</p>
        </footer>
      </RangkaUndangan>
      <div className="sc-grain" aria-hidden="true" />
    </main>
  );
}
