import Image from "next/image";
import { barisTeksAsli } from "@/konten/format";
import type { KontenUndangan } from "@/konten/skema";

type Props = { pembuka: KontenUndangan["pembuka"] };

/**
 * Act Restu (RENCANA.md §5): `flow` + `in`, satu-satunya act rata tengah. Dibuka dengan hening hampir
 * hitam, lalu ayat datang baris demi baris (selang 80 ms), terjemahan, sumber, dan foto penutup.
 * Tidak ada yang bergerak selain teks: foto tidak ikut `in`, hanya menghangat saat stasiunnya menyala.
 */
export function Restu({ pembuka }: Props) {
  const { salam, kutipan, gambar } = pembuka;
  const barisAsli = barisTeksAsli(kutipan);

  return (
    <section id="restu" className="restu" data-sc-act="flow" aria-labelledby="restu-judul">
      <h2 id="restu-judul" className="restu__salam" data-sc-in="">
        {salam}
      </h2>
      <blockquote className="restu__kutipan">
        {barisAsli.length > 0 && (
          <p className="restu__asli" lang={kutipan.bahasaAsli} dir="auto" data-sc-in="" data-sc-stagger="80">
            {barisAsli.map((baris, i) => (
              <span key={`${i}-${baris}`} className="restu__baris">
                {baris}
              </span>
            ))}
          </p>
        )}
        <p className="restu__terjemahan" data-sc-in="">
          {kutipan.terjemahan}
        </p>
        <footer className="restu__sumber label-tanggal" data-sc-in="">
          <cite>{kutipan.sumber}</cite>
        </footer>
      </blockquote>
      {gambar && (
        <figure className="restu__gambar media-redup">
          <Image
            src={gambar.src}
            alt={gambar.alt}
            width={gambar.lebar}
            height={gambar.tinggi}
            sizes="(min-width: 900px) 52rem, calc(100vw - 3rem)"
          />
        </figure>
      )}
    </section>
  );
}
