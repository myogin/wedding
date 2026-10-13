import type { Acara } from "./skema";
import { rentangAcara } from "./waktu-acara";

/** "20261021T070000Z": waktu UTC dalam format iCalendar, juga dipakai Google Calendar. */
function waktuUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Judul, lokasi, dan keterangan entri kalender satu Acara. */
function rincian(acara: Acara, namaMempelai: string) {
  return {
    judul: `${acara.nama} ${namaMempelai}`,
    lokasi: [acara.tempat, acara.alamat].filter(Boolean).join(", "),
    keterangan: `Undangan pernikahan ${namaMempelai}.\nLokasi: ${acara.peta}`,
  };
}

/** Nama berkas .ics satu Acara, sekaligus segmen URL-nya di /kalender/. */
export function berkasIcs(acara: Pick<Acara, "id">): string {
  return `${acara.id}.ics`;
}

/** Tautan unduhan .ics satu Acara (route src/app/kalender/[berkas]). */
export function tautanIcs(acara: Pick<Acara, "id">): string {
  return `/kalender/${berkasIcs(acara)}`;
}

/** Tautan "tambah ke Google Calendar" yang sudah terisi waktu, zona waktu, dan lokasi Acara. */
export function tautanGoogleCalendar(acara: Acara, namaMempelai: string): string {
  const { mulai, akhir } = rentangAcara(acara);
  const { judul, lokasi, keterangan } = rincian(acara, namaMempelai);
  const parameter = new URLSearchParams({
    action: "TEMPLATE",
    text: judul,
    dates: `${waktuUtc(mulai)}/${waktuUtc(akhir)}`,
    ctz: acara.zonaWaktu,
    location: lokasi,
    details: keterangan,
  });
  return `https://calendar.google.com/calendar/render?${parameter}`;
}

/** Escape nilai TEXT iCalendar (RFC 5545 §3.3.11). */
function teksIcs(teks: string): string {
  return teks.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
}

const enkoder = new TextEncoder();

/** Melipat baris lebih dari 75 oktet (RFC 5545 §3.1) tanpa memotong karakter multibita. */
function lipat(baris: string): string {
  const potongan: string[] = [];
  let kini = "";
  let oktet = 0;
  for (const huruf of baris) {
    const ukuran = enkoder.encode(huruf).length;
    // Baris lanjutan diawali satu spasi, yang ikut terhitung.
    if (oktet + ukuran > (potongan.length ? 74 : 75)) {
      potongan.push(kini);
      kini = "";
      oktet = 0;
    }
    kini += huruf;
    oktet += ukuran;
  }
  potongan.push(kini);
  return potongan.join("\r\n ");
}

/** "agung-dalem-ayu-oka" dari "Agung Dalem & Ayu Oka". */
function slug(teks: string): string {
  return teks
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Isi berkas .ics satu Acara. Waktunya ditulis dalam UTC, jadi kalender Tamu menampilkannya di zona
 * waktu perangkatnya sendiri tanpa perlu definisi VTIMEZONE.
 */
export function isiIcs(acara: Acara, namaMempelai: string, dibuat: Date): string {
  const { mulai, akhir } = rentangAcara(acara);
  const { judul, lokasi, keterangan } = rincian(acara, namaMempelai);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Pernikahan//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    // Tetap untuk Acara yang sama walau jadwalnya diubah, supaya kalender yang mengenali UID memperbarui
    // entrinya alih-alih menggandakannya. Nama Mempelai membedakannya dari undangan lain yang memakai id sama.
    `UID:${acara.id}.${slug(namaMempelai)}@undangan-pernikahan`,
    `DTSTAMP:${waktuUtc(dibuat.getTime())}`,
    `DTSTART:${waktuUtc(mulai)}`,
    `DTEND:${waktuUtc(akhir)}`,
    `SUMMARY:${teksIcs(judul)}`,
    `LOCATION:${teksIcs(lokasi)}`,
    `DESCRIPTION:${teksIcs(keterangan)}`,
    `URL:${acara.peta}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(lipat)
    .join("\r\n")
    .concat("\r\n");
}
