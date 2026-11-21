import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Download,
  FileText,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Siren,
  Stethoscope,
} from "lucide-react";
import { BarraProgreso, ChipModulo, SemaforoBadge } from "@/components/Insignias";
import { GRUPOS, NOMBRE_MODULO, TEXTO_RANGO } from "@/lib/catalogo";
import { jornadaPorId } from "@/lib/db";
import { formatoFecha, formatoFechaHora, horasRestantes, textoFaltanDias, textoVencimiento } from "@/lib/fechas";
import { conteo, diagnostico, progreso, resumenAvance } from "@/lib/logica";
import type { GrupoRequisito } from "@/lib/types";
import { BotonAtendido, CopiarEnlace } from "./Acciones";
import { RevisionRequisito } from "./RevisionRequisito";

export const dynamic = "force-dynamic";

const MEDIO = { whatsapp: "WhatsApp", correo: "Correo electrónico", llamada: "Llamada" };

const PESTANAS = [
  { clave: "expediente", texto: "Expediente y checklist", icono: ClipboardList },
  { clave: "condiciones", texto: "Condiciones y alertas", icono: AlertTriangle },
] as const;

export default async function Expediente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "expediente" } = await searchParams;
  const j = await jornadaPorId(id);
  if (!j) notFound();

  const ahora = Date.now();
  const d = diagnostico(j, ahora);
  const p = progreso(j);
  const c = conteo(j);
  const grupos = (Object.keys(GRUPOS) as GrupoRequisito[]).map((g) => ({
    g,
    reqs: j.requisitos.filter((r) => r.grupo === g).sort((a, b) => a.diasAntes === b.diasAntes ? 0 : b.diasAntes - a.diasAntes),
  }));
  const portal = `/gob/${j.token}`;
  const mensajes = j.mensajes;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave">
        <Link href="/eira" className="hover:text-pizarra">Tablero</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">{j.municipio}</span>
      </nav>

      {/* Encabezado del expediente */}
      <section className="tarjeta overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-4xl font-normal tracking-tight">{j.municipio}</h1>
              <SemaforoBadge d={d} grande />
            </div>
            <p className="mt-1 text-pizarra-suave">{j.estado} · Expediente {j.id}</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Dato icono={CalendarDays} titulo="Día de la jornada" valor={formatoFecha(j.fecha)} pie={textoFaltanDias(j.fecha, ahora)} />
              <Dato icono={CalendarClock} titulo="Fecha límite general" valor={formatoFecha(j.fechaLimite)} pie="D-5 · último requisito" />
              <Dato icono={MapPin} titulo="Sede" valor={j.sede} pie={j.direccion} />
            </div>
          </div>
          <div className={`rounded-2xl p-5 ${d.semaforo === "luz_verde" ? "bg-emerald-50" : d.semaforo === "riesgo" ? "bg-red-50" : "bg-amber-50"}`}>
            <div className="flex items-center gap-2">
              {d.semaforo === "luz_verde" ? <ShieldCheck className="h-5 w-5 text-estado-aprobado" /> : <Siren className="h-5 w-5 text-estado-observado" />}
              <p className="font-bold">{d.etiqueta}</p>
            </div>
            <p className="mt-1 text-sm text-pizarra-suave">{d.motivo}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-display text-4xl font-extrabold">{p}%</span>
              <span className="text-xs text-pizarra-suave">{c.aprobado}/{j.requisitos.length} aprobados</span>
            </div>
            <div className="mt-2"><BarraProgreso valor={p} color={p === 100 ? "verde" : "rosa"} /></div>
            <p className="mt-2 text-xs font-medium text-pizarra-suave">{resumenAvance(j)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-borde bg-crema/60 px-6 py-3 text-sm">
          <span className="ojal">Enlace municipal</span>
          <code className="rounded-lg bg-white px-2 py-1 text-xs text-guinda ring-1 ring-guinda-100">{portal}</code>
          <CopiarEnlace ruta={portal} />
          <Link href={portal} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-guinda hover:underline">
            Abrir portal municipal <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

        {/* Pestañas */}
      <div className="flex gap-1 overflow-x-auto rounded-full bg-rosa-50 p-1">
        {PESTANAS.map((t) => {
          const activa = tab === t.clave;
          return (
            <Link
              key={t.clave}
              href={t.clave === "expediente" ? `/eira/jornadas/${j.id}` : `/eira/jornadas/${j.id}?tab=${t.clave}`}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activa ? "bg-white text-pizarra shadow-suave" : "text-pizarra-suave hover:text-pizarra"
              }`}
            >
              <t.icono className={`h-4 w-4 ${activa ? "text-rosa" : ""}`} /> {t.texto}
              {t.clave === "condiciones" && j.alertas.length > 0 && (
                <span className="rounded-full bg-guinda px-1.5 text-[10px] font-bold text-white">{j.alertas.length}</span>
              )}
            </Link>
          );
        })}
      </div>

      {tab === "condiciones" ? (
        <Condiciones j={j} />
      ) : (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-8">
            {grupos.map(({ g, reqs }) =>
              reqs.length === 0 ? null : (
                <section key={g}>
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">{GRUPOS[g].titulo}</h2>
                      <p className="text-sm text-pizarra-suave">{GRUPOS[g].descripcion}</p>
                    </div>
                    <span className="text-xs font-semibold text-pizarra-suave">
                      {reqs.filter((r) => r.estado === "aprobado").length}/{reqs.length} aprobados
                    </span>
                  </div>
                  <div className="space-y-4">
                    {reqs.map((r) => (
                      <RevisionRequisito
                        key={r.id}
                        jornadaId={j.id}
                        r={r}
                        fechaLimiteTexto={formatoFecha(r.fechaLimite)}
                        venceTexto={textoVencimiento(r.fechaLimite, ahora)}
                        urgente={r.estado !== "aprobado" && r.estado !== "recibido" && horasRestantes(r.fechaLimite, ahora) < 72}
                      />
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>

          <aside className="space-y-4">
            <div className="tarjeta p-5">
              <h2 className="flex items-center gap-2 text-base font-bold"><MessageCircle className="h-4 w-4 text-rosa" /> Avisos y preguntas del municipio</h2>
              <div className="mt-3 space-y-2">
                {mensajes.length === 0 && <p className="rounded-2xl bg-slate-50 p-3 text-center text-sm text-pizarra-suave">Sin preguntas.</p>}
                {mensajes.map((m) => {
                  const req = j.requisitos.find((r) => r.id === m.requisitoId);
                  return (
                    <div key={m.id} className={`rounded-2xl p-3 ${m.atendido ? "bg-slate-50 opacity-70" : "bg-rosa-50"}`}>
                      <p className="text-[11px] font-semibold text-pizarra-suave">
                        {m.autor} · {formatoFechaHora(m.fecha)}
                      </p>
                      {m.tipo === "cambio_estimado" && <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-guinda">Cambio de estimado</p>}
                      {req && <p className="mt-0.5 text-[11px] font-semibold text-rosa-700">Sobre: {req.nombre}</p>}
                      <p className="mt-1 text-sm">{m.mensaje}</p>
                      {!m.atendido ? <BotonAtendido jornadaId={j.id} mensajeId={m.id} /> : <p className="mt-1 text-[11px] font-semibold text-estado-aprobado">Atendida</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tarjeta p-5">
              <h2 className="text-base font-bold">Contactos</h2>
              <div className="mt-3 space-y-4 text-sm">
                <div>
                  <p className="ojal text-guinda">Enlace municipal</p>
                  <p className="mt-1 font-semibold">{j.enlaceMunicipal.nombre}</p>
                  <p className="text-xs text-pizarra-suave">{j.enlaceMunicipal.cargo}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs"><Phone className="h-3.5 w-3.5 text-pizarra-suave" /> {j.enlaceMunicipal.celular} (WhatsApp: {j.enlaceMunicipal.whatsapp === j.enlaceMunicipal.celular ? "mismo" : j.enlaceMunicipal.whatsapp})</p>
                  <p className="flex items-center gap-1.5 text-xs"><Mail className="h-3.5 w-3.5 text-pizarra-suave" /> {j.enlaceMunicipal.correo}</p>
                  <p className="mt-1.5"><ChipModulo tono="guinda">Prefiere: {MEDIO[j.enlaceMunicipal.medioPreferido]}</ChipModulo></p>
                </div>
                <div className="border-t border-borde pt-3">
                  <p className="ojal text-rosa-700">Enlace EIRA</p>
                  <p className="mt-1 font-semibold">{j.enlaceEira.nombre}</p>
                  <p className="text-xs text-pizarra-suave">{j.enlaceEira.cargo} · {j.enlaceEira.telefono}</p>
                </div>
              </div>
            </div>

            <div className="tarjeta p-5">
              <h2 className="flex items-center gap-2 text-base font-bold"><FileText className="h-4 w-4 text-rosa" /> Carta compromiso</h2>
              <p className="mt-1 text-xs text-pizarra-suave">
                {j.carta?.firmadaEn ? `Firmada digitalmente el ${formatoFechaHora(j.carta.firmadaEn)}.` : j.carta ? "Datos llenados; aún sin firma digital." : "El municipio aún no la llena."}
              </p>
              <a href={`/eira/jornadas/${j.id}/carta-pdf`} className="btn-secundario mt-3 w-full text-xs">
                <Download className="h-4 w-4" /> Descargar carta en PDF
              </a>
            </div>

            <div className="tarjeta-crema p-5">
              <h2 className="flex items-center gap-2 text-base font-bold"><Stethoscope className="h-4 w-4 text-rosa" /> Servicios y módulos</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.servicios.map((s) => <ChipModulo key={s}>{s}</ChipModulo>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.modulos.length === 0 && <span className="text-xs text-pizarra-suave">Sin módulos adicionales</span>}
                {j.modulos.map((m) => <ChipModulo key={m} tono="dorado">{NOMBRE_MODULO[m]}</ChipModulo>)}
              </div>
              <p className="mt-3 text-xs text-pizarra-suave">{j.plantilla} · Personas estimadas: {TEXTO_RANGO[j.estimadoPersonas]}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Dato({ icono: Icono, titulo, valor, pie }: { icono: typeof MapPin; titulo: string; valor: string; pie: string }) {
  return (
    <div className="rounded-2xl bg-crema p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-pizarra-suave">
        <Icono className="h-3.5 w-3.5 text-rosa" /> {titulo}
      </p>
      <p className="mt-1 font-semibold leading-snug">{valor}</p>
      <p className="text-xs text-pizarra-suave">{pie}</p>
    </div>
  );
}

const ETIQUETA_INTERNET = { wifi: "Wi-Fi", telcel: "Telcel", altan_cfe: "Altán / CFE", ninguna: "Ninguna" };

function Condiciones({ j }: { j: NonNullable<Awaited<ReturnType<typeof jornadaPorId>>> }) {
  const f = j.ficha;
  if (!f) {
    return (
      <div className="tarjeta grid place-items-center px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-rosa-50 text-rosa-600"><AlertTriangle className="h-6 w-6" /></span>
        <h2 className="mt-4 font-serif text-2xl font-normal">Aún no hay ficha de campo</h2>
        <p className="mt-1 max-w-md text-sm text-pizarra-suave">
          Cuando {j.municipio} envíe la ficha del lugar y la comunidad, aquí aparecerán las alertas operativas generadas automáticamente.
        </p>
      </div>
    );
  }
  const si = (v: string) => (v === "si" ? "Sí" : "No");
  const filas: [string, string][] = [
    ["Toma eléctrica a < 20 m", si(f.tomaMenos20m)],
    ["Voltaje estable", si(f.voltajeEstable)],
    ["Apagones", { nunca: "Nunca", ocasionales: "Ocasionales", frecuentes: "Frecuentes" }[f.apagones]],
    ["Planta de respaldo", si(f.plantaRespaldo)],
    ["Internet / señal", f.internet.map((x) => ETIQUETA_INTERNET[x]).join(", ")],
    ["Espacio privado", si(f.espacioPrivado)],
    ["Techado", si(f.espacioTechado)],
    ["Baños / agua", `${si(f.banos)} / ${si(f.aguaDisponible)}`],
    ["Mesas y sillas", si(f.mesasSillas)],
    ["Lengua indígena", f.hablaLenguaIndigena === "si" ? [f.lengua, f.variante].filter(Boolean).join(" · ") || "Sí" : "No"],
    ["Días/horarios locales", f.diasHorariosLocales || "—"],
    ["Acceso", `${f.accesoVehicular === "dificil" ? "Difícil" : "Fácil"}${f.caminos4x4 === "si" ? " · 4×4" : ""}`],
  ];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-bold">Alertas operativas ({j.alertas.length})</h2>
          <span className="text-xs text-pizarra-suave">Ficha enviada {formatoFechaHora(f.actualizadoEn)}</span>
        </div>
        {j.alertas.length === 0 && <p className="tarjeta p-6 text-center text-sm text-pizarra-suave">Sin alertas: las condiciones reportadas son adecuadas.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {j.alertas.map((a) => (
            <article key={a.id} className={`rounded-2xl border p-4 ${a.severidad === "alta" ? "border-guinda-100 bg-guinda-50/60" : "border-borde bg-white"}`}>
              <div className="flex items-start gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${a.severidad === "alta" ? "bg-guinda text-white" : "bg-dorado-50 text-[#8A6A3A]"}`}>
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold leading-snug">{a.titulo}</p>
                  <p className="mt-1 text-sm text-pizarra-suave">{a.detalle}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{formatoFechaHora(a.fecha)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside className="tarjeta h-fit p-5">
        <h2 className="text-base font-bold">Respuestas de la ficha</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {filas.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-borde pb-2 last:border-0">
              <dt className="text-pizarra-suave">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
