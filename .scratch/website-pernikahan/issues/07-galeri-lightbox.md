# 07: Galeri + lightbox

**What to build:** Tamu menikmati galeri foto prewedding dengan perilaku scroll sesuai score. Tamu bisa mengetuk foto untuk memperbesarnya, berpindah antar foto, lalu menutupnya.

**Blocked by:** 04 (Buka Undangan, lalu Hero berlapis + musik)

**Status:** done

**Category:** enhancement

- [x] Device galeri sesuai score. Gambar dioptimasi dan dimuat lazy.
- [x] Lightbox:
  - [x] terbuka saat foto diketuk,
  - [x] bisa digeser dengan sentuhan dan punya tombol sebelumnya/berikutnya,
  - [x] tertutup dengan Esc atau klik latar,
  - [x] mengunci scroll body selama terbuka,
  - [x] menjaga fokus keyboard tetap di dalam lightbox,
  - [x] mengembalikan fokus ke foto asal saat ditutup.
- [x] Setiap foto punya teks alternatif.
- [x] Komposisi mobile dan mode reduced-motion tetap lengkap.
- [x] E2E: buka lightbox, pindah ke foto berikutnya, lalu tutup dengan Esc.

## Comments

**Implementasi:**

- **Act Kenangan** (`src/komponen/kenangan.tsx`, `id="kenangan"`): `pan` sesuai score.
  - Rel berupa dinding foto dua baris dengan kolom yang bergantian sedikit naik dan turun. Judul "Kenangan" adalah item pertama; catatan penutup "Bab berikutnya ingin kami tulis bersamamu." item terakhir.
  - Tinggi baris 27svh di ponsel dan 33svh di layar ≥ 900px. Di layar ultrawide baris ikut membesar (maks. 42svh) supaya rel tetap bergeser; rel yang tetap lebih pendek dari layar ditaruh di tengah.
  - Span dihitung dari panjang rel (`data-span-otomatis`), paling banyak 2.4 (`data-span-maks`, atribut baru di `mesin-scroll.ts`), supaya Hero (3.0) tetap act terpanjang. Terukur: ponsel 2.40, 1280×720 2.11, 1440×900 2.02. Dengan gerakan dikurangi: span 1 dan rel menjadi area geser biasa.
  - Foto dioptimasi next/image dengan `sizes` dari tinggi baris × rasio foto, dan dimuat lazy. Karena panggung `overflow: clip` membuat lazy loading bawaan terlambat, foto rel mulai dimuat saat act-nya 1,5 layar lagi.
  - Signature move: setiap foto `.media-redup`, menghangat saat terlihat setelah stasiunnya menyala.
- **Lightbox** (`src/komponen/galeri-lightbox.tsx`): `<dialog>` modal. Rel tetap markup server; klik pada tombol foto ditangkap pembungkus `display: contents`.
  - Terbuka saat foto diketuk; fokus awal di "Tutup".
  - Tombol "Foto sebelumnya"/"Foto berikutnya" dan tombol panah, berputar di ujung galeri. Posisi "3 dari 10" diumumkan ke pembaca layar bersama teks alternatifnya.
  - Usap: foto mengikuti jari (transform saja), berpindah bila seretan ≥ 60px dan lebih mendatar.
  - Tertutup dengan Esc, klik latar, atau "Tutup". Klik pada foto tidak menutupnya.
  - Scroll halaman terkunci (`html:has(.lightbox[open])`).
  - Fokus dikurung di dalam lightbox dan kembali ke foto asal saat ditutup.
  - Ukuran berkas foto mengikuti ukuran tampilnya (bukan 100vw).
- **Fokus keyboard di rel `pan`** (`src/komponen/rel-pan.ts`, kode halaman, berlaku juga untuk Kisah Cinta): Tab ke foto yang masih di luar layar menggulir halaman sampai foto itu di tengah. Hanya untuk `:focus-visible`, jadi ketukan dan klik tidak menggeser halaman.
- **Tes E2E** `e2e/kenangan.spec.ts`:
  - Gerakan dikurangi:
    - semua foto ber-alt;
    - buka, berikutnya, Esc, fokus kembali (skenario wajib tiket);
    - sebelumnya, panah, dan perputaran;
    - klik latar dan tombol Tutup;
    - scroll terkunci (gestur scroll sungguhan lewat CDP);
    - kurungan fokus;
    - usap (sentuhan sungguhan di ponsel);
    - ketukan latar setelah usap;
    - ukuran berkas lightbox;
    - klik foto tidak menutup.
  - Gerakan penuh:
    - rel dari judul sampai catatan penutup, dengan span ≤ 2.4 dan di bawah Hero;
    - Tab membawa rel ke foto;
    - foto rel dimuat sebelum tiba;
    - ketukan pada foto yang terpotong di tepi layar tidak menggeser halaman;
    - layar ultrawide 3440×1440 (desktop saja).
  - Hasil: E2E 83 lulus + 1 dilewati terhadap image produksi; Vitest 8/8.
  - Catatan: spec meminta satu smoke test gerakan penuh. Di sini ada beberapa, karena perilaku itu hanya ada saat gerakan penuh; semuanya deterministik.
- **Verifikasi Step 5** (desktop, ponsel 390×844, gerakan dikurangi): tidak ada dead scroll, semua kontras lulus. Temuan yang diperbaiki:
  1. Foto rel selebar 0, karena `max-width: 100%` bawaan engine bertemu tombol yang lebarnya mengikuti isi.
  2. Rel menyusut sebagai flex item dan memotong tombol foto, sehingga klik jatuh ke `ol`.
  3. Act setinggi 2.4 layar dengan gerakan dikurangi; kini `data-span-statis`.
  4. Lightbox desktop meluap melewati tinggi layar (track grid `auto`).
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - fokus keyboard di rel kini hanya untuk `:focus-visible`; sebelumnya ketukan pada foto di tepi melompatkan halaman dan lightbox gagal terbuka;
  - penanda usap direset di setiap tekanan baru, jadi ketukan latar setelah usap tidak tertelan;
  - `sizes` lightbox;
  - foto rel dimuat lebih awal;
  - rel di layar ultrawide;
  - rumus geseran rel dipakai bersama;
  - CSS panggung dan judul disatukan dengan Kisah Cinta;
  - nama dan konstanta dirapikan;
  - keputusan lightbox di act `pan` dicatat di RENCANA §9.
- **Perlu dicek di perangkat sungguhan (tiket 15):** kunci scroll lightbox di iOS Safari. `overflow: hidden` pada `html` baru dihormati iOS 16 ke atas, dan E2E hanya menjalankan Chromium.
- **Konten:** teks alternatif Placeholder masih generik ("Foto prewedding 1"). Saat foto asli dipasang, isi alt yang menggambarkan fotonya.
