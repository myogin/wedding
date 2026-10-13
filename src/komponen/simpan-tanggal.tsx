"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";

type Props = {
  /** Id elemen nama Acara, supaya pembaca layar tahu tanggal Acara mana yang disimpan. */
  idNamaAcara: string;
  tautanGoogleCalendar: string;
  tautanIcs: string;
};

/**
 * Tombol "Simpan Tanggal" dengan dua pilihan: Google Calendar dan berkas .ics untuk kalender lain.
 * Pilihannya melayang di atas halaman, bukan menyisip ke alur, jadi membukanya tidak menggeser isi di
 * bawahnya, termasuk act ber-pin sesudah Hari H.
 */
export function SimpanTanggal({ idNamaAcara, tautanGoogleCalendar, tautanIcs }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  const akar = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const idPilihan = useId();

  useEffect(() => {
    if (!terbuka) return;
    const padaTombolKeyboard = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setTerbuka(false);
      tombol.current?.focus();
    };
    const padaKetukan = (e: PointerEvent) => {
      if (!akar.current?.contains(e.target as Node)) setTerbuka(false);
    };
    document.addEventListener("keydown", padaTombolKeyboard);
    document.addEventListener("pointerdown", padaKetukan);
    return () => {
      document.removeEventListener("keydown", padaTombolKeyboard);
      document.removeEventListener("pointerdown", padaKetukan);
    };
  }, [terbuka]);

  // Tutup saat fokus keyboard berpindah keluar dari tombol dan pilihannya.
  const padaFokusKeluar = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setTerbuka(false);
  };

  return (
    <div ref={akar} className="simpan-tanggal" onBlur={padaFokusKeluar}>
      <button
        ref={tombol}
        type="button"
        className="tombol-garis"
        aria-expanded={terbuka}
        aria-controls={idPilihan}
        aria-describedby={idNamaAcara}
        onClick={() => setTerbuka((t) => !t)}
      >
        Simpan Tanggal
      </button>
      <div id={idPilihan} className="simpan-tanggal__pilihan" hidden={!terbuka}>
        <a href={tautanGoogleCalendar} target="_blank" rel="noopener noreferrer" onClick={() => setTerbuka(false)}>
          Google Calendar
        </a>
        <a href={tautanIcs} onClick={() => setTerbuka(false)}>
          Kalender lain (.ics)
        </a>
      </div>
    </div>
  );
}
