import type { KontenUndangan } from "@/konten/skema";
import { FotoTerpotong } from "./foto-terpotong";

type Props = { kisah: NonNullable<KontenUndangan["kisahCinta"]> };

/**
 * Act Kisah Cinta (opsional, RENCANA.md §5): `pan`. Babak-babak kisah digeser menyamping seperti
 * menyusuri waktu. Span dihitung saat engine dipasang dari panjang rel di layar Tamu
 * (`data-span-otomatis`); `data-sc-span` di bawah hanya nilai awal. Hanya dirender bila `kisahCinta` diisi.
 */
export function KisahCinta({ kisah }: Props) {
  return (
    <section
      id="kisah"
      className="kisah"
      data-sc-act="pan"
      data-sc-span="2"
      data-span-otomatis=""
      data-span-statis="1"
      aria-labelledby="kisah-judul"
    >
      <div className="kisah__panggung sc-stage" data-sc-stage="">
        <ol className="kisah__rel" data-sc-pan="0">
          <li className="kisah__pembuka">
            <h2 id="kisah-judul" className="kisah__judul">
              Kisah Cinta
            </h2>
          </li>
          {kisah.map((babak) => (
            <li key={`${babak.tanggal}-${babak.judul}`} className="kisah__babak">
              {babak.foto && (
                <figure className="kisah__foto media-redup">
                  <FotoTerpotong gambar={babak.foto} sizes="(min-width: 900px) 22rem, 72vw" />
                </figure>
              )}
              <h3 className="kisah__nama-babak">{babak.judul}</h3>
              {/* Tanggal sesudah judul dan tanpa huruf kapital berjarak, supaya tidak menjadi eyebrow. */}
              <p className="kisah__tanggal">{babak.tanggal}</p>
              <p className="kisah__cerita">{babak.cerita}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
