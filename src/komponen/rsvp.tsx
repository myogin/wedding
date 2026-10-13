"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import {
  KEHADIRAN,
  PANJANG_MAKS_NAMA,
  PANJANG_MAKS_UCAPAN,
  periksaRsvp,
  type AturanRsvp,
  type FieldRsvp,
  type GalatRsvp,
  type Kehadiran,
  type RingkasanRsvp,
} from "@/buku-tamu/rsvp";
import { bacaKonteksTamu } from "@/tamu/konteks-tamu";

type AcaraPilihan = { id: string; nama: string };

type Props = {
  acara: AcaraPilihan[];
  aturan: AturanRsvp;
  tampilkanRingkasan: boolean;
};

/** Penanda "sudah mengirim" di perangkat ini. Lentera tamu (tiket 15) memakai nama yang sama. */
type CatatanKirim = { nama: string; kehadiran: Kehadiran };

const KUNCI_CATATAN = "undangan:rsvp";

function bacaCatatan(): CatatanKirim | null {
  try {
    const nilai: unknown = JSON.parse(localStorage.getItem(KUNCI_CATATAN) ?? "null");
    if (typeof nilai !== "object" || nilai === null) return null;
    const { nama, kehadiran } = nilai as Record<string, unknown>;
    if (typeof nama !== "string" || !KEHADIRAN.includes(kehadiran as Kehadiran)) return null;
    return { nama, kehadiran: kehadiran as Kehadiran };
  } catch {
    return null;
  }
}

function simpanCatatan(catatan: CatatanKirim) {
  try {
    localStorage.setItem(KUNCI_CATATAN, JSON.stringify(catatan));
  } catch {
    // Penyimpanan diblokir (mis. jendela privat): RSVP tetap terkirim, hanya penandanya yang tidak diingat.
  }
}

/** Ringkasan dari server. null selama dimuat, "gagal" bila belum pernah berhasil dimuat. */
function useRingkasan(aktif: boolean) {
  const [ringkasan, setRingkasan] = useState<RingkasanRsvp | "gagal" | null>(null);

  const muat = useCallback(async () => {
    try {
      const res = await fetch("/api/rsvp/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setRingkasan(await res.json());
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

/**
 * RSVP di act Hadir: ringkasan kehadiran (bila diaktifkan) dan form Konfirmasi Kehadiran. Setelah terkirim,
 * form diganti pesan sukses. Saat Tamu kembali di perangkat yang sama, penanda "sudah mengirim" tampil di atas
 * form, dan form tetap bisa dipakai (mis. untuk anggota keluarga lain).
 * Dirender sebagai dua anak grid act: ringkasan di kolom kiri dan form di kolom kanan.
 */
export function Rsvp({ acara, aturan, tampilkanRingkasan }: Props) {
  const { namaTamu } = bacaKonteksTamu(useSearchParams());
  const [ringkasan, muatUlangRingkasan] = useRingkasan(tampilkanRingkasan);
  /** Kiriman dari kunjungan sebelumnya di perangkat ini. */
  const [sudahMengirim, setSudahMengirim] = useState<CatatanKirim | null>(null);
  /** Kiriman pada kunjungan ini. */
  const [terkirim, setTerkirim] = useState<CatatanKirim | null>(null);

  useEffect(() => {
    setSudahMengirim(bacaCatatan());
  }, []);

  function padaTerkirim(catatan: CatatanKirim) {
    simpanCatatan(catatan);
    setTerkirim(catatan);
    if (tampilkanRingkasan) void muatUlangRingkasan();
  }

  return (
    <>
      {tampilkanRingkasan && (
        <div className="hadir__ringkasan" data-sc-in="">
          <RingkasanKehadiran ringkasan={ringkasan} />
        </div>
      )}
      {/* Pembungkus tetap ada saat isinya berganti, karena engine hanya mengamati [data-sc-in] saat dipasang. */}
      <div className="hadir__rsvp" data-sc-in="">
        {terkirim ? (
          <RsvpTerkirim {...terkirim} />
        ) : (
          <>
            {sudahMengirim && (
              <p id="rsvp-sudah-mengirim" className="rsvp__sudah-mengirim">
                Kamu sudah mengirim konfirmasi sebagai {sudahMengirim.nama}. Kirim lagi hanya bila ada yang berubah,
                atau untuk orang lain.
              </p>
            )}
            <FormRsvp
              acara={acara}
              aturan={aturan}
              namaAwal={namaTamu ?? ""}
              keterangan={sudahMengirim ? "rsvp-sudah-mengirim" : undefined}
              onTerkirim={padaTerkirim}
            />
          </>
        )}
      </div>
    </>
  );
}

const formatAngka = new Intl.NumberFormat("id-ID");
/** Lebar satu angka (figure space) selama ringkasan dimuat, supaya tingginya sudah tercadang. */
const ANGKA_KOSONG = " ";

function RingkasanKehadiran({ ringkasan }: { ringkasan: RingkasanRsvp | "gagal" | null }) {
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

const PESAN_GAGAL_KIRIM = "Konfirmasi belum terkirim. Periksa koneksimu, lalu coba lagi.";
/** Urutan fokus saat ada galat: kolom pertama yang salah. */
const URUTAN_FIELD: FieldRsvp[] = ["nama", "kehadiran", "idAcara", "pax", "ucapan"];

type PropsForm = {
  acara: AcaraPilihan[];
  aturan: AturanRsvp;
  namaAwal: string;
  /** Id teks yang menjelaskan form (penanda "sudah mengirim"). */
  keterangan?: string;
  onTerkirim(catatan: CatatanKirim): void;
};

/** Id pesan galat sebuah field, untuk aria-describedby. */
const idGalat = (f: FieldRsvp) => `rsvp-${f}-galat`;

function FormRsvp({ acara, aturan, namaAwal, keterangan, onTerkirim }: PropsForm) {
  const [nama, setNama] = useState(namaAwal);
  const [kehadiran, setKehadiran] = useState<Kehadiran | null>(null);
  // Bila hanya ada satu Acara, Acara itu terpilih otomatis dan pemilihnya tidak ditampilkan.
  const satuAcara = acara.length === 1;
  const [idAcara, setIdAcara] = useState<string[]>(satuAcara ? [acara[0]!.id] : []);
  const [pax, setPax] = useState(1);
  const [ucapan, setUcapan] = useState("");
  const [galat, setGalat] = useState<GalatRsvp>({});
  const [galatUmum, setGalatUmum] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const field = useRef<Partial<Record<FieldRsvp, HTMLElement | null>>>({});

  const hadir = kehadiran === "hadir";
  /** Field yang kontrolnya sedang tampil. */
  const tampil = (f: FieldRsvp) => (f === "idAcara" ? hadir && !satuAcara : f === "pax" ? hadir : true);

  /** Isian sebuah field berubah: galatnya hilang. */
  const hapusGalat = (f: FieldRsvp) => setGalat(({ [f]: _, ...sisa }) => sisa);

  /**
   * Galat tampil di field-nya, lalu fokus pindah ke field pertama yang salah. Render dipaksa lebih dulu,
   * supaya pembaca layar langsung membaca galatnya bersama field itu. Galat untuk field yang kontrolnya
   * tidak tampil (mis. jumlah orang saat Tidak Hadir) ditampilkan sebagai pesan umum.
   */
  function tampilkanGalat(baru: GalatRsvp) {
    const tersembunyi = URUTAN_FIELD.find((f) => baru[f] && !tampil(f));
    flushSync(() => {
      setGalat(baru);
      setGalatUmum(tersembunyi ? baru[tersembunyi]! : null);
    });
    const pertama = URUTAN_FIELD.find((f) => baru[f] && tampil(f));
    if (pertama) field.current[pertama]?.focus();
  }

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mengirim) return;
    const isian = { nama, kehadiran, idAcara, pax, ucapan };
    const periksa = periksaRsvp(aturan, isian);
    if (!periksa.ok) return tampilkanGalat(periksa.galat);

    setMengirim(true);
    setGalatUmum(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isian),
      });
      if (res.status === 201) {
        const tersimpan: CatatanKirim = await res.json();
        return onTerkirim({ nama: tersimpan.nama, kehadiran: tersimpan.kehadiran });
      }
      if (res.status === 422) return tampilkanGalat((await res.json()).galat);
      setGalatUmum(PESAN_GAGAL_KIRIM);
    } catch {
      setGalatUmum(PESAN_GAGAL_KIRIM);
    } finally {
      setMengirim(false);
    }
  }

  /** Atribut aksesibilitas kolom: ditandai salah dan dijelaskan oleh pesan galatnya. */
  const tandaGalat = (f: FieldRsvp, ...penjelas: string[]) => ({
    "aria-invalid": galat[f] ? true : undefined,
    "aria-describedby": [...penjelas, galat[f] ? idGalat(f) : ""].filter(Boolean).join(" ") || undefined,
  });

  return (
    <form
      className="rsvp"
      aria-label="Konfirmasi Kehadiran"
      aria-describedby={keterangan}
      noValidate
      aria-busy={mengirim}
      onSubmit={kirim}
    >
      <div className="isian">
        <label className="isian__label" htmlFor="rsvp-nama">
          Nama
        </label>
        <input
          ref={(el) => {
            field.current.nama = el;
          }}
          id="rsvp-nama"
          className="isian__kolom"
          name="nama"
          autoComplete="name"
          maxLength={PANJANG_MAKS_NAMA}
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            hapusGalat("nama");
          }}
          {...tandaGalat("nama")}
        />
        <Galat field="nama" galat={galat} />
      </div>

      <fieldset className="isian" aria-describedby={galat.kehadiran ? idGalat("kehadiran") : undefined}>
        <legend className="isian__label">Kehadiran</legend>
        <div className="pilihan">
          {(
            [
              ["hadir", "Hadir"],
              ["tidak_hadir", "Tidak Hadir"],
            ] as const
          ).map(([nilai, label], i) => (
            <label key={nilai} className="pilihan__opsi">
              <input
                ref={(el) => {
                  if (i === 0) field.current.kehadiran = el;
                }}
                type="radio"
                name="kehadiran"
                value={nilai}
                checked={kehadiran === nilai}
                aria-invalid={galat.kehadiran ? true : undefined}
                onChange={() => {
                  setKehadiran(nilai);
                  hapusGalat("kehadiran");
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <Galat field="kehadiran" galat={galat} />
      </fieldset>

      {hadir && !satuAcara && (
        <fieldset className="isian" aria-describedby={galat.idAcara ? idGalat("idAcara") : undefined}>
          <legend className="isian__label">Acara yang akan dihadiri</legend>
          <div className="pilihan">
            {acara.map((a, i) => (
              <label key={a.id} className="pilihan__opsi">
                <input
                  ref={(el) => {
                    if (i === 0) field.current.idAcara = el;
                  }}
                  type="checkbox"
                  name="idAcara"
                  value={a.id}
                  checked={idAcara.includes(a.id)}
                  aria-invalid={galat.idAcara ? true : undefined}
                  onChange={(e) => {
                    setIdAcara(e.target.checked ? [...idAcara, a.id] : idAcara.filter((id) => id !== a.id));
                    hapusGalat("idAcara");
                  }}
                />
                <span>{a.nama}</span>
              </label>
            ))}
          </div>
          <Galat field="idAcara" galat={galat} />
        </fieldset>
      )}

      {hadir && (
        <div className="isian">
          <label className="isian__label" htmlFor="rsvp-pax">
            Jumlah orang
          </label>
          <div className="isian__pilih">
            <select
              ref={(el) => {
                field.current.pax = el;
              }}
              id="rsvp-pax"
              className="isian__kolom isian__kolom--pilih"
              name="pax"
              value={pax}
              onChange={(e) => {
                setPax(Number(e.target.value));
                hapusGalat("pax");
              }}
              {...tandaGalat("pax")}
            >
              {Array.from({ length: aturan.batasPax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} orang
                </option>
              ))}
            </select>
          </div>
          <Galat field="pax" galat={galat} />
        </div>
      )}

      <div className="isian">
        <label className="isian__label" htmlFor="rsvp-ucapan">
          Ucapan dan doa <span className="isian__opsional">(opsional)</span>
        </label>
        <textarea
          ref={(el) => {
            field.current.ucapan = el;
          }}
          id="rsvp-ucapan"
          className="isian__kolom isian__kolom--panjang"
          name="ucapan"
          rows={4}
          maxLength={PANJANG_MAKS_UCAPAN}
          value={ucapan}
          onChange={(e) => {
            setUcapan(e.target.value);
            hapusGalat("ucapan");
          }}
          {...tandaGalat("ucapan", "rsvp-ucapan-keterangan", "rsvp-ucapan-hitung")}
        />
        <div className="isian__bawah">
          <p id="rsvp-ucapan-keterangan" className="isian__keterangan">
            Ucapanmu akan tampil di Buku Tamu dan bisa dibaca tamu lain.
          </p>
          <p id="rsvp-ucapan-hitung" className="isian__hitung">
            {ucapan.length}/{PANJANG_MAKS_UCAPAN}
          </p>
        </div>
        <Galat field="ucapan" galat={galat} />
      </div>

      {galatUmum && (
        <p className="rsvp__galat-umum" role="alert">
          {galatUmum}
        </p>
      )}
      <button type="submit" className="tombol-utama" disabled={mengirim}>
        Konfirmasi Kehadiran
      </button>
      <p className="sr-only" role="status">
        {mengirim ? "Mengirim konfirmasi" : ""}
      </p>
    </form>
  );
}

function Galat({ field, galat }: { field: FieldRsvp; galat: GalatRsvp }) {
  if (!galat[field]) return null;
  return (
    <p id={idGalat(field)} className="isian__galat">
      {galat[field]}
    </p>
  );
}

/** Pesan sukses setelah RSVP terkirim. Fokus pindah ke sini supaya pesannya langsung terbaca. */
function RsvpTerkirim({ nama, kehadiran }: CatatanKirim) {
  const pesan = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pesan.current?.focus();
  }, []);

  return (
    <div ref={pesan} className="rsvp-terkirim" tabIndex={-1}>
      <p className="rsvp-terkirim__judul">Terima kasih, {nama}.</p>
      <p className="rsvp-terkirim__isi">
        {kehadiran === "hadir"
          ? "Konfirmasi kehadiranmu sudah kami terima. Sampai bertemu di hari bahagia kami."
          : "Konfirmasimu sudah kami terima. Terima kasih atas doa dan restumu."}
      </p>
    </div>
  );
}
