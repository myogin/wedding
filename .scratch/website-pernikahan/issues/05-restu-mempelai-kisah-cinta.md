# 05: Restu, Mempelai, dan kisah cinta

**What to build:** Setelah Hero, Tamu membaca salam pembuka dan ayat. Lalu Tamu berkenalan dengan kedua Mempelai (foto, nama lengkap bergelar, urutan anak, orang tua, Instagram) dan membaca kisah cinta mereka. Setiap bagian punya perilaku scroll sesuai score.

**Blocked by:** 04 (Buka Undangan, lalu Hero berlapis + musik)

**Status:** done

**Category:** enhancement

- [x] Device setiap act sesuai score dari tiket 03.
- [x] Semua data diambil dari Konten Undangan. Kisah cinta tidak di-render bila dimatikan di konfigurasi.
- [x] Tautan Instagram tiap Mempelai membuka profilnya di tab baru.
- [x] Setiap foto punya teks alternatif.
- [x] Aturan keras scroll-craft dipatuhi: perataan teks bervariasi, tanpa em dash, tanpa penomoran bagian, tanpa teks gradien atau glow.
- [x] Komposisi mobile dan mode reduced-motion tetap lengkap.
- [x] Screenshot Step 5 untuk act-act ini dibaca, dan temuannya diperbaiki.

## Comments

**Implementasi (branch `tiket-05-restu-mempelai`, ditumpuk di atas tiket 04):**

- **Restu** (`src/komponen/restu.tsx`): act `flow` + `in`, satu-satunya act rata tengah.
  - Dibuka dengan hening ±0,3 layar.
  - Salam menjadi judul act, lalu ayat datang baris demi baris (`data-sc-stagger` 80 ms), terjemahan, dan sumber.
  - Foto penutup masuk redup dan menghangat saat terlihat.
- **Kami** (`src/komponen/kami.tsx`): `pin` + `reveal`, span 1.6.
  - Potret pria dibuka dari kiri (p 0–0.5), wanita dari kanan (p 0.45–0.95). Teks menyusul di tengah jendelanya, di sisi seberang potret.
  - Bingkai potret sudah terlihat padam sejak panggung masuk.
  - Ponsel: zigzag dua baris. Layar ≥ 3:2: satu baris, teks bertemu di tengah.
  - Instagram dibuka di tab baru (`noopener noreferrer`), dengan label "Instagram {panggilan} (@nama)".
- **Kisah Cinta** (`src/komponen/kisah-cinta.tsx`): act `pan` opsional, hanya dirender bila `kisahCinta` diisi.
  - Span otomatis dari panjang rel, dihitung ulang (engine dipasang ulang) saat lebar layar berubah.
  - Placeholder tidak punya kisah cinta, jadi bagian ini tidak tampil sekarang. Tampilannya diverifikasi dengan tiga babak contoh sementara di server dev (ponsel, desktop, gerakan dikurangi), lalu datanya dikembalikan. Buktinya ada di `lab/verifikasi-kisah-contoh.jpg`.
  - Tes E2E kisah cinta hanya menjalankan cabang "tidak diisi" selama konten Placeholder dipakai; cabang "diisi" akan berjalan otomatis begitu Mempelai mengisi `kisahCinta`.
  - Kisah cinta sebagai act opsional (3b, perasaan "Tersentuh") adalah keputusan *didelegasikan*; BRIEF dan RENCANA sudah diselaraskan.
- **Signature move, bagian stasiun:**
  - Act mendapat `data-menyala` saat progres ≥ 0.25.
  - Media `.media-redup` menghangat saat terlihat setelah stasiunnya menyala.
  - Untaian lentera (navigasi) tetap di tiket 15.
- **Konten:** `Gambar.fokus` opsional (titik potong foto). Semua foto punya alt dari Konten Undangan; lapisan potret padam bersifat dekoratif (`alt=""`).
- **E2E** `e2e/restu-mempelai.spec.ts` (gerakan dikurangi):
  - Restu lengkap dan terlihat (opasitas 1);
  - kedua Mempelai dengan orang tua, foto ber-alt, dan tautan Instagram;
  - Instagram membuka tab baru ke profil yang benar;
  - kisah cinta hanya tampil bila diisi.
  - Helper bersama dipindah ke `e2e/bantuan.ts`.
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - Foto Restu tidak lagi ikut `in`, karena BRIEF menyebut tidak ada yang bergerak selain teks.
  - Bahasa teks asli dipindah ke Konten Undangan (`kutipan.bahasaAsli`), ditambah `dir="auto"`. Key baris ayat dibuat unik.
  - Span otomatis dihitung ulang saat lebar layar berubah.
  - Lentera stasiun membaca `--sc-p`, bukan struktur internal engine. Logika engine dan lentera dipisah ke `mesin-scroll.ts` dan `lentera-stasiun.ts`.
  - Tautan Instagram bisa diketuk di mode gerak dikurangi.
  - Tanggal kisah tidak lagi berupa eyebrow.
  - Perbedaan pria/wanita di Kami menjadi satu peta `PERAN`, ditambah komponen `FotoTerpotong` bersama.
  - Lantai yang menghangat (§3.3) diserahkan ke tiket 15 di RENCANA §9.
- **Verifikasi Step 5** (ponsel, desktop, gerakan dikurangi): tidak ada dead scroll, semua kontras lulus. Temuan yang diperbaiki:
  1. Panggung Kami kosong selama geser masuk. Kini ada lapisan potret padam.
  2. Dead scroll p 0.8–1.0 di Kami. Jendela wipe digeser.
  3. Potret ponsel terlalu lebar, nama terpotong. Kini 40vw.
  4. Nama di desktop terpotong. Ukurannya diturunkan.
  5. Rel kisah pendek di desktop menghabiskan scroll panjang. Kini span otomatis.
  6. Tepi putih foto pria Placeholder. Kini `fokus`.

