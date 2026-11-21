"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Users } from "lucide-react";
import { actualizarEstimado } from "@/lib/actions";
import { RANGOS_PERSONAS, REFERENCIA_EDADES } from "@/lib/catalogo";
import type { RangoPersonas } from "@/lib/types";

export function EstimadoPersonas({
  jornadaId,
  valor,
  limiteTexto,
  editable,
}: {
  jornadaId: string;
  valor: RangoPersonas;
  limiteTexto: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const elegir = (estimado: RangoPersonas) =>
    iniciar(async () => {
      setError(null);
      const res = await actualizarEstimado({ jornadaId, estimado });
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  return (
    <section className="tarjeta p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rosa-50 text-rosa-600">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">Lista preliminar: personas a atender</h2>
          <p className="text-sm text-pizarra-suave">
            Selecciona un estimado. Nos ayuda a organizar horarios y transporte. {REFERENCIA_EDADES}
          </p>
        </div>
        {pendiente && <Loader2 className="h-4 w-4 animate-spin text-pizarra-suave" />}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {RANGOS_PERSONAS.map((r) => {
          const on = r.clave === valor;
          return (
            <button
              key={r.clave}
              type="button"
              aria-pressed={on}
              disabled={!editable || pendiente}
              onClick={() => elegir(r.clave)}
              className={`rounded-2xl border px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed ${
                on ? "border-rosa bg-rosa-50 text-rosa-700" : "border-borde hover:border-rosa-200 disabled:opacity-50 disabled:hover:border-borde"
              }`}
            >
              {r.texto}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-pizarra-suave">
        {editable
          ? `Puedes modificarlo hasta el ${limiteTexto} (5 días antes de la visita). EIRA recibirá un aviso con cada cambio.`
          : `El plazo para modificarlo terminó el ${limiteTexto}. Si necesitas un cambio, escribe a EIRA.`}
      </p>
      {error && <p className="mt-2 text-sm font-medium text-estado-observado">{error}</p>}
    </section>
  );
}
