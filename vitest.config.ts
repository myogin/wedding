import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    // Semua file tes memakai satu database Postgres sungguhan; jalankan berurutan agar tidak saling menimpa data.
    fileParallelism: false,
  },
});
