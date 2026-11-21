"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, LayoutDashboard, Landmark, LogOut, Plus, RotateCcw, MapPin } from "lucide-react";
import { LogoEira } from "@/components/LogoEira";
import { reiniciarDemo } from "@/lib/actions";
import { cerrarSesionEira } from "@/lib/auth-actions";
import { BuscadorJornadas, type ItemBusqueda } from "./BuscadorJornadas";

interface ItemJornada extends ItemBusqueda {
  semaforo: "luz_verde" | "riesgo" | "preparacion" | "completada";
}

const PUNTO = { luz_verde: "bg-estado-aprobado", riesgo: "bg-estado-observado", preparacion: "bg-estado-pendiente", completada: "bg-slate-300" };

export function BarraLateralEira({ jornadas, mensajesPendientes }: { jornadas: ItemJornada[]; mensajesPendientes: number }) {
  const ruta = usePathname();
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  const nav = [
    { href: "/eira", texto: "Tablero de jornadas", icono: LayoutDashboard, activo: ruta === "/eira" },
    { href: "/eira/jornadas/nueva", texto: "Nueva jornada", icono: Plus, activo: ruta === "/eira/jornadas/nueva" },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-borde bg-white px-4 py-6 lg:flex">
      <Link href="/eira" className="px-2">
        <LogoEira />
      </Link>

      <div className="mt-6"><BuscadorJornadas jornadas={jornadas} /></div>

      <Link href="/eira/jornadas/nueva" className="btn-primario mt-4 w-full py-3">
        <Plus className="h-4 w-4" strokeWidth={2.6} /> Crear jornada
      </Link>

      <nav className="mt-7 space-y-1">
        <p className="ojal px-3 pb-2">Administración</p>
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              n.activo ? "bg-rosa-50 text-rosa-700" : "text-pizarra-suave hover:bg-slate-50 hover:text-pizarra"
            }`}
          >
            {n.activo && <span className="absolute left-0 top-2 h-6 w-1 rounded-r-full bg-rosa" />}
            <n.icono className="h-[18px] w-[18px]" /> {n.texto}
          </Link>
        ))}
      </nav>

      <div className="mt-7">
        <p className="ojal px-3 pb-2">Expedientes</p>
        <div className="space-y-0.5">
          {jornadas.map((j) => {
            const activo = ruta.startsWith(`/eira/jornadas/${j.id}`);
            return (
              <Link
                key={j.id}
                href={`/eira/jornadas/${j.id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  activo ? "bg-crema font-semibold text-pizarra" : "text-pizarra-suave hover:bg-slate-50 hover:text-pizarra"
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{j.municipio}</span>
                <span className={`ml-auto h-2 w-2 shrink-0 rounded-full ${PUNTO[j.semaforo]}`} />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto space-y-3">
        {mensajesPendientes > 0 && (
          <Link href="/eira/preguntas" className="flex items-center gap-2 rounded-2xl bg-rosa-50 px-3 py-2.5 text-xs font-medium text-rosa-700 transition hover:bg-rosa-100">
            <Bell className="h-4 w-4 shrink-0" /> {mensajesPendientes} pregunta(s) de municipios sin responder
          </Link>
        )}
        <div className="tarjeta-crema flex items-center gap-3 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-rosa-degradado text-sm font-bold text-white">LF</span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">Lucía Fernández</p>
            <p className="truncate text-[11px] text-pizarra-suave">Coordinadora de Jornadas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/gob" className="btn-secundario flex-1 px-2 py-2 text-xs">
            <Landmark className="h-3.5 w-3.5 text-guinda" /> Vista municipal
          </Link>
          <button
            type="button"
            title="Restaurar datos de demostración"
            disabled={pendiente}
            onClick={() =>
              iniciar(async () => {
                if (!confirm("¿Restaurar los datos de demostración? Se perderán los cambios.")) return;
                await reiniciarDemo();
                router.refresh();
              })
            }
            className="btn-secundario px-3 py-2 text-xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${pendiente ? "animate-spin" : ""}`} />
          </button>
          <form action={cerrarSesionEira}>
            <button type="submit" title="Cerrar sesión" className="btn-secundario px-3 py-2 text-xs"><LogOut className="h-3.5 w-3.5" /></button>
          </form>
        </div>
      </div>
    </aside>
  );
}
