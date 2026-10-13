# 09: Buku Tamu: daftar Ucapan

**What to build:** Tamu membaca Ucapan dari Tamu lain, mulai dari yang terbaru, dan bisa berpindah halaman. Ucapan yang baru dikirim langsung muncul paling atas.

**Blocked by:** 08 (RSVP: Tamu konfirmasi kehadiran)

**Status:** done

**Category:** enhancement

- [x] `GET /api/wishes?page=n` mengembalikan item (nama, kehadiran, ucapan, waktu dibuat), nomor halaman, dan total halaman.
  - [x] 10 item per halaman, terbaru dulu.
  - [x] Hanya RSVP yang ucapannya terisi dan tidak tersembunyi.
- [x] Setiap Ucapan menampilkan nama, status kehadiran, isi Ucapan, dan waktu relatif dalam bahasa Indonesia ("2 jam lalu").
- [x] Tombol "Sebelumnya" dan "Berikutnya" untuk berpindah halaman.
- [x] Setelah RSVP berhasil dikirim, daftar kembali ke halaman 1 dan Ucapan baru tampil paling atas.
- [x] Tes API:
  - [x] Ucapan tampil terbaru dulu, dan paginasinya benar.
  - [x] RSVP tanpa Ucapan tidak masuk daftar, tetapi tetap dihitung di ringkasan.
- [x] E2E: setelah RSVP dikirim dengan Ucapan, Ucapan itu muncul paling atas.

## Comments

**Implementasi:**

- **`GET /api/wishes?page=n`** (`src/server/buku-tamu.ts` → `daftarUcapan`, handler di `src/server/api-buku-tamu.ts`, route `src/app/api/wishes/route.ts`):
  - Mengembalikan `{ item: [{ nama, kehadiran, ucapan, dibuat }], halaman, totalHalaman }`, dengan 10 item per halaman, terbaru dulu. Urutan yang sama-sama dibuat pada saat yang sama dipecah dengan `id`, jadi paginasinya stabil.
  - Hanya RSVP yang ucapannya terisi dan tidak tersembunyi. Ucapan berisi spasi saja sudah disimpan kosong sejak tiket 08.
  - `totalHalaman` paling sedikit 1, juga saat belum ada Ucapan. Halaman sesudah halaman terakhir berisi kosong.
  - `page` bawaannya 1. Nilai yang bukan bilangan bulat 1..999999 (termasuk `?page=` kosong) dibalas 400.
  - `Cache-Control: no-store`. Kontraknya ada di `src/buku-tamu/ucapan.ts`.
- **Buku Tamu di act Hadir** (`src/komponen/daftar-ucapan.tsx`), di bawah form. Di layar ≥ 900px selebar act, dalam dua kolom yang terisi per baris (terbaru di kiri atas), supaya urutan terbaru dulu tetap terbaca.
  - Setiap Ucapan menampilkan nama, status kehadiran ("Hadir"/"Tidak Hadir", label yang sama dengan pilihan form), waktu relatif, dan isinya dalam `blockquote`. Baris baru dari Tamu dipertahankan.
  - Waktu relatif ditulis sendiri ("baru saja", "5 menit lalu", "2 jam lalu", "3 hari lalu", lalu minggu, bulan, tahun), karena `Intl.RelativeTimeFormat` menghasilkan "2 jam yang lalu" atau "5 mnt lalu" dan berbeda antarbrowser. Dihitung saat daftar dirender, tidak diperbarui terus.
  - "Sebelumnya"/"Berikutnya" dengan posisi "1 dari 2". Keduanya tidak tampil bila hanya ada satu halaman. Halaman lama tetap tampil selama halaman berikutnya dimuat, dan hanya permintaan terakhir yang dipakai.
  - Setelah pindah halaman, fokus pindah ke judul, yang juga menyebut halamannya untuk pembaca layar ("Buku Tamu halaman 2 dari 3").
  - Keadaan kosong: "Belum ada Ucapan. Jadilah yang pertama menitipkan doa." Gagal dimuat: pesan, dan halaman lama tetap tampil.
- **Setelah RSVP terkirim**, Buku Tamu kembali ke halaman 1 (bersama ringkasan yang dimuat ulang). `src/komponen/isi-hadir.tsx` kini menyusun ringkasan, RSVP, dan Buku Tamu; `rsvp.tsx` tetap memegang form, pesan sukses, dan penanda "sudah mengirim".
- **Tinggi:** Buku Tamu dimuat saat halaman terhidrasi, selama layar loading masih menutupi. Tinggi yang berubah saat pindah halaman diukur ulang oleh `mesin-scroll.ts` (tiket 08). Hadir masih sesudah act ber-pin terakhir. Satu halaman Buku Tamu ±1.9 layar di ponsel, jadi act Hadir kini ±3 layar; tiket 15 mengukur panjang total.
- **Tes API** `tests/api/buku-tamu.test.ts` (berkas tes API Buku Tamu, dulu `rsvp.test.ts`), 6 tes baru:
  - terbaru dulu dan paginasi 12 Ucapan;
  - bentuk item;
  - RSVP tanpa Ucapan tidak masuk daftar tetapi dihitung di ringkasan;
  - daftar kosong;
  - halaman sesudah yang terakhir;
  - `page` tidak valid.
  - Jam fixture kini bisa dimajukan per tes. Filter urutan, filter Ucapan kosong, dan `totalHalaman` minimal 1 sudah dicek bisa merah dengan mematikannya.
  - Filter **tersembunyi belum teruji**, karena belum ada cara menyembunyikan Ucapan lewat API. Tiket 13 menambahkan tesnya.
- **Tes E2E** `e2e/hadir.spec.ts` (dulu `rsvp.spec.ts`), describe "Buku Tamu":
  - Skenario spec: setelah RSVP dengan Ucapan, pesan sukses tampil, Ucapan muncul paling atas, dan ringkasan bertambah. Karena proyek ponsel dan desktop mengirim Ucapan ke database yang sama secara paralel, Ucapan tes ini (bertoken unik) diperiksa berada di atas Ucapan yang teratas sebelum dikirim, bukan harus di baris pertama.
  - Dengan `/api/wishes` tiruan dan jam yang dibekukan:
    - nama, status, isi, dan waktu relatif ("baru saja", "2 jam lalu", "3 hari lalu");
    - Sebelumnya/Berikutnya dan fokus ke judul;
    - kembali ke halaman 1 setelah RSVP;
    - gagal memuat halaman;
    - keadaan kosong.
  - Hasil: E2E 121 lulus + 1 dilewati terhadap image produksi; Vitest 27/27.
- **Verifikasi Step 5** (desktop, ponsel 390×844, gerakan dikurangi, terhadap image produksi): tidak ada dead scroll, semua kontras lulus (isi Ucapan 15.5:1, meta 8.2:1). Harness kini juga mengukur `blockquote`. Temuan yang diperbaiki: "Halaman 1 dari 2" terlipat di ponsel, jadi kini "1 dari 2" (kata "Halaman" hanya untuk pembaca layar); jarak antar-Ucapan di ponsel dirapatkan.
- **Code review** (dua sumbu) sudah ditindaklanjuti:
  - dua kolom per baris, bukan `columns` (Ucapan ke-6 sebelumnya sejajar dengan Ucapan pertama);
  - pesan saat pindah halaman gagal;
  - pengumuman ganda (`aria-live` ditambah fokus) diganti posisi halaman di judul;
  - label kehadiran disatukan (`LABEL_KEHADIRAN`);
  - `Rsvp` kembali memegang state-nya sendiri;
  - `waktuRelatif` dipindah ke komponen daftar;
  - pengambil JSON dipakai bersama;
  - nama dan idiom dirapikan.
- **Diterima apa adanya:** jumlah dan isi halaman diambil dengan dua kueri terpisah, jadi `totalHalaman` bisa sesaat tidak cocok saat ada kiriman bersamaan.
