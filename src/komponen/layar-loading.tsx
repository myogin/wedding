import type { CSSProperties } from "react";

type Props = { namaMempelai: string; persen?: number };

/**
 * Menutupi Undangan sampai Konteks Tamu terbaca dan aset kritis Hero termuat,
 * agar Tamu tidak melihat nama berkedip atau adegan yang setengah jadi.
 */
export function LayarLoading({ namaMempelai, persen = 0 }: Props) {
  return (
    <div className="gerbang layar-loading" role="status">
      <p className="layar-loading__mempelai">{namaMempelai}</p>
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
