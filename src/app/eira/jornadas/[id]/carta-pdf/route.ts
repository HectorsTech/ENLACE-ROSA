import { generarCartaPdf } from "@/lib/carta";
import { jornadaPorId } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const j = jornadaPorId((await params).id);
  if (!j) return new Response("No encontrada", { status: 404 });
  return new Response(Buffer.from(generarCartaPdf(j)), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Carta_Compromiso_${j.token}.pdf"` },
  });
}
