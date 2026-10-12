# 03: Brief scroll-craft dan aset Hero

**What to build:** Agent menjalankan tahap perencanaan skill **scroll-craft** bersama Mempelai. Hasilnya BRIEF.md dan rencana halaman yang lengkap, ditambah lapisan Hero yang siap dipakai dari foto Placeholder. Rencana ini cukup jelas sehingga tiket 04–07 dan 15 bisa dikerjakan tanpa bertanya ulang. Mempelai harus tersedia untuk menjawab pertanyaan Step 0.

**Blocked by:** 01 (Fondasi: Sampul personal dari Link Tamu, berjalan di container)

**Status:** done

**Category:** enhancement

- [x] Skill scroll-craft dipanggil, doctor dijalankan, dan workspace-nya berada di dalam repo.
- [x] Step 0 memakai brief yang sudah ada di spec. Pertanyaan yang belum terjawab diajukan ke Mempelai: energy curve, perasaan per tahap dan peak, benih signature move, rentang estetika, dan satu dunia yang menyambung atau adegan terpisah. Jawabannya dicatat verbatim di BRIEF.md.
- [x] BRIEF.md memuat feeling curve, peak (sebagai kalimat yang akan diceritakan Tamu ke temannya), kalimat "It's the site where ___", dan bagian hening yang disengaja.
- [x] Journey final ditetapkan, berangkat dari usulan di spec.
- [x] Grammar dipilih, beserta alasan mengapa tujuh grammar lain kalah.
- [x] Signature move dirancang khusus untuk undangan ini.
- [x] Fingerprint gate lulus.
- [x] Score table mematuhi aturan skill:
  - [x] minimal 4 device family,
  - [x] tidak ada device yang sama dua kali berurutan,
  - [x] paling banyak 2 act `scrub`,
  - [x] peak punya span terbesar.
- [x] Score memetakan act untuk:
  - [x] Sampul → Hero,
  - [x] Restu,
  - [x] Mempelai dan kisah cinta,
  - [x] Hari H,
  - [x] Galeri,
  - [x] act `flow` untuk RSVP, Buku Tamu, dan Amplop Digital,
  - [x] Penutup.
- [x] Lapisan Hero lengkap:
  - [x] plate latar bersih,
  - [x] potongan Mempelai dengan alpha asli,
  - [x] foreground (bunga/ornamen),
  - [x] atmosfer,
  - [x] poster fallback,
  - [x] varian mobile.
- [x] Setiap aset Hero sudah diperiksa: alpha, halo di tepi potongan, dan titik kontak.
- [x] kie.ai hanya dipakai bila `KIE_AI_API_KEY` tersedia dan memang dibutuhkan. Keputusan ini dicatat.

## Comments

**Implementasi (branch `tiket-03-brief-scroll-craft`):** semua hasilnya ada di `scrollcraft/builds/undangan/`.

- **Brief.** `BRIEF.md` berstatus *Self-authored under explicit creative delegation*. Mempelai menjawab tujuh pertanyaan Step 0 dengan "lanjut".
- **Rencana.** `RENCANA.md` memuat:
  - grammar baru **Prosesi berlentera**, beserta alasan tujuh grammar lain kalah;
  - signature move **Lentera yang menyala**;
  - hasil fingerprint gate (registri masih kosong, jadi lulus; baris ditambahkan di tiket 15);
  - score 7 act, sekitar 13.3vh;
  - palet terukur;
  - kontrak lapisan Hero dan angka koreografinya.
- **Aset Hero** di `public/placeholder/hero/` (872 KB):
  - latar, subjek, sedap malam (lapisan depan), dan poster, masing-masing versi terang dan gelap;
  - `hero.json` berisi geometri, titik kontak kaki, dan posisi lentera.
- **Alat** yang bisa dijalankan ulang ada di `alat/` (Apple Vision lokal dan sharp). Cara menjalankannya ada di RENCANA.md bagian 8.
- **Bukti visual**: `lab/lembar-lapisan.jpg` dan `lab/simulasi-hero.jpg`.
- **kie.ai tidak dipakai.** `KIE_AI_API_KEY` tidak ada, dan semua lapisan bisa dipotong dari foto. ffmpeg juga tidak dibutuhkan karena score tidak memakai `scrub`.
