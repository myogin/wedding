import { defineConfig, devices } from "@playwright/test";

// E2E dijalankan terhadap image Docker produksi (app + Postgres), sama dengan yang di-deploy ke Easypanel.
// Project compose terpisah ("undangan-e2e") dan port sendiri agar tidak bentrok dengan stack pengembangan.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // Layar loading tampil minimal 3 detik (ditambah transisi keluarnya), jadi Sampul baru muncul setelah itu.
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    // Tes fungsional berjalan tanpa animasi agar deterministik (lihat Testing Decisions di spec).
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "ponsel",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: devices["iPhone 13"].userAgent,
      },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "docker compose -p undangan-e2e up --build app",
    url: `http://127.0.0.1:${PORT}/api/health`,
    env: { APP_PORT: String(PORT), DB_PORT: "54339" },
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
    stdout: "ignore",
    stderr: "pipe",
    gracefulShutdown: { signal: "SIGTERM", timeout: 30_000 },
  },
});
