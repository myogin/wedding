# BRIEF: Undangan Pernikahan

> **Self-authored under explicit creative delegation.**
> Pada 2026-10-13 Mempelai menerima tujuh pertanyaan Step 0 sekaligus. Setiap pertanyaan
> boleh dijawab "terserah kamu". Jawaban Mempelai untuk semuanya, verbatim: **"lanjut"**.
> Jawaban itu dibaca sebagai penyerahan semua keputusan yang tersisa.
>
> Penanda sumber:
> - *(Mempelai)*: kata-kata Mempelai sendiri.
> - *(spec)*: sudah diputuskan di spec dan tidak diubah.
> - *(didelegasikan)*: keputusan agent atas delegasi tadi. Semua yang bertanda ini boleh diubah Mempelai kapan saja.

Nama, foto, dan musik di bawah adalah Placeholder dari website referensi. Brief ini menjelaskan *cara* halaman bekerja, bukan *siapa* pasangannya. Saat Placeholder diganti, brief tetap berlaku.

## Delapan topik

1. **Vibe.**
   - *(Mempelai, dari spec)*: "tujuan utama adalah membuat web fancy dan elegan".
   - Ditambah *(didelegasikan)*: **hangat, temaram, sakral**.
   - Referensi *(didelegasikan)*:
     - *In the Mood for Love* (Wong Kar-wai, 2000): lorong sempit dengan lampu hangat, tempo yang menahan napas.
     - *Barry Lyndon* (Kubrick, 1975): interior yang hanya diterangi lilin, setiap bingkai seperti lukisan.
     - Lontar Bali: teks dibaca dengan membuka helai demi helai.

   Ketiganya dipilih karena foto Placeholder memang sudah bercahaya seperti itu: lentera, lampu kristal, lilin, dan bayangan dalam.

2. **Urutan bagian** *(spec, diterima dengan "lanjut")*:
   1. Undangan (Sampul lalu Hero)
   2. Restu
   3. Kami
   4. Hari H
   5. Kenangan
   6. Hadir
   7. Terima kasih

   Kisah cinta tidak ada di konten Placeholder, jadi tidak punya bagian sendiri.

3. **Energi** *(didelegasikan)*:
   - Sunyi di Sampul.
   - Puncak di Gerbang (Hero).
   - Sangat tenang di Restu.
   - Sedang di Kami dan Kenangan.
   - Ringkas dan jelas di Hari H.
   - Hangat dan aktif di Hadir.
   - Penuh tapi tenang di Terima kasih.

4. **Perasaan per tahap dan satu momen** *(didelegasikan)*: lihat feeling curve dan peak di bawah.

5. **Sesuatu yang belum pernah ada** *(didelegasikan)*: "Undangan yang mulai dari gelap, dan kehadiranmu yang menyalakannya." Inilah benih signature move.

6. **Gaya estetika** *(didelegasikan)*: **premium-minimal yang hangat**.
   - Alasannya, "fancy dan elegan" menunjuk kemewahan yang tenang.
   - Maximalist ditolak karena fotonya sudah kaya: ornamen, kain, emas, lampu kristal. Halaman yang ramai akan bersaing dengan foto, bukan membingkainya.
   - Palet: off-black hangat, bone, dan amber api lentera. Palet krem-dan-kuningan (jebakan taste.md) tidak dipakai.

7. **Satu dunia atau adegan terpisah?** *(didelegasikan)*: **adegan terpisah**, berupa stasiun-stasiun. Alasannya:
   - Tidak ada footage, tidak ada `KIE_AI_API_KEY`, dan ffmpeg belum terpasang. Satu dunia yang menyambung butuh klip berantai yang tidak bisa dibuat dari foto diam.
   - Tamu harus bisa langsung lompat ke Acara, RSVP, dan Hadiah (spec, US 20). Dunia yang tidak bisa dilompati hanyalah video.

8. **Aset** *(spec)*: Placeholder dari referensi.
   - 13 foto: villa kolonial Bali yang temaram, lentera, busana adat, ditambah tiga foto taman.
   - Musik "Rebong".
   - Tidak ada footage dan tidak ada generasi. Semua lapisan Hero dipotong secara lokal dari foto Sampul dan foto mempelai pria.

### Tambahan dari Mempelai (setelah tiket 04)

- *(Mempelai)*: "loading: buat minimal 5 detik untuk loading. tambahkan foto (otomatis ganti cepat) seperti ada efek film dipercepat diatas text memuat undangan".
- Diterapkan di layar loading, sebelum Sampul:
  - kilasan foto galeri seperti film yang dipercepat;
  - persentase yang naik halus selama minimal 5 detik.
- Foto diurutkan dari yang paling gelap ke yang paling terang supaya kedipannya jarang.
- Sampul sesudahnya tetap gelap dan diam. Lompatan dari gerak cepat ke hening justru mempertegas jeda sebelum peak.

### Jawaban Step 1 (dari spec)

- **Apa dan untuk siapa**: undangan pernikahan untuk tamu yang menerima Link Tamu lewat WhatsApp, kebanyakan dibuka di ponsel.
- **Yang harus diyakini di akhir**: "Kehadiran dan doamu berarti bagi kami."
- **Satu aksi**: **Konfirmasi Kehadiran**. Labelnya sama di mana pun.
- **Dunia** *(didelegasikan)*: World 1, *low-key cinematic*. Ini sesuai dengan fotonya. Preamble berikut disimpan untuk berjaga-jaga kalau nanti ada generasi:
  > Cinematic wedding photography in a Balinese colonial villa at night, shot on 35mm anamorphic lenses. Shallow depth of field, true blacks, matte film grain. Practical light only: brass lanterns and candles as warm keys, deep falloff into shadow. Colour grade of warm off-black, amber highlights, desaturated mid-tones, maroon and gold textiles. Photographic realism. NOT 3D render, NOT illustration, NOT CGI, no digital glow, no plastic sheen.

## Feeling curve

Satu baris per tahap: emosinya dulu, lalu penyebabnya di layar.

| # | Tahap | Perasaan | Penyebabnya di layar |
|---|---|---|---|
| 0 | Sampul | **Diterima** | Ruangan gelap dan diam. Hanya ada namamu, nama mereka, dan satu tombol. *(hening yang disengaja)* |
| 1 | Gerbang | **Takjub** (peak) | Kamu menekan Buka Undangan, lentera menyala satu per satu, lalu saat di-scroll lorongnya berlapis dan Mempelai seperti melangkah ke arahmu. |
| 2 | Restu | **Khidmat** | Hampir hitam. Ayat datang baris demi baris, lalu artinya. Tidak ada yang bergerak selain teks. |
| 3 | Kami | **Akrab** | Dua potret dibuka dari dua sisi, dekat. Nama lengkap, orang tua, Instagram. |
| 4 | Hari H | **Yakin** | Hitung mundur yang sungguh berdetak, tanggal, jam dengan WITA, satu ketukan ke peta dan kalender. |
| 5 | Kenangan | **Gembira** | Berjalan menyamping menyusuri ruangan-ruangan villa, foto demi foto. |
| 6 | Hadir | **Ikut serta** | Kata-katamu bergabung dengan ucapan tamu lain. Begitu kamu konfirmasi, lenteramu digantung. |
| 7 | Terima kasih | **Haru, lalu tenang** | Semua lentera menyala, lenteramu ada di antaranya, dan halaman diam di situ. |

Tidak ada dua tahap bersebelahan dengan perasaan yang sama.

## Peak

**Tahap 1, Gerbang.** Kalimat yang akan diceritakan tamu ke temannya:

> "Pas aku buka undangannya layarnya gelap. Aku pencet Buka Undangan, lentera-lenteranya nyala satu-satu, terus waktu aku scroll Agung sama Ayu kayak melangkah keluar dari lorong ke arahku."

Bekal peak:
- **Seluruh anggaran aset**: semua lapisan potongan ada di sini.
- **Keheningan sebelumnya**: Sampul yang gelap.
- **Ruang scroll terbesar**: `data-sc-span` 3.0. Act terpanjang berikutnya 2.4.

## Kalimat tell-someone

> "Itu undangan yang mulai dari gelap. Setiap bagian yang kulewati menyalakan satu lentera, dan begitu aku konfirmasi, lentera dengan namaku ikut menyala di antara lentera mereka."

*It's the site where the invitation starts in the dark, every part you pass lights a lantern, and when you confirm, a lantern with your own name glows among theirs.*

Signature move tinggal di dalam kalimat ini, bukan di momen lain.

## Hening yang disengaja

Dua bagian ini sengaja sunyi. Jangan dilaporkan sebagai dead scroll.

- **Sampul**: gelap dan diam. Ini gerbang, bukan act. Scroll terkunci sampai "Buka Undangan" ditekan.
- **Awal Restu**: sekitar 0,3 viewport hampir hitam setelah Hero lepas, sebelum ayat pertama datang. Ini jeda napas sesudah peak.
