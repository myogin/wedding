# 06: Hari H: hitung mundur, Acara, lokasi, Simpan Tanggal

**What to build:** Tamu melihat hitung mundur ke Acara target dan detail setiap Acara lengkap dengan zona waktunya. Tamu juga bisa membuka lokasi di Google Maps dan menyimpan Acara ke kalendernya.

**Blocked by:** 04 (Buka Undangan, lalu Hero berlapis + musik)

**Status:** done

**Category:** enhancement

- [x] Hitung mundur (hari, jam, menit, detik) dihitung terhadap waktu mulai Acara target, termasuk zona waktunya.
  - [x] Setelah Acara mulai, tampil "Acara sedang berlangsung".
  - [x] Setelah waktu selesai, atau akhir hari itu bila waktu selesai tidak diisi, tampil "Acara telah berlangsung".
- [x] Kartu setiap Acara menampilkan nama, hari dan tanggal (format `id-ID`), jam mulai, jam selesai atau "Selesai", label WIB/WITA/WIT, nama tempat, dan alamat.
- [x] Tombol "Lihat Lokasi" membuka URL Google Maps Acara tersebut.
- [x] Tombol "Simpan Tanggal" menyediakan tautan Google Calendar dan unduhan `.ics` untuk setiap Acara, dengan waktu dan zona waktu yang benar.
- [x] Device setiap act sesuai score. Komposisi mobile dan mode reduced-motion tetap lengkap.
- [x] E2E dengan `page.clock`: angka hitung mundur benar sebelum Acara, dan pesan yang tepat tampil setelah Acara mulai.
- [x] E2E: file `.ics` terunduh dengan waktu Acara yang benar.

## Comments

**Implementasi:**

- **Act Hari H** (`src/komponen/hari-h.tsx`, `id="hari-h"`): `flow` + `in`, rata kiri, sesuai score.
  - Ponsel: bertumpuk, tinggi act ±0,7 layar.
  - Layar ≥ 900px: hitung mundur di kolom kiri, daftar Acara di kanan.
  - Judul act "Menuju hari bahagia". Tidak ada eyebrow.
- **Hitung mundur** (`src/komponen/hitung-mundur.tsx`): client component yang hanya me-render dirinya sendiri, tidak pernah me-render ulang act.
  - Dihitung terhadap waktu mulai Acara utama, dengan selisih UTC zona Indonesia yang tetap (`ZONA_WAKTU` kini memuat `label` dan `selisihUtc`).
  - Detik dibulatkan ke atas, jadi angka nol semua tidak pernah tampil.
  - Detak berikutnya dijadwalkan tepat saat angka detik berganti. Selama Acara berlangsung, jam diperiksa paling lambat sekali semenit.
  - "Acara sedang berlangsung" tampil sejak waktu mulai. "Acara telah berlangsung" tampil sejak waktu selesai, atau sejak tengah malam setempat bila waktu selesai tidak diisi (`rentangAcara` di `src/konten/waktu-acara.ts`).
  - Tinggi dicadangkan, jadi pergantian ke pesan tidak menggeser act sesudahnya.
  - Ukuran angka mengikuti lebar kolomnya (`cqi`), jadi tidak menimpa daftar Acara di 900–1050px.
- **Kartu Acara:** nama, tanggal `id-ID`, jam ("15.00 WITA – Selesai" atau "15.00 – 17.00 WITA"), tempat (bila diisi), dan alamat.
- **Lihat Lokasi** membuka `acara.peta` di tab baru.
- **Simpan Tanggal** (`src/komponen/simpan-tanggal.tsx`): pilihan Google Calendar dan "Kalender lain (.ics)".
  - Panelnya melayang di atas halaman, jadi tinggi act tidak berubah.
  - Tertutup oleh Esc (fokus kembali ke tombol), ketukan di luar panel, atau fokus Tab yang keluar.
- **Berkas .ics:** route statis `src/app/kalender/[berkas]/route.ts` (`/kalender/<id>.ics`), di-prerender per Acara. Nama lain menghasilkan 404.
  - Dibangun lewat factory `buatKalenderHandler({ kontenUndangan, sekarang })`, sesuai pola dependensi di spec.
  - Waktu ditulis dalam UTC (instan yang benar, ditampilkan di zona perangkat Tamu), dengan CRLF, lipatan 75 oktet, dan escape TEXT.
  - UID tetap walau jadwal diubah: id Acara + slug nama Mempelai.
  - Header: `text/calendar` + `attachment`.
  - Tautan Google Calendar membawa `dates` UTC dan `ctz` zona Acara.
- **Konten:** validasi baru, `selesai` harus setelah `mulai` (build gagal dengan `acara[i].selesai`).
- **Signature move:** Hari H tidak punya media, jadi angka hitung mundur yang masuk redup (opasitas 0,55, kontras tetap > 3:1) lalu menyala bersama stasiunnya (`data-menyala`). Label satuan tidak diredupkan.
- **Tes.**
  - E2E `e2e/hari-h.spec.ts`, 9 skenario × 2 project, dengan `page.clock`:
    - angka sebelum Acara (02/03/04/05);
    - berdetak per detik sampai berganti pesan tepat saat mulai;
    - sedang berlangsung (sesaat setelah mulai dan sesaat sebelum akhir);
    - telah berlangsung;
    - kartu Acara;
    - unduhan .ics (DTSTART/DTEND);
    - tautan Google Calendar;
    - panel tertutup saat fokus keluar;
    - Lihat Lokasi.
  - API `tests/api/kalender.test.ts` dengan konten fixture (dua Acara, WIB dan WIT, dengan dan tanpa `selesai`/`tempat`): waktu UTC, akhir tengah malam, escape, CRLF dan lipatan, UID stabil, 404.
  - Hasil: E2E 54/54 terhadap image produksi, Vitest 8/8.
- **Verifikasi Step 5** (desktop, ponsel 390×844, gerakan dikurangi): tidak ada dead scroll dan semua kontras lulus. Harness kini juga mengukur isi `role="timer"`; satuan terendah 8,16:1. Temuan yang diperbaiki:
  1. Panel kalender meluap ke tepi kanan ponsel. Kini berjangkar ke baris aksi.
  2. Hitung mundur menimpa daftar Acara di 900–1050px. Kini ukurannya ikut kolom.
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - transisi `border-color` dihapus (aturan keras: hanya `transform`/`opacity`/`clip-path`);
  - parameter `dibuat` kini datang dari jam yang disuntikkan;
  - `tautanIcs()` berada di samping `tautanGoogleCalendar()`;
  - `sisa` dikunci per satuan;
  - UID tidak lagi memuat waktu mulai;
  - panel menutup saat fokus keluar;
  - helper tes E2E disatukan.
- **Keputusan yang perlu diketahui Mempelai:**
  - **Dua ketukan ke kalender.** BRIEF menulis "satu ketukan ke peta dan kalender", tetapi tiket meminta dua pilihan (Google Calendar dan .ics). Peta tetap satu ketukan.
  - **Ujung entri kalender.** Tanpa waktu selesai, entri kalender berakhir tengah malam setempat, mengikuti aturan "akhir hari itu".
- **Belum teruji di browser:** tampilan jam selesai, nama tempat, dan beberapa Acara. Konten Placeholder hanya punya satu Acara tanpa `selesai` dan `tempat`; tes E2E yang ada otomatis menjalankan cabang itu begitu kontennya diisi. Jalur yang sama di berkas .ics sudah teruji lewat API dengan konten fixture.
