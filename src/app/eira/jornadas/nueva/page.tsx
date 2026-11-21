import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { hoyMx } from "@/lib/fechas";
import { Asistente } from "./Asistente";

export default function NuevaJornada() {
  const h = hoyMx();
  const sugerida = new Date(Date.UTC(h.anio, h.mes0, h.dia + 21));
  const minima = new Date(Date.UTC(h.anio, h.mes0, h.dia + 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/eira" className="hover:text-pizarra">Tablero</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">Nueva jornada</span>
      </nav>
      <div>
        <h1 className="text-3xl font-extrabold">Crear jornada</h1>
        <p className="mt-1 text-pizarra-suave">Tres pasos: datos básicos, requisitos y enlace para el municipio.</p>
      </div>
      <Asistente fechaSugerida={iso(sugerida)} fechaMinima={iso(minima)} />
    </div>
  );
}
