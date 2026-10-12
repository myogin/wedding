// Dibundel ke satu file dan dijalankan entrypoint container sebelum server mulai.
import { jalankanMigrasi } from "../src/db/migrasi";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum diatur");
  process.exit(1);
}

await jalankanMigrasi(url, "./drizzle");
console.log("✓ Migrasi database selesai");
