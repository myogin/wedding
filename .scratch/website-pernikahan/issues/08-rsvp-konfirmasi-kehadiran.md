# 08: RSVP: Tamu konfirmasi kehadiran

**What to build:** Tamu mengisi form RSVP yang namanya sudah terisi dari Link Tamu. Tamu memilih hadir atau tidak, memilih Acara dan jumlah orang, menulis Ucapan, lalu mengirim. Setelah itu tampil konfirmasi sukses, dan ringkasan kehadiran bertambah. Untuk sementara bagian ini dipasang sebagai act `flow` biasa. Penempatan akhirnya dikerjakan di tiket 15.

**Blocked by:** 01 (Fondasi: Sampul personal dari Link Tamu, berjalan di container)

**Status:** done

**Category:** enhancement

- [x] Tabel `rsvp` dibuat sesuai spec. Kolom hash IP boleh ditambahkan nanti di tiket 11.
- [x] Route handler Buku Tamu dibangun lewat factory `{ db, clock, kontenUndangan }`.
- [x] `POST /api/rsvp` mengikuti aturan berikut dan mengembalikan 201 atau 422 dengan galat per field:
  - [x] Bila `hadir`: minimal satu id Acara, semuanya ada di konfigurasi, dan pax 1..Batas Pax.
  - [x] Bila `tidak_hadir`: id Acara kosong dan pax disimpan 0.
- [x] `GET /api/rsvp/summary` mengembalikan total respons, jumlah hadir, jumlah tidak hadir, dan total pax.
- [x] Perilaku form:
  - [x] Nama terisi dari Link Tamu dan tetap bisa diubah.
  - [x] Saat "Hadir" dipilih, muncul pemilih Acara dan jumlah orang 1..Batas Pax. Bila hanya ada satu Acara, Acara itu terpilih otomatis dan pemilihnya disembunyikan.
  - [x] Saat "Tidak Hadir" dipilih, pemilih Acara dan jumlah orang disembunyikan.
  - [x] Kolom Ucapan punya penghitung karakter (0/500) dan keterangan bahwa Ucapan akan tampil publik.
  - [x] Galat per field tampil dalam bahasa Indonesia.
  - [x] Tombol kirim nonaktif selama pengiriman.
  - [x] Pesan sukses tampil setelah terkirim.
  - [x] Pada kunjungan berikutnya di perangkat yang sama, tampil penanda "sudah mengirim" (dari localStorage).
- [x] Label aksi utama di seluruh halaman: "Konfirmasi Kehadiran".
- [x] Ringkasan tampil bila diaktifkan di konfigurasi, dan bertambah setelah RSVP dikirim.
- [x] Perubahan tinggi bagian ini tidak menggeser posisi act yang di-pin.
- [x] Tes API mencakup:
  - [x] nama kosong atau lebih dari 100 karakter,
  - [x] Ucapan lebih dari 500 karakter,
  - [x] hadir tanpa Acara,
  - [x] id Acara tak dikenal,
  - [x] pax melebihi Batas Pax,
  - [x] tidak hadir tersimpan dengan pax 0,
  - [x] ringkasan bertambah setelah RSVP.
- [x] E2E: nama terisi otomatis, pilihan jumlah orang 1..Batas Pax, dan setelah dikirim pesan sukses tampil serta ringkasan bertambah.

## Comments

**Implementasi:**

- **Tabel `rsvp`** (`src/db/tabel.ts`, migrasi `drizzle/0001_rsvp.sql`): id uuid, nama (varchar 100), kehadiran (enum `hadir`/`tidak_hadir`), `id_acara` (text[]), pax, ucapan (varchar 500, boleh kosong), tersembunyi (default false), dibuat. Kolom hash IP menyusul di tiket 11.
- **Aturan RSVP bersama** (`src/buku-tamu/rsvp.ts`): satu skema Zod dipakai form di browser dan API di server, dengan pesan galat berbahasa Indonesia.
  - Nama dan Ucapan dirapikan (spasi di tepi dibuang); Ucapan kosong berarti tanpa Ucapan.
  - Hadir: minimal satu Acara, semuanya ada di Konten Undangan (disimpan tanpa duplikat, berurutan seperti di konten), dan pax 1..Batas Pax.
  - Tidak hadir: Acara dan pax yang dikirim **diabaikan**, lalu disimpan `[]` dan 0 (bukan ditolak). Form memang menyembunyikan keduanya.
  - Semua galat dikembalikan sekaligus, juga saat ada field yang tidak dikirim.
  - Panjang dihitung seperti `maxLength` di browser (satuan UTF-16), jadi penghitung 0/500 dan batas server selalu sama.
- **Modul Buku Tamu** (`src/server/buku-tamu.ts`) dan handler tipisnya (`src/server/api-buku-tamu.ts`, factory `buatBukuTamuHandler({ db, sekarang, kontenUndangan })`). Nama `sekarang` (bukan `clock`) mengikuti `buatKalenderHandler` dari tiket 06.
  - `POST /api/rsvp`: 201 berisi RSVP tersimpan (tanpa kolom internal), 422 `{ galat: { field: pesan } }`. Body yang bukan objek JSON dibalas 400.
  - `GET /api/rsvp/summary`: `{ totalRespons, hadir, tidakHadir, totalPax }`, `Cache-Control: no-store`. Dibalas **404 bila `tampilkanRingkasan` dimatikan**, supaya angka yang disembunyikan Mempelai juga tidak bisa dibaca lewat API publik.
- **Act Hadir** (`src/komponen/hadir.tsx`, `id="hadir"`): `flow` + `in`, rata kiri, sesudah Kenangan. Judul "Kabari kami". Ponsel bertumpuk; layar ≥ 900px: judul dan ringkasan di kolom kiri, form di kanan. Penempatan akhir di tiket 15.
- **Form RSVP** (`src/komponen/rsvp.tsx`, client):
  - Nama terisi dari Link Tamu dan bisa diubah.
  - Hadir/Tidak Hadir berupa pill. Saat Hadir: pemilih Acara (disembunyikan bila hanya satu Acara, yang langsung terpilih) dan jumlah orang 1..Batas Pax.
  - Ucapan dengan penghitung 0/500 dan keterangan bahwa Ucapan tampil di Buku Tamu.
  - Galat tampil per field, dan fokus pindah ke field pertama yang salah setelah galatnya ter-render, jadi pembaca layar membacanya bersama field itu. Galat server untuk field yang sedang tersembunyi tampil sebagai pesan umum. Gagal jaringan atau 5xx: pesan "Konfirmasi belum terkirim…", lalu bisa dicoba lagi.
  - Tombol "Konfirmasi Kehadiran" nonaktif selama pengiriman.
  - Setelah terkirim, form diganti pesan sukses dan fokus pindah ke pesan itu.
  - Penanda "sudah mengirim" (`localStorage` `undangan:rsvp`, berisi nama dan kehadiran untuk lentera tamu di tiket 15) tampil di atas form pada kunjungan berikutnya. Form tetap bisa dipakai, mis. untuk anggota keluarga lain. Tidak ada tombol kedua dengan label lain, supaya label aksi utama tetap satu.
- **Ringkasan** (bila `tampilkanRingkasan`): empat angka nyata, tingginya tercadang selama dimuat, dan dimuat ulang setelah RSVP terkirim. Angkanya ikut menyala bersama stasiun Hadir. Ponsel satu baris, layar lebar 2×2.
- **Tinggi yang berubah dan act ber-pin:** saat ini Hadir berada sesudah act ber-pin terakhir (Kenangan), jadi syarat itu terpenuhi oleh penempatan. Untuk tiket 15, karena penutup ber-pin akan berada sesudah Hadir, `mesin-scroll.ts` kini memanggil `layout()` publik engine setiap kali tinggi akar Undangan berubah (form yang memanjang, galat, pesan sukses). Act di bawahnya tetap berpindah, tetapi pin-nya tetap tepat. Terukur di gerakan penuh: tinggi Hadir menurut engine selalu sama dengan tinggi sebenarnya (910 → 1044 dengan galat → 706 setelah terkirim). **Belum ada tes otomatis**; tiket 15 sebaiknya mengujinya lewat pin penutup.
- **Tes API** `tests/api/rsvp.test.ts` (13): semua kasus di tiket, ditambah batas 100 dan 500 karakter yang diterima, pax 0 dan kosong saat hadir, semua galat sekaligus, perapian isian, body bukan JSON, RSVP yang ditolak tidak dihitung, dan ringkasan 404 bila dimatikan. Setiap aturan validasi sudah dicek bisa merah dengan mematikannya sementara.
- **Tes E2E** `e2e/rsvp.spec.ts` (gerakan dikurangi, ponsel dan desktop):
  - nama terisi dan bisa diubah, kosong tanpa nama;
  - jumlah orang 1..Batas Pax saat Hadir, tersembunyi saat Tidak Hadir;
  - satu Acara terpilih otomatis;
  - penghitung dan keterangan publik;
  - galat per field (termasuk galat sudah terpasang saat fokus mendarat);
  - galat server, termasuk untuk field tersembunyi, dan gagal kirim;
  - tombol nonaktif selama pengiriman;
  - sukses dan ringkasan bertambah, untuk hadir dan tidak hadir;
  - penanda "sudah mengirim" pada kunjungan berikutnya.
  - Ringkasan diperiksa bertambah *paling sedikit* sebanyak kiriman tes, karena proyek ponsel dan desktop mengirim ke database yang sama secara paralel.
  - Hasil: E2E 109 lulus + 1 dilewati terhadap image produksi; Vitest 21/21.
- **Verifikasi Step 5** (desktop, ponsel 390×844, gerakan dikurangi, terhadap image produksi): tidak ada dead scroll, semua kontras lulus ("Konfirmasi Kehadiran" 8.8:1, galat 9:1). Harness kini juga mengukur `label`, `legend`, `dt`, dan `dd`. Urutan Tab: Nama → Kehadiran → (Acara) → Jumlah orang → Ucapan → Konfirmasi Kehadiran.
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - fokus galat setelah render (dibuktikan tes);
  - `aria-invalid` di radio dan checkbox;
  - galat server untuk field tersembunyi;
  - semua galat API sekaligus;
  - penanda "sudah mengirim" di atas form menggantikan tombol "Kirim konfirmasi lagi" (label kedua untuk aksi utama);
  - titik pilihan berisi tinta, bukan accent;
  - gaya tombol accent dan label kecil disatukan;
  - nama factory, `aturanRsvp` dipakai halaman, dan komentar basi di `simpan-tanggal.tsx`.
- **Belum teruji di browser:** pemilih Acara untuk lebih dari satu Acara, karena konten Placeholder hanya punya satu Acara. Aturannya teruji di tes API, dan tampilannya perlu dicek saat konten asli berisi beberapa Acara.
- **Disusulkan:** hash IP, rate limit, honeypot, dan batas waktu (tiket 11); daftar Ucapan (tiket 09); lentera tamu (tiket 15).
