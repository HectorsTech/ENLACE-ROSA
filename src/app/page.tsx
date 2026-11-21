import Link from "next/link";
import { ArrowRight, ClipboardCheck, Landmark, LayoutDashboard, ShieldCheck, Siren } from "lucide-react";
import { BarraProgreso } from "@/components/Insignias";
import { LogoEira } from "@/components/LogoEira";
import { listarJornadas } from "@/lib/db";
import { diagnostico, progreso } from "@/lib/logica";

export const dynamic = "force-dynamic";

const PASOS = [
  { n: 1, t: "EIRA crea la jornada", d: "Se activan los requisitos con fechas límite D-15, D-10 y D-5 según los servicios y módulos." },
  { n: 2, t: "El municipio entrega", d: "Con un enlace único sube documentos, ve qué falta y pregunta sus dudas sin menús complicados." },
  { n: 3, t: "Luz Verde Logística", d: "EIRA revisa, aprueba u observa, y solo moviliza al equipo cuando todo lo crítico está listo." },
];

export default function Inicio() {
  const jornadas = listarJornadas();
  const enRiesgo = jornadas.filter((j) => diagnostico(j).semaforo === "riesgo").length;
  const listas = jornadas.filter((j) => diagnostico(j).semaforo === "luz_verde").length;
  const promedio = Math.round(jornadas.reduce((a, j) => a + progreso(j), 0) / Math.max(1, jornadas.length));

  return (
    <main className="min-h-screen bg-lienzo">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="flex h-[72px] items-center justify-between">
          <LogoEira />
          <nav className="flex items-center gap-2">
            <Link href="/gob" className="btn text-pizarra hover:bg-rosa-50">Portal municipal</Link>
            <Link href="/eira" className="btn-primario">Entrar como EIRA</Link>
          </nav>
        </header>

        <section className="grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="ojal">Enlace Rosa · EIRA Movimiento Rosa</p>
            <h1 className="mt-5 font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-7xl">
              Menos pendientes, más <em>jornadas a tiempo</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pizarra-suave">
              Enlace Rosa reúne documentos, datos del espacio y avisos para que cada municipio sepa exactamente qué entregar,
              cómo y para cuándo, y para que EIRA detecte riesgos antes de movilizar al equipo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/eira" className="btn-primario px-7 py-3 text-base">
                Abrir tablero EIRA <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/gob" className="btn-secundario px-7 py-3 text-base">
                Portal municipal
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-2 rounded-2xl bg-guinda" />
            <div className="tarjeta relative p-8 shadow-flotante">
              <p className="ojal">Panorama de hoy</p>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-serif text-6xl leading-none">{promedio}%</span>
                <span className="text-sm text-pizarra-suave">{jornadas.length} jornadas activas</span>
              </div>
              <div className="mt-3"><BarraProgreso valor={promedio} color="guinda" /></div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-crema p-4">
                  <ShieldCheck className="h-5 w-5 text-estado-aprobado" />
                  <p className="mt-2 font-serif text-3xl">{listas}</p>
                  <p className="text-xs text-pizarra-suave">Luz verde logística</p>
                </div>
                <div className="rounded-2xl bg-crema p-4">
                  <Siren className="h-5 w-5 text-estado-observado" />
                  <p className="mt-2 font-serif text-3xl">{enRiesgo}</p>
                  <p className="text-xs text-pizarra-suave">En riesgo de reprogramar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <h2 className="mx-auto max-w-2xl text-center font-serif text-4xl font-normal leading-tight">
            Tres pasos para llegar <span className="acento">listas</span> al día de la jornada
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PASOS.map((p) => {
              const tinta = p.n === 1;
              const acento = p.n === 3;
              return (
                <div
                  key={p.n}
                  className={`rounded-2xl p-8 ${
                    tinta ? "bg-guinda text-white" : acento ? "border-[1.5px] border-rosa bg-white" : "border border-borde bg-white"
                  }`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-rosa text-sm font-bold text-white">{p.n}</span>
                  <h3 className="mt-5 text-xl font-medium tracking-tight">{p.t}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${tinta ? "text-guinda-100" : "text-pizarra-suave"}`}>{p.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 pb-20 md:grid-cols-2">
          <Link href="/eira" className="group tarjeta p-8 transition hover:-translate-y-1 hover:shadow-flotante">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-rosa-50 text-rosa-600">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <h2 className="mt-6 font-serif text-3xl font-normal">Entrar como <em className="acento">Equipo EIRA</em></h2>
            <p className="mt-2 text-pizarra-suave">
              Tablero de jornadas ordenado por urgencia, revisión de expedientes y creación de nuevas jornadas.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm text-pizarra"><ClipboardCheck className="h-4 w-4 text-rosa" /> Aprobar u observar requisitos</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-rosa-700">
              Abrir tablero <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link href="/gob" className="group rounded-2xl bg-guinda p-8 text-white transition hover:-translate-y-1 hover:shadow-flotante">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white">
              <Landmark className="h-6 w-6" />
            </span>
            <h2 className="mt-6 font-serif text-3xl font-normal">Entrar como <em className="font-serif italic text-rosa-200">Enlace Municipal</em></h2>
            <p className="mt-2 text-guinda-100">
              Portal guiado para el municipio: qué falta, para cuándo y cómo entregarlo.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-rosa-200" /> Sube documentos y pide ayuda a EIRA</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-rosa-200">
              Abrir portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
      </div>

      <footer className="bg-guinda text-guinda-100">
        <div className="mx-auto max-w-[1200px] px-6 py-8 text-sm">
          EIRA Movimiento Rosa A.C. · Plataforma de coordinación con gobiernos municipales · Datos de demostración
        </div>
      </footer>
    </main>
  );
}
