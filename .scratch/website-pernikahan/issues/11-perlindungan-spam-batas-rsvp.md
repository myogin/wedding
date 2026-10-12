# 11: Perlindungan: rate limit, honeypot, batas waktu RSVP

**What to build:** Buku Tamu terlindung dari spam dan bot, dan IP tamu tidak pernah disimpan mentah. RSVP otomatis tertutup setelah batas waktu yang diatur Mempelai, dan Tamu melihat bahwa RSVP sudah ditutup.

**Blocked by:** 08 (RSVP: Tamu konfirmasi kehadiran), 10 (Amplop Digital + Konfirmasi Hadiah)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] IP klien dibaca dari header yang dipasang proxy Easypanel (`X-Real-IP`, fallback ke `X-Forwarded-For`), mengikuti catatan dari tiket 02 bila sudah ada.
- [ ] IP di-hash dengan SHA-256 + salt rahasia dan tidak pernah disimpan mentah. Kolom hash IP ditambahkan di tabel `rsvp` dan `konfirmasi_hadiah`.
- [ ] Rate limit: lebih dari 5 kiriman per hash IP dalam 10 menit, untuk setiap jenis kiriman, dibalas 429. Form menampilkan pesan yang ramah.
- [ ] Kedua form punya field honeypot. Bila field itu terisi, server membalas 201, tetapi datanya tidak disimpan dan tidak muncul di daftar maupun ringkasan.
- [ ] Batas waktu RSVP:
  - [ ] Setelah batas waktu, `POST /api/rsvp` dibalas 409.
  - [ ] Di halaman, form diganti dengan pesan "RSVP sudah ditutup".
- [ ] Tes API dengan jam tetap:
  - [ ] kiriman ke-6 dalam 10 menit dibalas 429,
  - [ ] setelah jendela waktu lewat, kiriman diterima lagi,
  - [ ] honeypot menghasilkan sukses palsu yang tidak muncul di mana pun,
  - [ ] RSVP setelah batas waktu dibalas 409.
