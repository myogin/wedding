"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Gambar } from "@/konten/skema";

type Props = {
  foto: Gambar[];
  /** Rel galeri (di-render server). Setiap tombol `button[data-foto="i"]` di dalamnya membuka foto ke-i. */
  children: ReactNode;
};

/** Seretan mendatar sejauh ini (px) dihitung sebagai usapan ke foto lain. */
const AMBANG_USAP = 60;
/** Gerak sekecil ini masih dianggap ketukan, bukan seretan. */
const AMBANG_SERET = 8;

/**
 * Atribut sizes foto lightbox. Foto dipasang utuh di layar: bila layar lebih lebar dari rasio foto,
 * tingginya yang membatasi (lebar = rasio × tinggi layar); selain itu lebarnya selebar layar.
 */
function ukuranLightbox(foto: Gambar): string {
  const rasio = foto.lebar / foto.tinggi;
  return `(min-aspect-ratio: ${foto.lebar}/${foto.tinggi}) ${Math.ceil(rasio * 100)}vh, 100vw`;
}

/**
 * Lightbox galeri. Klik pada tombol foto di rel ditangkap di pembungkus ini, jadi rel tetap markup
 * server dan tidak pernah di-render ulang. Lightbox adalah `<dialog>` modal: isi halaman di luarnya inert.
 */
export function GaleriLightbox({ foto, children }: Props) {
  const [indeks, setIndeks] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  /** Tombol foto yang membuka lightbox; fokus dikembalikan ke sini saat ditutup. */
  const pemicu = useRef<HTMLElement | null>(null);
  /** Titik awal seretan yang sedang berlangsung. */
  const seret = useRef<{ id: number; x: number; y: number } | null>(null);
  /**
   * Seretan baru saja terjadi: klik yang menyusul (bila ada) bukan klik pada latar. Direset di setiap
   * tekanan baru, karena usapan sentuh tidak diikuti klik sama sekali.
   */
  const baruDiseret = useRef(false);

  useEffect(() => {
    if (indeks !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [indeks]);

  function bukaDariKlik(e: MouseEvent<HTMLDivElement>) {
    const tombol = (e.target as Element).closest<HTMLElement>("button[data-foto]");
    if (!tombol) return;
    pemicu.current = tombol;
    setIndeks(Number(tombol.dataset.foto));
  }

  function padaTutup() {
    setIndeks(null);
    // preventScroll: foto di rel `pan` digeser dengan transform, jadi browser tidak boleh ikut menggulir.
    pemicu.current?.focus({ preventScroll: true });
  }

  /** Berpindah foto; dari foto terakhir lanjut ke foto pertama, dan sebaliknya. */
  const geser = (arah: 1 | -1) => setIndeks((i) => (i === null ? i : (i + arah + foto.length) % foto.length));
  const aktif = indeks === null ? null : { ...foto[indeks]!, posisi: indeks + 1 };

  const tutup = () => dialog.current?.close();

  /** Klik pada latar (bukan pada foto atau tombol) menutup lightbox. */
  function padaKlik(e: MouseEvent<HTMLDialogElement>) {
    if (baruDiseret.current) {
      baruDiseret.current = false;
      return;
    }
    if ((e.target as Element).matches(".lightbox, .lightbox__isi, .lightbox__panggung")) tutup();
  }

  // Usap: foto mengikuti jari (transform langsung di elemen, tanpa render ulang), lalu berpindah bila
  // seretannya cukup jauh dan lebih mendatar daripada tegak. Selain itu foto kembali ke tempatnya.
  function mulaiSeret(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    seret.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }

  function lanjutSeret(e: PointerEvent<HTMLElement>) {
    const awal = seret.current;
    if (!awal || e.pointerId !== awal.id) return;
    const dx = e.clientX - awal.x;
    if (!baruDiseret.current && Math.abs(dx) < AMBANG_SERET) return;
    if (!baruDiseret.current) e.currentTarget.setPointerCapture(e.pointerId);
    baruDiseret.current = true;
    e.currentTarget.dataset.diseret = "";
    e.currentTarget.style.transform = `translate3d(${dx}px, 0, 0)`;
  }

  function akhiriSeret(e: PointerEvent<HTMLElement>) {
    const awal = seret.current;
    if (!awal || e.pointerId !== awal.id) return;
    seret.current = null;
    delete e.currentTarget.dataset.diseret;
    e.currentTarget.style.transform = "";
    const [dx, dy] = [e.clientX - awal.x, e.clientY - awal.y];
    if (e.type === "pointerup" && Math.abs(dx) >= AMBANG_USAP && Math.abs(dx) > Math.abs(dy)) geser(dx < 0 ? 1 : -1);
  }

  function padaTombolKeyboard(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === "ArrowRight") geser(1);
    else if (e.key === "ArrowLeft") geser(-1);
    else if (e.key === "Tab") kurungFokus(e);
  }

  /**
   * Tab dari tombol terakhir kembali ke tombol pertama, dan sebaliknya. Dialog modal saja tidak cukup:
   * browser melepas fokus ke bilah alamat setelah elemen terakhir.
   */
  function kurungFokus(e: KeyboardEvent<HTMLDialogElement>) {
    const tombol = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button"));
    const pertama = tombol[0];
    const terakhir = tombol[tombol.length - 1];
    if (!pertama || !terakhir) return;
    const fokusKini = document.activeElement as HTMLElement | null;
    const diLuar = !fokusKini || !tombol.includes(fokusKini);
    if (e.shiftKey && (fokusKini === pertama || diLuar)) {
      e.preventDefault();
      terakhir.focus();
    } else if (!e.shiftKey && (fokusKini === terakhir || diLuar)) {
      e.preventDefault();
      pertama.focus();
    }
  }

  return (
    <>
      <div className="galeri-lightbox" onClick={bukaDariKlik}>
        {children}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Galeri foto"
        onClose={padaTutup}
        onPointerDownCapture={() => (baruDiseret.current = false)}
        onClick={padaKlik}
        onKeyDown={padaTombolKeyboard}
      >
        {aktif && (
          <div className="lightbox__isi">
            <button type="button" className="lightbox__tombol lightbox__tutup" aria-label="Tutup" onClick={tutup}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <figure
              className="lightbox__panggung"
              onPointerDown={mulaiSeret}
              onPointerMove={lanjutSeret}
              onPointerUp={akhiriSeret}
              onPointerCancel={akhiriSeret}
            >
              <Image
                key={aktif.src}
                className="lightbox__gambar"
                src={aktif.src}
                alt={aktif.alt}
                width={aktif.lebar}
                height={aktif.tinggi}
                sizes={ukuranLightbox(aktif)}
                draggable={false}
              />
            </figure>
            <div className="lightbox__kendali">
              <button type="button" className="lightbox__tombol" aria-label="Foto sebelumnya" onClick={() => geser(-1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              {/* Diumumkan setiap foto berganti, lengkap dengan teks alternatifnya. */}
              <p className="lightbox__posisi" aria-live="polite">
                <span className="sr-only">{aktif.alt}, </span>
                {aktif.posisi} dari {foto.length}
              </p>
              <button type="button" className="lightbox__tombol" aria-label="Foto berikutnya" onClick={() => geser(1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
