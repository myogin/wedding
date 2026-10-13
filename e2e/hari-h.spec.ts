import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { acaraUtama, kontenUndangan } from "@/konten";
import type { Acara } from "@/konten/skema";
import { bukaUndangan } from "./bantuan";

const DETIK = 1000;
const MENIT = 60 * DETIK;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

/**
 * Oracle tes, sengaja ditulis terpisah dari kode halaman: selisih UTC dan label tiap zona waktu Indonesia
 * (tidak ada musim panas, jadi selisihnya tetap).
 */
const ZONA: Record<Acara["zonaWaktu"], { selisih: string; label: string }> = {
  "Asia/Jakarta": { selisih: "+07:00", label: "WIB" },
  "Asia/Pontianak": { selisih: "+07:00", label: "WIB" },
  "Asia/Makassar": { selisih: "+08:00", label: "WITA" },
  "Asia/Jayapura": { selisih: "+09:00", label: "WIT" },
};

/** Instan dari waktu setempat Acara, mis. "2026-10-21T15:00" di Asia/Makassar. */
function instan(waktuLokal: string, acara: Acara): Date {
  return new Date(`${waktuLokal}:00${ZONA[acara.zonaWaktu].selisih}`);
}

/** "15.00" dari "2026-10-21T15:00". */
const jam = (waktuLokal: string) => waktuLokal.slice(11, 16).replace(":", ".");

/** Waktu selesai, atau akhir hari mulainya (tengah malam setempat) bila waktu selesai tidak diisi. */
function akhirAcara(acara: Acara): Date {
  if (acara.selesai) return instan(acara.selesai, acara);
  return new Date(instan(`${acara.mulai.slice(0, 10)}T00:00`, acara).getTime() + HARI);
}

/** "20261021T070000Z": format UTC iCalendar dan Google Calendar. */
const utc = (waktu: Date) => waktu.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Nilai properti iCalendar setelah baris lipatan disambung dan escape teks dibuka. */
function propertiIcs(isi: string, nama: string): string | undefined {
  const baris = isi.replace(/\r\n[ \t]/g, "").split("\r\n");
  const nilai = baris.find((b) => b.startsWith(`${nama}:`))?.slice(nama.length + 1);
  return nilai?.replace(/\\([\\;,])/g, "$1").replace(/\\n/gi, "\n");
}

const utama = acaraUtama(kontenUndangan);
const mulaiUtama = instan(utama.mulai, utama).getTime();
const akhirUtama = akhirAcara(utama).getTime();

function hariH(page: Page) {
  return page.getByRole("region", { name: "Menuju hari bahagia" });
}

function hitungMundur(page: Page) {
  return hariH(page).getByRole("timer", { name: `Hitung mundur menuju ${utama.nama}` });
}

/** Membuka Undangan lalu menuju Hari H. Bila `waktu` diisi, jam browser dibekukan di situ. */
async function bukaHariH(page: Page, waktu?: number) {
  if (waktu !== undefined) await page.clock.setFixedTime(waktu);
  await page.goto("/");
  await bukaUndangan(page);
  await hariH(page).scrollIntoViewIfNeeded();
}

/** Menekan "Simpan Tanggal" pada kartu Acara, sehingga pilihan kalendernya terbuka. */
async function bukaSimpanTanggal(page: Page, acara: Acara) {
  const kartu = hariH(page).getByRole("article", { name: acara.nama });
  const tombol = kartu.getByRole("button", { name: "Simpan Tanggal" });
  await tombol.scrollIntoViewIfNeeded();
  await tombol.click();
  return { kartu, tombol };
}

test.describe("Hari H", () => {
  test("setiap Acara tampil dengan tanggal, jam, zona waktu, tempat, dan alamatnya", async ({ page }) => {
    await bukaHariH(page);

    for (const acara of kontenUndangan.acara) {
      const kartu = hariH(page).getByRole("article", { name: acara.nama });
      await kartu.scrollIntoViewIfNeeded();
      const tanggal = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeZone: acara.zonaWaktu,
      }).format(instan(acara.mulai, acara));
      const { label } = ZONA[acara.zonaWaktu];
      const waktu = acara.selesai ? `${jam(acara.mulai)} – ${jam(acara.selesai)} ${label}` : `${jam(acara.mulai)} ${label} – Selesai`;

      await expect(kartu.getByRole("heading", { name: acara.nama })).toBeVisible();
      await expect(kartu.getByText(tanggal)).toBeVisible();
      await expect(kartu.getByText(waktu)).toBeVisible();
      if (acara.tempat) await expect(kartu.getByText(acara.tempat)).toBeVisible();
      await expect(kartu.getByText(acara.alamat)).toBeVisible();
      await expect(kartu).toHaveCSS("opacity", "1");
    }
  });

  test("hitung mundur menunjukkan sisa hari, jam, menit, dan detik menuju Acara utama", async ({ page }) => {
    await bukaHariH(page, mulaiUtama - (2 * HARI + 3 * JAM + 4 * MENIT + 5 * DETIK));

    await expect(hitungMundur(page)).toHaveText("02 Hari 03 Jam 04 Menit 05 Detik");
  });

  test("hitung mundur berdetak setiap detik, lalu berganti pesan tepat saat Acara mulai", async ({ page }) => {
    await page.clock.install({ time: mulaiUtama - 10 * MENIT });
    await bukaHariH(page);

    await page.clock.pauseAt(mulaiUtama - 2 * DETIK);
    await expect(hitungMundur(page)).toHaveText("00 Hari 00 Jam 00 Menit 02 Detik");
    await page.clock.runFor(1 * DETIK);
    await expect(hitungMundur(page)).toHaveText("00 Hari 00 Jam 00 Menit 01 Detik");
    await page.clock.runFor(1 * DETIK);
    await expect(hitungMundur(page)).toHaveText("Acara sedang berlangsung");
  });

  test("setelah Acara utama mulai, hitung mundur berganti menjadi pesan sedang berlangsung", async ({ page }) => {
    for (const waktu of [mulaiUtama + 1 * MENIT, akhirUtama - 1 * MENIT]) {
      await bukaHariH(page, waktu);

      await expect(hitungMundur(page)).toHaveText("Acara sedang berlangsung");
    }
  });

  test("setelah Acara utama berakhir, tampil pesan telah berlangsung", async ({ page }) => {
    await bukaHariH(page, akhirUtama);

    await expect(hitungMundur(page)).toHaveText("Acara telah berlangsung");
  });

  test("Simpan Tanggal mengunduh berkas .ics berisi waktu Acara yang benar", async ({ page }) => {
    await bukaHariH(page);

    for (const acara of kontenUndangan.acara) {
      const { kartu } = await bukaSimpanTanggal(page, acara);
      const [unduhan] = await Promise.all([
        page.waitForEvent("download"),
        kartu.getByRole("link", { name: "Kalender lain (.ics)" }).click(),
      ]);

      expect(unduhan.suggestedFilename()).toBe(`${acara.id}.ics`);
      const isi = await readFile(await unduhan.path(), "utf8");
      expect(isi).toMatch(/^BEGIN:VCALENDAR\r\n/);
      expect(propertiIcs(isi, "DTSTART")).toBe(utc(instan(acara.mulai, acara)));
      expect(propertiIcs(isi, "DTEND")).toBe(utc(akhirAcara(acara)));
      expect(propertiIcs(isi, "SUMMARY")).toContain(acara.nama);
      expect(propertiIcs(isi, "LOCATION")).toContain(acara.alamat);
    }
  });

  test("Simpan Tanggal menyediakan tautan Google Calendar dengan waktu dan zona waktu Acara", async ({ page }) => {
    await bukaHariH(page);

    for (const acara of kontenUndangan.acara) {
      const { kartu, tombol } = await bukaSimpanTanggal(page, acara);
      const tautan = kartu.getByRole("link", { name: "Google Calendar" });
      await expect(tautan).toBeVisible();

      const url = new URL((await tautan.getAttribute("href"))!);
      expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
      expect(url.searchParams.get("action")).toBe("TEMPLATE");
      expect(url.searchParams.get("dates")).toBe(`${utc(instan(acara.mulai, acara))}/${utc(akhirAcara(acara))}`);
      expect(url.searchParams.get("ctz")).toBe(acara.zonaWaktu);
      expect(url.searchParams.get("text")).toContain(acara.nama);
      expect(url.searchParams.get("location")).toContain(acara.alamat);
      await expect(tautan).toHaveAttribute("target", "_blank");

      await page.keyboard.press("Escape");
      await expect(tautan).toBeHidden();
      await expect(tombol).toBeFocused();
    }
  });

  test("pilihan kalender tertutup saat fokus keyboard keluar darinya", async ({ page }) => {
    await bukaHariH(page);
    const { kartu, tombol } = await bukaSimpanTanggal(page, utama);
    const pilihan = kartu.getByRole("link", { name: "Kalender lain (.ics)" });
    await expect(pilihan).toBeVisible();

    await tombol.focus();
    await page.keyboard.press("Tab"); // Google Calendar
    await page.keyboard.press("Tab"); // Kalender lain (.ics)
    await expect(pilihan).toBeFocused();
    await page.keyboard.press("Tab"); // keluar dari pilihan

    await expect(pilihan).toBeHidden();
  });

  test("Lihat Lokasi membuka Google Maps Acara di tab baru", async ({ page, context }) => {
    // Jangan keluar ke internet saat tes: cukup pastikan tab baru menuju peta yang benar.
    await context.route(/^https:\/\/(maps\.app\.goo\.gl|(www\.)?google\.com\/maps)/, (route) =>
      route.fulfill({ body: "peta" }),
    );
    await bukaHariH(page);

    for (const acara of kontenUndangan.acara) {
      const tautan = hariH(page).getByRole("article", { name: acara.nama }).getByRole("link", { name: "Lihat Lokasi" });
      await tautan.scrollIntoViewIfNeeded();
      const [tab] = await Promise.all([page.waitForEvent("popup"), tautan.click()]);

      await expect(tab).toHaveURL(acara.peta);
      await tab.close();
    }
  });
});
