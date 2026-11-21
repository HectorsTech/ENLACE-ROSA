import { Ribbon } from "lucide-react";

export function LogoEira({ variante = "rosa", compacto = false }: { variante?: "rosa" | "guinda" | "blanco"; compacto?: boolean }) {
  const fondo =
    variante === "guinda" ? "bg-guinda text-white" : variante === "blanco" ? "bg-white text-rosa" : "bg-rosa text-white";
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl shadow-sm ${fondo}`}>
        <Ribbon className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compacto && (
        <span className="leading-tight">
          <span className={`block font-display text-[17px] font-extrabold ${variante === "blanco" ? "text-white" : "text-pizarra"}`}>
            Enlace Rosa
          </span>
          <span className={`block text-[11px] font-medium ${variante === "blanco" ? "text-white/80" : "text-pizarra-suave"}`}>
            EIRA Movimiento Rosa A.C.
          </span>
        </span>
      )}
    </div>
  );
}
