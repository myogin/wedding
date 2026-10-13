import { expect, test, type Page } from "@playwright/test";

const ASET_HERO = "**/placeholder/hero/";

function sampul(page: Page) {
  return page.getByRole("region", { name: "Sampul" });
}

async function bukaUndangan(page: Page) {
  await sampul(page).getByRole("button", { name: "Buka Undangan" }).click();
  await expect(sampul(page)).toBeHidden();
}

function posisiScroll(page: Page) {
  return page.evaluate(() => window.scrollY);
}

function musikDiputar(page: Page) {
  return page.locator("audio").evaluate((audio: HTMLAudioElement) => !audio.paused);
}

/** Meniru Tamu yang pindah tab atau aplikasi, lalu kembali. */
async function aturVisibilitas(page: Page, keadaan: "hidden" | "visible") {
  await page.evaluate((keadaan) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => keadaan });
    Object.defineProperty(document, "hidden", { configurable: true, get: () => keadaan === "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  }, keadaan);
}

test.describe("Buka Undangan", () => {
  test("layar loading menampilkan persentase sampai aset Hero siap", async ({ page }) => {
    let lepaskan = () => {};
    const ditahan = new Promise<void>((selesai) => (lepaskan = selesai));
    await page.route(`${ASET_HERO}latar.webp`, async (route) => {
      await ditahan;
      await route.continue();
    });

    // Event load baru datang setelah semua gambar termuat, padahal satu gambar sedang ditahan.
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const progres = page.getByRole("progressbar", { name: "Memuat undangan" });
    await expect
      .poll(async () => Number(await progres.getAttribute("aria-valuenow")))
      .toBeGreaterThan(0);
    expect(Number(await progres.getAttribute("aria-valuenow"))).toBeLessThan(100);
    await expect(sampul(page)).toBeHidden();

    lepaskan();
    await expect(sampul(page)).toBeVisible();
  });

  test("layar loading tampil minimal 3 detik walau aset sudah siap", async ({ page }) => {
    await page.goto("/");

    await expect(sampul(page)).toBeVisible();
    const sejakNavigasiMs = await page.evaluate(() => performance.now());
    expect(sejakNavigasiMs).toBeGreaterThanOrEqual(3000);
  });

  test("isi Undangan baru bisa di-scroll setelah Buka Undangan", async ({ page }) => {
    await page.goto("/?to=Budi%20Santoso");
    await expect(sampul(page).getByText("Budi Santoso", { exact: true })).toBeVisible();

    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    expect(await posisiScroll(page)).toBe(0);

    await bukaUndangan(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.mouse.wheel(0, 600);
    await expect.poll(() => posisiScroll(page)).toBeGreaterThan(0);
  });

  test("musik mulai saat Buka Undangan dan tombol musik bisa men-toggle", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);

    const tombol = page.getByRole("button", { name: "Musik" });
    await expect(tombol).toHaveAttribute("aria-pressed", "true");
    expect(await musikDiputar(page)).toBe(true);

    await tombol.click();
    await expect(tombol).toHaveAttribute("aria-pressed", "false");
    expect(await musikDiputar(page)).toBe(false);

    await tombol.click();
    await expect(tombol).toHaveAttribute("aria-pressed", "true");
    expect(await musikDiputar(page)).toBe(true);
  });

  test("musik berhenti saat tab disembunyikan dan lanjut saat Tamu kembali", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);

    await aturVisibilitas(page, "hidden");
    expect(await musikDiputar(page)).toBe(false);

    await aturVisibilitas(page, "visible");
    expect(await musikDiputar(page)).toBe(true);
  });

  test("musik yang dijeda Tamu tetap diam setelah Tamu kembali ke tab", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);
    await page.getByRole("button", { name: "Musik" }).click();

    await aturVisibilitas(page, "hidden");
    await aturVisibilitas(page, "visible");

    expect(await musikDiputar(page)).toBe(false);
    await expect(page.getByRole("button", { name: "Musik" })).toHaveAttribute("aria-pressed", "false");
  });

  test("poster tampil bila ada lapisan Hero yang gagal dimuat", async ({ page }) => {
    await page.route(`${ASET_HERO}subjek.webp`, (route) => route.abort());

    await page.goto("/");
    await bukaUndangan(page);

    await expect(page.locator('img[src$="/hero/poster.webp"]')).toBeVisible();
    await expect(page.locator('img[src$="/hero/latar.webp"]')).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Gerakan penuh", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("layar loading memutar foto galeri dengan cepat", async ({ page }) => {
    await page.goto("/");

    const fotoTampil = page.getByRole("img", { name: "Kilasan foto Mempelai" }).locator("img:visible");
    const terlihat = new Set<string>();
    await expect
      .poll(
        async () => {
          const src = await fotoTampil.first().getAttribute("src").catch(() => null);
          if (src) terlihat.add(src);
          return terlihat.size;
        },
        { intervals: [100], timeout: 4000 },
      )
      .toBeGreaterThanOrEqual(4);
  });

  test("lapisan Hero bergerak dengan laju berbeda dan nama Mempelai tetap terlihat", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);

    const ukurLapisan = () =>
      page.evaluate(() => {
        const lebar = (akhiran: string) =>
          document.querySelector(`img[src$="${akhiran}"]`)!.getBoundingClientRect().width;
        return { latar: lebar("/hero/latar.webp"), subjek: lebar("/hero/subjek.webp") };
      });
    const awal = await ukurLapisan();

    await page.mouse.wheel(0, 900);
    await expect.poll(async () => (await ukurLapisan()).latar).toBeGreaterThan(awal.latar);

    const tengah = await ukurLapisan();
    expect(tengah.subjek / awal.subjek).toBeGreaterThan(tengah.latar / awal.latar);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport({ ratio: 1 });
  });
});

test.describe("Sampul di layar pendek (ponsel mendatar)", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("tombol Buka Undangan tetap bisa dijangkau walau nama tamu panjang", async ({ page }) => {
    await page.goto(`/?to=${encodeURIComponent("Keluarga Besar Bapak I Made Sudarsana Wijaya")}`);

    await bukaUndangan(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
