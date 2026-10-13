// Kode halaman untuk rel act `pan`. Engine menggeser rel ([data-sc-pan]) dengan transform dari progres act,
// dan panggungnya `overflow: clip`. Akibatnya browser tidak bisa menggulir elemen yang difokus ke dalam layar,
// dan lazy loading bawaannya baru memuat foto saat foto itu sudah masuk layar.

/** Act sedekat ini (kelipatan tinggi layar) dari layar mulai memuat foto relnya. */
const JARAK_MUAT_AWAL = "150%";

/** Geseran penuh rel dalam px, sama dengan engine: (lebar rel - lebar layar) × (1 + data-sc-pan). */
export function geseranRel(rel: HTMLElement): number {
  const lebih = Math.max(rel.scrollWidth - innerWidth, 0);
  return lebih * (1 + (parseFloat(rel.dataset.scPan ?? "") || 0));
}

/**
 * Fokus keyboard di rel: halaman digulir ke progres act yang membawa elemen yang difokus ke tengah layar.
 * Dengan gerakan dikurangi, panggung `pan` adalah area scroll biasa, jadi ini tidak dipasang.
 * Mengembalikan fungsi pelepas.
 */
export function pasangFokusRel(akar: HTMLElement): () => void {
  const padaFokus = (e: FocusEvent) => {
    const el = e.target as HTMLElement;
    const act = el.closest<HTMLElement>('[data-sc-act="pan"]');
    const rel = act?.querySelector<HTMLElement>("[data-sc-pan]");
    // Hanya fokus keyboard. Fokus dari ketukan atau klik terjadi saat jari menekan foto yang sudah terlihat;
    // menggulir saat itu menggeser foto dari bawah jari, dan klik untuk membuka lightbox hilang.
    if (!act || !rel?.contains(el) || !el.matches(":focus-visible")) return;
    // Sudah terlihat utuh di act yang sedang di-pin (mis. fokus kembali dari lightbox): biarkan.
    const kotak = el.getBoundingClientRect();
    const kotakAct = act.getBoundingClientRect();
    if (kotakAct.top <= 0 && kotakAct.bottom >= innerHeight && kotak.left >= 0 && kotak.right <= innerWidth) return;

    const geseran = geseranRel(rel);
    if (geseran <= 0) return;
    // Posisi elemen di layar bila rel belum digeser: tepi kiri rel tanpa transform + jaraknya di dalam rel.
    const kiriRel = (rel.offsetParent?.getBoundingClientRect().left ?? 0) + rel.offsetLeft;
    const tengah = kiriRel + (kotak.left - rel.getBoundingClientRect().left) + kotak.width / 2;
    const progres = Math.min(Math.max((tengah - innerWidth / 2) / geseran, 0), 1);

    const atas = kotakAct.top + scrollY;
    scrollTo({ top: atas + progres * (act.offsetHeight - innerHeight), behavior: "instant" });
  };

  akar.addEventListener("focusin", padaFokus);
  return () => akar.removeEventListener("focusin", padaFokus);
}

/**
 * Foto di rel mulai dimuat saat act-nya mendekat, bukan saat setiap foto masuk layar, supaya di jaringan
 * seluler foto tidak muncul tiba-tiba di tengah rel. Mengembalikan fungsi pelepas.
 */
export function pasangMuatAwalRel(akar: HTMLElement): () => void {
  const pengamat = new IntersectionObserver(
    (entri) => {
      for (const e of entri) {
        if (!e.isIntersecting) continue;
        e.target.querySelectorAll<HTMLImageElement>('[data-sc-pan] img[loading="lazy"]').forEach((img) => {
          img.loading = "eager";
        });
        pengamat.unobserve(e.target);
      }
    },
    { rootMargin: `${JARAK_MUAT_AWAL} 0px` },
  );
  akar.querySelectorAll('[data-sc-act="pan"]').forEach((act) => pengamat.observe(act));
  return () => pengamat.disconnect();
}
