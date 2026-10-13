import { formatJamAcara, formatTanggalAcara } from "@/konten/format";
import { tautanGoogleCalendar, tautanIcs } from "@/konten/kalender";
import type { Acara } from "@/konten/skema";
import { rentangAcara } from "@/konten/waktu-acara";
import { HitungMundur } from "./hitung-mundur";
import { SimpanTanggal } from "./simpan-tanggal";

type Props = {
  acara: Acara[];
  /** Target hitung mundur. */
  acaraUtama: Acara;
  /** Untuk judul entri kalender, mis. "Resepsi Agung Dalem & Ayu Oka". */
  namaMempelai: string;
};

/**
 * Act Hari H (RENCANA.md §5): `flow` + `in`, rata kiri. Informasi praktis yang ringkas: hitung mundur
 * menuju Acara utama, lalu setiap Acara dengan hari, tanggal, jam, zona waktu, tempat, dan alamatnya.
 */
export function HariH({ acara, acaraUtama, namaMempelai }: Props) {
  const { mulai, akhir } = rentangAcara(acaraUtama);

  return (
    <section id="hari-h" className="hari-h" data-sc-act="flow" aria-labelledby="hari-h-judul">
      <h2 id="hari-h-judul" className="hari-h__judul" data-sc-in="">
        Menuju hari bahagia
      </h2>
      <div className="hari-h__hitung" data-sc-in="">
        <HitungMundur namaAcara={acaraUtama.nama} mulai={mulai} akhir={akhir} />
      </div>
      <div className="hari-h__acara">
        {acara.map((a) => (
          <article key={a.id} className="acara" aria-labelledby={`acara-${a.id}`} data-sc-in="">
            <h3 id={`acara-${a.id}`} className="acara__nama">
              {a.nama}
            </h3>
            <p className="acara__tanggal">{formatTanggalAcara(a)}</p>
            <p className="acara__jam">{formatJamAcara(a)}</p>
            <address className="acara__lokasi">
              {a.tempat && <span className="acara__tempat">{a.tempat}</span>}
              <span className="acara__alamat">{a.alamat}</span>
            </address>
            <div className="acara__aksi">
              <a
                className="tombol-garis"
                href={a.peta}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby={`acara-${a.id}`}
              >
                Lihat Lokasi
              </a>
              <SimpanTanggal
                idNamaAcara={`acara-${a.id}`}
                tautanGoogleCalendar={tautanGoogleCalendar(a, namaMempelai)}
                tautanIcs={tautanIcs(a)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
