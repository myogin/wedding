export const PANJANG_MAKS_NAMA_TAMU = 100;

export type KonteksTamu = { namaTamu: string | null };

export function bacaKonteksTamu(params: Pick<URLSearchParams, "get">): KonteksTamu {
  // Dipotong per code point agar emoji atau aksara di luar BMP tidak terbelah.
  const nama = Array.from((params.get("to") ?? "").trim())
    .slice(0, PANJANG_MAKS_NAMA_TAMU)
    .join("")
    .trim();
  return { namaTamu: nama || null };
}
