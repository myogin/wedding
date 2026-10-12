import { expect, test } from "@playwright/test";

test.describe("Sampul", () => {
  test("menampilkan nama tamu dari Link Tamu", async ({ page }) => {
    await page.goto("/?to=Budi%20Santoso");

    const sampul = page.getByRole("region", { name: "Sampul" });
    await expect(sampul.getByText("Budi Santoso", { exact: true })).toBeVisible();
    await expect(sampul.getByRole("button", { name: "Buka Undangan" })).toBeVisible();
  });

  test("menampilkan sapaan umum saat link tanpa nama", async ({ page }) => {
    await page.goto("/");

    const sampul = page.getByRole("region", { name: "Sampul" });
    await expect(sampul.getByText("Bapak/Ibu/Saudara/i", { exact: true })).toBeVisible();
  });

  test("memotong nama tamu yang lebih dari 100 karakter", async ({ page }) => {
    const seratusKarakter = "Keluarga Besar ".repeat(7).slice(0, 100);
    await page.goto(`/?to=${encodeURIComponent(`${seratusKarakter}SISA`)}`);

    const namaTamu = page.getByRole("region", { name: "Sampul" }).getByText(/^Keluarga Besar/);
    await expect(namaTamu).toHaveText(seratusKarakter.trim());
  });

  test("menganggap nama yang hanya berisi spasi sebagai link tanpa nama", async ({ page }) => {
    await page.goto("/?to=%20%20%20");

    const sampul = page.getByRole("region", { name: "Sampul" });
    await expect(sampul.getByText("Bapak/Ibu/Saudara/i", { exact: true })).toBeVisible();
  });
});
