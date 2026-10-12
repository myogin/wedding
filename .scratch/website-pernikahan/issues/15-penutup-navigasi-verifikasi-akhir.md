# 15: Penutup, navigasi cepat, pratinjau WhatsApp, verifikasi akhir

**What to build:** Halaman Undangan utuh dari Sampul sampai Penutup, sesuai journey dan score. RSVP, Buku Tamu, dan Amplop Digital ditempatkan di posisi akhirnya. Penutupnya tuntas, navigasi cepat tersedia, dan pratinjau link di WhatsApp rapi. Seluruh halaman sudah lolos verifikasi visual dan feel check scroll-craft.

**Blocked by:** 05 (Restu, Mempelai, dan kisah cinta), 06 (Hari H), 07 (Galeri + lightbox), 09 (Buku Tamu: daftar Ucapan), 10 (Amplop Digital + Konfirmasi Hadiah)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Act RSVP, Buku Tamu, dan Amplop Digital ditempatkan dan ditata sesuai journey dan score.
- [ ] Act Penutup (ucapan terima kasih) tuntas dan diam di layar, tidak memudar menjadi footer. Footer dibuat minimal.
- [ ] Navigasi mengikuti grammar terpilih dan memberi akses cepat ke Acara, RSVP, dan Hadiah.
- [ ] Metadata OG statis (judul, deskripsi, gambar) tersedia. Tag-nya dicek dengan mengambil halaman seperti yang dilakukan crawler.
- [ ] Verifikasi Step 5 scroll-craft untuk seluruh halaman:
  - [ ] screenshot desktop, 390×844, dan reduced-motion,
  - [ ] laporan dead scroll, opasitas cue, dan kontras ditinjau,
  - [ ] contact sheet dibaca,
  - [ ] urutan fokus dicek dengan Tab.
- [ ] Feel check: kurva yang dirasakan dibandingkan dengan BRIEF.md, dan bagian yang meleset diperbaiki.
- [ ] Baris build ditambahkan ke registri fingerprint.
- [ ] Daftar uji manual di ponsel sungguhan diserahkan ke Mempelai. Cakupannya iOS Safari, Android Chrome, serta browser bawaan WhatsApp dan Instagram, untuk: musik setelah ketukan, tombol salin, unduhan `.ics`, kehalusan scroll, dan pemutaran klip.
- [ ] E2E: navigasi cepat membawa Tamu ke RSVP.
- [ ] Seluruh suite E2E lulus terhadap image Docker produksi.
