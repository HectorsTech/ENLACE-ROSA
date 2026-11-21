import Link from "next/link";
import { Landmark } from "lucide-react";
import { AutoRefresco } from "@/components/AutoRefresco";
import { LogoEira } from "@/components/LogoEira";
import { listarJornadas } from "@/lib/db";
import { diagnostico } from "@/lib/logica";
import { BarraLateralEira } from "./BarraLateralEira";

export const dynamic = "force-dynamic";

export default function LayoutEira({ children }: { children: React.ReactNode }) {
  const jornadas = listarJornadas();
  const items = jornadas.map((j) => ({ id: j.id, municipio: j.municipio, semaforo: diagnostico(j).semaforo }));
  const mensajes = jornadas.reduce((acc, j) => acc + j.mensajes.filter((m) => !m.atendido).length, 0);

  return (
    <div className="flex min-h-screen bg-lienzo">
      <AutoRefresco />
      <BarraLateralEira jornadas={items} mensajesPendientes={mensajes} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado móvil */}
        <div className="flex items-center justify-between border-b border-borde bg-white px-4 py-3 lg:hidden">
          <Link href="/eira"><LogoEira /></Link>
          <Link href="/gob" className="btn-secundario px-3 py-2 text-xs">
            <Landmark className="h-3.5 w-3.5 text-guinda" /> Municipal
          </Link>
        </div>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
