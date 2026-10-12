"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Musik latar. Hanya mulai dari gestur Tamu (`putar` dipanggil di dalam handler klik), berhenti saat
 * tab atau aplikasi disembunyikan, lalu lanjut saat Tamu kembali, kecuali Tamu sendiri yang menjedanya.
 */
export function useMusik() {
  const ref = useRef<HTMLAudioElement>(null);
  const [memutar, setMemutar] = useState(false);
  const dijedaTamu = useRef(false);
  const dijedaKarenaTersembunyi = useRef(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    const sinkron = () => setMemutar(!audio.paused);
    const padaVisibilitas = () => {
      if (document.hidden) {
        if (!audio.paused) {
          dijedaKarenaTersembunyi.current = true;
          audio.pause();
        }
      } else if (dijedaKarenaTersembunyi.current) {
        dijedaKarenaTersembunyi.current = false;
        if (!dijedaTamu.current) audio.play().catch(sinkron);
      }
    };

    audio.addEventListener("play", sinkron);
    audio.addEventListener("pause", sinkron);
    document.addEventListener("visibilitychange", padaVisibilitas);
    return () => {
      audio.removeEventListener("play", sinkron);
      audio.removeEventListener("pause", sinkron);
      document.removeEventListener("visibilitychange", padaVisibilitas);
    };
  }, []);

  function putar() {
    const audio = ref.current;
    if (!audio) return;
    dijedaTamu.current = false;
    // Gagal putar (mis. berkas tidak ada) cukup membuat tombol kembali ke keadaan jeda.
    audio.play().catch(() => setMemutar(!audio.paused));
  }

  function alihkan() {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      putar();
    } else {
      dijedaTamu.current = true;
      audio.pause();
    }
  }

  return { ref, memutar, putar, alihkan };
}

type PropsTombol = { memutar: boolean; judul: string; onAlihkan(): void };

export function TombolMusik({ memutar, judul, onAlihkan }: PropsTombol) {
  return (
    <button
      type="button"
      className="tombol-musik"
      aria-label="Musik"
      aria-pressed={memutar}
      title={judul}
      onClick={onAlihkan}
    >
      <span className="tombol-musik__batang" aria-hidden="true" />
      <span className="tombol-musik__batang" aria-hidden="true" />
      <span className="tombol-musik__batang" aria-hidden="true" />
    </button>
  );
}
