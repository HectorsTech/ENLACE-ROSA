import Link from "next/link";
import {
  AlertOctagon,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox,
  MapPin,
  PhoneCall,
  Plus,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";
import { BarraProgreso, ChipModulo, EstadoBadge, SemaforoBadge } from "@/components/Insignias";
import { NOMBRE_MODULO } from "@/lib/catalogo";
import { listarJornadas } from "@/lib/db";
import { formatoFecha, formatoFechaLarga, formatoFechaHora, textoFaltanDias, textoVencimiento } from "@/lib/fechas";
import { conteo, diagnostico, observados, progreso, vencenEn } from "@/lib/logica";

export const dynamic = "force-dynamic";

const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "72h", texto: "Vencen en < 72 h", icono: Clock },
  { clave: "observados", texto: "Con observados", icono: AlertOctagon },
  { clave: "listas", texto: "Listas", icono: ShieldCheck },
] as const;

export default async function TableroEira({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { filtro = "todas" } = await searchParams;
  const ahora = Date.now();
  const todas = listarJornadas()
    .map((j) => ({ j, d: diagnostico(j, ahora), p: progreso(j), c: conteo(j), v72: vencenEn(j, 72, ahora), obs: observados(j) }))
    .sort((a, b) => a.d.urgencia - b.d.urgencia);

  const filtradas = todas.filter((x) => {
    if (filtro === "72h") return x.v72.length > 0;
    if (filtro === "observados") return x.obs.length > 0;
    if (filtro === "listas") return x.d.semaforo === "luz_verde";
    return true;
  });

  const cuenta = {
    todas: todas.length,
    "72h": todas.filter((x) => x.v72.length > 0).length,
    observados: todas.filter((x) => x.obs.length > 0).length,
    listas: todas.filter((x) => x.d.semaforo === "luz_verde").length,
  } as Record<string, number>;

  const enRiesgo = todas.filter((x) => x.d.semaforo === "riesgo").length;
  const porRevisar = todas.flatMap((x) =>
    x.j.requisitos.filter((r) => r.estado === "recibido").map((r) => ({ j: x.j, r })),
  );
  const alertas = todas.filter((x) => x.d.alertaCoordinador);
  const promedio = Math.round(todas.reduce((a, x) => a + x.p, 0) / Math.max(1, todas.length));

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ojal">Equipo EIRA · {formatoFechaLarga(new Date(ahora).toISOString())}</p>
          <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Tablero de <em>jornadas</em></h1>
          <p className="mt-1 text-pizarra-suave">Ordenadas por urgencia y riesgo de retraso.</p>
        </div>
        <Link href="/eira/jornadas/nueva" className="btn-primario">
          <Plus className="h-4 w-4" strokeWidth={2.6} /> Crear jornada
        </Link>
      </div>

      {/* Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-rosa-degradado p-5 text-white shadow-flotante">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20" />
          <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Preparación promedio</p>
          <p className="mt-2 font-display text-4xl font-extrabold">{promedio}%</p>
          <div className="mt-3"><BarraProgreso valor={promedio} color="blanco" alto="h-2" /></div>
          <p className="mt-2 text-xs text-white/90">{todas.length} jornadas activas</p>
        </div>
        <Metrica icono={ShieldCheck} tono="text-estado-aprobado bg-emerald-50" titulo="Luz Verde Logística" valor={cuenta.listas} pie="Listas para movilizar" />
        <Metrica icono={Siren} tono="text-estado-observado bg-red-50" titulo="Riesgo de reprogramación" valor={enRiesgo} pie="No cubrir viáticos aún" />
        <Metrica icono={Inbox} tono="text-estado-recibido bg-blue-50" titulo="Por revisar" valor={porRevisar.length} pie="Documentos recibidos" />
      </section>

      {/* Alerta coordinador */}
      {alertas.length > 0 && (
        <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-red-100 bg-red-50/70 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-estado-observado text-white">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-red-800">Aviso al coordinador: requisitos críticos a menos de 48 h</p>
            <ul className="mt-1 space-y-0.5 text-sm text-red-700">
              {alertas.map(({ j }) => {
                const criticos = vencenEn(j, 48, ahora).filter((r) => r.critico);
                return (
                  <li key={j.id}>
                    <Link href={`/eira/jornadas/${j.id}`} className="font-semibold underline-offset-2 hover:underline">{j.municipio}</Link>
                    {": "}
                    {criticos.map((r) => r.nombre).join(", ")} — llamar a {j.enlaceMunicipal.nombre} ({j.enlaceMunicipal.celular}).
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        {/* Lista de jornadas */}
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTROS.map((f) => {
              const activo = filtro === f.clave;
              const Icono = "icono" in f ? f.icono : null;
              return (
                <Link
                  key={f.clave}
                  href={f.clave === "todas" ? "/eira" : `/eira?filtro=${f.clave}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    activo ? "border-rosa bg-rosa text-white shadow-sm" : "border-borde bg-white text-pizarra-suave hover:border-rosa-200 hover:text-pizarra"
                  }`}
                >
                  {Icono && <Icono className="h-3.5 w-3.5" />}
                  {f.texto}
                  <span className={`rounded-full px-1.5 text-[11px] font-bold ${activo ? "bg-white/25" : "bg-slate-100"}`}>{cuenta[f.clave]}</span>
                </Link>
              );
            })}
          </div>

          {filtradas.length === 0 ? (
            <div className="tarjeta grid place-items-center p-12 text-center text-pizarra-suave">
              <CheckCircle2 className="h-8 w-8 text-estado-aprobado" />
              <p className="mt-2 font-medium">No hay jornadas con este filtro.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtradas.map(({ j, d, p, c, v72 }) => {
                const proximo = j.requisitos
                  .filter((r) => r.estado !== "aprobado")
                  .sort((a, b) => +new Date(a.fechaLimite) - +new Date(b.fechaLimite))[0];
                const borde = { luz_verde: "before:bg-estado-aprobado", riesgo: "before:bg-estado-observado", preparacion: "before:bg-estado-pendiente" }[d.semaforo];
                return (
                  <Link
                    key={j.id}
                    href={`/eira/jornadas/${j.id}`}
                    className={`tarjeta group relative block overflow-hidden p-5 transition before:absolute before:inset-y-0 before:left-0 before:w-1.5 hover:-translate-y-0.5 hover:shadow-flotante ${borde}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{j.municipio}</h3>
                          <span className="text-sm text-pizarra-suave">· {j.estado}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-pizarra-suave">
                          <MapPin className="h-3.5 w-3.5" /> {j.sede}
                        </p>
                      </div>
                      <SemaforoBadge d={d} />
                    </div>

                    <div className="mt-4 grid gap-4 pl-2 md:grid-cols-[1.1fr_1fr_1.2fr]">
                      <div>
                        <p className="ojal">Jornada</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                          <CalendarDays className="h-4 w-4 text-rosa" /> {formatoFecha(j.fecha)}
                        </p>
                        <p className="text-xs text-pizarra-suave">{textoFaltanDias(j.fecha, ahora)} · meta {j.metaPacientes} mujeres</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="ojal">Preparación</p>
                          <span className="text-sm font-bold">{p}%</span>
                        </div>
                        <div className="mt-2"><BarraProgreso valor={p} color={p === 100 ? "verde" : "rosa"} /></div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                          <span className="text-estado-aprobado">{c.aprobado} aprobados</span>
                          {c.recibido > 0 && <span className="text-estado-recibido">{c.recibido} recibidos</span>}
                          {c.observado > 0 && <span className="text-estado-observado">{c.observado} observados</span>}
                          {c.pendiente > 0 && <span className="text-estado-pendiente">{c.pendiente} pendientes</span>}
                        </div>
                      </div>
                      <div>
                        <p className="ojal">Próximo vencimiento</p>
                        {proximo ? (
                          <>
                            <p className="mt-1 truncate text-sm font-semibold">{proximo.nombre}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <EstadoBadge estado={proximo.estado} chico />
                              <span className={`text-xs font-semibold ${v72.includes(proximo) ? "text-estado-observado" : "text-pizarra-suave"}`}>
                                {textoVencimiento(proximo.fechaLimite, ahora)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-estado-aprobado">Todo aprobado ✓</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borde pl-2 pt-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {j.modulos.map((m) => <ChipModulo key={m}>{NOMBRE_MODULO[m]}</ChipModulo>)}
                        <span className="flex items-center gap-1 text-xs text-pizarra-suave"><Users className="h-3.5 w-3.5" /> {j.enlaceMunicipal.nombre}</span>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold text-rosa-700">
                        Ver expediente <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Bandeja de revisión */}
        <aside className="space-y-4">
          <div className="tarjeta p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Bandeja de revisión</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-estado-recibido">{porRevisar.length}</span>
            </div>
            <p className="mt-0.5 text-xs text-pizarra-suave">Documentos recibidos esperando aprobación u observación.</p>
            <div className="mt-4 space-y-2">
              {porRevisar.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-pizarra-suave">Sin documentos por revisar 🎉</p>}
              {porRevisar.map(({ j, r }) => {
                const v = r.versiones[r.versiones.length - 1];
                return (
                  <Link key={r.id} href={`/eira/jornadas/${j.id}#${r.id}`} className="block rounded-2xl border border-borde p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-pizarra-suave">{j.municipio}</p>
                    <p className="truncate text-sm font-semibold">{r.nombre}</p>
                    <p className="mt-0.5 truncate text-xs text-pizarra-suave">
                      v{v?.numero} · {v?.archivo} · {v ? formatoFechaHora(v.fecha) : ""}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="tarjeta-crema p-5">
            <h2 className="text-base font-bold">Reglas de recordatorios</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-pizarra-suave">
              <li>• Máximo 1 recordatorio automático cada 48 h por jornada.</li>
              <li>• Solo días hábiles, de 9:00 a. m. a 6:00 p. m.</li>
              <li>• WhatsApp primero; si no es posible, correo.</li>
              <li>• Crítico a menos de 48 h → aviso al coordinador.</li>
            </ul>
            <p className="mt-3 text-[11px] font-semibold text-rosa-700">Envío de recordatorios disponible en Fase 2.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metrica({ icono: Icono, tono, titulo, valor, pie }: { icono: typeof Clock; tono: string; titulo: string; valor: number; pie: string }) {
  return (
    <div className="tarjeta p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-pizarra-suave">{titulo}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tono}`}><Icono className="h-[18px] w-[18px]" /></span>
      </div>
      <p className="mt-2 font-display text-4xl font-extrabold">{valor}</p>
      <p className="mt-1 text-xs text-pizarra-suave">{pie}</p>
    </div>
  );
}
