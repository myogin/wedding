import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type Db = PostgresJsDatabase;

export type KoneksiDb = {
  db: Db;
  tutup: () => Promise<void>;
};

export function buatDb(url: string, opsi: { connectTimeoutDetik?: number } = {}): KoneksiDb {
  const client = postgres(url, {
    max: 10,
    connect_timeout: opsi.connectTimeoutDetik ?? 10,
    onnotice: () => {},
  });
  return { db: drizzle(client), tutup: () => client.end() };
}

let koneksiProduksi: KoneksiDb | undefined;

/** Koneksi bersama untuk server; dibuat saat request pertama, bukan saat build. */
export function getDb(): Db {
  if (!koneksiProduksi) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL belum diatur");
    koneksiProduksi = buatDb(url);
  }
  return koneksiProduksi.db;
}
