import { handlerBukuTamu } from "@/server/buku-tamu-produksi";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handlerBukuTamu().kirimRsvp(request);
}
