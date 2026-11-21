"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSignature,
  Languages,
  Loader2,
  Moon,
  PartyPopper,
  Truck,
} from "lucide-react";
import { crearJornada, type NuevaJornadaInput } from "@/lib/actions";
import { GRUPOS, MODULOS, PLANTILLA_BASE, RANGOS_PERSONAS, REFERENCIA_EDADES, REQUISITOS_BASE, SERVICIOS_EIRA, TEXTO_RANGO } from "@/lib/catalogo";
import { fechaLimiteDesde, fechaMx, formatoFecha } from "@/lib/fechas";
import type { ModuloClave } from "@/lib/types";

const ESTADOS_MX = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México",
  "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán",
  "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
];

const ICONO_MODULO: Record<ModuloClave, typeof Truck> = {
  unidad_movil: Truck,
  comunidad_indigena: Languages,
  estancia_multiple: Moon,
};

const PASOS = ["Datos básicos y servicios", "Módulos y requisitos", "Confirmación y enlace"];

export function Asistente({ fechaSugerida, fechaMinima }: { fechaSugerida: string; fechaMinima: string }) {
  const [paso, setPaso] = useState(0);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [creada, setCreada] = useState<{ id: string; token: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [mismoWhats, setMismoWhats] = useState(true);
  const [f, setF] = useState<NuevaJornadaInput>({
    municipio: "",
    estado: "Estado de México",
    sede: "",
    direccion: "",
    fecha: fechaSugerida,
    servicios: [SERVICIOS_EIRA[0], SERVICIOS_EIRA[1], SERVICIOS_EIRA[2]],
    modulos: [],
    estimadoPersonas: "50_100",
    enlaceNombre: "",
    enlaceCargo: "",
    enlaceCorreo: "",
    enlaceCelular: "",
    enlaceWhatsapp: "",
    medioPreferido: "whatsapp",
  });

  const set = <K extends keyof NuevaJornadaInput>(k: K, v: NuevaJornadaInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  const fechaIso = useMemo(() => {
    const [a, m, d] = f.fecha.split("-").map(Number);
    return a && m && d ? fechaMx(a, m - 1, d, 9).toISOString() : null;
  }, [f.fecha]);

  const requisitos = useMemo(() => {
    const extra = MODULOS.filter((m) => f.modulos.includes(m.clave)).flatMap((m) => m.requisitos);
    return [...REQUISITOS_BASE, ...extra];
  }, [f.modulos]);

  const paso1Valido = f.municipio.trim() && f.sede.trim() && f.fecha && f.servicios.length > 0;

  const crear = () =>
    iniciar(async () => {
      setError(null);
      const res = await crearJornada({ ...f, enlaceWhatsapp: mismoWhats ? f.enlaceCelular : f.enlaceWhatsapp });
      if (!res.ok) return setError(res.error);
      setCreada({ id: res.id, token: res.token });
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
      {/* Pasos */}
      <ol className="tarjeta h-fit space-y-1 p-3">
        {PASOS.map((t, i) => {
          const hecho = i < paso || !!creada;
          const activo = i === paso && !creada;
          return (
            <li key={t} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${activo ? "bg-rosa-50" : ""}`}>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  hecho ? "bg-estado-aprobado text-white" : activo ? "bg-rosa text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {hecho ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-sm font-semibold ${activo ? "text-rosa-700" : hecho ? "text-pizarra" : "text-slate-400"}`}>{t}</span>
            </li>
          );
        })}
      </ol>

      <div className="tarjeta p-6 md:p-8">
        {/* PASO 1 */}
        {paso === 0 && (
          <div className="space-y-6">
            <Encabezado n={1} titulo="Datos básicos y servicios" texto="Información general de la jornada y de la persona enlace del municipio." />
            <div className="grid gap-4 md:grid-cols-2">
              <Campo etiqueta="Municipio *">
                <input className="campo" value={f.municipio} onChange={(e) => set("municipio", e.target.value)} placeholder="Ej. Tlalnepantla de Baz" />
              </Campo>
              <Campo etiqueta="Estado *">
                <select className="campo" value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                  {ESTADOS_MX.map((e) => <option key={e}>{e}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Sede *">
                <input className="campo" value={f.sede} onChange={(e) => set("sede", e.target.value)} placeholder="Ej. Explanada del DIF Municipal" />
              </Campo>
              <Campo etiqueta="Dirección">
                <input className="campo" value={f.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle, número, colonia, C.P." />
              </Campo>
              <Campo etiqueta="Día de la jornada (D) *">
                <input type="date" className="campo" min={fechaMinima} value={f.fecha} onChange={(e) => set("fecha", e.target.value)} />
              </Campo>
            </div>
            {fechaIso && (
              <p className="rounded-2xl bg-crema px-4 py-3 text-sm">
                <span className="font-semibold">Fecha límite general (D-5):</span> {formatoFecha(fechaLimiteDesde(fechaIso, 5))}
              </p>
            )}

            <div>
              <p className="etiqueta">Servicios de EIRA *</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICIOS_EIRA.map((s) => {
                  const on = f.servicios.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("servicios", alternar(f.servicios, s))}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                        on ? "border-rosa bg-rosa-50 text-rosa-700" : "border-borde hover:border-rosa-200"
                      }`}
                    >
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${on ? "bg-rosa text-white" : "border border-slate-300"}`}>
                        {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="etiqueta">Estimado de personas a atender</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {RANGOS_PERSONAS.map((r) => {
                  const on = f.estimadoPersonas === r.clave;
                  return (
                    <button
                      key={r.clave}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("estimadoPersonas", r.clave)}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
                        on ? "border-rosa bg-rosa-50 text-rosa-700" : "border-borde hover:border-rosa-200"
                      }`}
                    >
                      {r.texto}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-pizarra-suave">{REFERENCIA_EDADES} El municipio podrá modificarlo hasta 5 días antes de la visita.</p>
            </div>

            <div className="rounded-2xl border border-guinda-100 bg-guinda-50/40 p-5">
              <p className="flex items-center gap-2 font-semibold text-guinda"><Building2 className="h-4 w-4" /> Persona enlace del municipio</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Campo etiqueta="Nombre completo">
                  <input className="campo" value={f.enlaceNombre} onChange={(e) => set("enlaceNombre", e.target.value)} placeholder="Ej. Lic. Ana Pérez" />
                </Campo>
                <Campo etiqueta="Cargo">
                  <input className="campo" value={f.enlaceCargo} onChange={(e) => set("enlaceCargo", e.target.value)} placeholder="Ej. Directora del DIF" />
                </Campo>
                <Campo etiqueta="Correo electrónico">
                  <input type="email" className="campo" value={f.enlaceCorreo} onChange={(e) => set("enlaceCorreo", e.target.value)} placeholder="nombre@municipio.gob.mx" />
                </Campo>
                <Campo etiqueta="Celular">
                  <input className="campo" value={f.enlaceCelular} onChange={(e) => set("enlaceCelular", e.target.value)} placeholder="55 1234 5678" />
                </Campo>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={mismoWhats} onChange={(e) => setMismoWhats(e.target.checked)} className="h-4 w-4 accent-[#E57373]" />
                    WhatsApp es el mismo número que el celular
                  </label>
                  {!mismoWhats && (
                    <input className="campo" value={f.enlaceWhatsapp} onChange={(e) => set("enlaceWhatsapp", e.target.value)} placeholder="Número de WhatsApp" />
                  )}
                </div>
                <Campo etiqueta="Medio de comunicación preferido">
                  <select className="campo" value={f.medioPreferido} onChange={(e) => set("medioPreferido", e.target.value as NuevaJornadaInput["medioPreferido"])}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="correo">Correo electrónico</option>
                    <option value="llamada">Llamada telefónica</option>
                  </select>
                </Campo>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 1 && (
          <div className="space-y-6">
            <Encabezado n={2} titulo="Módulos y requisitos" texto="Parte de la plantilla base y activa los módulos que necesita esta jornada." />
            <div className="flex items-center justify-between rounded-2xl bg-crema px-4 py-3 text-sm">
              <span><span className="font-semibold">Plantilla:</span> {PLANTILLA_BASE}</span>
              <span className="text-xs text-pizarra-suave">{REQUISITOS_BASE.length} requisitos base</span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {MODULOS.map((m) => {
                const on = f.modulos.includes(m.clave);
                const Icono = ICONO_MODULO[m.clave];
                return (
                  <button
                    key={m.clave}
                    type="button"
                    onClick={() => set("modulos", alternar(f.modulos, m.clave))}
                    aria-pressed={on}
                    className={`rounded-2xl border p-4 text-left transition ${on ? "border-rosa bg-rosa-50 shadow-sm" : "border-borde hover:border-rosa-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${on ? "bg-rosa text-white" : "bg-slate-100 text-pizarra-suave"}`}>
                        <Icono className="h-5 w-5" />
                      </span>
                      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-rosa" : "bg-slate-200"}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">{m.nombre}</p>
                    <p className="mt-1 text-xs text-pizarra-suave">{m.descripcion}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <p className="etiqueta">Requisitos y fechas límite calculadas ({requisitos.length})</p>
              <div className="overflow-hidden rounded-2xl border border-borde">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-pizarra-suave">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Requisito</th>
                      <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Grupo</th>
                      <th className="px-4 py-2.5 font-semibold">Plazo</th>
                      <th className="px-4 py-2.5 font-semibold">Fecha límite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borde">
                    {[...requisitos].sort((a, b) => b.diasAntes - a.diasAntes).map((r) => (
                      <tr key={r.clave} className={r.modulo ? "bg-dorado-50/50" : ""}>
                        <td className="px-4 py-2.5">
                          <span className="font-medium">{r.nombre}</span>
                          {r.critico && <span className="ml-2 rounded-full bg-guinda-50 px-1.5 py-0.5 text-[10px] font-bold text-guinda">CRÍTICO</span>}
                          {r.modulo && <span className="ml-2 rounded-full bg-dorado-100 px-1.5 py-0.5 text-[10px] font-bold text-[#8A6A3A]">MÓDULO</span>}
                        </td>
                        <td className="hidden px-4 py-2.5 text-pizarra-suave md:table-cell">{GRUPOS[r.grupo].titulo}</td>
                        <td className="px-4 py-2.5"><span className="rounded-md bg-pizarra px-1.5 py-0.5 text-[11px] font-bold text-white">D-{r.diasAntes}</span></td>
                        <td className="px-4 py-2.5 text-pizarra-suave">{fechaIso ? formatoFecha(fechaLimiteDesde(fechaIso, r.diasAntes)) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 2 && !creada && (
          <div className="space-y-6">
            <Encabezado n={3} titulo="Confirmación" texto="Revisa la información y genera el enlace único para el municipio." />
            <div className="grid gap-4 md:grid-cols-2">
              <Resumen titulo="Jornada" filas={[
                ["Municipio", `${f.municipio}, ${f.estado}`],
                ["Sede", f.sede],
                ["Día (D)", fechaIso ? formatoFecha(fechaIso) : "—"],
                ["Fecha límite general", fechaIso ? formatoFecha(fechaLimiteDesde(fechaIso, 5)) : "—"],
                ["Personas estimadas", TEXTO_RANGO[f.estimadoPersonas]],
              ]} />
              <Resumen titulo="Enlace municipal" filas={[
                ["Nombre", f.enlaceNombre || "Por confirmar"],
                ["Cargo", f.enlaceCargo || "—"],
                ["Contacto", [f.enlaceCelular, f.enlaceCorreo].filter(Boolean).join(" · ") || "—"],
                ["Prefiere", { whatsapp: "WhatsApp", correo: "Correo", llamada: "Llamada" }[f.medioPreferido]],
              ]} />
            </div>
            <div className="rounded-2xl bg-crema p-5 text-sm">
              <p><span className="font-semibold">Servicios:</span> {f.servicios.join(", ")}</p>
              <p className="mt-1"><span className="font-semibold">Módulos:</span> {f.modulos.length ? MODULOS.filter((m) => f.modulos.includes(m.clave)).map((m) => m.nombre).join(", ") : "Ninguno"}</p>
              <p className="mt-1"><span className="font-semibold">Requisitos:</span> {requisitos.length} ({requisitos.filter((r) => r.critico).length} críticos)</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-borde p-4 text-sm">
              <FileSignature className="mt-0.5 h-5 w-5 shrink-0 text-rosa" />
              <p className="text-pizarra-suave">
                La carta compromiso se generará con las cláusulas institucionales de EIRA bloqueadas. El municipio completará los
                campos variables desde su portal (disponible en Fase 2).
              </p>
            </div>
            {error && <p className="text-sm font-medium text-estado-observado">{error}</p>}
          </div>
        )}

        {creada && (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-estado-aprobado text-white shadow-lg">
              <PartyPopper className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">¡Jornada creada!</h2>
            <p className="mt-1 text-pizarra-suave">Comparte este enlace único con la persona enlace de {f.municipio}.</p>
            <div className="mx-auto mt-5 flex max-w-lg items-center gap-2 rounded-2xl border border-guinda-100 bg-guinda-50/50 p-2 pl-4">
              <code className="flex-1 truncate text-left text-sm font-semibold text-guinda">/gob/{creada.token}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/gob/${creada.token}`);
                  setCopiado(true);
                }}
                className="btn-guinda px-3 py-2 text-xs"
              >
                {copiado ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={`/eira/jornadas/${creada.id}`} className="btn-primario">Ver expediente <ArrowRight className="h-4 w-4" /></Link>
              <Link href={`/gob/${creada.token}`} target="_blank" className="btn-secundario">Abrir portal municipal <ExternalLink className="h-4 w-4" /></Link>
            </div>
          </div>
        )}

        {/* Navegación */}
        {!creada && (
          <div className="mt-8 flex items-center justify-between border-t border-borde pt-5">
            <button type="button" onClick={() => setPaso((p) => Math.max(0, p - 1))} disabled={paso === 0} className="btn-fantasma">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>
            {paso < 2 ? (
              <button type="button" onClick={() => setPaso((p) => p + 1)} disabled={paso === 0 && !paso1Valido} className="btn-primario">
                Siguiente <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={crear} disabled={pendiente} className="btn-primario">
                {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Crear jornada y generar enlace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Encabezado({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <div>
      <p className="ojal text-rosa-700">Paso {n} de 3</p>
      <h2 className="mt-1 text-xl font-bold">{titulo}</h2>
      <p className="text-sm text-pizarra-suave">{texto}</p>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="etiqueta">{etiqueta}</span>
      {children}
    </label>
  );
}

function Resumen({ titulo, filas }: { titulo: string; filas: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-borde p-5">
      <p className="ojal">{titulo}</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-pizarra-suave">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
