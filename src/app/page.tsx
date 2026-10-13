import { Suspense } from "react";
import { GerbangUndangan } from "@/komponen/gerbang-undangan";
import { HariH } from "@/komponen/hari-h";
import { Hero } from "@/komponen/hero";
import { Kami } from "@/komponen/kami";
import { Kenangan } from "@/komponen/kenangan";
import { KisahCinta } from "@/komponen/kisah-cinta";
import { RangkaUndangan } from "@/komponen/rangka-undangan";
import { Restu } from "@/komponen/restu";
import { acaraUtama, kontenUndangan, namaMempelai } from "@/konten";
import { formatTanggalAcara } from "@/konten/format";
import { muatHero } from "@/konten/hero";
import { urutkanKilasan } from "@/konten/kilasan";
// Engine scroll-craft hanya dimuat di halaman ini, dan tema halaman ditulis setelahnya.
import "@/scrollcraft/scrollcraft.css";
import "./undangan.css";

export default async function HalamanUndangan() {
  const { sampul, mempelai, musik, galeri, pembuka, kisahCinta } = kontenUndangan;
  const nama = namaMempelai(kontenUndangan);
  const utama = acaraUtama(kontenUndangan);
  const tanggal = formatTanggalAcara(utama);
  const kilasan = await urutkanKilasan(galeri);

  return (
    <main>
      <RangkaUndangan
        namaMempelai={nama}
        kilasan={kilasan}
        gerbang={
          // Konteks Tamu dibaca di browser; halaman tetap statis. Selama itu layar loading
          // (dirender kerangka, di luar boundary ini) sudah menutupi halaman.
          <Suspense fallback={null}>
            <GerbangUndangan
              judul={sampul.judul}
              namaMempelai={nama}
              tanggal={tanggal}
              catatanMaaf={sampul.catatanMaaf}
              musik={musik}
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
        <Restu pembuka={pembuka} />
        <Kami mempelai={mempelai} />
        {kisahCinta && kisahCinta.length > 0 && <KisahCinta kisah={kisahCinta} />}
        <HariH acara={kontenUndangan.acara} acaraUtama={utama} namaMempelai={nama} />
        <Kenangan galeri={galeri} />
        <footer className="kaki">
          <p className="kaki__mempelai">{nama}</p>
          <p className="kaki__tanggal label-tanggal">{tanggal}</p>
        </footer>
      </RangkaUndangan>
      <div className="sc-grain" aria-hidden="true" />
    </main>
  );
}
