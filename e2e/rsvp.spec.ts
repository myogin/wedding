import { expect, test, type Page } from "@playwright/test";
import { kontenUndangan } from "@/konten";
import { bukaUndangan } from "./bantuan";

function hadir(page: Page) {
  return page.getByRole("region", { name: "Kabari kami" });
}

function formRsvp(page: Page) {
  return page.getByRole("form", { name: "Konfirmasi Kehadiran" });
}

type Ringkasan = { respons: number; hadir: number; tidakHadir: number; tamu: number };

/** Angka ringkasan konfirmasi seperti yang terlihat Tamu, setelah selesai dimuat. */
async function bacaRingkasan(page: Page): Promise<Ringkasan> {
  const ringkasan = hadir(page).getByRole("group", { name: "Ringkasan konfirmasi" });
  await expect(ringkasan).toHaveAttribute("aria-busy", "false");
  const angka = async (label: string) => {
    const teks = await ringkasan
      .getByRole("term")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator("xpath=following-sibling::dd[1]")
      .textContent();
    return Number(teks?.replace(/\./g, ""));
  };
  return {
    respons: await angka("Total respons"),
    hadir: await angka("Hadir"),
    tidakHadir: await angka("Tidak hadir"),
    tamu: await angka("Total tamu"),
  };
}

/** Membuka Undangan dari Link Tamu, lalu menuju form RSVP. */
async function bukaRsvp(page: Page, tautan = "/?to=Budi%20Santoso") {
  await page.goto(tautan);
  await bukaUndangan(page);
  await hadir(page).scrollIntoViewIfNeeded();
}

test.describe("RSVP", () => {
  test("nama dari Link Tamu sudah terisi dan tetap bisa diubah", async ({ page }) => {
    await bukaRsvp(page);
    const nama = formRsvp(page).getByLabel("Nama");

    await expect(nama).toHaveValue("Budi Santoso");
    await nama.fill("Budi Santoso Wijaya");
    await expect(nama).toHaveValue("Budi Santoso Wijaya");
  });

  test("tanpa nama di Link Tamu, kolom nama kosong untuk diisi", async ({ page }) => {
    await bukaRsvp(page, "/");

    await expect(formRsvp(page).getByLabel("Nama")).toHaveValue("");
  });

  test("Hadir menampilkan pilihan jumlah orang 1 sampai Batas Pax, Tidak Hadir menyembunyikannya", async ({ page }) => {
    await bukaRsvp(page);
    const form = formRsvp(page);
    const jumlah = form.getByLabel("Jumlah orang");
    await expect(jumlah).toBeHidden();

    await form.getByRole("radio", { name: "Hadir", exact: true }).check();
    const batasPax = kontenUndangan.rsvp.batasPax;
    await expect(jumlah.getByRole("option")).toHaveText(Array.from({ length: batasPax }, (_, i) => `${i + 1} orang`));

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await expect(jumlah).toBeHidden();
  });

  test("dengan satu Acara, Acara itu terpilih otomatis dan pemilihnya tidak ditampilkan", async ({ page }) => {
    test.skip(kontenUndangan.acara.length !== 1, "Konten Undangan berisi lebih dari satu Acara");
    await bukaRsvp(page);
    const form = formRsvp(page);

    await form.getByRole("radio", { name: "Hadir", exact: true }).check();

    await expect(form.getByLabel("Jumlah orang")).toBeVisible();
    await expect(form.getByRole("group", { name: "Acara yang akan dihadiri" })).toHaveCount(0);
  });

  test("Ucapan punya penghitung karakter dan keterangan bahwa Ucapan tampil publik", async ({ page }) => {
    await bukaRsvp(page);
    const form = formRsvp(page);
    const ucapan = form.getByLabel("Ucapan dan doa");

    await expect(form.getByText("0/500")).toBeVisible();
    await ucapan.fill("Selamat menempuh hidup baru");
    await expect(form.getByText("27/500")).toBeVisible();
    await expect(ucapan).toHaveAccessibleDescription(/akan tampil di Buku Tamu/);
  });

  test("isian yang salah menampilkan galat per field dalam bahasa Indonesia", async ({ page }) => {
    await bukaRsvp(page, "/");
    const form = formRsvp(page);
    // Pembaca layar membaca field saat fokus mendarat, jadi galatnya harus sudah terpasang saat itu.
    // (Fokus pertama jatuh ke tombol yang diklik; yang diperiksa fokus pada kolom isian.)
    const galatSaatFokus = page.evaluate(
      () =>
        new Promise<string | null>((selesai) => {
          const padaFokus = (e: FocusEvent) => {
            const el = e.target as Element;
            if (!el.matches("input, select, textarea")) return;
            document.removeEventListener("focusin", padaFokus);
            selesai(el.getAttribute("aria-invalid"));
          };
          document.addEventListener("focusin", padaFokus);
        }),
    );

    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    const nama = form.getByLabel("Nama");
    await expect(nama).toHaveAccessibleDescription("Nama wajib diisi");
    await expect(nama).toBeFocused();
    expect(await galatSaatFokus).toBe("true");
    await expect(form.getByRole("group", { name: "Kehadiran" })).toHaveAccessibleDescription(
      "Pilih Hadir atau Tidak Hadir",
    );

    // Galat sebuah field hilang begitu field itu diisi.
    await nama.fill("Budi");
    await expect(form.getByText("Nama wajib diisi")).toHaveCount(0);
  });

  test("galat dari server tampil pada field-nya", async ({ page }) => {
    await page.route("/api/rsvp", (route) =>
      route.fulfill({ status: 422, json: { galat: { nama: "Nama paling banyak 100 karakter" } } }),
    );
    await bukaRsvp(page);
    const form = formRsvp(page);

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    await expect(form.getByLabel("Nama")).toHaveAccessibleDescription("Nama paling banyak 100 karakter");
  });

  test("galat dari server untuk field yang tidak ditampilkan tetap terlihat", async ({ page }) => {
    await page.route("/api/rsvp", (route) =>
      route.fulfill({ status: 422, json: { galat: { pax: "Jumlah orang harus 1 sampai 2" } } }),
    );
    await bukaRsvp(page);
    const form = formRsvp(page);

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    await expect(form.getByRole("alert")).toHaveText("Jumlah orang harus 1 sampai 2");
  });

  test("bila pengiriman gagal, Tamu diberi tahu dan bisa mencoba lagi", async ({ page }) => {
    await page.route("/api/rsvp", (route) => route.fulfill({ status: 500 }));
    await bukaRsvp(page);
    const form = formRsvp(page);

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    await expect(form.getByRole("alert")).toHaveText(/belum terkirim/);
    await expect(form.getByRole("button", { name: "Konfirmasi Kehadiran" })).toBeEnabled();
  });

  test("tombol kirim nonaktif selama pengiriman", async ({ page }) => {
    let lepaskan!: () => void;
    const ditahan = new Promise<void>((r) => (lepaskan = r));
    await page.route("/api/rsvp", async (route) => {
      await ditahan;
      await route.continue();
    });
    await bukaRsvp(page);
    const form = formRsvp(page);
    const tombol = form.getByRole("button", { name: "Konfirmasi Kehadiran" });

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await tombol.click();
    await expect(tombol).toBeDisabled();

    lepaskan();
    await expect(hadir(page).getByText("Terima kasih, Budi Santoso.")).toBeVisible();
  });

  // Tes lain (dan proyek ponsel/desktop) mengirim RSVP ke database yang sama secara paralel,
  // jadi ringkasan diperiksa bertambah paling sedikit sebanyak kiriman tes ini.
  test("setelah dikirim, pesan sukses tampil dan ringkasan bertambah", async ({ page }) => {
    await bukaRsvp(page);
    const sebelum = await bacaRingkasan(page);
    const form = formRsvp(page);
    const batasPax = kontenUndangan.rsvp.batasPax;

    await form.getByRole("radio", { name: "Hadir", exact: true }).check();
    await form.getByLabel("Jumlah orang").selectOption(`${batasPax} orang`);
    await form.getByLabel("Ucapan dan doa").fill("Selamat menempuh hidup baru!");
    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    const pesan = hadir(page).getByText("Terima kasih, Budi Santoso.");
    await expect(pesan).toBeVisible();
    await expect(formRsvp(page)).toHaveCount(0);
    await expect.poll(async () => (await bacaRingkasan(page)).respons).toBeGreaterThanOrEqual(sebelum.respons + 1);
    await expect.poll(async () => (await bacaRingkasan(page)).hadir).toBeGreaterThanOrEqual(sebelum.hadir + 1);
    await expect.poll(async () => (await bacaRingkasan(page)).tamu).toBeGreaterThanOrEqual(sebelum.tamu + batasPax);
  });

  test("Tamu yang tidak hadir cukup mengisi nama dan Ucapan", async ({ page }) => {
    await bukaRsvp(page);
    const sebelum = await bacaRingkasan(page);
    const form = formRsvp(page);

    await form.getByRole("radio", { name: "Tidak Hadir" }).check();
    await form.getByRole("button", { name: "Konfirmasi Kehadiran" }).click();

    await expect(hadir(page).getByText("Terima kasih atas doa dan restumu.")).toBeVisible();
    await expect
      .poll(async () => (await bacaRingkasan(page)).tidakHadir)
      .toBeGreaterThanOrEqual(sebelum.tidakHadir + 1);
  });

  test("pada kunjungan berikutnya di perangkat yang sama, tampil penanda sudah mengirim", async ({ page }) => {
    await bukaRsvp(page);
    await formRsvp(page).getByRole("radio", { name: "Tidak Hadir" }).check();
    await formRsvp(page).getByRole("button", { name: "Konfirmasi Kehadiran" }).click();
    await expect(hadir(page).getByText("Terima kasih, Budi Santoso.")).toBeVisible();

    await bukaRsvp(page);

    await expect(hadir(page).getByText("Kamu sudah mengirim konfirmasi sebagai Budi Santoso.")).toBeVisible();
    // Form tetap bisa dipakai (mis. untuk anggota keluarga lain), dan penandanya ikut terbaca bersama form.
    await expect(formRsvp(page)).toHaveAccessibleDescription(/sudah mengirim konfirmasi/);
    await expect(formRsvp(page).getByLabel("Nama")).toHaveValue("Budi Santoso");
  });
});
