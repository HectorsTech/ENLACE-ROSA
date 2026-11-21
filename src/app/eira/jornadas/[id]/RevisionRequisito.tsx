"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, FileText, History, Loader2, MessageSquareWarning, Star, X } from "lucide-react";
import { EstadoBadge } from "@/components/Insignias";
import { Historial } from "@/components/Historial";
import { aprobarRequisito, observarRequisito } from "@/lib/actions";
import { formatoFechaHora } from "@/lib/fechas";
import type { Requisito } from "@/lib/types";
import { ChipModulo } from "@/components/Insignias";
import { NOMBRE_MODULO } from "@/lib/catalogo";

const SUGERENCIAS: Record<string, string[]> = {
  carta_compromiso: [
    "El sello oficial no es visible. Suban la carta con sello legible de la Presidencia Municipal o del DIF.",
    "Falta la firma de la autoridad municipal en la última página.",
    "Se modificó una cláusula institucional de EIRA. Usen la versión oficial sin cambios.",
  ],
  fotos_espacio: ["La foto de la toma eléctrica está borrosa y no permite ver la distancia al área de trabajo."],
  logotipos: ["Es una captura de pantalla borrosa. Necesitamos PNG transparente, SVG o AI."],
};

export function RevisionRequisito({
  jornadaId,
  r,
  fechaLimiteTexto,
  venceTexto,
  urgente,
}: {
  jornadaId: string;
  r: Requisito;
  fechaLimiteTexto: string;
  venceTexto: string;
  urgente: boolean;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [modo, setModo] = useState<"nada" | "observar">("nada");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);
  const ultima = r.versiones[r.versiones.length - 1];
  const puedeRevisar = r.estado === "recibido" && !!ultima;

  const aprobar = () =>
    iniciar(async () => {
      setError(null);
      const res = await aprobarRequisito({ jornadaId, requisitoId: r.id });
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  const observar = () =>
    iniciar(async () => {
      setError(null);
      const res = await observarRequisito({ jornadaId, requisitoId: r.id, motivo });
      if (!res.ok) return setError(res.error);
      setModo("nada");
      setMotivo("");
      router.refresh();
    });

  const resalte =
    r.estado === "recibido"
      ? "border-blue-200 ring-4 ring-blue-50"
      : r.estado === "observado"
        ? "border-red-100"
        : "border-borde";

  return (
    <article id={r.id} className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-suave transition ${resalte}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold leading-snug">{r.nombre}</h3>
            {r.critico && (
              <span className="inline-flex items-center gap-1 rounded-full bg-guinda-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-guinda">
                <Star className="h-3 w-3" fill="currentColor" /> Crítico
              </span>
            )}
            {r.opcional && <ChipModulo tono="gris">Opcional · sugerido</ChipModulo>}
            {r.modulo && <ChipModulo tono="dorado">Módulo: {NOMBRE_MODULO[r.modulo]}</ChipModulo>}
          </div>
          <p className="mt-1 text-sm text-pizarra-suave">{r.descripcion}</p>
        </div>
        <EstadoBadge estado={r.estado} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr]">
        <div className="rounded-2xl bg-crema p-3">
          <p className="ojal">Fecha límite · D-{r.diasAntes}</p>
          <p className="mt-1 text-sm font-semibold">{fechaLimiteTexto}</p>
          <p className={`text-xs font-semibold ${urgente ? "text-estado-observado" : r.estado === "aprobado" ? "text-estado-aprobado" : "text-pizarra-suave"}`}>
            {r.estado === "aprobado" ? "Cumplido" : venceTexto}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-borde p-3">
          <p className="ojal">Criterio de aprobación</p>
          <p className="mt-1 text-sm leading-relaxed">{r.criterio}</p>
          <p className="mt-1 text-xs text-pizarra-suave">Formatos: {r.formatos}</p>
        </div>
      </div>

      {r.estado === "observado" && r.motivoObservacion && (
        <div className="mt-3 flex gap-3 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <p><span className="font-semibold">Motivo de observación:</span> {r.motivoObservacion}</p>
        </div>
      )}

      {/* Versiones */}
      {r.versiones.length > 0 && (
        <div className="mt-4 space-y-2">
          {[...r.versiones].reverse().map((v) => (
            <div key={v.numero} className={`flex flex-wrap items-center gap-3 rounded-2xl border px-3 py-2.5 ${v === ultima ? "border-borde bg-slate-50/60" : "border-borde opacity-70"}`}>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-pizarra-suave shadow-sm"><FileText className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  <span className="mr-1.5 rounded-md bg-pizarra px-1.5 py-0.5 text-[10px] font-bold text-white">v{v.numero}</span>
                  {v.archivo}
                </p>
                <p className="text-xs text-pizarra-suave">
                  {v.tamano} · subió {v.subidoPor} · {formatoFechaHora(v.fecha)}
                  {v.revisadoPor && v.fechaRevision && ` · revisó ${v.revisadoPor} ${formatoFechaHora(v.fechaRevision)}`}
                </p>
              </div>
              <EstadoBadge estado={v.estado} chico />
            </div>
          ))}
        </div>
      )}

      {/* Acciones de revisión */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {puedeRevisar && modo === "nada" && (
          <>
            <button type="button" onClick={aprobar} disabled={pendiente} className="btn bg-estado-aprobado text-white hover:bg-emerald-700">
              {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Aprobar v{ultima.numero}
            </button>
            <button type="button" onClick={() => setModo("observar")} disabled={pendiente} className="btn border border-red-200 bg-white text-estado-observado hover:bg-red-50">
              <MessageSquareWarning className="h-4 w-4" /> Observar
            </button>
          </>
        )}
        {!puedeRevisar && r.estado === "pendiente" && (
          <p className="text-xs text-pizarra-suave">Esperando a que el municipio suba el documento.</p>
        )}
        {!puedeRevisar && r.estado === "observado" && (
          <p className="text-xs text-pizarra-suave">Esperando corrección del municipio (v{r.versiones.length + 1}).</p>
        )}
        <button type="button" onClick={() => setVerHistorial((x) => !x)} className="btn-fantasma ml-auto px-3 py-2 text-xs">
          <History className="h-3.5 w-3.5" /> Historial ({r.historial.length})
          <ChevronDown className={`h-3.5 w-3.5 transition ${verHistorial ? "rotate-180" : ""}`} />
        </button>
      </div>

      {modo === "observar" && (
        <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <label htmlFor={`motivo-${r.id}`} className="etiqueta text-red-800">¿Qué debe corregir el municipio?</label>
          <textarea
            id={`motivo-${r.id}`}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Ej. La foto de la toma eléctrica está borrosa y no permite ver la distancia al área de trabajo."
            className="campo focus:border-estado-observado focus:ring-red-100"
          />
          {(SUGERENCIAS[r.clave] ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGERENCIAS[r.clave].map((s) => (
                <button key={s} type="button" onClick={() => setMotivo(s)} className="rounded-full border border-red-100 bg-white px-2.5 py-1 text-left text-[11px] text-red-700 hover:bg-red-50">
                  {s.length > 60 ? s.slice(0, 60) + "…" : s}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={observar} disabled={pendiente || motivo.trim().length < 10} className="btn bg-estado-observado text-white hover:bg-red-700">
              {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareWarning className="h-4 w-4" />} Enviar observación
            </button>
            <button type="button" onClick={() => { setModo("nada"); setError(null); }} className="btn-fantasma">
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm font-medium text-estado-observado">{error}</p>}

      {verHistorial && (
        <div className="mt-4 rounded-2xl bg-slate-50/70 p-4">
          <Historial eventos={r.historial} />
        </div>
      )}
    </article>
  );
}
