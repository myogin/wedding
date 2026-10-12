# 14: Admin: pembuat Link Tamu + WhatsApp

**What to build:** Mempelai membuat Link Tamu, satu per satu atau massal dari daftar nama. Untuk setiap tamu, Mempelai bisa menyalin teks undangan WhatsApp beserta link-nya, atau langsung membuka WhatsApp dengan teks itu.

**Blocked by:** 12 (Admin: login, daftar RSVP, pax per Acara, CSV)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Input satu nama menghasilkan URL dengan `?to=` yang ter-encode, berdasarkan URL publik situs.
- [ ] Input massal (satu nama per baris, baris kosong diabaikan, nama di-trim) menghasilkan tabel Link Tamu.
- [ ] Teks WhatsApp memakai template dari konfigurasi, dengan placeholder untuk nama dan link.
- [ ] Setiap baris punya tombol salin teks dan tombol `wa.me` yang membuka WhatsApp dengan teks terisi.
- [ ] Tidak ada daftar tamu yang disimpan di server.
- [ ] E2E: tiga nama massal menghasilkan tiga link, dan membuka salah satu link menampilkan nama yang benar di Sampul.
