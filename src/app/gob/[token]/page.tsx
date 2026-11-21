import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, MapPin, UserRound } from "lucide-react";
import { BarraProgreso } from "@/components/Insignias";
import { GRUPOS } from "@/lib/catalogo";
import { jornadaPorToken } from "@/lib/db";
import { fechaLimiteDesde, formatoFecha, textoFaltanDias, textoVencimiento } from "@/lib/fechas";
import { EstimadoPersonas } from "./EstimadoPersonas";
import { progreso, resumenAvance } from "@/lib/logica";
import type { GrupoRequisito } from "@/lib/types";
import { TarjetaRequisito } from "./TarjetaRequisito";

export const dynamic = "force-dynamic";

export default async function PortalMunicipal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const j = jornadaPorToken(decodeURIComponent(token));
  if (!j) notFound();

  const ahora = Date.now();
  const p = progreso(j);
  const grupos = (Object.keys(GRUPOS) as GrupoRequisito[]).map((g) => ({
    g,
    reqs: j.requisitos.filter((r) => r.grupo === g).sort((a, b) => b.diasAntes - a.diasAntes),
  }));

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/gob" className="hover:text-pizarra">Municipios</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">{j.municipio}</span>
      </nav>

      <section className="tarjeta p-6">
        <p className="ojal">{j.estado}</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">{j.municipio}</h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-pizarra-suave">
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatoFecha(j.fecha)} · {textoFaltanDias(j.fecha, ahora)}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {j.sede}</span>
          <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" /> {j.enlaceMunicipal.nombre}</span>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm font-semibold">
            <span>Preparación</span>
            <span>{p}%</span>
          </div>
          <BarraProgreso valor={p} color={p === 100 ? "verde" : "guinda"} />
          <p className="mt-2 text-xs text-pizarra-suave">{resumenAvance(j)}</p>
        </div>
      </section>

      <EstimadoPersonas
        jornadaId={j.id}
        valor={j.estimadoPersonas}
        limiteTexto={formatoFecha(fechaLimiteDesde(j.fecha, 5))}
        editable={ahora <= new Date(fechaLimiteDesde(j.fecha, 5)).getTime()}
      />

      {grupos.map(({ g, reqs }) =>
        reqs.length === 0 ? null : (
          <section key={g}>
            <h2 className="text-lg font-bold">{GRUPOS[g].titulo}</h2>
            <p className="mb-3 text-sm text-pizarra-suave">{GRUPOS[g].descripcion}</p>
            <div className="space-y-4">
              {reqs.map((r) => (
                <TarjetaRequisito
                  key={r.id}
                  jornadaId={j.id}
                  r={r}
                  fechaLimiteTexto={formatoFecha(r.fechaLimite)}
                  venceTexto={textoVencimiento(r.fechaLimite, ahora)}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
