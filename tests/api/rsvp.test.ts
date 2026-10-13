import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buatDb } from "@/db";
import { parseKontenUndangan } from "@/konten/parse";
import { kontenMentah } from "@/konten/undangan";
import { buatBukuTamuHandler } from "@/server/api-buku-tamu";
import { URL_DB_TES } from "../db-tes";

const koneksi = buatDb(URL_DB_TES);
afterAll(() => koneksi.tutup());
beforeEach(() => koneksi.db.execute(sql`truncate table rsvp`));

const SEKARANG = new Date("2026-10-13T04:30:00Z");

/** Konten fixture: dua Acara dan Batas Pax 3. */
const kontenUndangan = parseKontenUndangan({
  ...kontenMentah,
  acara: [
    {
      id: "akad",
      nama: "Akad Nikah",
      mulai: "2026-11-07T08:00",
      zonaWaktu: "Asia/Jakarta",
      alamat: "Jl. Merdeka No. 1, Jakarta Pusat",
      peta: "https://maps.app.goo.gl/contohAkad",
    },
    {
      id: "resepsi",
      nama: "Resepsi",
      mulai: "2026-11-07T19:00",
      zonaWaktu: "Asia/Jakarta",
      alamat: "Jl. Merdeka No. 1, Jakarta Pusat",
      peta: "https://maps.app.goo.gl/contohResepsi",
    },
  ],
  acaraUtama: "akad",
  rsvp: { batasWaktu: "2026-11-01T23:59:00+07:00", batasPax: 3, tampilkanRingkasan: true },
});

const api = buatBukuTamuHandler({ db: koneksi.db, sekarang: () => SEKARANG, kontenUndangan });

function kirimRsvp(body: unknown) {
  return api.kirimRsvp(
    new Request("http://undangan.test/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const rsvpHadir = {
  nama: "Budi Santoso",
  kehadiran: "hadir",
  idAcara: ["akad", "resepsi"],
  pax: 2,
  ucapan: "Selamat menempuh hidup baru!",
};

describe("POST /api/rsvp", () => {
  it("menyimpan RSVP hadir dan mengembalikannya dengan 201", async () => {
    const res = await kirimRsvp(rsvpHadir);

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      nama: "Budi Santoso",
      kehadiran: "hadir",
      idAcara: ["akad", "resepsi"],
      pax: 2,
      ucapan: "Selamat menempuh hidup baru!",
      dibuat: "2026-10-13T04:30:00.000Z",
    });
  });

  async function galat(body: unknown) {
    const res = await kirimRsvp(body);
    expect(res.status).toBe(422);
    return (await res.json()).galat;
  }

  it("menolak nama kosong atau lebih dari 100 karakter", async () => {
    expect(await galat({ ...rsvpHadir, nama: "   " })).toEqual({ nama: "Nama wajib diisi" });
    expect(await galat({ ...rsvpHadir, nama: "a".repeat(101) })).toEqual({
      nama: "Nama paling banyak 100 karakter",
    });
    expect((await kirimRsvp({ ...rsvpHadir, nama: "a".repeat(100) })).status).toBe(201);
  });

  it("menolak Ucapan lebih dari 500 karakter", async () => {
    expect(await galat({ ...rsvpHadir, ucapan: "a".repeat(501) })).toEqual({
      ucapan: "Ucapan paling banyak 500 karakter",
    });
    expect((await kirimRsvp({ ...rsvpHadir, ucapan: "a".repeat(500) })).status).toBe(201);
  });

  it("menolak Tamu hadir yang tidak memilih Acara", async () => {
    expect(await galat({ ...rsvpHadir, idAcara: [] })).toEqual({ idAcara: "Pilih minimal satu Acara" });
  });

  it("menolak id Acara yang tidak ada di Konten Undangan", async () => {
    expect(await galat({ ...rsvpHadir, idAcara: ["akad", "ngunduh-mantu"] })).toEqual({
      idAcara: "Acara tidak dikenal",
    });
  });

  it("menolak jumlah orang di luar 1 sampai Batas Pax", async () => {
    const pesan = { pax: "Jumlah orang harus 1 sampai 3" };
    expect(await galat({ ...rsvpHadir, pax: 4 })).toEqual(pesan);
    expect(await galat({ ...rsvpHadir, pax: 0 })).toEqual(pesan);
    expect(await galat({ ...rsvpHadir, pax: undefined })).toEqual(pesan);
    expect((await kirimRsvp({ ...rsvpHadir, pax: 3 })).status).toBe(201);
  });

  it("mengembalikan semua galat sekaligus, satu per field", async () => {
    expect(await galat({ nama: "", kehadiran: "hadir", idAcara: [], pax: 9 })).toEqual({
      nama: "Nama wajib diisi",
      idAcara: "Pilih minimal satu Acara",
      pax: "Jumlah orang harus 1 sampai 3",
    });
    // Field yang tidak dikirim sama sekali tidak menyembunyikan galat field lain.
    expect(await galat({ kehadiran: "hadir", idAcara: [], pax: 9 })).toEqual({
      nama: "Nama wajib diisi",
      idAcara: "Pilih minimal satu Acara",
      pax: "Jumlah orang harus 1 sampai 3",
    });
    expect(await galat({ nama: "Budi" })).toEqual({ kehadiran: "Pilih Hadir atau Tidak Hadir" });
  });

  it("menyimpan Tamu yang tidak hadir dengan pax 0 dan tanpa Acara", async () => {
    const res = await kirimRsvp({ nama: "Andi", kehadiran: "tidak_hadir", idAcara: ["akad"], pax: 2 });

    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ kehadiran: "tidak_hadir", idAcara: [], pax: 0 });
  });

  it("merapikan isian: spasi di tepi dibuang, Ucapan kosong berarti tanpa Ucapan, Acara tanpa duplikat", async () => {
    const res = await kirimRsvp({
      ...rsvpHadir,
      nama: "  Budi Santoso ",
      idAcara: ["resepsi", "akad", "resepsi"],
      ucapan: "   ",
    });

    expect(await res.json()).toMatchObject({ nama: "Budi Santoso", idAcara: ["akad", "resepsi"], ucapan: null });
  });

  it("menolak body yang bukan objek JSON", async () => {
    const res = await api.kirimRsvp(new Request("http://undangan.test/api/rsvp", { method: "POST", body: "nama=Budi" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/rsvp/summary", () => {
  async function ringkasan() {
    const res = await api.ringkasanRsvp();
    expect(res.status).toBe(200);
    return res.json();
  }

  it("ringkasan bertambah setelah RSVP", async () => {
    expect(await ringkasan()).toEqual({ totalRespons: 0, hadir: 0, tidakHadir: 0, totalPax: 0 });

    await kirimRsvp(rsvpHadir);
    await kirimRsvp({ ...rsvpHadir, nama: "Siti", idAcara: ["resepsi"], pax: 3 });
    await kirimRsvp({ nama: "Andi", kehadiran: "tidak_hadir" });

    expect(await ringkasan()).toEqual({ totalRespons: 3, hadir: 2, tidakHadir: 1, totalPax: 5 });
  });

  it("RSVP yang ditolak tidak ikut dihitung", async () => {
    await kirimRsvp({ ...rsvpHadir, pax: 99 });

    expect(await ringkasan()).toEqual({ totalRespons: 0, hadir: 0, tidakHadir: 0, totalPax: 0 });
  });

  it("tidak tersedia bila ringkasan publik dimatikan di Konten Undangan", async () => {
    const tanpaRingkasan = buatBukuTamuHandler({
      db: koneksi.db,
      sekarang: () => SEKARANG,
      kontenUndangan: { ...kontenUndangan, rsvp: { ...kontenUndangan.rsvp, tampilkanRingkasan: false } },
    });

    expect((await tanpaRingkasan.ringkasanRsvp()).status).toBe(404);
  });
});
