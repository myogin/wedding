# RENCANA: Undangan Pernikahan

Rencana halaman hasil tahap perencanaan scroll-craft (tiket 03). Brief, feeling curve, dan peak ada di [BRIEF.md](BRIEF.md). File ini menjadi sumber tiket 04–07 dan 15. Angka koreografi Hero sama persis dengan konstanta `KOREOGRAFI` di [alat/simulasi-hero.mjs](alat/simulasi-hero.mjs).

## 1. Journey

Usulan spec dipakai. Kisah cinta adalah bagian opsional dari stasiun Kami (3b, tiket 05): konten Placeholder tidak punya kisah cinta, jadi saat ini tidak tampil.

| # | Tahap | Yang berubah pada tamu |
|---|---|---|
| 0 | Sampul (gerbang, bukan act) | Tahu dirinya diundang, secara pribadi |
| 1 | Gerbang | Melihat siapa yang mengundang, dan merasakan acaranya |
| 2 | Restu | Memahami makna pernikahan ini bagi mereka |
| 3 | Kami | Mengenal kedua Mempelai dan keluarganya |
| 3b | Kisah Cinta (opsional) | Mengenal perjalanan mereka sampai hari ini |
| 4 | Hari H | Tahu kapan dan di mana, lalu bisa menyimpannya |
| 5 | Kenangan | Ikut menikmati momen mereka |
| 6 | Hadir | Konfirmasi, menulis ucapan, mengirim hadiah |
| 7 | Terima kasih | Pulang dengan rasa dihargai |

## 2. Grammar: **Prosesi berlentera** (grammar baru)

Halaman ini adalah prosesi melewati stasiun-stasiun sebuah villa yang temaram. Setiap stasiun menyala saat tamu tiba, dan cahayanya tetap menyala.

- **Cocok untuk**: upacara atau undangan, ketika tamu diterima lalu diantar berurutan, dan kehadirannya adalah inti pesan.
- **Rasanya saat di-scroll**: diantar dengan cahaya lentera. Setiap stasiun berawal dari gelap. Cahaya terkumpul di sepanjang perjalanan, jadi halaman makin hangat makin ke bawah.
- **Navigasi**: **untaian lentera**, satu-satunya chrome di halaman. Lentera kecil per stasiun, berderet tegak di tepi kanan pada layar ≥ 900px dan mendatar di tepi bawah pada ponsel. Lentera padam sebelum stasiunnya didatangi, menyala setelahnya, dan bisa diketuk untuk melompat ke stasiun itu. Tidak ada bar atas, wordmark, maupun tombol di bar.
- **Hero**: gerbang yang awalnya padam. Gestur tamu sendiri ("Buka Undangan") yang menyalakan lentera, lalu scroll membawa kamera masuk ke adegan berlapis.
- **Penutup**: semua lentera menyala, ditambah lentera milik tamu dengan namanya. Halaman berhenti dalam keadaan terang. CTA penutup adalah menyalakan lenteramu sendiri, yaitu "Konfirmasi Kehadiran".
- **Dilarang**:
  - bar atas atau wordmark + CTA,
  - penomoran bagian,
  - crossfade gambar ke gambar antarstasiun (setiap stasiun masuk dari gelap),
  - `spotlight` dan cahaya yang mengikuti pointer (cahaya milik perjalanan, bukan kursor),
  - `magnet`,
  - `scrub` (dunia ini foto diam bercahaya lentera, dan kamera yang memutar film merusak heningnya upacara),
  - `drift` kontinu (lantai halaman menghangat bertahap tiap lentera menyala, bukan diinterpolasi per scroll),
  - lentera yang padam lagi (sekali menyala, tetap menyala walau di-scroll ke atas),
  - teks rata tengah di semua act.
- **Bersandar pada**: `parallax` (lapisan Hero), `pin` pendek, `reveal`, `pan`, `flow` + `in`, `kinetic` satu kali, dan status cahaya buatan sendiri yang digerakkan dari JS halaman.

### Mengapa tujuh grammar lain kalah

| Grammar | Alasan kalah |
|---|---|
| Filmic one-shot | Melarang navigasi lompat dan urutan yang terlihat, padahal tamu harus bisa langsung ke Acara, RSVP, dan Hadiah (US 20). Tumpuannya `scrub` juga tidak punya footage. |
| Chaptered editorial | Kandidat terdekat, karena undangan memang tradisi cetak. Tetapi Hero-nya berupa halaman judul tanpa media di atas lipatan, dan media hanya boleh di kolom. Aset terkuat (foto Mempelai di lorong berlentera) jadi terkubur, dan latar kertas melawan dunia malam. |
| Live surface | Tidak ada produk yang dioperasikan. Form RSVP adalah bagian dari undangan, bukan intinya. |
| Continuous world | Wajib worldflight dengan klip berantai, sementara tidak ada footage, kunci generasi, maupun ffmpeg. Lagi pula undangan bukan perjalanan melintasi geografi. |
| Typographic poster | Melarang latar fotografis, padahal foto adalah aset utamanya. |
| Gallery / catalog | Pertanyaan tamu bukan "apa saja pilihannya". Galeri hanya satu stasiun. |
| Split stage | Dua kolom pria dan wanita memang menggoda, tetapi grammar ini butuh sisi yang menang di akhir. Pernikahan tidak punya pemenang, dan isi bersama (Acara, RSVP, Amplop) tidak bisa dibelah dua. |
| Rhythmic cutlist | Bahasa energi dan denyut, kebalikan dari elegan dan khidmat. |

## 3. Signature move: **Lentera yang menyala**

Diturunkan dari benih "undangan yang mulai dari gelap, dan kehadiranmu yang menyalakannya". Ditulis sebagai kode halaman sendiri. Engine tidak diubah.

1. **Untaian lentera.** Sembilan kait: delapan stasiun (Undangan, Restu, Kami, Hari H, Kenangan, Hadir, Hadiah, Terima kasih) ditambah satu kait kosong di ujung untuk lentera tamu. "Hadiah" adalah jangkar di dalam act Hadir.
2. **Menyala saat tiba.**
   - Pertama kali act sebuah stasiun mencapai progres ≥ 0.25, lenteranya menyala dengan nyala api pendek (±600 ms, `opacity` dan `transform` saja).
   - Lentera Undangan menyala saat "Buka Undangan" ditekan.
   - Status ini bertahan selama kunjungan (scroll ke atas tidak memadamkannya) dan dimulai lagi dari gelap saat halaman dimuat ulang.
3. **Ruangan ikut terang.**
   - `--terang` = jumlah lentera menyala dibagi 8. Lantai halaman berpindah bertahap dari `#0E0B09` ke paling hangat `#1A130D`, dengan transisi `background-color` 1,2 s per langkah, tidak per scroll.
   - Media di setiap act masuk dalam keadaan redup, lalu menghangat saat stasiunnya menyala. Ini perubahan `opacity` satu kali pada lapisan gelap milik media itu sendiri, bukan overlay layar penuh.
4. **Lentera tamu.**
   - Setelah RSVP berhasil (hadir maupun tidak hadir, karena doa juga dihitung), lentera ke-9 bertuliskan nama tamu digantung di kait kosong dan menyala lebih lambat (±1,6 s).
   - Status ini disimpan bersama penanda "sudah mengirim" di localStorage, jadi lenteranya sudah tergantung saat tamu kembali.
5. **Penutup.**
   - Untaian ditampilkan besar dan mendatar di act Terima kasih. Lentera tamu adalah yang paling terang, dengan baris "Kehadiran dan doamu berarti bagi kami."
   - Kalau tamu belum RSVP, kait ke-9 kosong dan CTA "Konfirmasi Kehadiran" membawanya ke form.
6. **Aksesibilitas dan gerak.**
   - Untaian adalah `<nav aria-label="Navigasi undangan">` berisi tautan jangkar dengan fokus terlihat dan `aria-current` pada stasiun saat ini. Status menyala diumumkan lewat teks tersembunyi "sudah dilewati".
   - Di bawah `prefers-reduced-motion`, tidak ada nyala api maupun kedip. Status berganti dengan fade `opacity` 200 ms, dan semua fungsi tetap ada.
   - Di ponsel, untaian setinggi 44 px di atas safe area, dan tidak boleh menutupi tombol form.

## 4. Fingerprint gate

Registri (`scrollcraft/FINGERPRINTS.md`) masih **kosong**, jadi tidak ada baris yang harus dilampaui. Gate lulus secara definisi.

Baris yang direncanakan berikut ditambahkan ke registri **setelah halaman rampung (tiket 15)**, bukan sekarang:

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| undangan | Prosesi berlentera (baru) | Untaian lentera: satu lentera per stasiun, menyala saat tiba, bisa dilompati, plus kait lentera tamu | Penyalaan oleh ketukan, lalu dolly-in lapisan (latar/subjek/depan) dalam `pin`. Desktop berupa jendela cahaya tegak yang memudar ke gelap, ponsel full-bleed | 7 act: pin(3.0) · flow · pin+reveal(1.6) · flow · pan(2.4) · flow · pin+kinetic(1.4), ±13.3vh termasuk flow alami (8 act bila kisah cinta diisi: + pan otomatis sesudah Kami) | Untaian penuh menyala, lentera bernama milik tamu paling terang, CTA = menyalakan lenteramu | Lentera tamu: RSVP menggantung lentera bernama tamu yang tetap menyala | Low-key cinematic, foto sendiri | Next.js 3000 / E2E 3100 |

## 5. Score

| # | Act | Device | Span | Anchor teks | Mengapa device ini |
|---|---|---|---|---|---|
| 1 | Gerbang | `pin` + `parallax` (lapisan) + status cahaya | **3.0** | Desktop: kiri (kolom gelap di samping jendela cahaya). Ponsel: pita bawah | Peak. Perbedaan laju antarlapisan memberi kedalaman tanpa video, dan pin memberi ruang bagi kamera untuk "melangkah masuk". |
| 2 | Restu | `flow` + `in` (baris ayat bergiliran 80 ms) | alami ±1.1 | **Tengah** (satu-satunya act rata tengah) | Khidmat butuh diam. Pin di sini akan terasa seperti menahan tamu, padahal yang diperlukan ruang bernapas. |
| 3 | Kami | `pin` + `reveal` (potret pria dari kiri, wanita dari kanan) | 1.6 | Split: teks di sisi berlawanan dengan potretnya | Wipe adalah perubahan keadaan: dari orang asing menjadi wajah yang dikenal, dari dekat. |
| 3b | Kisah Cinta *(opsional, hanya bila `kisahCinta` diisi)* | `pan` (babak-babak kisah, judul act sebagai item pertama) | otomatis dari panjang rel | Kiri | Ditambahkan di tiket 04/05. Menyamping terasa seperti menyusuri waktu. Diletakkan setelah Kami supaya urutan family tetap pin → pan → flow. Perasaan: **Tersentuh**. |
| 4 | Hari H | `flow` + `in`, hitung mundur hidup (buatan sendiri) | alami ±1.2 | Kiri | Informasi praktis harus ringkas. Hitung mundur bukan `count`, karena itu jam yang berdetak, bukan angka yang dihitung naik. |
| 5 | Kenangan | `pan` (10 foto; judul act sebagai item pertama, catatan penutup sebagai item terakhir) | 2.4 | Judul di item pertama rail | Gerak menyamping terasa seperti berjalan menyusuri ruangan. |
| 6 | Hadir | `flow` + `in` (RSVP, Buku Tamu, Amplop) | alami ±2.6 | Kolom kiri | Form dan daftar adalah bagian administratif, jadi tidak di-pin. |
| 7 | Terima kasih | `pin` + `kinetic` (satu baris, per baris) + cue tahan | 1.4 | Kanan (trail) | Halaman berhenti dan menahan. Cue terakhir satu nilai, jadi layar akhir tetap berisi. |

Pengecekan sebelum build:

- [x] Larangan grammar dipatuhi: tidak ada `scrub`, `spotlight`, `magnet`, bar atas, penomoran, maupun `drift` kontinu.
- [x] Lebih dari empat device family: pin, parallax, flow+in, reveal, pan, kinetic (6).
- [x] Tidak ada family yang sama berurutan: pin → flow → pin → flow → pan → flow → pin. Dengan kisah cinta: pin → flow → pin → **pan** → flow → pan → flow → pin, tetap lulus (dua `pan` dipisah Hari H).
- [x] Paling banyak dua `scrub`: tidak ada sama sekali.
- [x] Tidak ada dua act bersebelahan dengan perasaan yang sama (lihat BRIEF).
- [x] Peak punya span terbesar dengan jarak yang jelas: 3.0 lawan 2.4. Sebelum peak ada keheningan (Sampul).
- [x] Panjang total ±13.3vh, di luar pita 13.6–13.8. Flow alami harus diukur ulang di tiket 15; kalau mendekati pita, pendekkan Kami atau Kenangan. Kisah cinta (bila diisi) menambah panjang sesuai relnya; tiket 15 mengukur keduanya, dengan dan tanpa kisah.

## 6. Palet dan tipografi

Usulan ini menggantikan Placeholder di `tema` Konten Undangan (diterapkan di tiket 04).

| Peran | Warna | Kontras terukur |
|---|---|---|
| canvas | `#0E0B09`, menghangat bertahap sampai `#1A130D` | |
| surface | `#18120E` | |
| ink | `#F2E9DD` | 16.3:1 di canvas, 15.3:1 di canvas paling hangat |
| ink-soft | `#BBA990` | 8.6:1 di canvas, 8.0:1 di canvas paling hangat, 8.1:1 di surface |
| accent (api lentera) | `#E3A857` | 9.4:1 di canvas |
| accent-ink | `#1B1208` | 8.8:1 di accent |

- **Display: Bodoni Moda.** Huruf Didone adalah huruf tradisi kartu undangan cetak bergrafir, dan diambil dari referensi.
- **Teks: Jost**, menggantikan Poppins. Poppins adalah huruf bawaan hampir semua template undangan digital Indonesia, padahal template persis yang ingin dihindari. Jost dari garis Futura, yang berpasangan klasik dengan Didone di editorial mode. Tiket 04 menambahkannya ke pilihan font.
- Aturan copy:
  - tanpa em dash di teks yang terlihat,
  - eyebrow paling banyak satu per tiga act (hanya "Pernikahan" di Sampul),
  - tanpa petunjuk scroll,
  - label aksi selalu "Konfirmasi Kehadiran".

## 7. Kontrak lapisan Hero

Semua lapisan berada di **ruang bingkai foto 1400×2100** dan diskalakan dari **titik kontak kaki** (`hero.json` → `subjek.kontak`). Dengan begitu Mempelai tetap berpijak di lantai yang sama.

| Lapisan | Aset | Gerak (p = progres act 0→1) | Aturan kontak / oklusi |
|---|---|---|---|
| Latar jauh | `latar.webp` / `latar-gelap.webp`: lorong dengan Mempelai dihapus, lubangnya diisi push-pull | Skala 1→1.10 (ponsel), 1→1.25 (desktop) | Tidak ada Mempelai dobel. Isian lubang selalu tertutup subjek, karena skala relatif subjek/latar ≥ 1.03. |
| Atmosfer belakang | Pendar CSS di koordinat `hero.json` → `lentera` (radial, `mix-blend-mode: screen`) | `opacity` 0→1 saat penyalaan, kedip pelan ±3% (mati di reduced motion) | Ikut skala latar |
| Teks | `<h1>` nama Mempelai | Stabil (1x) | Desktop: di kolom gelap kiri, tanpa scrim. Ponsel: pita bawah dengan scrim pita. Nama utuh selalu terbaca. |
| Subjek | `subjek.webp` / `subjek-gelap.webp`, alpha asli dari Apple Vision | Skala 1.03→1.16 (ponsel), 1.03→1.33 (desktop) | Titik kontak kaki = titik asal transform |
| Depan dekat | `depan-sedap-malam.webp` / `-gelap`, blur dan gelap (di luar cahaya) | Lebar 56% (ponsel) / 40% (desktop) lebar viewport. Turun 0→50% (ponsel) / 55% (desktop) tinggi viewport, skala 1→1.25, keluar layar sebelum p=1 | Hanya di sudut kanan bawah. Tidak pernah menutupi `<h1>` atau tombol. Di ponsel berada di atas scrim pita teks, di luar kolom teks (tiket 04: pada 78% buket tenggelam di scrim). Tepi kiri potongannya dipudarkan di CSS karena buket terpotong di tepi itu. |
| Atmosfer depan | Kabut hangat dan debu (CSS, tanpa aset) | Melayang pelan, berhenti saat di luar layar | Tidak memucatkan foto |

- **Desktop = jendela cahaya.** Bingkai setinggi 1.12× viewport, pusatnya di 62% lebar, tepinya memudar ke canvas dengan `mask-image`: 20% di kiri dan kanan, 12% di atas dan bawah. Hasilnya lorong terang di ruangan gelap, dengan kolom kiri yang gelap untuk nama.
- **Ponsel = full-bleed.** Bingkai di-cover ke viewport pada `fokus.x`. Tinggi bingkai muat penuh di 390×844, jadi lentera di atas dan kaki di bawah sama-sama terlihat.
- **Pembukaan, tengah, dan akhir.**
  - Gelap: Sampul memakai `poster-gelap`.
  - Ketukan "Buka Undangan": latar dan subjek gelap memudar ke versi terang selama ±1,2 s dan pendar lentera menyala bergiliran.
  - p 0→1: kamera "melangkah masuk", sedap malam lewat dan keluar, nama tetap di tempatnya.
  - Keluar: lepas pin ke Restu yang hampir hitam.
- **Keadaan statis (reduced motion)**: lapisan terang di posisi p=0, tetap berlapis (latar, subjek, dan sedap malam diam di posisi p=0), tanpa ruang pin tambahan. Tanpa JavaScript, Undangan tidak dibuka sama sekali: layar loading menampilkan pesan untuk mengaktifkan JavaScript (keputusan tiket 01), karena Sampul personal dan RSVP butuh JavaScript.
- **Poster** (`poster.webp`, `poster-gelap.webp`): komposit latar dan subjek di ruang bingkai yang sama. Diposisikan dengan rumus yang sama seperti lapisan, sehingga tidak ada lompatan saat lapisan selesai dimuat. Semua lapisan dimuat bersamaan sebelum poster diganti.

Bukti visual (dihasilkan alat, tidak di-commit kecuali dua lembar ini):
- `lab/lembar-lapisan.jpg`: setiap lapisan di atas papan catur. Alpha, versi gelap, dan poster sudah diperiksa.
- `lab/simulasi-hero.jpg`: komposit ponsel dan desktop pada gelap, p=0, p=0.5, dan p=1. Tidak ada subjek dobel, lubang terbuka, maupun kaki melayang. Tepi jendela desktop memudar.

## 8. Membangun ulang aset Hero

Jalankan setiap kali `sampul.jpg` (atau sumber sedap malam) diganti. Semua dijalankan dari root repo di macOS 14+, tanpa layanan luar.

```bash
B=scrollcraft/builds/undangan
# 1. Masker subjek (Apple Vision, lokal). Ambil latar-depan-semua.png sebagai masker.
swift $B/alat/masker-vision.swift public/placeholder/sampul.jpg $B/lab/masker
cp $B/lab/masker/latar-depan-semua.png $B/masker/sampul.png
# 2. Masker sedap malam dari potongannya (potongan diambil dari mempelai-pria.jpg, x 975 y 1010, 360×820).
swift $B/alat/masker-vision.swift $B/aset-asli/sedap-malam-crop.jpg $B/lab/masker-bunga
cp $B/lab/masker-bunga/latar-depan-semua.png $B/masker/sedap-malam.png
# 3. Lapisan, poster, hero.json
node $B/alat/buat-lapisan-hero.mjs
# 4. Bukti visual
node $B/alat/lembar.mjs $B/lab/lembar-lapisan.jpg 560 public/placeholder/hero/*.webp
node $B/alat/simulasi-hero.mjs
```

Periksa kedua lembar sebelum dipakai. Untuk foto baru:
- `isiPushPull` hanya aman kalau subjek selalu lebih besar dari lubangnya.
- Konstanta `BIBIR_VAS` hanya berlaku untuk potongan sedap malam yang sekarang.

## 9. Catatan untuk tiket berikutnya

- **04**:
  - Sampul diganti dari foto terang ke `poster-gelap`, dan penyalaannya terjadi saat "Buka Undangan" ditekan.
  - Tambahkan `hero` ke skema Konten Undangan supaya path `/placeholder/hero/` terdeteksi sebagai Placeholder.
  - Terapkan palet dan Jost.
  - Engine disalin dari folder build ini tanpa diubah.
- **05–07**: device dan anchor mengikuti tabel score. Media setiap act masuk redup lalu menghangat saat stasiunnya menyala.
  - **Sudah ada sejak tiket 05** (di `rangka-undangan.tsx`):
    - `data-menyala` pada act saat progresnya pertama kali ≥ 0.25. Hero memakai `data-menyala-saat-dibuka`.
    - `data-hangat` pada `.media-redup` saat media itu ≥ 40% terlihat dan stasiunnya sudah menyala.
    - `data-span-statis` (span saat gerakan dikurangi).
    - `data-span-otomatis` pada act `pan`: span dihitung dari panjang rel, 1,1 px scroll per 1 px geseran. Kenangan (tiket 07) sebaiknya memakainya juga, karena 2.4 tetap terlalu panjang atau terlalu pendek tergantung lebar layar.
  - **Kami di ponsel:** dua baris zigzag. Di layar ≥ 3:2, satu baris: potret di dua sisi luar, teks bertemu di tengah. Bingkai potret sudah terlihat dalam keadaan padam sejak panggung masuk, supaya geser masuk tidak kosong.
  - **Fokus foto:** `Gambar` punya `fokus` opsional untuk titik potong. Placeholder pria memakai `{ x: 1 }` karena tepi kirinya putih.
- **08–10**: act `flow` biasa, sudah sesuai score (Hadir). Lentera tamu digantung saat RSVP berhasil (bisa disusulkan di tiket 15).
- **15**: untaian lentera, penutup, ukur panjang total, Step 5 penuh, feel check terhadap BRIEF, lalu tambahkan baris fingerprint.
  - Juga **lantai yang menghangat** (§3.3): `--terang` = jumlah stasiun ber-`data-menyala` dibagi jumlah stasiun, canvas bertahap dari `#0E0B09` ke `#1A130D`. Dibuat di tiket 15 karena baru bermakna setelah semua stasiun ada; pemicunya (`data-menyala`) sudah ada di `lentera-stasiun.ts`.
