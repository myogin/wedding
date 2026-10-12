## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Perintah

Butuh Docker yang sedang berjalan.

- `npm run typecheck`: cek tipe TypeScript.
- `npm test`: tes API (Vitest). Otomatis menyalakan Postgres lewat `docker compose`, membuat database `undangan_test`, dan menerapkan migrasi.
- `npm run test:e2e`: tes E2E (Playwright) terhadap image Docker produksi, project compose `undangan-e2e` di port 3100. Image di-build ulang setiap dijalankan.
- `npm run dev`: server pengembangan. Jalankan `docker compose up -d db` dulu dan salin `.env.example` ke `.env.local`.
- `npm run db:generate`: buat file migrasi Drizzle dari skema tabel.
