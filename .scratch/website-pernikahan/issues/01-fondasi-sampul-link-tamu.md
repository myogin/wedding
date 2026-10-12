# 01: Fondasi: Sampul personal dari Link Tamu, berjalan di container

**What to build:** Tamu membuka Link Tamu `/?to=Budi%20Santoso` dan melihat Sampul berisi nama Mempelai, tanggal, sapaan "Kepada Yth." dengan namanya, catatan permohonan maaf atas salah penulisan nama/gelar, dan tombol "Buka Undangan" (cukup tampil dulu, fungsinya di tiket 04). Semuanya berjalan dari image Docker produksi bersama Postgres, sama seperti nanti di Easypanel. Isinya diambil dari Konten Undangan yang tervalidasi dan terisi Placeholder dari website referensi. Lihat `spec.md` di folder fitur ini.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Category:** enhancement

- [ ] Proyek Next.js (App Router, TypeScript) dengan output `standalone`. Dockerfile multi-stage menyertakan `sharp`.
- [ ] docker compose (app + Postgres) menyalakan aplikasi. Entrypoint menjalankan migrasi Drizzle yang idempoten sebelum server mulai.
- [ ] `GET /api/health` mengembalikan 200 bila database terhubung dan non-200 bila tidak.
- [ ] Konten Undangan ada di satu file konfigurasi bertipe dan divalidasi Zod saat build. Data tidak valid menggagalkan build dengan pesan yang menunjuk field-nya.
- [ ] Placeholder diambil dari halaman referensi: nama dan gelar Mempelai, orang tua, ayat, Acara, alamat, foto Sampul/Mempelai/galeri, musik, ornamen, dan font. Nomor rekening memakai nomor dummy yang jelas palsu.
- [ ] Setiap Placeholder ditandai. Build produksi mencetak daftar Placeholder yang masih aktif tanpa menggagalkan build.
- [ ] Konteks Tamu: `to` di-decode, di-trim, dan dipotong maksimal 100 karakter. Bila kosong, Sampul memakai sapaan umum "Bapak/Ibu/Saudara/i".
- [ ] Tema dipetakan ke token `--sc-*` (enam warna, dua font).
- [ ] Halaman di-render statis. Layar loading menutupi Sampul sampai Konteks Tamu terbaca, jadi tidak ada kilatan nama.
- [ ] Vitest siap memakai Postgres tes. Playwright menjalankan E2E terhadap image Docker produksi di viewport 390×844 dan desktop.
- [ ] E2E: `/?to=Budi%20Santoso` menampilkan "Budi Santoso" di Sampul, dan tanpa `to` tampil sapaan umum.
- [ ] Tes API: health check mengembalikan 200.
