# 04: Buka Undangan, lalu Hero berlapis + musik

**What to build:** Tamu menekan "Buka Undangan". Scroll terbuka, musik mulai diputar, dan Tamu masuk ke Hero berlapis yang bergerak berkedalaman saat di-scroll, di desktop maupun di ponsel.

**Blocked by:** 03 (Brief scroll-craft dan aset Hero)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Engine scroll-craft (JS + CSS) disalin tanpa diubah dan hanya dimuat di halaman Undangan. Markup act berupa HTML semantik yang di-render server dengan atribut `data-sc-*`.
- [ ] Sebelum "Buka Undangan" ditekan, isi Undangan tidak bisa di-scroll. Layar loading menampilkan persentase pemuatan aset kritis Hero.
- [ ] "Buka Undangan" membuka kunci scroll, memulai musik secara loop, lalu masuk ke Hero.
- [ ] Tombol musik bisa menjeda dan memutar lagi. Musik berhenti saat tab atau aplikasi disembunyikan, dan lanjut saat Tamu kembali, kecuali Tamu sendiri yang menjedanya.
- [ ] Hero sesuai rencana di tiket 03:
  - [ ] lapisan bergerak dengan laju berbeda,
  - [ ] nama Mempelai terbaca sepanjang gerakan,
  - [ ] poster fallback tampil bila ada lapisan yang gagal dimuat,
  - [ ] komposisi mobile dirancang terpisah,
  - [ ] mode reduced-motion menampilkan komposisi statis yang tetap berlapis, tanpa ruang scroll kosong.
- [ ] Tidak ada ikon atau petunjuk "scroll", dan klip scrub tidak bersuara.
- [ ] E2E (reduced-motion): setelah "Buka Undangan", isi bisa di-scroll dan tombol musik bisa men-toggle. Ditambah satu smoke test dengan gerakan penuh.
- [ ] Verifikasi Step 5 scroll-craft untuk Hero: screenshot desktop, 390×844, dan reduced-motion diambil, contact sheet dibaca, dan temuannya diperbaiki.
