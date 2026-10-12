const AWALAN_ASET_PLACEHOLDER = "/placeholder/";

/**
 * Daftar jalur Placeholder yang masih aktif di Konten Undangan:
 * blok bertanda `placeholder: true` dan aset yang masih diambil dari folder /placeholder/.
 */
export function daftarPlaceholder(nilai: unknown, jalur = ""): string[] {
  if (typeof nilai === "string") {
    return nilai.startsWith(AWALAN_ASET_PLACEHOLDER) ? [jalur] : [];
  }
  if (Array.isArray(nilai)) {
    return nilai.flatMap((item, i) => daftarPlaceholder(item, `${jalur}[${i}]`));
  }
  if (nilai !== null && typeof nilai === "object") {
    if ("placeholder" in nilai && nilai.placeholder === true) return [jalur];
    return Object.entries(nilai).flatMap(([kunci, isi]) =>
      daftarPlaceholder(isi, jalur ? `${jalur}.${kunci}` : kunci),
    );
  }
  return [];
}
