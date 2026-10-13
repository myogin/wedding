import { expect, test, type Locator, type Page } from "@playwright/test";
import { kontenUndangan, namaMempelai } from "@/konten";
import { bukaUndangan } from "./bantuan";

const { galeri } = kontenUndangan;

function kenangan(page: Page) {
  return page.getByRole("region", { name: "Kenangan" });
}

/** Tombol perbesar untuk foto ke-i galeri (namanya teks alternatif foto itu). */
function tombolFoto(page: Page, i: number) {
  return kenangan(page).getByRole("button", { name: galeri[i]!.alt, exact: true });
}

function lightbox(page: Page) {
  return page.getByRole("dialog", { name: "Galeri foto" });
}

function fotoDiLightbox(page: Page) {
  return lightbox(page).getByRole("img");
}

function catatanPenutup(page: Page) {
  return kenangan(page).getByText("Bab berikutnya ingin kami tulis bersamamu.");
}

/** Mengetuk satu titik layar: sentuhan di ponsel, klik tetikus di desktop. */
async function ketuk(page: Page, x: number, y: number) {
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

/**
 * Gestur usap sungguhan (sentuh di ponsel, roda di desktop) lewat Chromium. Berbeda dengan event
 * sintetis, gestur ini menggulir halaman di belakang lightbox bila scroll tidak dikunci.
 */
async function usap(page: Page, { x = 0, y = 0 }: { x?: number; y?: number }) {
  const cdp = await page.context().newCDPSession(page);
  const { width, height } = page.viewportSize()!;
  await cdp.send("Input.synthesizeScrollGesture", {
    x: width / 2,
    y: height / 2,
    xDistance: x,
    yDistance: y,
    speed: 1200,
    gestureSourceType: "default",
  });
  await cdp.detach();
}

/** Menyeret mendatar sejauh dx dari titik tengah layar: sentuhan di ponsel, tetikus di desktop. */
async function seret(page: Page, dx: number) {
  const { width, height } = page.viewportSize()!;
  const [x, y] = [width / 2, height / 2];
  const langkah = Array.from({ length: 8 }, (_, i) => x + (dx * (i + 1)) / 8);
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (const xi of langkah) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: xi, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (const xi of langkah) await page.mouse.move(xi, y);
    await page.mouse.up();
  }
}

/** Membuka Undangan lalu menuju Kenangan. */
async function bukaKenangan(page: Page) {
  await page.goto("/");
  await bukaUndangan(page);
  await kenangan(page).scrollIntoViewIfNeeded();
}

test.describe("Kenangan", () => {
  test("galeri menampilkan setiap foto dengan teks alternatifnya", async ({ page }) => {
    await bukaKenangan(page);

    for (const foto of galeri) {
      const gambar = kenangan(page).getByRole("img", { name: foto.alt, exact: true });
      await gambar.scrollIntoViewIfNeeded();
      await expect(gambar).toBeVisible();
    }
  });

  test("lightbox terbuka saat foto diketuk, pindah ke foto berikutnya, lalu tertutup dengan Esc", async ({ page }) => {
    await bukaKenangan(page);
    const asal = tombolFoto(page, 0);

    await asal.click();
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);
    await lightbox(page).getByRole("button", { name: "Foto berikutnya" }).click();
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[1]!.alt);
    await page.keyboard.press("Escape");

    await expect(lightbox(page)).toBeHidden();
    await expect(asal).toBeFocused();
  });

  test("lightbox berpindah dengan tombol sebelumnya dan tombol panah, berputar di ujung galeri", async ({ page }) => {
    const terakhir = galeri.length - 1;
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();

    await expect(lightbox(page).getByText(`1 dari ${galeri.length}`)).toBeVisible();
    await lightbox(page).getByRole("button", { name: "Foto sebelumnya" }).click();
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[terakhir]!.alt);
    await expect(lightbox(page).getByText(`${galeri.length} dari ${galeri.length}`)).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);
    await page.keyboard.press("ArrowRight");
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[1]!.alt);
    await page.keyboard.press("ArrowLeft");
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);
  });

  test("lightbox tertutup dengan klik latar atau tombol Tutup, dan fokus kembali ke foto asal", async ({ page }) => {
    await bukaKenangan(page);
    const asal = tombolFoto(page, 1);

    await asal.click();
    await expect(lightbox(page)).toBeVisible();
    // Sudut kiri atas layar adalah latar: jauh dari foto dan tombol.
    await page.mouse.click(4, 4);
    await expect(lightbox(page)).toBeHidden();
    await expect(asal).toBeFocused();

    await asal.click();
    await lightbox(page).getByRole("button", { name: "Tutup" }).click();
    await expect(lightbox(page)).toBeHidden();
    await expect(asal).toBeFocused();
  });

  test("scroll halaman terkunci selama lightbox terbuka", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();
    await expect(lightbox(page)).toBeVisible();
    const sebelum = await page.evaluate(() => scrollY);

    await usap(page, { y: -600 });
    await page.mouse.wheel(0, 800);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(400);

    expect(await page.evaluate(() => scrollY)).toBe(sebelum);
  });

  test("fokus keyboard tetap di dalam lightbox", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();
    await expect(lightbox(page)).toBeVisible();
    const fokusDiLightbox = () =>
      page.evaluate(() => !!document.activeElement?.closest("dialog[open]") && document.activeElement !== document.body);

    for (const tombol of ["Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(tombol);
      expect(await fokusDiLightbox(), `fokus setelah ${tombol}`).toBe(true);
    }
  });

  test("lightbox bisa digeser: ke kiri ke foto berikutnya, ke kanan ke foto sebelumnya", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);

    await seret(page, -160);
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[1]!.alt);
    await seret(page, 160);
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);
    // Seretan pendek bukan usapan: foto tetap, dan lightbox tidak tertutup seolah latarnya diklik.
    await seret(page, -20);
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[0]!.alt);
    await expect(lightbox(page)).toBeVisible();
  });

  test("ketukan di latar setelah usapan langsung menutup lightbox", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();
    await seret(page, -160);
    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[1]!.alt);

    await ketuk(page, 4, 4);

    await expect(lightbox(page)).toBeHidden();
  });

  test("lightbox mengunduh foto seukuran tampilannya, bukan selebar layar", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();
    const foto = fotoDiLightbox(page);
    await expect.poll(() => foto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

    const { unduhan, tampil } = await foto.evaluate((img: HTMLImageElement) => ({
      unduhan: img.naturalWidth,
      tampil: img.getBoundingClientRect().width * devicePixelRatio,
    }));
    // Langkah lebar next/image cukup renggang; dua kali ukuran tampil masih wajar, lebih dari itu boros.
    expect(unduhan).toBeLessThanOrEqual(tampil * 2);
  });

  test("klik pada foto di lightbox tidak menutupnya", async ({ page }) => {
    await bukaKenangan(page);
    await tombolFoto(page, 0).click();

    await fotoDiLightbox(page).click();

    await expect(lightbox(page)).toBeVisible();
  });
});

test.describe("Kenangan dengan gerakan penuh", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  /** Menggulir ke posisi act Kenangan (0 = awal pin, 1 = akhir pin). */
  async function gulirKe(page: Page, progres: number) {
    await kenangan(page).evaluate((act, p) => {
      const atas = act.getBoundingClientRect().top + scrollY;
      scrollTo({ top: atas + p * ((act as HTMLElement).offsetHeight - innerHeight), behavior: "instant" });
    }, progres);
  }

  /** Elemen seluruhnya berada di dalam lebar layar. */
  async function diLayar(page: Page, elemen: Locator) {
    const kotak = await elemen.boundingBox();
    return !!kotak && kotak.x >= 0 && kotak.x + kotak.width <= page.viewportSize()!.width;
  }

  /** Ruang scroll sebuah act, dalam tinggi layar. */
  async function ruangScroll(page: Page, act: Locator) {
    return (await act.boundingBox())!.height / page.viewportSize()!.height;
  }

  test("rel berjalan dari judul sampai catatan penutup, dengan ruang scroll di bawah Hero", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);

    // Score: peak (Hero, 3.0) punya ruang scroll terbesar; Kenangan paling banyak 2.4.
    const hero = page.getByRole("region", { name: namaMempelai(kontenUndangan) });
    expect(await ruangScroll(page, kenangan(page))).toBeLessThanOrEqual(2.4 + 0.01);
    expect(await ruangScroll(page, kenangan(page))).toBeLessThan(await ruangScroll(page, hero));

    await gulirKe(page, 0);
    await expect.poll(() => diLayar(page, kenangan(page).getByRole("heading", { name: "Kenangan" }))).toBe(true);
    await gulirKe(page, 1);
    await expect.poll(() => diLayar(page, catatanPenutup(page))).toBe(true);
  });

  test("fokus Tab pada foto membawa rel ke foto itu", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);
    await gulirKe(page, 0);
    await tombolFoto(page, 0).focus();

    for (let i = 1; i < galeri.length; i++) {
      await page.keyboard.press("Tab");
      await expect(tombolFoto(page, i)).toBeFocused();
      await expect.poll(() => diLayar(page, tombolFoto(page, i)), { message: `foto ${i + 1} di layar` }).toBe(true);
    }
  });

  test("foto di rel sudah dimuat sebelum Tamu tiba di Kenangan", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);
    // Hari H tepat sebelum Kenangan: rel belum digeser, foto terakhirnya masih jauh di luar layar.
    // Panggung act pan memotong isinya (overflow: clip), jadi lazy loading bawaan browser baru memuat
    // foto saat foto itu masuk layar.
    await page.getByRole("region", { name: "Menuju hari bahagia" }).scrollIntoViewIfNeeded();

    const terakhir = tombolFoto(page, galeri.length - 1).getByRole("img");
    await expect
      .poll(() => terakhir.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test("ketukan pada foto yang terpotong di tepi layar membukanya tanpa menggeser halaman", async ({ page }) => {
    await page.goto("/");
    await bukaUndangan(page);
    await gulirKe(page, 0);
    const lebarLayar = page.viewportSize()!.width;
    let terpotong = -1;
    await expect
      .poll(async () => {
        for (let i = 0; i < galeri.length; i++) {
          const kotak = await tombolFoto(page, i).boundingBox();
          if (kotak && kotak.x < lebarLayar - 20 && kotak.x + kotak.width > lebarLayar) return (terpotong = i);
        }
        return -1;
      })
      .toBeGreaterThanOrEqual(0);
    const kotak = (await tombolFoto(page, terpotong).boundingBox())!;
    const sebelum = await page.evaluate(() => scrollY);

    await ketuk(page, kotak.x + 10, kotak.y + kotak.height / 2);

    await expect(fotoDiLightbox(page)).toHaveAccessibleName(galeri[terpotong]!.alt);
    expect(await page.evaluate(() => scrollY)).toBe(sebelum);
  });
});

test.describe("Kenangan di layar ultrawide", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" }, viewport: { width: 3440, height: 1440 } });

  test("rel tetap bergeser dari judul sampai catatan penutup", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "layar ultrawide hanya ada di desktop");
    await page.goto("/");
    await bukaUndangan(page);
    const judul = kenangan(page).getByRole("heading", { name: "Kenangan" });
    const kiriJudul = async () => (await judul.boundingBox())!.x;

    await kenangan(page).evaluate((act) => scrollTo({ top: act.getBoundingClientRect().top + scrollY, behavior: "instant" }));
    await expect.poll(kiriJudul).toBeGreaterThanOrEqual(0);
    const awal = await kiriJudul();
    await kenangan(page).evaluate((act) => {
      const atas = act.getBoundingClientRect().top + scrollY;
      scrollTo({ top: atas + (act as HTMLElement).offsetHeight - innerHeight, behavior: "instant" });
    });

    await expect.poll(kiriJudul).toBeLessThan(awal - 100);
    await expect(catatanPenutup(page)).toBeInViewport({ ratio: 1 });
  });
});
