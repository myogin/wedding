import { namaInstagram } from "@/konten/format";
import type { KontenUndangan } from "@/konten/skema";
import { FotoTerpotong } from "./foto-terpotong";

type Peran = keyof KontenUndangan["mempelai"];

/** Sama untuk lapisan padam dan terang, jadi browser cukup mengunduh satu berkas. */
const UKURAN_POTRET = "(min-aspect-ratio: 3/2) 22vw, 40vw";

/**
 * Semua yang berbeda antara Mempelai pria dan wanita di act ini.
 * `saatTampil` adalah jendela progres act untuk wipe potret; teks menyusul di tengahnya.
 */
const PERAN: Record<Peran, { sapaan: string; sisi: "kiri" | "kanan"; saatTampil: [number, number] }> = {
  pria: { sapaan: "Putra", sisi: "kiri", saatTampil: [0, 0.5] },
  wanita: { sapaan: "Putri", sisi: "kanan", saatTampil: [0.45, 0.95] },
};

/**
 * Satu Mempelai: potret dibuka dari sisi luarnya ke arah tengah, teks di sisi seberang.
 * Bingkai potret sudah terlihat sejak panggung masuk, dalam keadaan padam; wipe membuka versi terangnya
 * seperti cahaya lentera yang menyapu masuk. Tanpa lapisan padam, panggung kosong selama geser masuk.
 */
function SatuMempelai({ data, peran }: { data: KontenUndangan["mempelai"][Peran]; peran: Peran }) {
  const { sapaan, sisi, saatTampil } = PERAN[peran];
  const [mulai, selesai] = saatTampil;
  const akunInstagram = data.instagram ? namaInstagram(data.instagram) : null;

  return (
    <div className={`kami__mempelai kami__mempelai--${sisi}`}>
      <figure className="kami__potret">
        <FotoTerpotong gambar={data.foto} sizes={UKURAN_POTRET} alt="" className="kami__potret-padam" />
        <div
          className="kami__potret-terang media-redup"
          data-sc-reveal={sisi === "kiri" ? "left" : "right"}
          data-sc-reveal-at={`${mulai} ${selesai}`}
        >
          <FotoTerpotong gambar={data.foto} sizes={UKURAN_POTRET} />
        </div>
      </figure>
      <div className="kami__teks" data-sc-cue={((mulai + selesai) / 2).toFixed(2)}>
        <h3 className="kami__panggilan">{data.panggilan}</h3>
        <p className="kami__lengkap">{data.namaLengkap}</p>
        <p className="kami__ortu">
          {sapaan}
          {data.urutanAnak ? ` ${data.urutanAnak}` : ""} dari
          <br />
          Bapak {data.ayah}
          <br />
          &amp; Ibu {data.ibu}
        </p>
        {data.instagram && (
          <a
            className="kami__instagram"
            href={data.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram ${data.panggilan}${akunInstagram ? ` (@${akunInstagram})` : ""}`}
          >
            {akunInstagram ? `@${akunInstagram}` : "Instagram"}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Act Kami (RENCANA.md §5): `pin` + `reveal`, span 1.6. Potret pria dibuka dari kiri, wanita dari kanan,
 * dan teks masing-masing berada di sisi seberang potretnya.
 */
export function Kami({ mempelai }: { mempelai: KontenUndangan["mempelai"] }) {
  return (
    <section
      id="kami"
      className="kami"
      data-sc-act="pin"
      data-sc-span="1.6"
      data-span-statis="1"
      aria-labelledby="kami-judul"
    >
      <div className="kami__panggung sc-stage" data-sc-stage="">
        <h2 id="kami-judul" className="sr-only">
          Mempelai
        </h2>
        <div className="kami__isi">
          <SatuMempelai data={mempelai.pria} peran="pria" />
          <SatuMempelai data={mempelai.wanita} peran="wanita" />
        </div>
      </div>
    </section>
  );
}
