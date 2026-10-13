import { expect, type Page } from "@playwright/test";

export function sampul(page: Page) {
  return page.getByRole("region", { name: "Sampul" });
}

/** Menunggu layar loading selesai, lalu menekan "Buka Undangan". */
export async function bukaUndangan(page: Page) {
  await sampul(page).getByRole("button", { name: "Buka Undangan" }).click();
  await expect(sampul(page)).toBeHidden();
}
