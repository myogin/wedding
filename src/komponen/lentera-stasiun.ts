/** Stasiun menyala saat act-nya pertama kali mencapai progres ini (RENCANA.md §3). */
const AMBANG_MENYALA = 0.25;
/** Media redup menghangat saat setidaknya sebagian ini terlihat dan stasiunnya sudah menyala. */
const AMBANG_MEDIA_TERLIHAT = 0.4;

/**
 * Lentera stasiun (signature move, RENCANA.md §3), ditulis sebagai kode halaman di luar engine.
 * - Act mendapat `data-menyala` saat `--sc-p` yang ditulis engine pertama kali mencapai 0.25, dan tetap
 *   menyala walau di-scroll ke atas. Act bertanda `data-menyala-saat-dibuka` (Hero) langsung menyala.
 * - Media `.media-redup` mendapat `data-hangat` saat terlihat setelah stasiunnya menyala.
 * Mengembalikan fungsi pelepas.
 */
export function pasangLenteraStasiun(akar: HTMLElement): () => void {
  const act = Array.from(akar.querySelectorAll<HTMLElement>("[data-sc-act]"));
  const mediaTerlihat = new Set<Element>();

  const nyalakanStasiunYangTiba = () => {
    for (const el of act) {
      if (el.hasAttribute("data-menyala")) continue;
      const progres = parseFloat(el.style.getPropertyValue("--sc-p")) || 0;
      if (progres >= AMBANG_MENYALA || el.hasAttribute("data-menyala-saat-dibuka")) {
        el.setAttribute("data-menyala", "");
      }
    }
    for (const media of mediaTerlihat) {
      if (!media.closest("[data-menyala]")) continue;
      media.setAttribute("data-hangat", "");
      mediaTerlihat.delete(media);
      pengamat.unobserve(media);
    }
  };

  const pengamat = new IntersectionObserver(
    (entri) => {
      for (const e of entri) {
        if (e.isIntersecting) mediaTerlihat.add(e.target);
        else mediaTerlihat.delete(e.target);
      }
      nyalakanStasiunYangTiba();
    },
    { threshold: AMBANG_MEDIA_TERLIHAT },
  );
  akar.querySelectorAll(".media-redup:not([data-hangat])").forEach((media) => pengamat.observe(media));

  // --sc-p ditulis engine di rAF-nya sendiri setelah scroll. Kalau frame ini kebetulan lebih dulu,
  // yang terbaca nilai satu frame sebelumnya: cukup untuk ambang, dan terkejar di scroll berikutnya.
  let bingkai = 0;
  const padaScroll = () => {
    if (bingkai) return;
    bingkai = requestAnimationFrame(() => {
      bingkai = 0;
      nyalakanStasiunYangTiba();
    });
  };
  addEventListener("scroll", padaScroll, { passive: true });
  nyalakanStasiunYangTiba();

  return () => {
    removeEventListener("scroll", padaScroll);
    cancelAnimationFrame(bingkai);
    pengamat.disconnect();
  };
}
