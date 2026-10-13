import { Suspense } from "react";
import { aturanRsvp } from "@/buku-tamu/rsvp";
import type { KontenUndangan } from "@/konten/skema";
import { Rsvp } from "./rsvp";

type Props = Pick<KontenUndangan, "acara" | "rsvp">;

/**
 * Act Hadir (RENCANA.md §5): `flow` + `in`, rata kiri. Ponsel: bertumpuk. Layar lebar: judul dan ringkasan
 * di kolom kiri, form di kanan. Untuk sementara hanya berisi RSVP; Buku Tamu dan Amplop Digital menyusul,
 * dan penempatan akhirnya dikerjakan di tiket 15.
 */
export function Hadir({ acara, rsvp }: Props) {
  return (
    <section id="hadir" className="hadir" data-sc-act="flow" aria-labelledby="hadir-judul">
      <div className="hadir__kepala">
        <h2 id="hadir-judul" className="hadir__judul" data-sc-in="">
          Kabari kami
        </h2>
        <p className="hadir__pengantar" data-sc-in="">
          Beri tahu kami apakah kamu bisa hadir, dan titipkan doa untuk kami berdua.
        </p>
      </div>
      {/* Nama dari Link Tamu dibaca di browser. Selama itu layar loading sudah menutupi halaman. */}
      <Suspense fallback={null}>
        <Rsvp
          acara={acara.map(({ id, nama }) => ({ id, nama }))}
          aturan={aturanRsvp({ acara, rsvp })}
          tampilkanRingkasan={rsvp.tampilkanRingkasan}
        />
      </Suspense>
    </section>
  );
}
