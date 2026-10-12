import { execSync } from "node:child_process";
import path from "node:path";
import postgres from "postgres";
import { jalankanMigrasi } from "../src/db/migrasi";
import { URL_DB_TES } from "./db-tes";

export default async function setup() {
  execSync("docker compose up -d --wait db", { stdio: "inherit" });

  const namaDb = new URL(URL_DB_TES).pathname.slice(1);
  const urlAdmin = new URL(URL_DB_TES);
  urlAdmin.pathname = "/postgres";

  const admin = postgres(urlAdmin.toString(), { max: 1, onnotice: () => {} });
  const ada = await admin`select 1 from pg_database where datname = ${namaDb}`;
  if (ada.length === 0) await admin.unsafe(`create database "${namaDb}"`);
  await admin.end();

  await jalankanMigrasi(URL_DB_TES, path.resolve(import.meta.dirname, "../drizzle"));
}
