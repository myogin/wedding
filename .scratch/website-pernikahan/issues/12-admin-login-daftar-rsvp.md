# 12: Admin: login, daftar RSVP, pax per Acara, CSV

**What to build:** Mempelai masuk ke halaman admin dengan kata sandi. Di sana Mempelai melihat semua RSVP dengan filter, total pax per Acara untuk katering, dan bisa mengunduh RSVP dalam bentuk CSV.

**Blocked by:** 08 (RSVP: Tamu konfirmasi kehadiran)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Halaman `/admin` punya tampilan fungsional dan rapi, tanpa scroll-craft.
- [ ] `POST /api/admin/login` mencocokkan kata sandi dengan env. Bila cocok, server memasang cookie sesi httpOnly, Secure, SameSite=Lax yang ditandatangani HMAC dan berlaku 7 hari.
- [ ] Percobaan login dibatasi.
- [ ] `POST /api/admin/logout` menghapus sesi.
- [ ] Semua endpoint admin membalas 401 tanpa sesi yang valid.
- [ ] `GET /api/admin/rsvps` mendukung filter kehadiran, ikut menampilkan Ucapan yang tersembunyi, dan menyertakan total pax per Acara.
- [ ] `GET /api/admin/rsvps.csv` mengunduh CSV yang isinya sesuai data.
- [ ] Tes API:
  - [ ] tanpa sesi dibalas 401,
  - [ ] kata sandi salah ditolak,
  - [ ] kata sandi benar memberi akses,
  - [ ] filter kehadiran bekerja,
  - [ ] total pax per Acara benar,
  - [ ] isi CSV sesuai data.
- [ ] E2E: login, lalu tabel RSVP tampil.
