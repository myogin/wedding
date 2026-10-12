// Tipe untuk engine scroll-craft. scrollcraft.js dan scrollcraft.css adalah salinan persis dari
// scrollcraft/builds/undangan/ dan tidak boleh diedit; tema dan perilaku halaman ditulis di luar engine.
// Engine adalah IIFE yang memasang `window.ScrollCraft` saat modulnya dievaluasi (hanya di browser).

export {};

type InstansScrollCraft = {
  layout(): void;
  read(): void;
  destroy(): void;
};

declare global {
  interface Window {
    ScrollCraft?: {
      mount(akar?: Element | string | Document): InstansScrollCraft;
      /** `prefers-reduced-motion: reduce` saat engine dimuat. */
      reduce: boolean;
      instances: InstansScrollCraft[];
    };
  }
}
