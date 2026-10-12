# 02: Deploy fondasi ke Easypanel

**What to build:** Mempelai men-deploy hasil tiket 01 ke server Easypanel miliknya, sehingga Sampul bisa dibuka di domain sendiri lewat HTTPS. Agent boleh menyiapkan panduan langkah demi langkah (mis. dengan `/wizard`), tetapi semua langkah di panel Easypanel dikerjakan Mempelai, karena agent tidak punya akses ke server.

**Blocked by:** 01 (Fondasi: Sampul personal dari Link Tamu, berjalan di container)

**Status:** ready-for-human

**Category:** enhancement

- [ ] Easypanel bisa membangun aplikasi, dari repo Git atau dari image yang di-push.
- [ ] Service Postgres ada di project yang sama dan hanya bisa diakses lewat hostname internal, tidak diekspos ke publik.
- [ ] Service App memakai port 3000, dengan environment variable: URL database, kata sandi admin, secret sesi, salt hash IP, dan URL publik situs.
- [ ] Domain dan HTTPS (Let's Encrypt) aktif.
- [ ] Health check Easypanel memakai `/api/health`.
- [ ] Backup otomatis Postgres aktif.
- [ ] `https://<domain>/?to=Budi` menampilkan "Budi" di Sampul.
- [ ] Sudah dicek dan dicatat header IP klien mana dari proxy Easypanel (`X-Real-IP` / `X-Forwarded-For`) yang diterima aplikasi, sebagai masukan untuk tiket 11.
