"use client";

import { useCallback, useEffect, useState } from "react";
import type { RingkasanRsvp } from "@/buku-tamu/rsvp";
import { ambilJson } from "./ambil-json";

/** Ringkasan dari server. null selama dimuat, "gagal" bila belum pernah berhasil dimuat. */
export function useRingkasan(aktif: boolean) {
  const [ringkasan, setRingkasan] = useState<RingkasanRsvp | "gagal" | null>(null);

  const muat = useCallback(async () => {
    try {
      setRingkasan(await ambilJson<RingkasanRsvp>("/api/rsvp/summary"));
    } catch {
      // Angka lama (bila ada) tetap tampil daripada hilang.
      setRingkasan((lama) => lama ?? "gagal");
    }
  }, []);

  useEffect(() => {
    if (aktif) void muat();
  }, [aktif, muat]);

  return [ringkasan, muat] as const;
}

const formatAngka = new Intl.NumberFormat("id-ID");
/** Lebar satu angka (figure space) selama ringkasan dimuat, supaya tingginya sudah tercadang. */
const ANGKA_KOSONG = "\u2007";

export function RingkasanKehadiran({ ringkasan }: { ringkasan: RingkasanRsvp | "gagal" | null }) {
  const angka = typeof ringkasan === "object" ? ringkasan : null;
  const butir: [string, number | undefined][] = [
    ["Total respons", angka?.totalRespons],
    ["Hadir", angka?.hadir],
    ["Tidak hadir", angka?.tidakHadir],
    ["Total tamu", angka?.totalPax],
  ];

  return (
    <div
      className="ringkasan"
      role="group"
      aria-label="Ringkasan konfirmasi"
      aria-busy={ringkasan === null}
      data-gagal={ringkasan === "gagal" || undefined}
    >
      <dl className="ringkasan__daftar">
        {butir.map(([label, nilai]) => (
          <div key={label} className="ringkasan__butir">
            <dt className="ringkasan__label">{label}</dt>
            <dd className="ringkasan__angka">{nilai === undefined ? ANGKA_KOSONG : formatAngka.format(nilai)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
