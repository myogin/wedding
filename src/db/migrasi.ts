import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/** Menerapkan migrasi Drizzle yang belum diterapkan. Aman dijalankan berulang kali. */
export async function jalankanMigrasi(url: string, folderMigrasi: string): Promise<void> {
  const client = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: folderMigrasi });
  } finally {
    await client.end();
  }
}
