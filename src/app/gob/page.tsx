import Link from "next/link";
import { ArrowRight, CalendarDays, Landmark, MapPin, Sparkles } from "lucide-react";
import { BarraProgreso } from "@/components/Insignias";
import { listarJornadas } from "@/lib/db";
import { formatoFecha } from "@/lib/fechas";
import { progreso, resumenAvance } from "@/lib/logica";

export const dynamic = "force-dynamic";

const DEMO = "naucalpan-2026";

export default function SelectorGob() {
  const jornadas = listarJornadas();
  const orden = [...jornadas].sort((a, b) => (a.token === DEMO ? -1 : b.token === DEMO ? 1 : 0));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-guinda text-white shadow-sm">
          <Landmark className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">Bienvenida, persona enlace municipal</h1>
        <p className="mt-2 text-pizarra-suave">
          Normalmente entrarás con el enlace único que te envía EIRA. Para la demo, elige un municipio:
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {orden.map((j) => {
          const p = progreso(j);
          const demo = j.token === DEMO;
          return (
            <Link
              key={j.id}
              href={`/gob/${j.token}`}
              className={`group tarjeta relative flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(105,28,50,0.4)] ${
                demo ? "ring-2 ring-guinda" : ""
              }`}
            >
              {demo && (
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-guinda px-2.5 py-1 text-[11px] font-bold text-white shadow">
                  <Sparkles className="h-3 w-3" /> Jornada demo activa
                </span>
              )}
              <p className="ojal">{j.estado}</p>
              <h2 className="mt-1 text-xl font-bold">{j.municipio}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-pizarra-suave"><MapPin className="h-3.5 w-3.5" /> <span className="truncate">{j.sede}</span></p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-pizarra-suave"><CalendarDays className="h-3.5 w-3.5" /> {formatoFecha(j.fecha)}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span>Preparación</span>
                  <span>{p}%</span>
                </div>
                <BarraProgreso valor={p} color={p === 100 ? "verde" : "guinda"} />
                <p className="mt-2 text-xs text-pizarra-suave">{resumenAvance(j)}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-guinda">
                Entrar al portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
              <code className="mt-2 text-[11px] text-slate-400">/gob/{j.token}</code>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
