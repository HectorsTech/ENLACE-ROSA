import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Inbox, ShieldCheck, Siren } from "lucide-react";
import type { Diagnostico } from "@/lib/logica";
import type { EstadoRequisito } from "@/lib/types";

export const ESTADOS: Record<EstadoRequisito, { texto: string; clases: string; punto: string; icono: typeof Clock }> = {
  pendiente: { texto: "Pendiente", clases: "bg-amber-50 text-estado-pendiente ring-amber-200", punto: "bg-estado-pendiente", icono: Clock },
  recibido: { texto: "Recibido", clases: "bg-blue-50 text-estado-recibido ring-blue-200", punto: "bg-estado-recibido", icono: Inbox },
  observado: { texto: "Observado", clases: "bg-red-50 text-estado-observado ring-red-200", punto: "bg-estado-observado", icono: AlertTriangle },
  aprobado: { texto: "Aprobado", clases: "bg-emerald-50 text-estado-aprobado ring-emerald-200", punto: "bg-estado-aprobado", icono: CheckCircle2 },
};

export function EstadoBadge({ estado, chico = false }: { estado: EstadoRequisito; chico?: boolean }) {
  const e = ESTADOS[estado];
  const Icono = e.icono;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${e.clases} ${
        chico ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icono className={chico ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.4} />
      {e.texto}
    </span>
  );
}

export function SemaforoBadge({ d, grande = false }: { d: Diagnostico; grande?: boolean }) {
  const estilos = {
    luz_verde: { clases: "bg-emerald-600 text-white", icono: ShieldCheck },
    riesgo: { clases: "bg-estado-observado text-white", icono: Siren },
    preparacion: { clases: "bg-amber-100 text-amber-800", icono: CircleDashed },
  }[d.semaforo];
  const Icono = estilos.icono;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm ${estilos.clases} ${
        grande ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icono className={grande ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.4} />
      {d.etiqueta}
    </span>
  );
}

export function BarraProgreso({ valor, color = "rosa", alto = "h-2.5" }: { valor: number; color?: "rosa" | "guinda" | "verde" | "blanco"; alto?: string }) {
  const relleno = {
    rosa: "bg-gradient-to-r from-rosa-300 to-rosa",
    guinda: "bg-gradient-to-r from-rosa to-guinda",
    verde: "bg-estado-aprobado",
    blanco: "bg-white",
  }[color];
  const fondo = color === "blanco" ? "bg-white/30" : "bg-slate-100";
  return (
    <div className={`w-full overflow-hidden rounded-full ${fondo} ${alto}`} role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-700 ${relleno}`} style={{ width: `${Math.max(2, valor)}%` }} />
    </div>
  );
}

export function ChipModulo({ children, tono = "rosa" }: { children: React.ReactNode; tono?: "rosa" | "guinda" | "dorado" | "gris" }) {
  const t = {
    rosa: "bg-rosa-50 text-rosa-700 ring-rosa-100",
    guinda: "bg-guinda-50 text-guinda ring-guinda-100",
    dorado: "bg-dorado-50 text-[#8A6A3A] ring-dorado-100",
    gris: "bg-slate-50 text-pizarra-suave ring-slate-200",
  }[tono];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${t}`}>{children}</span>;
}
