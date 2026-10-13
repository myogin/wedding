import Image from "next/image";
import { posisiFokus } from "@/konten/format";
import type { Gambar } from "@/konten/skema";

type Props = {
  gambar: Gambar;
  sizes: string;
  /** Bawaannya alt gambar; isi "" untuk salinan dekoratif. */
  alt?: string;
  className?: string;
};

/** Foto yang mengisi bingkainya (object-fit cover) dan dipotong di sekitar titik fokusnya. */
export function FotoTerpotong({ gambar, sizes, alt = gambar.alt, className }: Props) {
  return (
    <Image
      className={className}
      src={gambar.src}
      alt={alt}
      fill
      sizes={sizes}
      style={{ objectPosition: posisiFokus(gambar) }}
    />
  );
}
