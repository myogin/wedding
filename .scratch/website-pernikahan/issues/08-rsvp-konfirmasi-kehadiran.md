# 08: RSVP: Tamu konfirmasi kehadiran

**What to build:** Tamu mengisi form RSVP yang namanya sudah terisi dari Link Tamu. Tamu memilih hadir atau tidak, memilih Acara dan jumlah orang, menulis Ucapan, lalu mengirim. Setelah itu tampil konfirmasi sukses, dan ringkasan kehadiran bertambah. Untuk sementara bagian ini dipasang sebagai act `flow` biasa. Penempatan akhirnya dikerjakan di tiket 15.

**Blocked by:** 01 (Fondasi: Sampul personal dari Link Tamu, berjalan di container)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Tabel `rsvp` dibuat sesuai spec. Kolom hash IP boleh ditambahkan nanti di tiket 11.
- [ ] Route handler Buku Tamu dibangun lewat factory `{ db, clock, kontenUndangan }`.
- [ ] `POST /api/rsvp` mengikuti aturan berikut dan mengembalikan 201 atau 422 dengan galat per field:
  - [ ] Bila `hadir`: minimal satu id Acara, semuanya ada di konfigurasi, dan pax 1..Batas Pax.
  - [ ] Bila `tidak_hadir`: id Acara kosong dan pax disimpan 0.
- [ ] `GET /api/rsvp/summary` mengembalikan total respons, jumlah hadir, jumlah tidak hadir, dan total pax.
- [ ] Perilaku form:
  - [ ] Nama terisi dari Link Tamu dan tetap bisa diubah.
  - [ ] Saat "Hadir" dipilih, muncul pemilih Acara dan jumlah orang 1..Batas Pax. Bila hanya ada satu Acara, Acara itu terpilih otomatis dan pemilihnya disembunyikan.
  - [ ] Saat "Tidak Hadir" dipilih, pemilih Acara dan jumlah orang disembunyikan.
  - [ ] Kolom Ucapan punya penghitung karakter (0/500) dan keterangan bahwa Ucapan akan tampil publik.
  - [ ] Galat per field tampil dalam bahasa Indonesia.
  - [ ] Tombol kirim nonaktif selama pengiriman.
  - [ ] Pesan sukses tampil setelah terkirim.
  - [ ] Pada kunjungan berikutnya di perangkat yang sama, tampil penanda "sudah mengirim" (dari localStorage).
- [ ] Label aksi utama di seluruh halaman: "Konfirmasi Kehadiran".
- [ ] Ringkasan tampil bila diaktifkan di konfigurasi, dan bertambah setelah RSVP dikirim.
- [ ] Perubahan tinggi bagian ini tidak menggeser posisi act yang di-pin.
- [ ] Tes API mencakup:
  - [ ] nama kosong atau lebih dari 100 karakter,
  - [ ] Ucapan lebih dari 500 karakter,
  - [ ] hadir tanpa Acara,
  - [ ] id Acara tak dikenal,
  - [ ] pax melebihi Batas Pax,
  - [ ] tidak hadir tersimpan dengan pax 0,
  - [ ] ringkasan bertambah setelah RSVP.
- [ ] E2E: nama terisi otomatis, pilihan jumlah orang 1..Batas Pax, dan setelah dikirim pesan sukses tampil serta ringkasan bertambah.
