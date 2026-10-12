import { Suspense } from "react";
import { LayarLoading } from "@/komponen/layar-loading";
import { Sampul } from "@/komponen/sampul";
import { acaraUtama, kontenUndangan, namaMempelai } from "@/konten";
import { formatTanggalAcara } from "@/konten/format";

export default function HalamanUndangan() {
  const { sampul } = kontenUndangan;
  const nama = namaMempelai(kontenUndangan);

  return (
    <main>
      {/* Konteks Tamu dibaca di browser; halaman tetap statis dan fallback-nya ikut di HTML awal. */}
      <Suspense fallback={<LayarLoading namaMempelai={nama} />}>
        <Sampul
          judul={sampul.judul}
          namaMempelai={nama}
          tanggal={formatTanggalAcara(acaraUtama(kontenUndangan))}
          catatanMaaf={sampul.catatanMaaf}
          foto={sampul.foto}
        />
      </Suspense>
    </main>
  );
}
