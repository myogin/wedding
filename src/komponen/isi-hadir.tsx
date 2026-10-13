"use client";

import type { AturanRsvp } from "@/buku-tamu/rsvp";
import { DaftarUcapan, useDaftarUcapan } from "./daftar-ucapan";
import { RingkasanKehadiran, useRingkasan } from "./ringkasan-kehadiran";
import { Rsvp, type AcaraPilihan } from "./rsvp";

type Props = {
  acara: AcaraPilihan[];
  aturan: AturanRsvp;
  tampilkanRingkasan: boolean;
};

/**
 * Bagian interaktif act Hadir: ringkasan kehadiran (bila diaktifkan), RSVP, dan Buku Tamu. Setelah RSVP
 * terkirim, ringkasan dimuat ulang dan Buku Tamu kembali ke halaman 1 supaya Ucapan baru tampil paling atas.
 * Dirender sebagai tiga anak grid act. Setiap pembungkus tetap ada saat isinya berganti, karena engine hanya
 * mengamati [data-sc-in] saat dipasang.
 */
export function IsiHadir({ acara, aturan, tampilkanRingkasan }: Props) {
  const [ringkasan, muatUlangRingkasan] = useRingkasan(tampilkanRingkasan);
  const bukuTamu = useDaftarUcapan();

  function padaTerkirim() {
    if (tampilkanRingkasan) void muatUlangRingkasan();
    void bukuTamu.keHalaman(1);
  }

  return (
    <>
      {tampilkanRingkasan && (
        <div className="hadir__ringkasan" data-sc-in="">
          <RingkasanKehadiran ringkasan={ringkasan} />
        </div>
      )}
      <div className="hadir__rsvp" data-sc-in="">
        <Rsvp acara={acara} aturan={aturan} onTerkirim={padaTerkirim} />
      </div>
      <div className="hadir__buku-tamu" data-sc-in="">
        <DaftarUcapan {...bukuTamu} />
      </div>
    </>
  );
}
