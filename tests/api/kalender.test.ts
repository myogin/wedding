import { describe, expect, it } from "vitest";
import { parseKontenUndangan } from "@/konten/parse";
import { kontenMentah } from "@/konten/undangan";
import { buatKalenderHandler } from "@/server/kalender";

/** Konten fixture: dua Acara di zona berbeda, satu dengan waktu selesai dan nama tempat, satu tanpa. */
const kontenUndangan = parseKontenUndangan({
  ...kontenMentah,
  acara: [
    {
      id: "akad",
      nama: "Akad Nikah",
      mulai: "2026-11-07T08:00",
      selesai: "2026-11-07T10:30",
      zonaWaktu: "Asia/Jakarta",
      tempat: "Masjid Raya; Ruang Utama",
      alamat: "Jl. Merdeka No. 1, Jakarta Pusat",
      peta: "https://maps.app.goo.gl/contohAkad",
    },
    {
      id: "resepsi",
      nama: "Resepsi",
      mulai: "2026-11-07T19:00",
      zonaWaktu: "Asia/Jayapura",
      alamat: "Jl. Pantai No. 2, Jayapura",
      peta: "https://maps.app.goo.gl/contohResepsi",
    },
  ],
  acaraUtama: "akad",
});

const GET = buatKalenderHandler({ kontenUndangan, sekarang: () => new Date("2026-10-13T04:30:00Z") });

function unduh(berkas: string) {
  return GET(new Request(`http://undangan.test/kalender/${berkas}`), { params: Promise.resolve({ berkas }) });
}

/** Nilai properti iCalendar setelah baris lipatan disambung (escape teks dibiarkan apa adanya). */
function properti(isi: string, nama: string): string | undefined {
  return isi
    .replace(/\r\n[ \t]/g, "")
    .split("\r\n")
    .find((baris) => baris.startsWith(`${nama}:`))
    ?.slice(nama.length + 1);
}

describe("GET /kalender/:berkas", () => {
  it("mengunduh .ics Acara dengan waktu selesai dalam UTC yang benar", async () => {
    const res = await unduh("akad.ics");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="akad.ics"');
    const isi = await res.text();
    // 08.00 sampai 10.30 WIB (UTC+7).
    expect(properti(isi, "DTSTART")).toBe("20261107T010000Z");
    expect(properti(isi, "DTEND")).toBe("20261107T033000Z");
    expect(properti(isi, "DTSTAMP")).toBe("20261013T043000Z");
  });

  it("tanpa waktu selesai, Acara berakhir tengah malam waktu setempat", async () => {
    const isi = await (await unduh("resepsi.ics")).text();

    // 19.00 WIT (UTC+9) sampai 00.00 WIT keesokan harinya.
    expect(properti(isi, "DTSTART")).toBe("20261107T100000Z");
    expect(properti(isi, "DTEND")).toBe("20261107T150000Z");
  });

  it("menulis tempat dan alamat dengan escape teks iCalendar", async () => {
    const isi = await (await unduh("akad.ics")).text();

    expect(properti(isi, "SUMMARY")).toContain("Akad Nikah");
    expect(properti(isi, "LOCATION")).toBe("Masjid Raya\\; Ruang Utama\\, Jl. Merdeka No. 1\\, Jakarta Pusat");
  });

  it("memakai CRLF dan melipat baris yang lebih panjang dari 75 oktet", async () => {
    const isi = await (await unduh("akad.ics")).text();

    expect(isi).toMatch(/^BEGIN:VCALENDAR\r\n[\s\S]*\r\nEND:VCALENDAR\r\n$/);
    expect(isi.replace(/\r\n/g, "")).not.toMatch(/\n/);
    for (const baris of isi.split("\r\n")) {
      expect(new TextEncoder().encode(baris).length).toBeLessThanOrEqual(75);
    }
  });

  it("memberi UID yang sama walau jadwal Acara diubah, supaya entri kalender tidak ganda", async () => {
    const dijadwalUlang = parseKontenUndangan({
      ...kontenMentah,
      acara: [{ ...kontenUndangan.acara[0]!, mulai: "2026-11-08T08:00", selesai: "2026-11-08T10:30" }],
      acaraUtama: "akad",
    });
    const GETUlang = buatKalenderHandler({ kontenUndangan: dijadwalUlang, sekarang: () => new Date() });

    const sebelum = properti(await (await unduh("akad.ics")).text(), "UID");
    const sesudah = properti(
      await (await GETUlang(new Request("http://undangan.test/kalender/akad.ics"), { params: Promise.resolve({ berkas: "akad.ics" }) })).text(),
      "UID",
    );

    expect(sebelum).toBeTruthy();
    expect(sesudah).toBe(sebelum);
  });

  it("mengembalikan 404 untuk Acara yang tidak ada", async () => {
    expect((await unduh("tidak-ada.ics")).status).toBe(404);
  });
});
