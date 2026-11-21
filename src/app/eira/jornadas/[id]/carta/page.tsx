import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { propsCarta } from "@/lib/cartaProps";
import { jornadaPorId } from "@/lib/db";
import { CartaEditor } from "@/app/gob/[token]/carta/CartaEditor";

export const dynamic = "force-dynamic";

export default async function CartaEira({ params }: { params: Promise<{ id: string }> }) {
  const j = await jornadaPorId((await params).id);
  if (!j) notFound();
  const req = j.requisitos.find((r) => r.clave === "carta_compromiso");
  if (!req) notFound();
  const ultima = req.versiones[req.versiones.length - 1];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/eira" className="hover:text-pizarra">Tablero</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/eira/jornadas/${j.id}`} className="hover:text-pizarra">{j.municipio}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">Carta compromiso</span>
      </nav>
      <div>
        <p className="ojal">Plantilla de la jornada</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Carta <em>compromiso</em></h1>
        <p className="mt-1 text-pizarra-suave">Edita los campos variables, previsualiza el PDF y descárgalo. El municipio la verá y podrá completarla y firmarla.</p>
      </div>
      <CartaEditor
        modo="eira"
        jornadaId={j.id}
        requisitoId={req.id}
        estado={req.estado}
        versionActual={ultima?.archivo}
        firmaInicial={j.carta?.firma}
        pdfUrl={`/eira/jornadas/${j.id}/carta-pdf`}
        {...propsCarta(j)}
      />
    </div>
  );
}
