import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, MapPin, UserRound } from "lucide-react";
import { BarraProgreso } from "@/components/Insignias";
import { GRUPOS } from "@/lib/catalogo";
import { jornadaPorToken } from "@/lib/db";
import { fechaLimiteDesde, formatoFecha, formatoFechaHora, textoFaltanDias, textoVencimiento } from "@/lib/fechas";
import { EstimadoPersonas } from "./EstimadoPersonas";
import { progreso, resumenAvance } from "@/lib/logica";
import type { GrupoRequisito } from "@/lib/types";
import { TarjetaRequisito } from "./TarjetaRequisito";

export const dynamic = "force-dynamic";

const ENLACES: Record<string, (token: string) => { href: string; texto: string }> = {
  carta_compromiso: (t) => ({ href: `/gob/${t}/carta`, texto: "Generar carta compromiso" }),
  ficha_condiciones: (t) => ({ href: `/gob/${t}/ficha-campo`, texto: "Llenar ficha" }),
};

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

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {grupos.map(({ g, reqs }) => (
          <section key={g} className="rounded-2xl bg-crema/60 p-4">
            <div className="mb-4 px-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-normal leading-tight">{GRUPOS[g].titulo}</h2>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-pizarra-suave ring-1 ring-borde">
                  {reqs.filter((r) => r.estado === "aprobado").length}/{reqs.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-pizarra-suave">{GRUPOS[g].descripcion}</p>
            </div>
            <div className="space-y-2.5">
              {reqs.map((r) => (
                <TarjetaRequisito
                  key={r.id}
                  jornadaId={j.id}
                  r={r}
                  fechaLimiteTexto={formatoFecha(r.fechaLimite)}
                  venceTexto={textoVencimiento(r.fechaLimite, ahora)}
                  ultimaActualizacion={formatoFechaHora(r.historial[r.historial.length - 1]?.fecha ?? j.creadaEn)}
                  enlace={ENLACES[r.clave]?.(j.token)}
                />
              ))}
              {reqs.length === 0 && <p className="rounded-2xl bg-white p-4 text-center text-sm text-pizarra-suave">Sin requisitos en este grupo.</p>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
