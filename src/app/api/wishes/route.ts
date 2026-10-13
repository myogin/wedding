import { handlerBukuTamu } from "@/server/buku-tamu-produksi";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handlerBukuTamu().daftarUcapan(request);
}
