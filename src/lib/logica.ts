import { MODULOS, REQUISITOS_BASE, type DefinicionRequisito } from "./catalogo";
import { fechaLimiteDesde, horasRestantes } from "./fechas";
import type { EstadoRequisito, Jornada, ModuloClave, Requisito } from "./types";

export function nuevoId(prefijo = "id"): string {
  return `${prefijo}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function definicionesPara(modulos: ModuloClave[]): DefinicionRequisito[] {
  const extra = MODULOS.filter((m) => modulos.includes(m.clave)).flatMap((m) => m.requisitos);
  return [...REQUISITOS_BASE, ...extra];
}

export function construirRequisitos(fechaJornada: string, modulos: ModuloClave[], creadoEn: string): Requisito[] {
  return definicionesPara(modulos).map((def) => ({
    id: nuevoId("req"),
    clave: def.clave,
    nombre: def.nombre,
    descripcion: def.descripcion,
    grupo: def.grupo,
    criterio: def.criterio,
    formatos: def.formatos,
    diasAntes: def.diasAntes,
    fechaLimite: fechaLimiteDesde(fechaJornada, def.diasAntes),
    critico: def.critico,
    opcional: def.opcional,
    modulo: def.modulo,
    estado: "pendiente" as EstadoRequisito,
    versiones: [],
    historial: [
      {
        id: nuevoId("ev"),
        tipo: "creado" as const,
        actor: "Sistema Enlace Rosa",
        rol: "sistema" as const,
        fecha: creadoEn,
        detalle: `Requisito activado con fecha límite D-${def.diasAntes}.`,
      },
    ],
  }));
}

// ---------- Métricas ----------

const PESO: Record<EstadoRequisito, number> = { aprobado: 1, recibido: 0.5, observado: 0, pendiente: 0 };

/** Progreso: aprobados cuentan 100 %, recibidos (en revisión) 50 %. */
export function progreso(j: Jornada): number {
  if (j.requisitos.length === 0) return 0;
  const total = j.requisitos.reduce((acc, r) => acc + PESO[r.estado], 0);
  return Math.round((total / j.requisitos.length) * 100);
}

export function conteo(j: Jornada): Record<EstadoRequisito, number> {
  const c: Record<EstadoRequisito, number> = { pendiente: 0, recibido: 0, observado: 0, aprobado: 0 };
  j.requisitos.forEach((r) => c[r.estado]++);
  return c;
}

export const esCriticoAbierto = (r: Requisito) => r.critico && r.estado !== "aprobado";

/** Requisitos importantes que faltan por entregar (pendientes). */
export const faltantesImportantes = (j: Jornada) =>
  j.requisitos.filter((r) => r.critico && r.estado === "pendiente");

export const observados = (j: Jornada) => j.requisitos.filter((r) => r.estado === "observado");

/** Requisitos sin aprobar que vencen en menos de N horas (incluye vencidos). */
export function vencenEn(j: Jornada, horas: number, ahora = Date.now()): Requisito[] {
  return j.requisitos.filter(
    (r) => (r.estado === "pendiente" || r.estado === "observado") && horasRestantes(r.fechaLimite, ahora) < horas,
  );
}

export type Semaforo = "luz_verde" | "riesgo" | "preparacion";

export interface Diagnostico {
  semaforo: Semaforo;
  etiqueta: string;
  motivo: string;
  urgencia: number; // menor = más urgente
  alertaCoordinador: boolean; // crítico pendiente a < 48 h
}

export function diagnostico(j: Jornada, ahora = Date.now()): Diagnostico {
  const criticosAbiertos = j.requisitos.filter(esCriticoAbierto);
  const carta = j.requisitos.find((r) => r.clave === "carta_compromiso");
  const criticos48 = criticosAbiertos.filter(
    (r) => r.estado !== "recibido" && horasRestantes(r.fechaLimite, ahora) < 48,
  );
  const proximo = criticosAbiertos
    .map((r) => horasRestantes(r.fechaLimite, ahora))
    .sort((a, b) => a - b)[0];

  if (criticosAbiertos.length === 0) {
    return {
      semaforo: "luz_verde",
      etiqueta: "Luz Verde Logística",
      motivo: "Todos los requisitos críticos están aprobados. Se puede movilizar al equipo.",
      urgencia: 10_000 + horasRestantes(j.fecha, ahora),
      alertaCoordinador: false,
    };
  }

  const cartaEnRiesgo =
    carta && carta.estado !== "aprobado" && (carta.estado === "observado" || horasRestantes(carta.fechaLimite, ahora) < 72);
  const hayObservadoCritico = criticosAbiertos.some((r) => r.estado === "observado");

  if (cartaEnRiesgo || criticos48.length > 0 || hayObservadoCritico) {
    const motivos: string[] = [];
    if (carta && carta.estado !== "aprobado") motivos.push("la carta compromiso no está aprobada");
    if (criticos48.length > 0) motivos.push(`${criticos48.length} requisito(s) crítico(s) vencen en < 48 h`);
    return {
      semaforo: "riesgo",
      etiqueta: "Riesgo de reprogramación",
      motivo: `No movilizar personal ni cubrir viáticos: ${motivos.join(" y ")}.`,
      urgencia: proximo ?? 0,
      alertaCoordinador: criticos48.length > 0,
    };
  }

  return {
    semaforo: "preparacion",
    etiqueta: "En preparación",
    motivo: `Faltan ${criticosAbiertos.length} requisito(s) crítico(s), aún en tiempo.`,
    urgencia: 1_000 + (proximo ?? 0),
    alertaCoordinador: false,
  };
}

/** Resumen corto para el encabezado del portal municipal. */
export function resumenAvance(j: Jornada): string {
  const p = progreso(j);
  const faltan = faltantesImportantes(j).length;
  const obs = observados(j).length;
  if (p === 100) return "100 % listo; todos los requisitos están aprobados";
  const partes: string[] = [];
  if (faltan > 0) partes.push(`faltan ${faltan} requisito${faltan === 1 ? "" : "s"} importante${faltan === 1 ? "" : "s"}`);
  if (obs > 0) partes.push(`${obs} por corregir`);
  if (partes.length === 0) partes.push("en revisión por EIRA");
  return `${p} % listo; ${partes.join(" y ")}`;
}
