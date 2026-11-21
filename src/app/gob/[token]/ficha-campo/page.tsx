import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { jornadaPorToken } from "@/lib/db";
import { FICHA_VACIA } from "@/lib/ficha";
import { FichaForm } from "./FichaForm";

export const dynamic = "force-dynamic";

export default async function FichaCampo({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const j = jornadaPorToken(decodeURIComponent(token));
  if (!j) notFound();
  const { actualizadoEn: _omit, ...inicial } = j.ficha ?? { ...FICHA_VACIA, actualizadoEn: "" };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/gob" className="hover:text-pizarra">Municipios</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/gob/${j.token}`} className="hover:text-pizarra">{j.municipio}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">Ficha del lugar y la comunidad</span>
      </nav>
      <div>
        <p className="ojal">Cuestionario</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Ficha del <em>lugar y la comunidad</em></h1>
        <p className="mt-1 text-pizarra-suave">Tus respuestas nos permiten preparar el equipo y avisarte si falta algo.</p>
      </div>
      <FichaForm jornadaId={j.id} inicial={inicial} enviada={!!j.ficha} />
    </div>
  );
}
