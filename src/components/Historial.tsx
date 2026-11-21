import { CheckCircle2, AlertTriangle, Inbox, Sparkles, Upload, MessageCircleQuestion } from "lucide-react";
import { formatoFechaHora } from "@/lib/fechas";
import type { EventoHistorial } from "@/lib/types";

const ICONOS = {
  creado: { icono: Sparkles, clases: "bg-slate-100 text-slate-500" },
  subida: { icono: Upload, clases: "bg-blue-50 text-estado-recibido" },
  aprobado: { icono: CheckCircle2, clases: "bg-emerald-50 text-estado-aprobado" },
  observado: { icono: AlertTriangle, clases: "bg-red-50 text-estado-observado" },
  ayuda: { icono: MessageCircleQuestion, clases: "bg-rosa-50 text-rosa" },
} as const;

const ROL = { eira: "EIRA", municipio: "Municipio", sistema: "Sistema" };

/** Historial de quién subió, revisó, observó y aprobó, y cuándo. */
export function Historial({ eventos }: { eventos: EventoHistorial[] }) {
  const lista = [...eventos].reverse();
  return (
    <ol className="relative space-y-3 border-l border-dashed border-borde pl-5">
      {lista.map((ev) => {
        const cfg = ICONOS[ev.tipo] ?? ICONOS.creado;
        const Icono = cfg.icono ?? Inbox;
        return (
          <li key={ev.id} className="relative">
            <span className={`absolute -left-[30px] top-0.5 grid h-5 w-5 place-items-center rounded-full ring-4 ring-white ${cfg.clases}`}>
              <Icono className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <p className="text-[13px] leading-snug text-pizarra">
              <span className="font-semibold">{ev.actor}</span>{" "}
              <span className="text-[11px] font-medium text-pizarra-suave">· {ROL[ev.rol]}</span>
            </p>
            <p className="text-[13px] leading-snug text-pizarra-suave">{ev.detalle}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{formatoFechaHora(ev.fecha)}</p>
          </li>
        );
      })}
    </ol>
  );
}
