# 10: Amplop Digital + Konfirmasi Hadiah

**What to build:** Tamu membuka Amplop Digital dan melihat rekening tujuan. Tamu bisa menyalin nomor rekening dengan sekali ketuk, melihat alamat kado bila ada, lalu mengirim Konfirmasi Hadiah. Untuk sementara bagian ini dipasang sebagai act `flow`. Penempatan akhirnya dikerjakan di tiket 15.

**Blocked by:** 01 (Fondasi: Sampul personal dari Link Tamu, berjalan di container)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Bagian Amplop Digital punya tombol yang membuka modal.
- [ ] Modal bisa ditutup dengan Esc, dan fokus keyboard tetap di dalam modal selama terbuka.
- [ ] Modal menampilkan kartu setiap rekening dari konfigurasi (nama bank, nomor, nama pemilik), lengkap dengan tombol "Salin".
- [ ] Tombol "Salin" memakai Clipboard API dengan fallback, lalu menampilkan "Tersalin".
- [ ] Alamat kado tampil hanya bila diatur di konfigurasi.
- [ ] Tabel `konfirmasi_hadiah` dibuat sesuai spec.
- [ ] `POST /api/gift-confirmations` memvalidasi isian dan mengembalikan 201 atau 422:
  - [ ] nama 1–100 karakter,
  - [ ] id rekening harus ada di konfigurasi,
  - [ ] nominal opsional, berupa bilangan bulat > 0,
  - [ ] catatan opsional, maksimal 300 karakter.
- [ ] Form Konfirmasi Hadiah menampilkan pesan sukses setelah terkirim.
- [ ] Tes API: validasi setiap field dan id rekening yang tidak dikenal.
- [ ] E2E: tombol "Salin" menampilkan "Tersalin", dan Konfirmasi Hadiah berhasil dikirim.
