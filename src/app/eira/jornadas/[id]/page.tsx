import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  ShieldCheck,
  Siren,
  Stethoscope,
} from "lucide-react";
import { BarraProgreso, ChipModulo, SemaforoBadge } from "@/components/Insignias";
import { GRUPOS, NOMBRE_MODULO } from "@/lib/catalogo";
import { jornadaPorId } from "@/lib/db";
import { formatoFecha, formatoFechaHora, horasRestantes, textoFaltanDias, textoVencimiento } from "@/lib/fechas";
import { conteo, diagnostico, progreso, resumenAvance } from "@/lib/logica";
import type { GrupoRequisito } from "@/lib/types";
import { BotonAtendido, CopiarEnlace } from "./Acciones";
import { RevisionRequisito } from "./RevisionRequisito";

export const dynamic = "force-dynamic";

const PESTANAS = [
  { clave: "expediente", texto: "Expediente y checklist", icono: ClipboardList },
  { clave: "condiciones", texto: "Condiciones y alertas", icono: AlertTriangle },
  { clave: "difusion", texto: "Kit de difusión", icono: Megaphone },
] as const;

const MEDIO = { whatsapp: "WhatsApp", correo: "Correo electrónico", llamada: "Llamada" };

export default async function Expediente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "expediente" } = await searchParams;
  const j = jornadaPorId(id);
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
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/70 p-1">
        {PESTANAS.map((t) => {
          const activa = tab === t.clave;
          return (
            <Link
              key={t.clave}
              href={t.clave === "expediente" ? `/eira/jornadas/${j.id}` : `/eira/jornadas/${j.id}?tab=${t.clave}`}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activa ? "bg-white text-pizarra shadow-sm" : "text-pizarra-suave hover:text-pizarra"
              }`}
            >
              <t.icono className={`h-4 w-4 ${activa ? "text-rosa" : ""}`} /> {t.texto}
              {t.clave !== "expediente" && <span className="rounded-full bg-slate-200/80 px-1.5 text-[10px] text-slate-500">Fase 2</span>}
            </Link>
          );
        })}
      </div>

      {tab === "expediente" ? (
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
              <h2 className="flex items-center gap-2 text-base font-bold"><MessageCircle className="h-4 w-4 text-rosa" /> Preguntas del municipio</h2>
              <div className="mt-3 space-y-2">
                {mensajes.length === 0 && <p className="rounded-2xl bg-slate-50 p-3 text-center text-sm text-pizarra-suave">Sin preguntas.</p>}
                {mensajes.map((m) => {
                  const req = j.requisitos.find((r) => r.id === m.requisitoId);
                  return (
                    <div key={m.id} className={`rounded-2xl p-3 ${m.atendido ? "bg-slate-50 opacity-70" : "bg-rosa-50"}`}>
                      <p className="text-[11px] font-semibold text-pizarra-suave">
                        {m.autor} · {formatoFechaHora(m.fecha)}
                      </p>
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

            <div className="tarjeta-crema p-5">
              <h2 className="flex items-center gap-2 text-base font-bold"><Stethoscope className="h-4 w-4 text-rosa" /> Servicios y módulos</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.servicios.map((s) => <ChipModulo key={s}>{s}</ChipModulo>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.modulos.length === 0 && <span className="text-xs text-pizarra-suave">Sin módulos adicionales</span>}
                {j.modulos.map((m) => <ChipModulo key={m} tono="dorado">{NOMBRE_MODULO[m]}</ChipModulo>)}
              </div>
              <p className="mt-3 text-xs text-pizarra-suave">{j.plantilla} · Meta: {j.metaPacientes} mujeres</p>
            </div>
          </aside>
        </div>
      ) : (
        <Placeholder tab={tab} />
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

function Placeholder({ tab }: { tab: string }) {
  const info =
    tab === "condiciones"
      ? {
          icono: AlertTriangle,
          titulo: "Condiciones y alertas",
          texto:
            "Aquí aparecerán las necesidades detectadas a partir de la ficha de campo: planta o regulador eléctrico, operación sin conexión, traductora, transporte comunitario, resguardo nocturno y riesgos por clima o caminos.",
          items: ["Planta / regulador eléctrico", "Modo sin conexión", "Traductora bilingüe", "Transporte comunitario", "Caminos 4×4"],
        }
      : {
          icono: Megaphone,
          titulo: "Kit de difusión",
          texto:
            "Cuando EIRA apruebe los logotipos municipales, aquí se generará automáticamente el volante con la identidad de ambas instituciones y el mensaje listo para WhatsApp.",
          items: ["Volante con logotipos", "Mensaje para WhatsApp", "Cartel para redes", "Perifoneo"],
        };
  return (
    <div className="tarjeta fondo-puntos grid place-items-center px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-rosa-degradado text-white shadow-flotante">
        <info.icono className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-2xl font-bold">{info.titulo}</h2>
      <p className="mt-2 max-w-xl text-pizarra-suave">{info.texto}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {info.items.map((i) => <ChipModulo key={i} tono="gris">{i}</ChipModulo>)}
      </div>
      <span className="mt-6 rounded-full bg-crema px-4 py-1.5 text-xs font-semibold text-rosa-700">Disponible en la Fase 2</span>
    </div>
  );
}
