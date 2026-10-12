import type { KontenUndanganMentah } from "./skema";

/**
 * Konten Undangan.
 *
 * Isi saat ini adalah Placeholder dari website referensi (groovepublic.com/agungayu).
 * Ganti dengan data kalian sendiri, lalu hapus `placeholder: true` dan pindahkan aset
 * keluar dari folder /placeholder/. Build produksi mencetak daftar Placeholder yang tersisa.
 *
 * Referensi tidak memakai aset ornamen terpisah (hanya foto), jadi belum ada ornamen di sini.
 */
export const kontenMentah = {
  mempelai: {
    wanita: {
      placeholder: true,
      panggilan: "Ayu Oka",
      namaLengkap: "Ni Putu Ayu Oka Wiastini, S.Kom",
      ayah: "Ir. I Nyoman Suasta",
      ibu: "Ni Kadek Wiasti",
      instagram: "https://www.instagram.com/ayuwiast",
      foto: { src: "/placeholder/mempelai-wanita.jpg", alt: "Ayu Oka", lebar: 1400, tinggi: 2100 },
    },
    pria: {
      placeholder: true,
      panggilan: "Agung Dalem",
      namaLengkap: "Ar. AA Gd Agung Dalem Bhajra Gautama, S.Ars",
      ayah: "A A Gede Anom Sukawati, SE",
      ibu: "Jero Kartika Sari",
      instagram: "https://www.instagram.com/gungdde_",
      foto: { src: "/placeholder/mempelai-pria.jpg", alt: "Agung Dalem", lebar: 1575, tinggi: 2100 },
    },
  },

  sampul: {
    placeholder: true,
    judul: "Pernikahan",
    catatanMaaf: "Kami mohon maaf apabila ada kesalahan penulisan nama atau gelar.",
  },

  // Dipotong dari /placeholder/sampul.jpg. Ganti fotonya, lalu bangun ulang lapisannya.
  hero: {
    placeholder: true,
    folder: "/placeholder/hero",
    alt: "Agung Dalem dan Ayu Oka berdiri di lorong villa berlentera",
  },

  pembuka: {
    placeholder: true,
    salam: "Grihastha, jalan suci dua insan menjalani dharma bersama.",
    gambar: { src: "/placeholder/restu.jpg", alt: "Agung Dalem dan Ayu Oka", lebar: 2100, tinggi: 1399 },
    kutipan: {
      teksAsli: [
        "Ihaiva stam mā vi yauṣṭaṃ",
        "viśvam āyur vy aśnutam",
        "krīḷantau putrair naptṛbhir",
        "modamānau sve gṛhe",
        "Sam añjantu viśve devāḥ",
        "sam āpo hṛdayāni nau",
        "sam mātariśvā sam dhātā",
        "sam u deṣṭrī dadhātu nau",
      ].join("\n"),
      terjemahan:
        "Tetaplah bersama di sini, jangan pernah terpisah; jalanilah seluruh hidup kalian bersama-sama. " +
        "Bermain bersama anak dan cucu, berbahagialah kalian berdua di rumah kalian sendiri. " +
        "Semoga segenap Dewa menyatukan kita berdua, semoga air menyatukan hati kita berdua. " +
        "Semoga Mātariśvan, Dhātā, dan Deṣṭrī menyatukan kita berdua selamanya.",
      sumber: "Ṛgveda 10.85.42, 47",
    },
  },

  acara: [
    {
      placeholder: true,
      id: "resepsi",
      nama: "Resepsi",
      mulai: "2026-10-21T15:00",
      zonaWaktu: "Asia/Makassar",
      alamat: "Jl. Sugriwa No. 36, Padangtegal Tengah, Ubud, Bali",
      peta: "https://maps.app.goo.gl/VCJQRoXwvZyJrhJw7",
    },
  ],
  acaraUtama: "resepsi",

  galeri: [
    { src: "/placeholder/galeri-01.jpg", alt: "Foto prewedding 1", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-02.jpg", alt: "Foto prewedding 2", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-03.jpg", alt: "Foto prewedding 3", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-04.jpg", alt: "Foto prewedding 4", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-05.jpg", alt: "Foto prewedding 5", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-06.jpg", alt: "Foto prewedding 6", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-07.jpg", alt: "Foto prewedding 7", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-08.jpg", alt: "Foto prewedding 8", lebar: 1400, tinggi: 2100 },
    { src: "/placeholder/galeri-09.jpg", alt: "Foto prewedding 9", lebar: 2100, tinggi: 1400 },
    { src: "/placeholder/galeri-10.jpg", alt: "Foto prewedding 10", lebar: 2100, tinggi: 1399 },
  ],

  amplop: {
    // Nomor rekening sengaja dummy, bukan rekening pasangan referensi, agar tidak ada tamu yang salah transfer.
    rekening: [
      {
        placeholder: true,
        id: "bca-agung",
        bank: "Bank BCA",
        nomor: "0000000000",
        pemilik: "Anak Agung Gede Agung Dalem Bhajra Gautama",
      },
      {
        placeholder: true,
        id: "bca-ayu",
        bank: "Bank BCA",
        nomor: "0000000001",
        pemilik: "Ni Putu Ayu Oka Wiastini",
      },
    ],
  },

  musik: { placeholder: true, src: "/placeholder/musik.mp3", judul: "Rebong" },

  tema: {
    placeholder: true,
    // Palet "api lentera" dari RENCANA.md §6. Kontras terukur: ink 16.3:1, inkSoft 8.6:1, accent 9.4:1.
    font: { display: "bodoni-moda", teks: "jost" },
    warna: {
      canvas: "#0E0B09",
      surface: "#18120E",
      ink: "#F2E9DD",
      inkSoft: "#BBA990",
      accent: "#E3A857",
      accentInk: "#1B1208",
    },
  },

  rsvp: {
    placeholder: true,
    batasWaktu: "2026-10-18T23:59:00+08:00",
    batasPax: 2,
    tampilkanRingkasan: true,
  },

  teksWhatsApp: {
    placeholder: true,
    template: [
      "Kepada Yth.",
      "Bapak/Ibu/Saudara/i",
      "*{nama}*",
      "",
      "Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan kami.",
      "",
      "Info lengkap acara:",
      "{link}",
      "",
      "Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.",
      "",
      "Terima kasih.",
      "Agung Dalem & Ayu Oka",
    ].join("\n"),
  },

  metadata: {
    placeholder: true,
    judul: "Undangan Pernikahan Agung Dalem & Ayu Oka",
    deskripsi: "Rabu, 21 Oktober 2026 · Ubud, Bali",
    gambarOg: "/placeholder/sampul.jpg",
  },
} satisfies KontenUndanganMentah;
