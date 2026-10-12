import { afterAll, describe, expect, it } from "vitest";
import { buatDb } from "@/db";
import { buatHealthHandler } from "@/server/health";
import { URL_DB_TES } from "../db-tes";

const koneksi = buatDb(URL_DB_TES);

afterAll(() => koneksi.tutup());

describe("GET /api/health", () => {
  it("mengembalikan 200 saat database terhubung", async () => {
    const GET = buatHealthHandler({ db: koneksi.db });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("mengembalikan 503 saat database tidak bisa dihubungi", async () => {
    const tidakTerhubung = buatDb("postgres://undangan:undangan@127.0.0.1:1/undangan", {
      connectTimeoutDetik: 1,
    });
    const GET = buatHealthHandler({ db: tidakTerhubung.db });

    const res = await GET();
    await tidakTerhubung.tutup();

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: "error" });
  });
});
