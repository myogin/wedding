# 04: Buka Undangan, lalu Hero berlapis + musik

**What to build:** Tamu menekan "Buka Undangan". Scroll terbuka, musik mulai diputar, dan Tamu masuk ke Hero berlapis yang bergerak berkedalaman saat di-scroll, di desktop maupun di ponsel.

**Blocked by:** 03 (Brief scroll-craft dan aset Hero)

**Status:** done

**Category:** enhancement

- [x] Engine scroll-craft (JS + CSS) disalin tanpa diubah dan hanya dimuat di halaman Undangan. Markup act berupa HTML semantik yang di-render server dengan atribut `data-sc-*`.
- [x] Sebelum "Buka Undangan" ditekan, isi Undangan tidak bisa di-scroll. Layar loading menampilkan persentase pemuatan aset kritis Hero.
- [x] "Buka Undangan" membuka kunci scroll, memulai musik secara loop, lalu masuk ke Hero.
- [x] Tombol musik bisa menjeda dan memutar lagi. Musik berhenti saat tab atau aplikasi disembunyikan, dan lanjut saat Tamu kembali, kecuali Tamu sendiri yang menjedanya.
- [x] Hero sesuai rencana di tiket 03:
  - [x] lapisan bergerak dengan laju berbeda,
  - [x] nama Mempelai terbaca sepanjang gerakan,
  - [x] poster fallback tampil bila ada lapisan yang gagal dimuat,
  - [x] komposisi mobile dirancang terpisah,
  - [x] mode reduced-motion menampilkan komposisi statis yang tetap berlapis, tanpa ruang scroll kosong.
- [x] Tidak ada ikon atau petunjuk "scroll", dan klip scrub tidak bersuara.
- [x] E2E (reduced-motion): setelah "Buka Undangan", isi bisa di-scroll dan tombol musik bisa men-toggle. Ditambah satu smoke test dengan gerakan penuh.
- [x] Verifikasi Step 5 scroll-craft untuk Hero: screenshot desktop, 390×844, dan reduced-motion diambil, contact sheet dibaca, dan temuannya diperbaiki.

## Comments

**Implementasi (branch `tiket-04-hero-musik`, ditumpuk di atas tiket 03):**

- **Engine** disalin persis ke `src/scrollcraft/` (dicek dengan `cmp`). CSS-nya hanya diimpor oleh halaman Undangan. Modul JS dimuat dinamis lebih awal, tetapi engine baru dipasang saat "Buka Undangan" ditekan.
- **Gerbang.**
  - Layar loading menampilkan persentase byte aset Hero, berbobot ukuran berkasnya.
  - Sampul melayang di atas Hero yang masih padam.
  - Isi Undangan `inert` dan scroll terkunci sampai tombol ditekan.
  - Musik dimulai di dalam handler klik.
  - Tombol "Musik" (`aria-pressed`) menjeda dan memutar. Musik berhenti saat tab tersembunyi dan lanjut saat Tamu kembali, kecuali Tamu sendiri yang menjedanya.
- **Hero** (`src/komponen/hero.tsx`, `src/app/undangan.css`):
  - Markup server dengan `data-sc-act="pin"` span 3, digerakkan dari `--sc-p` sesuai RENCANA §7.
  - Ponsel full-bleed; layar lebar (rasio ≥ 5:4) berupa jendela cahaya.
  - Penyalaan: lentera menyala bergiliran, lalu ruangan menghangat.
  - Poster dipakai bila ada lapisan yang gagal dimuat.
  - Dengan gerakan dikurangi, span menjadi 1: komposisi diam yang tetap berlapis.
- **Konten.** `hero` (folder + alt) ditambahkan ke skema dan terdeteksi sebagai Placeholder. `sampul.foto` dihapus. Palet api lentera dan Jost diterapkan. `muatHero` memvalidasi `hero.json` dan berkas lapisan saat build.
- **E2E** `e2e/buka-undangan.spec.ts`, 9 skenario × 2 project:
  - persentase loading, kunci scroll, toggle musik, dan musik saat tab tersembunyi/kembali;
  - fallback poster, Sampul di layar pendek;
  - satu smoke test dengan gerakan penuh (laju skala subjek > latar, nama tetap di viewport).
  - Hasil: seluruh suite 24/24 lulus terhadap image Docker produksi.
- **Verifikasi Step 5.**
  - `scrollcraft/builds/undangan/alat/verifikasi.mjs` menekan Sampul dulu (harness `shoot.mjs` tidak bisa melewatinya), lalu mengambil sampel tiap act, mendeteksi dead scroll, mengukur kontras di atas kotak baris teks, dan membuat contact sheet.
  - Lembar `lab/verifikasi-{desktop,ponsel,reduced}.jpg` diambil dari image produksi. Tidak ada dead scroll; kontras terendah 7.96:1 (tanggal di ponsel).
- **Temuan Step 5 yang diperbaiki:**
  1. Lentera padam tampak sebagai noda abu-abu kebiruan, karena kurva `gelapkan()` di alat aset tidak monoton. Kurva diganti dan tiga aset gelap dibangun ulang; versi terang identik byte demi byte.
  2. Buket sedap malam terpotong lurus di tepi kiri potongannya. Tepi itu kini dipudarkan di CSS.
  3. Di ponsel, buket selebar 78% tenggelam di bawah scrim pita teks. Kini 56% dan berada di atas scrim; RENCANA §7 dan `KOREOGRAFI` ikut diperbarui.
  4. Debu terlihat melayang di kolom gelap desktop. Kini hanya ada di dalam bingkai cahaya.
  5. Di ponsel mendatar (844×390), tombol Sampul jatuh di luar layar. Kini ukuran nama ikut dibatasi tinggi layar dan Sampul bisa di-scroll sendiri; ada tes regresinya.
  6. Setelah engine dipindah ke saat dibuka, panggung belum setinggi layar di belakang Sampul. Kelas `sc-stage` kini sudah ada di HTML awal.
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - engine dipasang saat dibuka (layout diukur setelah kunci scroll lepas);
  - panggung tidak lagi memakai state (atribut ditulis langsung);
  - Sampul baru tampil setelah mode Hero terpasang;
  - poster ditunggu sebelum Sampul bila lapisan gagal;
  - cleanup timer dan listener;
  - `useEffectEvent` menggantikan penulisan ref saat render;
  - aset Hero dipasangkan terang/gelap;
  - CSS diringkas.
- **Catatan untuk tiket berikutnya:**
  - Kaki minimal (`.kaki`) ditambahkan supaya halaman bisa di-scroll di mode gerak dikurangi. Tiket 05 menaruh Restu sebelum kaki, dan tiket 15 menata kaki finalnya ("bukan memudar menjadi footer").
  - Sampul dan tombol musik berada di luar act (overlay tetap). Itu sengaja, karena keduanya menutupi atau melayang di atas semua act.
  - Tanpa JavaScript, Undangan tidak dibuka (pesan di layar loading, keputusan tiket 01). RENCANA §7 sudah diluruskan.
  - Uji di ponsel sungguhan (autoplay musik setelah ketukan, kehalusan scroll) tetap ada di daftar manual tiket 15.

