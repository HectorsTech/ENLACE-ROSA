import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, HeartPulse, Landmark, LayoutDashboard, ShieldCheck, Upload } from "lucide-react";
import { LogoEira } from "@/components/LogoEira";
import { listarJornadas } from "@/lib/db";
import { diagnostico } from "@/lib/logica";

export const dynamic = "force-dynamic";

export default function Inicio() {
  const jornadas = listarJornadas();
  const enRiesgo = jornadas.filter((j) => diagnostico(j).semaforo === "riesgo").length;
  const listas = jornadas.filter((j) => diagnostico(j).semaforo === "luz_verde").length;

  return (
    <main className="fondo-puntos relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-rosa-degradado opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-guinda/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <LogoEira />
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-pizarra-suave backdrop-blur">
            Demo · Fase 1
          </span>
        </header>

        <section className="mt-16 max-w-3xl">
          <p className="ojal">Coordinación de jornadas de salud</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-pizarra sm:text-6xl">
            Menos pendientes,{" "}
            <span className="rounded-2xl bg-rosa px-3 text-white">más jornadas</span> a tiempo.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-pizarra-suave">
            Enlace Rosa reúne documentos, datos del espacio y avisos para que cada municipio sepa exactamente qué entregar,
            cómo y para cuándo — y que EIRA detecte riesgos antes de movilizar al equipo.
          </p>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href="/eira"
            className="group tarjeta relative overflow-hidden p-8 transition hover:-translate-y-1 hover:shadow-flotante"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-rosa-degradado" />
            <div className="flex items-start justify-between">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rosa text-white shadow-sm">
                <LayoutDashboard className="h-7 w-7" />
              </span>
              <span className="rounded-full bg-rosa-50 px-3 py-1 text-xs font-semibold text-rosa-700">/eira</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold">Entrar como Equipo EIRA</h2>
            <p className="mt-2 text-pizarra-suave">
              Tablero de jornadas ordenado por urgencia, revisión de expedientes y creación de nuevas jornadas.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-pizarra">
              <li className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-rosa" /> Aprobar u observar requisitos</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rosa" /> Indicador de Luz Verde Logística</li>
              <li className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-rosa" /> {jornadas.length} jornadas · {enRiesgo} en riesgo · {listas} lista(s)</li>
            </ul>
            <span className="btn-primario mt-8 w-full py-3 text-base">
              Abrir tablero EIRA <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/gob"
            className="group tarjeta relative overflow-hidden p-8 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(105,28,50,0.45)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-guinda-degradado" />
            <div className="flex items-start justify-between">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-guinda text-white shadow-sm">
                <Landmark className="h-7 w-7" />
              </span>
              <span className="rounded-full bg-guinda-50 px-3 py-1 text-xs font-semibold text-guinda">/gob</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold">Entrar como Enlace Municipal</h2>
            <p className="mt-2 text-pizarra-suave">
              Portal guiado para el municipio: qué falta, para cuándo y cómo entregarlo, sin menús complicados.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-pizarra">
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-guinda" /> Progreso y fechas límite por requisito</li>
              <li className="flex items-center gap-2"><Upload className="h-4 w-4 text-guinda" /> Subir documentos y nuevas versiones</li>
              <li className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-guinda" /> Pedir ayuda a la persona enlace de EIRA</li>
            </ul>
            <span className="btn-guinda mt-8 w-full py-3 text-base">
              Abrir portal municipal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        <footer className="mt-auto pt-12 text-center text-xs text-pizarra-suave">
          EIRA Movimiento Rosa A.C. · Plataforma de coordinación con gobiernos municipales · Datos de demostración
        </footer>
      </div>
    </main>
  );
}
