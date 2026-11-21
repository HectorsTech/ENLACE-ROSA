"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { HelpCircle, Loader2, MessageSquareWarning, Send, Star, Upload } from "lucide-react";
import { ChipModulo, EstadoBadge } from "@/components/Insignias";
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
}: {
  jornadaId: string;
  r: Requisito;
  fechaLimiteTexto: string;
  venceTexto: string;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const [ayuda, setAyuda] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ultima = r.versiones[r.versiones.length - 1];
  const puedeSubir = r.estado !== "aprobado";

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
    <article className={`rounded-3xl border bg-white p-5 shadow-suave ${r.estado === "observado" ? "border-red-200" : "border-slate-100"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold leading-snug">{r.nombre}</h3>
            {r.critico && (
              <span className="inline-flex items-center gap-1 rounded-full bg-guinda-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-guinda">
                <Star className="h-3 w-3" fill="currentColor" /> Importante
              </span>
            )}
            {r.opcional && <ChipModulo tono="gris">Opcional</ChipModulo>}
            {r.modulo && <ChipModulo tono="dorado">{NOMBRE_MODULO[r.modulo]}</ChipModulo>}
          </div>
          <p className="mt-1 text-sm text-pizarra-suave">{r.descripcion}</p>
        </div>
        <EstadoBadge estado={r.estado} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr]">
        <div className="rounded-2xl bg-crema p-3">
          <p className="ojal">Entregar antes del</p>
          <p className="mt-1 text-sm font-semibold">{fechaLimiteTexto}</p>
          <p className="text-xs font-semibold text-pizarra-suave">{r.estado === "aprobado" ? "Cumplido" : venceTexto}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 p-3">
          <p className="ojal">Qué debe incluir</p>
          <p className="mt-1 text-sm leading-relaxed">{r.criterio}</p>
          <p className="mt-1 text-xs text-pizarra-suave">Formatos: {r.formatos}</p>
        </div>
      </div>

      {r.estado === "observado" && r.motivoObservacion && (
        <div className="mt-3 flex gap-3 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <p><span className="font-semibold">Por corregir:</span> {r.motivoObservacion}</p>
        </div>
      )}

      {ultima && (
        <p className="mt-3 text-xs text-pizarra-suave">
          Último archivo: <span className="font-semibold text-pizarra">{ultima.archivo}</span> (v{ultima.numero}, {ultima.tamano})
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
        <div className="mt-3 rounded-2xl bg-rosa-50 p-4">
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            placeholder="Escribe tu pregunta para el equipo de EIRA"
            className="campo"
          />
          <button type="button" onClick={enviarAyuda} disabled={pendiente || mensaje.trim().length < 5} className="btn mt-2 bg-rosa text-white">
            {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm font-medium text-estado-observado">{error}</p>}
    </article>
  );
}
