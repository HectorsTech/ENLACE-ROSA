import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { listarJornadas } from "@/lib/db";
import { formatoFechaHora } from "@/lib/fechas";
import { BotonAtendido } from "../jornadas/[id]/Acciones";

export const dynamic = "force-dynamic";

export default async function Preguntas() {
  const pendientes = (await listarJornadas())
    .flatMap((j) => j.mensajes.filter((m) => !m.atendido).map((m) => ({ j, m, req: j.requisitos.find((r) => r.id === m.requisitoId) })))
    .sort((a, b) => +new Date(b.m.fecha) - +new Date(a.m.fecha));

  return (
    <div className="space-y-6">
      <div>
        <p className="ojal">Equipo EIRA</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Dudas de los <em>municipios</em></h1>
        <p className="mt-1 text-pizarra-suave">{pendientes.length} sin responder.</p>
      </div>

      {pendientes.length === 0 ? (
        <div className="tarjeta grid place-items-center p-12 text-center text-pizarra-suave">
          <CheckCircle2 className="h-8 w-8 text-estado-aprobado" />
          <p className="mt-2 font-medium">No hay dudas pendientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map(({ j, m, req }) => (
            <article key={m.id} className="tarjeta p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/eira/jornadas/${j.id}`} className="flex items-center gap-2 font-semibold text-guinda hover:underline">
                  <MessageCircle className="h-4 w-4" /> {j.municipio}
                </Link>
                <span className="text-xs text-pizarra-suave">{m.autor} · {formatoFechaHora(m.fecha)}</span>
              </div>
              {m.tipo === "cambio_estimado" && <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-guinda">Cambio de estimado</p>}
              {req && <p className="mt-1 text-xs font-semibold text-rosa-700">Sobre: {req.nombre}</p>}
              <p className="mt-2 text-sm">{m.mensaje}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <BotonAtendido jornadaId={j.id} mensajeId={m.id} />
                <Link href={`/eira/jornadas/${j.id}${req ? `#${req.id}` : ""}`} className="mt-2 text-xs font-semibold text-rosa-700 hover:underline">
                  Abrir expediente
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
