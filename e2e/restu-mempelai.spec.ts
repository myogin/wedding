import { expect, test } from "@playwright/test";
import { kontenUndangan } from "@/konten";
import { barisTeksAsli } from "@/konten/format";
import { bukaUndangan } from "./bantuan";

const { pembuka, mempelai, kisahCinta } = kontenUndangan;
const keduaMempelai = [mempelai.pria, mempelai.wanita];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await bukaUndangan(page);
});

test("Restu menampilkan salam, ayat baris demi baris, terjemahan, dan sumbernya", async ({ page }) => {
  const restu = page.getByRole("region", { name: pembuka.salam });
  await restu.scrollIntoViewIfNeeded();

  for (const baris of barisTeksAsli(pembuka.kutipan)) {
    await expect(restu.getByText(baris, { exact: true })).toBeVisible();
  }
  const terjemahan = restu.getByText(pembuka.kutipan.terjemahan);
  await terjemahan.scrollIntoViewIfNeeded();
  await expect(terjemahan).toHaveCSS("opacity", "1");
  await expect(restu.getByText(pembuka.kutipan.sumber)).toBeVisible();
  if (pembuka.gambar) {
    await expect(restu.getByRole("img", { name: pembuka.gambar.alt })).toBeVisible();
  }
});

test("Kami memperkenalkan kedua Mempelai lengkap dengan orang tua dan Instagram", async ({ page }) => {
  const kami = page.getByRole("region", { name: "Mempelai" });
  await kami.scrollIntoViewIfNeeded();

  for (const m of keduaMempelai) {
    await expect(kami.getByRole("heading", { name: m.panggilan, exact: true })).toBeVisible();
    await expect(kami.getByText(m.namaLengkap)).toHaveCSS("opacity", "1");
    await expect(kami.getByText(m.ayah, { exact: false })).toBeVisible();
    await expect(kami.getByText(m.ibu, { exact: false })).toBeVisible();
    await expect(kami.getByRole("img", { name: m.foto.alt })).toBeVisible();
    if (m.instagram) {
      const tautan = kami.getByRole("link", { name: `Instagram ${m.panggilan}`, exact: false });
      await expect(tautan).toHaveAttribute("href", m.instagram);
    }
  }
});

test("tautan Instagram membuka profil Mempelai di tab baru", async ({ page, context }) => {
  const m = keduaMempelai.find((m) => m.instagram);
  test.skip(!m?.instagram, "tidak ada Mempelai dengan Instagram di Konten Undangan");
  // Jangan keluar ke internet saat tes: cukup pastikan tab baru menuju profil yang benar.
  await context.route("https://www.instagram.com/**", (route) => route.fulfill({ body: "profil" }));

  const tautan = page.getByRole("region", { name: "Mempelai" }).getByRole("link", { name: `Instagram ${m!.panggilan}`, exact: false });
  await tautan.scrollIntoViewIfNeeded();
  const [tab] = await Promise.all([page.waitForEvent("popup"), tautan.click()]);

  await expect(tab).toHaveURL(m!.instagram!);
});

test("kisah cinta hanya tampil bila diisi di Konten Undangan", async ({ page }) => {
  const kisah = page.getByRole("region", { name: "Kisah Cinta" });

  if (!kisahCinta?.length) {
    await expect(kisah).toHaveCount(0);
    return;
  }
  await kisah.scrollIntoViewIfNeeded();
  for (const babak of kisahCinta) {
    await expect(kisah.getByRole("heading", { name: babak.judul })).toBeAttached();
  }
});
