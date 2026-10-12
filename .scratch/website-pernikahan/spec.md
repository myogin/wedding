# Spec: Website Undangan Pernikahan

Status: ready-for-agent
Category: enhancement

> Referensi: <https://groovepublic.com/agungayu/> (WordPress + Elementor + plugin WeddingPress)
> Tujuan utama: website yang **fancy dan elegan**.

## Glosarium

- **Undangan**: website satu halaman yang dibuka tamu.
- **Mempelai**: pasangan pemilik undangan, sekaligus satu-satunya **Admin**.
- **Konten Undangan**: semua data yang tampil di Undangan (nama, acara, galeri, rekening, musik, tema), disimpan dalam satu file konfigurasi bertipe.
- **Placeholder**: data atau aset contoh yang diambil dari website referensi dan harus diganti Mempelai sebelum go-live.
- **Tamu**: siapa pun yang membuka Undangan.
- **Link Tamu**: URL Undangan yang dipersonalisasi dengan parameter `to` (nama tamu), contohnya `/?to=Budi%20Santoso`.
- **Konteks Tamu**: hasil pembacaan Link Tamu, yaitu nama tamu (bisa kosong).
- **Sampul**: layar pembuka sebelum isi Undangan, berisi nama Tamu dan tombol "Buka Undangan".
- **Hero**: adegan pertama setelah Sampul dibuka. Adegan ini berlapis dan berkedalaman.
- **Acara**: satu rangkaian acara (mis. Akad/Pemberkatan, Resepsi), dengan waktu, zona waktu, dan lokasi.
- **RSVP**: konfirmasi kehadiran dari Tamu, boleh disertai **Ucapan**.
- **Ucapan**: pesan/doa dari RSVP yang ditampilkan publik di **Buku Tamu**.
- **Buku Tamu**: modul backend yang menyimpan RSVP, Ucapan, dan Konfirmasi Hadiah.
- **Amplop Digital**: daftar rekening tujuan hadiah (dan alamat kirim kado, opsional).
- **Konfirmasi Hadiah**: laporan dari Tamu bahwa ia sudah mengirim hadiah.
- **Pax**: jumlah orang yang datang dalam satu RSVP.
- **Batas Pax**: jumlah orang maksimum per RSVP. Berlaku sama untuk semua tamu dan diatur di konfigurasi.
- Istilah dari skill **scroll-craft**: *act*, *device*, *grammar*, *signature move*, *journey*, *feeling curve*, *peak*, *BRIEF.md*. Maknanya mengikuti skill tersebut.

## Problem Statement

Aku mau menikah dan ingin mengundang tamu lewat undangan digital yang benar-benar fancy dan elegan. Undangan itu harus terasa seperti pengalaman, bukan dokumen atau template yang dipakai ratusan pasangan lain. Tamu harus bisa:

- membuka link yang menyebut namanya,
- terpukau saat scroll,
- melihat detail acara dan lokasi,
- konfirmasi kehadiran beserta jumlah orang,
- menulis ucapan,
- mengirim hadiah lewat transfer.

Layanan undangan pihak ketiga seperti contoh dari groovepublic tampilannya seragam, mengunci data RSVP di platform mereka, dan meninggalkan branding mereka. Aku mau undangan milikku sendiri yang berjalan di server Easypanel-ku. Data RSVP-nya harus bisa kupakai untuk menghitung katering, dan link personal untuk ratusan tamu harus bisa kubuat cepat lalu kubagikan lewat WhatsApp.

## Solution

Website undangan satu halaman, mobile-first, dibangun dengan Next.js dan Postgres, dan di-deploy sebagai container di Easypanel. Pengalaman scroll-nya dirancang dan diverifikasi dengan skill **scroll-craft**.

- Tamu membuka Link Tamu (`/?to=Nama%20Tamu`). Sampul menampilkan namanya. Setelah menekan "Buka Undangan", musik mulai diputar dan Tamu masuk ke Hero berlapis yang bergerak berkedalaman saat di-scroll.
- Setelah Hero, setiap bagian punya perilaku scroll yang berbeda: ayat/kutipan, Mempelai, kisah cinta, hitung mundur dan Acara, galeri, RSVP dan Buku Tamu, Amplop Digital. Satu momen puncak dan satu signature move dibuat khusus untuk undangan ini. Penutupnya tuntas.
- Tampilan di ponsel dirancang tersendiri. Mode "kurangi gerakan" tetap menampilkan komposisi statis yang utuh.
- Form RSVP sudah terisi nama dari link. Jumlah orang dibatasi Batas Pax global. Ucapan yang dikirim langsung muncul di Buku Tamu.
- Semua konten ada di satu file konfigurasi yang divalidasi saat build. Isi awalnya Placeholder dari website referensi (foto, musik, font, ornamen, teks), jadi situs langsung terlihat utuh. Mempelai menggantinya nanti, dan build produksi mengingatkan Placeholder mana yang masih dipakai.
- Mempelai punya halaman admin berkata sandi untuk membuat Link Tamu (satuan atau massal) beserta teks WhatsApp, melihat dan mengekspor RSVP, menyembunyikan Ucapan, dan melihat Konfirmasi Hadiah.

## User Stories

### Tamu: Sampul dan pembukaan

1. Sebagai Tamu, aku ingin melihat namaku di Sampul, agar aku merasa diundang secara pribadi.
2. Sebagai Tamu yang membuka link tanpa nama, aku ingin melihat sapaan umum ("Bapak/Ibu/Saudara/i"), agar Undangan tetap pantas dibaca walau link-nya diteruskan orang lain.
3. Sebagai Tamu, aku ingin melihat nama kedua Mempelai dan tanggal pernikahan di Sampul, agar langsung tahu ini undangan siapa dan kapan.
4. Sebagai Tamu, aku ingin melihat catatan permohonan maaf bila ada salah penulisan nama atau gelar, agar aku memaklumi kalau namaku tertulis kurang tepat.
5. Sebagai Tamu, aku ingin menekan tombol "Buka Undangan" untuk masuk ke isi Undangan, agar rasanya seperti membuka undangan fisik.
6. Sebagai Tamu, aku ingin melihat layar loading dengan persentase saat aset dimuat, agar aku tidak melihat adegan yang setengah jadi.
7. Sebagai Tamu, aku ingin isi Undangan tidak bisa di-scroll sebelum aku menekan "Buka Undangan", agar urutan pembukaannya terjaga.

### Tamu: Pengalaman scroll (tujuan utama)

8. Sebagai Tamu, aku ingin Hero yang berlapis saat di-scroll: latar, Mempelai, ornamen depan, dan atmosfer bergerak dengan kecepatan berbeda. Dengan begitu Undangan terasa mewah sejak detik pertama.
9. Sebagai Tamu, aku ingin nama Mempelai di Hero tetap terbaca sepanjang gerakan, agar keindahannya tidak mengorbankan isi.
10. Sebagai Tamu, aku ingin setiap bagian berperilaku berbeda saat di-scroll, agar aku penasaran dengan bagian berikutnya dan Undangan tidak terasa seperti template.
11. Sebagai Tamu, aku ingin ada satu momen puncak yang paling berkesan, agar ada yang ingin kuceritakan ke orang lain.
12. Sebagai Tamu, aku ingin menemukan satu interaksi khas yang hanya ada di undangan ini (signature move), agar Undangan terasa dibuat khusus.
13. Sebagai Tamu di HP, aku ingin komposisi yang dirancang untuk ponsel, bukan versi desktop yang dikecilkan, agar tetap memukau di layar kecil.
14. Sebagai Tamu di HP, aku ingin gerakan yang halus dan terkendali saat scroll dengan jari, agar tidak terasa patah-patah atau melelahkan.
15. Sebagai Tamu yang mengaktifkan "kurangi gerakan", aku ingin komposisi statis yang tetap utuh dan berlapis, tanpa ruang scroll kosong atau konten yang tersembunyi, agar aku tetap menikmati Undangan tanpa pusing.
16. Sebagai Tamu, aku ingin penutup yang tuntas dan diam di layar, bukan memudar menjadi footer, agar rasa terima kasih Mempelai yang terakhir kubawa.

### Tamu: Musik dan navigasi

17. Sebagai Tamu, aku ingin musik latar mulai diputar setelah aku menekan "Buka Undangan", agar suasananya terasa dan tidak terblokir aturan autoplay browser.
18. Sebagai Tamu, aku ingin tombol untuk menjeda dan memutar lagi musik, agar aku bisa mematikannya di tempat umum.
19. Sebagai Tamu, aku ingin musik berhenti saat aku pindah tab atau aplikasi dan lanjut saat aku kembali, agar tidak mengganggu.
20. Sebagai Tamu, aku ingin bisa langsung lompat ke Acara, RSVP, dan Hadiah, agar tidak perlu scroll seluruh pengalaman saat aku hanya butuh info praktis.

### Tamu: Konten Undangan

21. Sebagai Tamu, aku ingin membaca salam pembuka dan kutipan/ayat, agar aku memahami makna pernikahan ini bagi Mempelai.
22. Sebagai Tamu, aku ingin melihat foto, nama lengkap dengan gelar, urutan anak, dan nama orang tua tiap Mempelai, agar aku mengenali keluarga yang mengundang.
23. Sebagai Tamu, aku ingin membuka Instagram tiap Mempelai, agar bisa mengikuti mereka.
24. Sebagai Tamu, aku ingin melihat hitung mundur (hari, jam, menit, detik) menuju Acara utama, agar aku tahu berapa lama lagi acaranya.
25. Sebagai Tamu yang membuka Undangan setelah Acara dimulai, aku ingin hitung mundur berganti menjadi pesan bahwa acara sedang atau telah berlangsung, agar tidak tampil angka nol yang membingungkan.
26. Sebagai Tamu, aku ingin melihat setiap Acara dengan hari, tanggal, jam mulai, jam selesai atau "Selesai", dan label zona waktu (WIB/WITA/WIT), agar aku tidak salah waktu.
27. Sebagai Tamu, aku ingin melihat nama tempat dan alamat lengkap setiap Acara, agar tahu harus ke mana.
28. Sebagai Tamu, aku ingin tombol "Lihat Lokasi" yang membuka Google Maps, agar bisa langsung bernavigasi.
29. Sebagai Tamu, aku ingin tombol "Simpan Tanggal" untuk menambahkan Acara ke kalenderku (Google Calendar atau file .ics), agar aku tidak lupa.
30. Sebagai Tamu, aku ingin membaca kisah cinta Mempelai, agar aku mengenal perjalanan mereka.
31. Sebagai Tamu, aku ingin melihat galeri foto prewedding, agar ikut menikmati momen mereka.
32. Sebagai Tamu, aku ingin mengetuk foto untuk memperbesarnya, menggeser ke foto berikutnya atau sebelumnya, lalu menutupnya, agar bisa melihat detail foto.

### Tamu: RSVP

33. Sebagai Tamu, aku ingin kolom nama di form RSVP sudah terisi dari link, agar tidak perlu mengetik ulang.
34. Sebagai Tamu, aku ingin tetap bisa mengubah nama di form RSVP, agar bisa membetulkan ejaan atau mengisi nama kalau link-nya tanpa nama.
35. Sebagai Tamu, aku ingin memilih "Hadir" atau "Tidak Hadir", agar Mempelai tahu kepastianku.
36. Sebagai Tamu yang hadir, aku ingin memilih Acara mana saja yang akan kudatangi, agar Mempelai bisa merencanakan tiap Acara.
37. Sebagai Tamu yang hadir, aku ingin memilih jumlah orang dari 1 sampai Batas Pax, agar Mempelai tahu berapa kursi yang perlu disiapkan.
38. Sebagai Tamu yang tidak hadir, aku tidak ingin diminta memilih Acara atau jumlah orang, agar form-nya singkat.
39. Sebagai Tamu, aku ingin menulis Ucapan dan doa dengan penghitung karakter (maks. 500), agar tahu sisa ruang yang ada.
40. Sebagai Tamu, aku ingin tahu bahwa Ucapanku akan tampil publik, agar aku menulis dengan pantas.
41. Sebagai Tamu, aku ingin pesan kesalahan yang jelas dalam bahasa Indonesia saat isian tidak valid, agar tahu apa yang harus diperbaiki.
42. Sebagai Tamu, aku ingin tombol kirim nonaktif selama pengiriman, agar tidak sengaja mengirim dua kali.
43. Sebagai Tamu, aku ingin melihat konfirmasi sukses setelah mengirim RSVP, agar yakin datanya sudah diterima.
44. Sebagai Tamu yang membuka link lagi di perangkat yang sama, aku ingin diberi tahu bahwa aku sudah pernah mengirim RSVP, agar tidak mengirim ulang tanpa sengaja.
45. Sebagai Tamu, aku ingin melihat ringkasan konfirmasi (total respons, hadir, tidak hadir, total tamu), agar tahu seberapa ramai acaranya.
46. Sebagai Tamu yang membuka Undangan setelah batas RSVP, aku ingin melihat bahwa RSVP sudah ditutup, agar tidak mengisi form yang tidak akan diproses.

### Tamu: Buku Tamu

47. Sebagai Tamu, aku ingin membaca Ucapan Tamu lain dengan nama, status kehadiran, dan waktu relatif ("2 jam lalu"), urut dari yang terbaru, agar ikut merasakan kebahagiaannya.
48. Sebagai Tamu, aku ingin berpindah halaman Ucapan dengan tombol "Sebelumnya" dan "Berikutnya", agar halaman tidak terlalu panjang.
49. Sebagai Tamu, aku ingin Ucapanku langsung muncul paling atas setelah terkirim, agar yakin Ucapanku tersampaikan.

### Tamu: Amplop Digital

50. Sebagai Tamu, aku ingin melihat rekening tujuan hadiah (bank, nomor, nama pemilik), agar bisa mengirim hadiah dari jauh.
51. Sebagai Tamu, aku ingin menyalin nomor rekening dengan sekali ketuk dan melihat tanda "Tersalin", agar tidak salah ketik.
52. Sebagai Tamu, aku ingin melihat alamat pengiriman kado fisik bila Mempelai menyediakannya, agar bisa mengirim kado lewat kurir.
53. Sebagai Tamu, aku ingin mengisi Konfirmasi Hadiah (nama, rekening tujuan, nominal opsional, catatan opsional), agar Mempelai tahu hadiah itu dariku.

### Tamu: Kualitas pengalaman

54. Sebagai Tamu yang membuka link dari WhatsApp atau Instagram, aku ingin Undangan berjalan normal di browser bawaan aplikasi itu, agar tidak perlu pindah ke browser lain.
55. Sebagai Tamu di jaringan seluler, aku ingin Undangan cepat dimuat (gambar dioptimasi, aset berat dimuat belakangan), agar tidak lama menunggu.
56. Sebagai Tamu yang menerima link di WhatsApp, aku ingin pratinjau link menampilkan foto Mempelai, judul, dan tanggal, agar langsung tahu isinya.
57. Sebagai Tamu pengguna pembaca layar atau keyboard, aku ingin foto punya teks alternatif, urutan fokus yang masuk akal, dan lightbox/modal yang bisa ditutup dengan Esc, agar Undangan bisa kuakses.

### Mempelai: Konten

58. Sebagai Mempelai, aku ingin mengisi semua Konten Undangan di satu file konfigurasi, agar mengubah isi tidak perlu menyentuh kode tampilan.
59. Sebagai Mempelai, aku ingin build gagal dengan pesan jelas jika ada data wajib yang kosong atau formatnya salah, agar Undangan yang rusak tidak pernah ter-deploy.
60. Sebagai Mempelai, aku ingin situs langsung terisi Placeholder dari website referensi, agar bisa melihat hasil akhirnya utuh sebelum aset kami sendiri siap.
61. Sebagai Mempelai, aku ingin build produksi menampilkan daftar Placeholder yang masih dipakai, agar tidak ada foto atau nama pasangan lain yang terkirim ke tamu kami.
62. Sebagai Mempelai, aku ingin mengatur jumlah dan urutan Acara, termasuk Acara mana yang jadi target hitung mundur, agar sesuai rangkaian acara kami.
63. Sebagai Mempelai, aku ingin mengatur palet warna dan font lewat konfigurasi, agar Undangan sesuai selera kami.
64. Sebagai Mempelai, aku ingin mengganti musik latar lewat konfigurasi, agar bisa memakai lagu pilihan kami.
65. Sebagai Mempelai, aku ingin menyalakan atau mematikan bagian opsional (kisah cinta, alamat kado, ringkasan RSVP publik), agar Undangan hanya menampilkan yang kami mau.
66. Sebagai Mempelai, aku ingin mengatur batas waktu RSVP, agar data katering bisa dikunci sebelum acara.
67. Sebagai Mempelai, aku ingin mengatur Batas Pax, agar tidak ada RSVP dengan jumlah orang yang tidak masuk akal.

### Mempelai: Admin

68. Sebagai Mempelai, aku ingin masuk ke halaman admin dengan kata sandi, agar data RSVP tidak bisa dilihat orang lain.
69. Sebagai Mempelai, aku ingin membuat satu Link Tamu dari sebuah nama, agar bisa mengundang orang secara personal.
70. Sebagai Mempelai, aku ingin menempelkan daftar nama (satu per baris) lalu mendapat tabel Link Tamu, agar bisa menyiapkan ratusan undangan sekaligus.
71. Sebagai Mempelai, aku ingin menyalin teks undangan WhatsApp lengkap dengan Link Tamu, atau langsung membuka WhatsApp dengan teks itu, agar mengirimnya cepat.
72. Sebagai Mempelai, aku ingin mengatur template teks undangan WhatsApp, agar bahasanya sesuai keinginan kami.
73. Sebagai Mempelai, aku ingin melihat semua RSVP dengan filter hadir atau tidak hadir, agar tahu siapa saja yang datang.
74. Sebagai Mempelai, aku ingin melihat total pax per Acara, agar bisa memesan katering dan kursi.
75. Sebagai Mempelai, aku ingin mengekspor RSVP ke CSV, agar bisa diolah di spreadsheet atau dikirim ke WO.
76. Sebagai Mempelai, aku ingin menyembunyikan Ucapan yang tidak pantas tanpa menghapus data kehadirannya, agar Buku Tamu tetap bersih dan hitungan tetap akurat.
77. Sebagai Mempelai, aku ingin menghapus RSVP ganda, agar hitungan tamu tidak membengkak.
78. Sebagai Mempelai, aku ingin melihat daftar Konfirmasi Hadiah, agar bisa mencocokkan transfer dan berterima kasih.

### Mempelai: Keamanan dan operasional

79. Sebagai Mempelai, aku ingin pengiriman RSVP dan Konfirmasi Hadiah dibatasi per pengirim dan dilindungi dari bot, agar Buku Tamu tidak dibanjiri spam.
80. Sebagai Mempelai, aku ingin percobaan login admin dibatasi, agar kata sandi tidak bisa ditebak terus-menerus.
81. Sebagai Mempelai, aku ingin alamat IP tamu tidak disimpan mentah, agar privasi tamu terjaga.
82. Sebagai Mempelai, aku ingin men-deploy Undangan ke server Easypanel-ku sebagai container, dengan Postgres di server yang sama dan domainku sendiri ber-HTTPS, agar semuanya milikku dan biayanya terkendali.
83. Sebagai Mempelai, aku ingin migrasi database berjalan otomatis saat container dinyalakan, agar deploy cukup sekali klik.
84. Sebagai Mempelai, aku ingin ada health check, agar Easypanel tahu dan bisa me-restart aplikasi yang bermasalah.

## Implementation Decisions

### Prioritas pengerjaan

1. **Fondasi.** Proyek Next.js, Konten Undangan dengan Placeholder dari referensi, container Docker, dan Postgres.
2. **Pengalaman Undangan (tujuan utama).** Sampul, Hero berlapis, dan semua bagian konten, dibangun dan diverifikasi dengan scroll-craft.
3. **Buku Tamu.** RSVP, Ucapan, Amplop Digital, dan Konfirmasi Hadiah.
4. **Admin.**

### Stack

- Next.js (App Router, TypeScript), full-stack dalam satu repo. Route handler menjadi API.
- Postgres, diakses lewat Drizzle ORM dengan migrasi yang di-versioning.
- Zod untuk validasi, dengan skema yang dipakai bersama oleh form di client dan API di server.
- UI berbahasa Indonesia dengan locale `id-ID` untuk format tanggal, angka, dan rupiah.

### Deploy: Easypanel

- Next.js dibangun dengan output `standalone` dan dikemas dalam Dockerfile multi-stage. Easypanel membangun image dari repo Git (atau dari image yang di-push) sebagai service **App** dengan port 3000.
- Postgres berjalan sebagai service Postgres Easypanel di project yang sama. Aplikasi terhubung lewat hostname internal Easypanel, dan database tidak diekspos ke publik.
- Domain dan HTTPS diatur di Easypanel (reverse proxy Traefik dengan sertifikat Let's Encrypt).
- Entrypoint container menjalankan migrasi Drizzle (idempoten) sebelum server mulai.
- Endpoint health check `GET /api/health` mengembalikan 200 bila aplikasi dan koneksi database sehat. Endpoint ini dipakai sebagai health check di Easypanel.
- `sharp` disertakan agar optimasi gambar `next/image` berjalan di server sendiri. Aset statis dan gambar diberi header cache panjang, karena tidak ada CDN.
- IP klien dibaca dari header yang dipasang reverse proxy Easypanel (`X-Real-IP`, fallback ke `X-Forwarded-For`). Header dari klien tidak dipercaya langsung.
- Environment variable diatur di Easypanel: URL database, kata sandi admin, secret penanda tangan sesi, salt hash IP, dan URL publik situs.
- Pengembangan lokal dan tes memakai docker compose (app + Postgres) yang meniru susunan service di Easypanel.

### Modul 1: Konten Undangan

- Satu file konfigurasi bertipe menjadi satu-satunya sumber Konten Undangan. Tidak ada CMS. Untuk mengubah konten: edit file, lalu deploy ulang.
- Isinya:
  - Mempelai: nama panggilan, nama lengkap dengan gelar, urutan anak, nama ayah dan ibu, Instagram, foto.
  - Salam pembuka dan kutipan/ayat (teks asli opsional, terjemahan, sumber).
  - Daftar Acara: id, nama, waktu mulai, waktu selesai (opsional, kalau kosong tampil "Selesai"), zona waktu IANA, nama tempat, alamat, URL Google Maps.
  - Id Acara target hitung mundur.
  - Kisah cinta (opsional): daftar tanggal, judul, cerita, dan foto.
  - Galeri: daftar foto dengan teks alternatif.
  - Lapisan Hero: plate latar, potongan subjek beralpha, foreground, atmosfer, dan poster fallback, untuk desktop dan mobile.
  - Amplop Digital: daftar rekening (id, nama bank, nomor, nama pemilik) dan alamat kado opsional.
  - Musik: berkas audio dan judul.
  - Tema: enam warna dan dua font, dipetakan ke token `--sc-*` scroll-craft.
  - Pengaturan RSVP: batas waktu, Batas Pax (default 2), tampilkan ringkasan publik atau tidak.
  - Template teks WhatsApp.
  - Metadata pratinjau link (judul, deskripsi, gambar OG).
- Konfigurasi divalidasi dengan skema Zod saat build. Data tidak valid membuat build gagal dengan pesan yang menunjuk field-nya.
- **Placeholder dari referensi.** Isi awal diambil dari halaman referensi: nama dan gelar Mempelai, orang tua, ayat, Acara, alamat, foto Sampul/Mempelai/galeri, musik latar, ornamen, dan font.
  - Pengecualian: nomor rekening memakai nomor dummy yang jelas palsu, bukan rekening asli pasangan referensi, supaya tidak ada tamu yang salah transfer.
  - Setiap Placeholder ditandai di konfigurasi.
  - Build produksi mencetak peringatan berisi daftar Placeholder yang masih aktif. Build tetap jalan, supaya situs bisa di-preview di Easypanel.

### Modul 2: Konteks Tamu

- Fungsi murni: query string → `{ namaTamu | null }`. Nilai `to` di-decode, di-trim, dan dipotong maksimal 100 karakter. Kosong berarti `null`, dan Sampul memakai sapaan umum.
- Link Tamu hanya berisi `to`. Tidak ada parameter `max` maupun jatah per tamu. Pilihan jumlah orang selalu 1..Batas Pax.
- Halaman di-render statis, dan Konteks Tamu dibaca di client. Layar loading menutupi Sampul sampai Konteks Tamu terbaca, jadi tidak ada kilatan nama.

### Modul 3: Buku Tamu (modul dalam, di balik HTTP API)

- Satu modul backend yang mengurus RSVP, Ucapan, Konfirmasi Hadiah, ringkasan, moderasi, rate limit, dan honeypot. Route handler hanya menjadi lapisan tipis di atasnya.
- Route handler dibangun lewat factory yang menerima dependensi `{ db, clock, kontenUndangan }`. Produksi memakai yang asli, sedangkan tes menyuntikkan jam tetap dan konten fixture.
- Skema data:
  - `rsvp`: id (uuid), nama (1–100), kehadiran (`hadir` | `tidak_hadir`), daftar id Acara, pax (int), ucapan (≤ 500, opsional), tersembunyi (bool, default false), hash IP, waktu dibuat.
  - `konfirmasi_hadiah`: id, nama (1–100), id rekening, nominal (bilangan bulat rupiah, opsional, > 0), catatan (≤ 300, opsional), hash IP, waktu dibuat.
  - Hash IP = SHA-256 dari IP + salt rahasia. IP mentah tidak pernah disimpan.
- Ucapan bukan entitas terpisah. Ucapan adalah RSVP yang kolom ucapannya terisi dan tidak tersembunyi.
- Kontrak API publik:
  - **Kirim RSVP** — `POST /api/rsvp`. Body: nama, kehadiran, id Acara, pax, ucapan, field honeypot.
    - Aturan bila `hadir`: minimal satu id Acara, semuanya harus ada di konfigurasi, dan pax 1..Batas Pax.
    - Aturan bila `tidak_hadir`: id Acara kosong dan pax disimpan 0.
    - Bila hanya ada satu Acara, client otomatis memilihnya dan pemilih Acara disembunyikan.
    - Respons: 201 berisi RSVP yang tersimpan, 422 berisi galat per field, 409 bila lewat batas waktu RSVP, 429 bila kena rate limit.
  - **Ringkasan** — `GET /api/rsvp/summary` → total respons, jumlah hadir, jumlah tidak hadir, total pax. Ucapan yang disembunyikan tetap dihitung.
  - **Daftar Ucapan** — `GET /api/wishes?page=n` → item (nama, kehadiran, ucapan, waktu dibuat), halaman, total halaman. 10 per halaman, terbaru dulu, yang tersembunyi tidak ikut.
  - **Kirim Konfirmasi Hadiah** — `POST /api/gift-confirmations`. Body: nama, id rekening (harus ada di konfigurasi), nominal opsional, catatan opsional, honeypot. Respons: 201 / 422 / 429.
- Kontrak API admin (semua 401 tanpa sesi admin):
  - Login: `POST /api/admin/login`. Kata sandi dicocokkan dengan env. Bila cocok, server memasang cookie sesi httpOnly, Secure, SameSite=Lax yang ditandatangani HMAC dan berlaku 7 hari. Percobaan login dibatasi.
  - Logout: `POST /api/admin/logout`.
  - Daftar RSVP: `GET /api/admin/rsvps`, dengan filter kehadiran. Termasuk yang tersembunyi, plus total pax per Acara.
  - Ekspor CSV: `GET /api/admin/rsvps.csv`.
  - Moderasi Ucapan: `PATCH /api/admin/rsvps/:id` dengan field tersembunyi.
  - Hapus RSVP: `DELETE /api/admin/rsvps/:id`.
  - Daftar Konfirmasi Hadiah: `GET /api/admin/gift-confirmations`.
- Rate limit: maksimal 5 kiriman per hash IP per 10 menit per jenis kiriman, dihitung dari baris di database (tanpa infrastruktur tambahan). Kalau lewat, respons 429.
- Honeypot: kalau field tersembunyi terisi, server membalas 201 seolah sukses tetapi tidak menyimpan apa pun.
- Tidak ada deduplikasi RSVP di server, karena nama tamu tidak unik. Duplikat ditangani lewat penghapusan di admin, ditambah penanda "sudah mengirim" di localStorage browser.

### Modul 4: Halaman Undangan, dibangun dengan scroll-craft

Agent pelaksana **wajib memanggil skill `scroll-craft`** dan mengikuti seluruh prosesnya:
- Step 0: brief, lalu `BRIEF.md`.
- Journey.
- Grammar.
- Signature move.
- Fingerprint gate.
- Feeling curve dan peak.
- Score table.
- Aset.
- Build.
- Step 5: verifikasi.

Workspace scroll-craft (BRIEF.md, registri fingerprint, hasil screenshot) disimpan di dalam repo ini.

**Brief yang sudah diketahui** (masukan untuk Step 0, tidak perlu ditanyakan ulang):
- Vibe, kata-kata Mempelai sendiri: "tujuan utama adalah membuat web fancy dan elegan".
- Referensi: undangan groovepublic di atas, untuk struktur isi dan nuansa. Tampilannya tidak perlu disalin.
- Aset: Placeholder dari website referensi (foto prewedding, foto Mempelai, musik, ornamen, font). Route utamanya aset sendiri, jadi kie.ai tidak wajib. Generasi kie.ai hanya dipakai bila `KIE_AI_API_KEY` tersedia dan sebuah device memang butuh klip atau plate yang tidak bisa dibuat dari foto.
- Satu aksi utama di seluruh halaman: **"Konfirmasi Kehadiran"** (RSVP). Labelnya sama di mana pun aksi itu muncul.
- Kalimat yang harus diyakini Tamu di akhir: "Kehadiran dan doamu berarti bagi kami."
- Usulan journey, boleh diperbaiki di Step 0:
  1. **Undangan.** Namamu di Sampul, lalu pintu terbuka.
  2. **Restu.** Ayat dan doa. Hening dan khidmat.
  3. **Kami.** Mempelai dan kisah cinta. Intim dan hangat.
  4. **Hari H.** Hitung mundur, Acara, dan lokasi. Antisipasi, informasi praktis yang jelas.
  5. **Kenangan.** Galeri. Senang dan kagum.
  6. **Hadir.** RSVP, Buku Tamu, dan Amplop Digital. Partisipasi.
  7. **Terima kasih.** Penutup yang tuntas dan diam di layar.
- **Belum diputuskan.** Pertanyaan berikut diajukan ke Mempelai di Step 0 scroll-craft:
  - energy curve
  - perasaan per tahap dan satu momen puncak
  - benih signature move
  - rentang estetika (mis. premium-minimal atau editorial)
  - satu dunia yang menyambung atau adegan-adegan terpisah

**Keputusan integrasi dengan Next.js:**
- Engine scroll-craft (JS + CSS) disalin ke proyek tanpa diubah dan hanya dimuat di halaman Undangan. Markup act ditulis sebagai HTML semantik yang di-render server, dengan atribut `data-sc-*`. Signature move ditulis sebagai kode halaman sendiri yang digerakkan oleh `--sc-p` dan atribut `data-sc-*` milik proyek, bukan dengan mengedit engine.
- Bagian interaktif menjadi client component di dalam act `flow`: Sampul, tombol musik, form RSVP, Buku Tamu, modal Amplop Digital, lightbox galeri, dan hitung mundur. Komponen ini tidak boleh me-render ulang act saat scroll, karena scroll sepenuhnya milik engine.
- Konten yang tingginya berubah setelah dimuat (daftar Ucapan, ringkasan, pesan sukses) tidak boleh menggeser posisi act yang di-pin. Caranya: cadangkan tingginya, atau letakkan setelah act ber-pin terakhir.
- Sampul adalah gerbang sebelum engine mulai bekerja. "Buka Undangan" membuka kunci scroll, memulai musik, lalu masuk ke Hero. Musik hanya berasal dari tombol musik ini dan diputar setelah gestur Tamu. Klip scrub tidak pernah bersuara.
- Hero memenuhi standar kedalaman scroll-craft, dibuat dari foto Placeholder:
  - plate latar yang bersih,
  - potongan Mempelai beralpha asli,
  - foreground (bunga/ornamen) dan atmosfer,
  - titik kontak yang tetap menempel,
  - nama Mempelai tetap terbaca,
  - poster fallback yang utuh,
  - komposisi mobile yang dirancang terpisah.
- Navigasi mengikuti grammar yang dipilih, tetapi harus memberi akses cepat ke Acara, RSVP, dan Hadiah.
- Aturan keras scroll-craft berlaku juga untuk teks dan tata letak undangan:
  - tanpa ikon atau petunjuk "scroll",
  - tanpa penomoran bagian `01 / 06`,
  - eyebrow paling banyak satu per tiga bagian,
  - tanpa em dash di teks yang terlihat,
  - perataan teks bervariasi (tidak semua rata tengah),
  - tanpa teks gradien atau glow neon,
  - animasi hanya `transform`/`opacity`/`clip-path`,
  - hanya angka nyata (hitung mundur dan ringkasan RSVP memenuhi syarat ini).
- Fungsi per bagian tetap sesuai user stories: hitung mundur menuju Acara target dengan zona waktunya, "Simpan Tanggal" (Google Calendar dan unduhan `.ics`), lightbox galeri (geser, sebelumnya/berikutnya, Esc, focus trap, kunci scroll body), dan modal Amplop Digital (tombol salin dengan fallback, lalu form Konfirmasi Hadiah).
- Metadata OG statis (tidak dipersonalisasi per tamu) agar pratinjau WhatsApp konsisten.

### Modul 5: Admin

- Halaman admin di bawah `/admin`, dilindungi sesi admin. Tampilannya fungsional dan rapi, tanpa scroll-craft.
- Pembuat Link Tamu berjalan sepenuhnya di client dan tidak menyimpan daftar tamu.
  - Input satuan: satu nama.
  - Input massal: daftar nama, satu per baris.
  - Keluaran: tabel URL `?to=` yang ter-encode, tombol salin teks WhatsApp (template dengan placeholder nama dan link), dan tombol `wa.me` yang membuka WhatsApp dengan teks terisi.
- Tampilan RSVP: tabel dengan filter, total pax per Acara, tombol sembunyikan/tampilkan Ucapan, hapus (dengan konfirmasi), dan unduh CSV.
- Tampilan Konfirmasi Hadiah: tabel saja.

## Testing Decisions

- Tes yang baik hanya menguji perilaku eksternal melalui seam, yaitu status HTTP, isi respons, efeknya pada pembacaan berikutnya, dan apa yang terlihat Tamu di browser. Tes tidak mengintip baris database atau memanggil fungsi internal secara langsung.
- **Seam 1: HTTP API Buku Tamu** (Vitest).
  - Route handler dipanggil dengan objek `Request`/`Response` web standar. Handler dibangun lewat factory dengan Postgres tes sungguhan (docker compose, migrasi diterapkan, tabel dikosongkan per tes), jam tetap, dan konten fixture.
  - Mencakup:
    - Validasi RSVP: nama, panjang ucapan, aturan hadir/tidak hadir, id Acara tak dikenal, pax melebihi Batas Pax.
    - RSVP setelah batas waktu → 409.
    - Kirim RSVP lalu daftar Ucapan memuatnya paling atas, dan ringkasan bertambah.
    - Paginasi Ucapan.
    - RSVP tanpa ucapan tidak muncul di daftar Ucapan tetapi dihitung di ringkasan.
    - Ucapan yang disembunyikan admin hilang dari daftar tetapi tetap dihitung, sedangkan RSVP yang dihapus hilang dari keduanya.
    - Rate limit → 429.
    - Honeypot: sukses palsu dan tidak muncul di mana pun.
    - Konfirmasi Hadiah: validasi rekening, lalu muncul di daftar admin.
    - Endpoint admin → 401 tanpa sesi. Login salah ditolak, login benar memberi akses.
    - Isi CSV sesuai data.
    - Health check → 200 saat database terhubung.
- **Seam 2: browser** (Playwright, viewport ponsel 390×844 dan desktop).
  - Dijalankan terhadap image Docker produksi yang sama dengan yang di-deploy ke Easypanel (docker compose app + Postgres), dengan konten fixture.
  - **Tes fungsional** dijalankan dengan `reducedMotion: 'reduce'` supaya deterministik, ditambah satu smoke test dengan gerakan penuh.
  - Skenario:
    - `/?to=Budi%20Santoso`: Sampul menampilkan "Budi Santoso". Setelah "Buka Undangan", isi bisa di-scroll dan tombol musik bisa men-toggle.
    - Form RSVP terisi "Budi Santoso" dengan pilihan jumlah orang 1..Batas Pax. Setelah dikirim, pesan sukses tampil, Ucapan muncul paling atas, dan ringkasan bertambah.
    - Tanpa `to`: sapaan umum tampil.
    - Hitung mundur diuji dengan jam yang dikendalikan (`page.clock`), sebelum dan sesudah Acara.
    - "Simpan Tanggal" mengunduh `.ics` berisi waktu Acara yang benar.
    - Tombol salin menampilkan "Tersalin".
    - Lightbox galeri terbuka, bisa pindah foto, dan tertutup dengan Esc.
    - Navigasi cepat membawa ke RSVP.
    - Admin: login, membuat Link Tamu massal, menyembunyikan Ucapan, lalu Ucapan itu hilang di halaman publik.
  - **Verifikasi visual** mengikuti Step 5 scroll-craft dan menjadi syarat sebelum deploy.
    - Harness screenshot dijalankan di desktop, mobile 390×844, dan reduced-motion.
    - Harness memeriksa dead scroll, cue yang tidak pernah mencapai opasitas penuh, dan kontras di frame paling terang.
    - Contact sheet dibaca langsung.
    - Feel check membandingkan kurva yang dirasakan dengan BRIEF.md.
    - Urutan fokus dicek dengan Tab.
- **Uji di ponsel sungguhan** dilakukan manual sebelum link dibagikan: iOS Safari, Android Chrome, dan browser bawaan WhatsApp/Instagram. Headless Chrome tidak bisa meniru decoder video, autoplay audio, Low Power Mode, maupun scroll sentuh di iPhone.
- Logika murni (Konteks Tamu, pembuat `.ics`, hitung mundur) diuji lewat dua seam di atas, bukan lewat seam tambahan. Validasi Konten Undangan cukup dibuktikan oleh kegagalan build.
- Prior art: belum ada karena repo masih kosong. Tes-tes ini menjadi konvensi pertama proyek.

## Out of Scope

- Jatah jumlah orang per tamu, baik lewat parameter link maupun daftar tamu di server. Yang ada hanya Batas Pax global.
- Multi-tenant atau builder undangan untuk pasangan lain. Satu repo = satu Undangan.
- CMS atau editor konten di admin. Konten diubah lewat file konfigurasi lalu deploy ulang.
- Database daftar tamu, pelacakan siapa yang sudah membuka link, dan Link Tamu bertanda tangan.
- Pengiriman WhatsApp otomatis (blast/API). Hanya tautan `wa.me` yang dibuka manual.
- Notifikasi email atau WhatsApp ke Mempelai saat ada RSVP.
- Payment gateway, QRIS dinamis, atau verifikasi transfer otomatis.
- Live streaming, protokol kesehatan, check-in QR atau penukaran suvenir di lokasi acara.
- Undangan multi-bahasa. Hanya bahasa Indonesia.
- Hosting serverless/Vercel dan CDN. Target deploy hanya Easypanel.
- Membeli lisensi font atau musik. Selama fase Placeholder, aset referensi dipakai apa adanya.

## Further Notes

- **Placeholder wajib diganti sebelum link dikirim ke tamu.** Foto dan identitas Placeholder adalah milik pasangan sungguhan. Musik dan beberapa font referensi berlisensi untuk groovepublic. Peringatan saat build produksi menjadi pengingatnya.
- Data asli yang perlu disiapkan Mempelai:
  - nama lengkap dan gelar kedua Mempelai serta orang tua
  - rangkaian Acara (tanggal, jam, zona waktu, lokasi, link Maps)
  - kutipan/ayat pilihan
  - foto prewedding (termasuk foto yang cocok dipotong menjadi lapisan Hero)
  - kisah cinta
  - rekening dan alamat kado
  - lagu
  - palet warna dan font
  - template teks WhatsApp
  - batas waktu RSVP dan Batas Pax
- Saat foto Placeholder diganti, lapisan Hero (plate latar dan potongan beralpha) harus dibuat ulang dari foto baru. Verifikasi visual Step 5 scroll-craft juga harus dijalankan ulang.
- Nomor rekening dan Ucapan memang publik. Form RSVP perlu menyebutkan bahwa Ucapan akan ditampilkan.
- Aktifkan backup otomatis service Postgres di Easypanel sebelum link mulai dibagikan, karena data RSVP tidak bisa dibuat ulang.
