# 09: Buku Tamu: daftar Ucapan

**What to build:** Tamu membaca Ucapan dari Tamu lain, mulai dari yang terbaru, dan bisa berpindah halaman. Ucapan yang baru dikirim langsung muncul paling atas.

**Blocked by:** 08 (RSVP: Tamu konfirmasi kehadiran)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] `GET /api/wishes?page=n` mengembalikan item (nama, kehadiran, ucapan, waktu dibuat), nomor halaman, dan total halaman.
  - [ ] 10 item per halaman, terbaru dulu.
  - [ ] Hanya RSVP yang ucapannya terisi dan tidak tersembunyi.
- [ ] Setiap Ucapan menampilkan nama, status kehadiran, isi Ucapan, dan waktu relatif dalam bahasa Indonesia ("2 jam lalu").
- [ ] Tombol "Sebelumnya" dan "Berikutnya" untuk berpindah halaman.
- [ ] Setelah RSVP berhasil dikirim, daftar kembali ke halaman 1 dan Ucapan baru tampil paling atas.
- [ ] Tes API:
  - [ ] Ucapan tampil terbaru dulu, dan paginasinya benar.
  - [ ] RSVP tanpa Ucapan tidak masuk daftar, tetapi tetap dihitung di ringkasan.
- [ ] E2E: setelah RSVP dikirim dengan Ucapan, Ucapan itu muncul paling atas.
