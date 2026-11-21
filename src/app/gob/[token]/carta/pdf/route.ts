import { generarCartaPdf } from "@/lib/carta";
import { jornadaPorToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const j = await jornadaPorToken(decodeURIComponent((await params).token));
  if (!j) return new Response("No encontrada", { status: 404 });
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  return new Response(Buffer.from(generarCartaPdf(j)), {
    headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store, max-age=0", "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="Carta_Compromiso_${j.token}.pdf"` },
  });
}
