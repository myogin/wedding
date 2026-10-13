import { handlerBukuTamu } from "@/server/buku-tamu-produksi";

export const dynamic = "force-dynamic";

export function GET() {
  return handlerBukuTamu().ringkasanRsvp();
}
