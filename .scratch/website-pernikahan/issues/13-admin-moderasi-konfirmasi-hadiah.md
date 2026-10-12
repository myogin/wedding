# 13: Admin: moderasi Ucapan, hapus RSVP, daftar Konfirmasi Hadiah

**What to build:** Mempelai bisa menyembunyikan Ucapan yang tidak pantas, menghapus RSVP ganda, dan melihat semua Konfirmasi Hadiah.

**Blocked by:** 09 (Buku Tamu: daftar Ucapan), 10 (Amplop Digital + Konfirmasi Hadiah), 12 (Admin: login, daftar RSVP, pax per Acara, CSV)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] `PATCH /api/admin/rsvps/:id` mengubah status tersembunyi. Ucapan yang disembunyikan hilang dari daftar publik, tetapi RSVP-nya tetap dihitung di ringkasan.
- [ ] `DELETE /api/admin/rsvps/:id` menghapus RSVP, sehingga RSVP itu hilang dari daftar Ucapan maupun ringkasan. Di UI, penghapusan meminta konfirmasi dulu.
- [ ] `GET /api/admin/gift-confirmations` dan tabelnya di halaman admin.
- [ ] Tes API: menyembunyikan, menampilkan kembali, menghapus, dan melihat daftar Konfirmasi Hadiah. Semua endpoint membalas 401 tanpa sesi.
- [ ] E2E: Ucapan yang disembunyikan di admin tidak lagi tampil di halaman publik.
