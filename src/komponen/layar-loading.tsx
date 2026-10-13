import type { CSSProperties } from "react";
import type { Gambar } from "@/konten/skema";
import { FilmKilasan } from "./film-kilasan";

type Props = { namaMempelai: string; foto: Gambar[]; persen?: number };

/**
 * Menutupi Undangan sampai Konteks Tamu terbaca dan aset kritis Hero termuat (minimal 5 detik),
 * agar Tamu tidak melihat nama berkedip atau adegan yang setengah jadi. Selama menunggu,
 * kilasan foto Mempelai diputar seperti film yang dipercepat.
 */
export function LayarLoading({ namaMempelai, foto, persen = 0 }: Props) {
  return (
    <div className="gerbang layar-loading" role="status">
      <p className="layar-loading__mempelai">{namaMempelai}</p>
      <FilmKilasan foto={foto} />
      <div
        className="layar-loading__progres"
        role="progressbar"
        aria-label="Memuat undangan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={persen}
        style={{ "--persen": persen / 100 } as CSSProperties}
      >
        <span className="layar-loading__teks">Memuat undangan</span>
        {/* Angka tidak diumumkan lewat role="status" (terlalu ramai); nilainya ada di aria-valuenow. */}
        <span className="layar-loading__angka" aria-hidden="true">
          {persen}%
        </span>
        <span className="layar-loading__garis" aria-hidden="true" />
      </div>
      <noscript>
        <p className="layar-loading__teks">Aktifkan JavaScript untuk membuka undangan.</p>
      </noscript>
    </div>
  );
}
