import { sql } from "drizzle-orm";
import type { Db } from "@/db";

export function buatHealthHandler({ db }: { db: Db }) {
  return async function GET(): Promise<Response> {
    try {
      await db.execute(sql`select 1`);
      return Response.json({ status: "ok" });
    } catch {
      return Response.json({ status: "error" }, { status: 503 });
    }
  };
}
