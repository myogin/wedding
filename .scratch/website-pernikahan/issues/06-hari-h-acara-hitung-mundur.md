# 06: Hari H: hitung mundur, Acara, lokasi, Simpan Tanggal

**What to build:** Tamu melihat hitung mundur ke Acara target dan detail setiap Acara lengkap dengan zona waktunya. Tamu juga bisa membuka lokasi di Google Maps dan menyimpan Acara ke kalendernya.

**Blocked by:** 04 (Buka Undangan, lalu Hero berlapis + musik)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Hitung mundur (hari, jam, menit, detik) dihitung terhadap waktu mulai Acara target, termasuk zona waktunya.
  - [ ] Setelah Acara mulai, tampil "Acara sedang berlangsung".
  - [ ] Setelah waktu selesai, atau akhir hari itu bila waktu selesai tidak diisi, tampil "Acara telah berlangsung".
- [ ] Kartu setiap Acara menampilkan nama, hari dan tanggal (format `id-ID`), jam mulai, jam selesai atau "Selesai", label WIB/WITA/WIT, nama tempat, dan alamat.
- [ ] Tombol "Lihat Lokasi" membuka URL Google Maps Acara tersebut.
- [ ] Tombol "Simpan Tanggal" menyediakan tautan Google Calendar dan unduhan `.ics` untuk setiap Acara, dengan waktu dan zona waktu yang benar.
- [ ] Device setiap act sesuai score. Komposisi mobile dan mode reduced-motion tetap lengkap.
- [ ] E2E dengan `page.clock`: angka hitung mundur benar sebelum Acara, dan pesan yang tepat tampil setelah Acara mulai.
- [ ] E2E: file `.ics` terunduh dengan waktu Acara yang benar.
