"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ChevronDown, Clock, FileSignature, FileText, HelpCircle, Loader2, MessageSquareWarning, Send, Star, Upload } from "lucide-react";
import { ChipModulo, EstadoBadge } from "@/components/Insignias";
import { Historial } from "@/components/Historial";
import { NOMBRE_MODULO } from "@/lib/catalogo";
import { pedirAyuda, subirArchivo } from "@/lib/actions";
import type { Requisito } from "@/lib/types";

function tamanoLegible(bytes: number) {
  return bytes > 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function TarjetaRequisito({
  jornadaId,
  r,
  fechaLimiteTexto,
  venceTexto,
  ultimaActualizacion,
  enlace,
}: {
  jornadaId: string;
  r: Requisito;
  fechaLimiteTexto: string;
  venceTexto: string;
  ultimaActualizacion: string;
  enlace?: { href: string; texto: string };
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ultima = r.versiones[r.versiones.length - 1];
  const puedeSubir = r.estado !== "aprobado" && r.clave !== "ficha_condiciones";

  const subir = (f: File | undefined) => {
    if (!f) return;
    iniciar(async () => {
      setError(null);
      const res = await subirArchivo({ jornadaId, requisitoId: r.id, archivo: f.name, tamano: tamanoLegible(f.size) });
      if (!res.ok) setError(res.error);
      if (input.current) input.current.value = "";
      router.refresh();
    });
  };

  const enviarAyuda = () =>
    iniciar(async () => {
      setError(null);
      const res = await pedirAyuda({ jornadaId, requisitoId: r.id, mensaje });
      if (!res.ok) return setError(res.error);
      setAyuda(false);
      setMensaje("");
      router.refresh();
    });

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-suave ${r.estado === "observado" ? "border-red-200" : "border-borde"}`}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={`panel-${r.id}`}
        onClick={() => setAbierto((x) => !x)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-crema/60"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug">{r.nombre}</span>
        </span>
        <EstadoBadge estado={r.estado} chico />
        <ChevronDown className={`h-4 w-4 shrink-0 text-pizarra-suave transition ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div id={`panel-${r.id}`} className="space-y-4 border-t border-borde px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {r.critico && (
              <span className="inline-flex items-center gap-1 rounded-full bg-guinda-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-guinda">
                <Star className="h-3 w-3" fill="currentColor" /> Importante
              </span>
            )}
            {r.opcional && <ChipModulo tono="gris">Opcional</ChipModulo>}
            {r.modulo && <ChipModulo tono="dorado">{NOMBRE_MODULO[r.modulo]}</ChipModulo>}
          </div>

          <p className="text-sm text-pizarra-suave">{r.descripcion}</p>

          <div className="rounded-2xl border border-dashed border-borde p-3">
            <p className="ojal">Qué debe incluir</p>
            <p className="mt-1 text-sm leading-relaxed">{r.criterio}</p>
            <p className="mt-1 text-xs text-pizarra-suave">Formatos: {r.formatos}</p>
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-2xl bg-crema p-3">
              <p className="ojal">Entregar antes del</p>
              <p className="mt-1 text-sm font-semibold">{fechaLimiteTexto}</p>
              <p className="font-semibold text-pizarra-suave">{r.estado === "aprobado" ? "Cumplido" : venceTexto}</p>
            </div>
            <div className="rounded-2xl bg-crema p-3">
              <p className="ojal">Última actualización</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold"><Clock className="h-3.5 w-3.5" /> {ultimaActualizacion}</p>
            </div>
          </div>

          {r.estado === "observado" && r.motivoObservacion && (
            <div className="flex gap-3 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
              <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" />
              <p><span className="font-semibold">Por corregir:</span> {r.motivoObservacion}</p>
            </div>
          )}

          {ultima && (
            <div className="flex items-center gap-3 rounded-2xl border border-borde px-3 py-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-crema text-pizarra-suave"><FileText className="h-4 w-4" /></span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                <span className="mr-1.5 rounded-md bg-pizarra px-1.5 py-0.5 text-[10px] font-bold text-white">v{ultima.numero}</span>
                {ultima.archivo}
                <span className="block text-xs font-normal text-pizarra-suave">{ultima.tamano}</span>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {enlace && (
              <Link href={enlace.href} className={r.clave === "ficha_condiciones" ? "btn-guinda" : "btn-secundario"}>
                <FileSignature className="h-4 w-4" /> {enlace.texto}
              </Link>
            )}
            {puedeSubir && (
              <>
                <input ref={input} type="file" className="hidden" onChange={(e) => subir(e.target.files?.[0])} />
                <button type="button" disabled={pendiente} onClick={() => input.current?.click()} className="btn bg-guinda text-white hover:opacity-90">
                  {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {ultima ? "Subir nueva versión" : "Subir documento"}
                </button>
              </>
            )}
            <button type="button" onClick={() => setAyuda((x) => !x)} className="btn-fantasma ml-auto px-3 py-2 text-xs">
              <HelpCircle className="h-3.5 w-3.5" /> Tengo una duda
            </button>
          </div>

          {ayuda && (
            <div className="rounded-2xl bg-rosa-50 p-4">
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={3} placeholder="Escribe tu pregunta para el equipo de EIRA" className="campo" />
              <button type="button" onClick={enviarAyuda} disabled={pendiente || mensaje.trim().length < 5} className="btn mt-2 bg-rosa text-white">
                {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar
              </button>
            </div>
          )}

          {error && <p className="text-sm font-medium text-estado-observado">{error}</p>}

          <div>
            <p className="ojal mb-2">Historial y comentarios</p>
            <div className="rounded-2xl bg-lienzo p-4">
              <Historial eventos={r.historial} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
