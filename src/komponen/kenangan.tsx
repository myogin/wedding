import Image from "next/image";
import type { Gambar } from "@/konten/skema";
import { GaleriLightbox } from "./galeri-lightbox";

type Props = { galeri: Gambar[] };

/** Span act paling banyak (score), supaya Hero (3.0) tetap act dengan ruang scroll terbesar. */
const SPAN_MAKS = "2.4";

/**
 * Tinggi satu baris foto di rel (vh), sama dengan --kenangan-baris di undangan.css. Di layar ultrawide
 * CSS memperbesarnya sampai 42vh; sizes di sini sengaja tidak mengikutinya (foto sedikit kurang tajam).
 */
const TINGGI_BARIS = { ponsel: 27, layarLebar: 33 };

/** Lebar tampil foto = tinggi baris × rasio fotonya, jadi browser memilih berkas sekecil mungkin. */
function ukuranFoto(foto: Gambar): string {
  const rasio = foto.lebar / foto.tinggi;
  const vh = (tinggi: number) => `${Math.ceil(tinggi * rasio)}vh`;
  return `(min-width: 900px) ${vh(TINGGI_BARIS.layarLebar)}, ${vh(TINGGI_BARIS.ponsel)}`;
}

/**
 * Act Kenangan (RENCANA.md §5): `pan`. Berjalan menyamping menyusuri dinding foto, foto demi foto.
 * Judul act adalah item pertama rel dan catatan penutup item terakhirnya. Setiap foto adalah tombol
 * yang membuka lightbox.
 * Span dihitung dari panjang rel di layar Tamu, paling banyak SPAN_MAKS.
 */
export function Kenangan({ galeri }: Props) {
  return (
    <section
      id="kenangan"
      className="kenangan"
      data-sc-act="pan"
      data-sc-span={SPAN_MAKS}
      data-span-otomatis=""
      data-span-maks={SPAN_MAKS}
      data-span-statis="1"
      aria-labelledby="kenangan-judul"
    >
      <div className="kenangan__panggung sc-stage" data-sc-stage="">
        <GaleriLightbox foto={galeri}>
          <ol className="kenangan__rel" data-sc-pan="0">
            <li className="kenangan__pembuka">
              <h2 id="kenangan-judul" className="kenangan__judul">
                Kenangan
              </h2>
            </li>
            {galeri.map((foto, i) => (
              <li key={foto.src} className="kenangan__foto media-redup">
                {/* Nama tombol adalah teks alternatif fotonya. */}
                <button type="button" className="kenangan__tombol" data-foto={i} aria-haspopup="dialog">
                  <Image src={foto.src} alt={foto.alt} width={foto.lebar} height={foto.tinggi} sizes={ukuranFoto(foto)} />
                </button>
              </li>
            ))}
            <li className="kenangan__penutup">
              <p>Bab berikutnya ingin kami tulis bersamamu.</p>
            </li>
          </ol>
        </GaleriLightbox>
      </div>
    </section>
  );
}
