import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { jornadaPorToken } from "@/lib/db";
import { CAMPOS_EVIDENCIA, FICHA_VACIA, partesFicha, tomar } from "@/lib/ficha";
import { EvidenciaForm } from "./EvidenciaForm";

export const dynamic = "force-dynamic";

export default async function EvidenciaEspacio({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const j = await jornadaPorToken(decodeURIComponent(token));
  if (!j) notFound();
  const inicial = tomar(j.ficha ?? FICHA_VACIA, CAMPOS_EVIDENCIA);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/gob" className="hover:text-pizarra">Municipios</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/gob/${j.token}`} className="hover:text-pizarra">{j.municipio}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">Formulario de evidencia del espacio</span>
      </nav>
      <div>
        <p className="ojal">Evidencia del espacio</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Formulario de <em>evidencia del espacio</em></h1>
        <p className="mt-1 text-pizarra-suave">Según tus respuestas, subir las fotografías del lugar será obligatorio u opcional.</p>
      </div>
      <EvidenciaForm jornadaId={j.id} inicial={inicial} respondido={partesFicha(j.ficha).evidencia && !!j.ficha} />
    </div>
  );
}
