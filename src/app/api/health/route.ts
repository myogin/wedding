import { getDb } from "@/db";
import { buatHealthHandler } from "@/server/health";

export const dynamic = "force-dynamic";

export function GET() {
  return buatHealthHandler({ db: getDb() })();
}
