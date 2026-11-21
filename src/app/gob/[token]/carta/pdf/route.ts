import { generarCartaPdf } from "@/lib/carta";
import { jornadaPorToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const j = await jornadaPorToken(decodeURIComponent((await params).token));
  if (!j) return new Response("No encontrada", { status: 404 });
  return new Response(Buffer.from(generarCartaPdf(j)), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Carta_Compromiso_${j.token}.pdf"` },
  });
}
