"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { marcarAtendido } from "@/lib/actions";

export function BotonAtendido({ jornadaId, mensajeId }: { jornadaId: string; mensajeId: string }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() =>
        iniciar(async () => {
          await marcarAtendido({ jornadaId, mensajeId });
          router.refresh();
        })
      }
      className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-pizarra-suave ring-1 ring-slate-200 hover:text-estado-aprobado"
    >
      <Check className="h-3 w-3" /> Marcar como atendida
    </button>
  );
}

export function CopiarEnlace({ ruta }: { ruta: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${ruta}`)}
      className="rounded-lg px-2 py-1 text-[11px] font-semibold text-rosa-700 hover:bg-rosa-50"
    >
      Copiar
    </button>
  );
}
