// Utilidades de fecha para México (America/Mexico_City, UTC-6 fijo desde 2022).

export const ZONA = "America/Mexico_City";
const OFFSET_HORAS = 6; // UTC-6
const HORA = 3600_000;
const DIA = 24 * HORA;

/** Crea una fecha (ISO) a partir de componentes en hora local de México. */
export function fechaMx(anio: number, mes0: number, dia: number, hora = 9, minuto = 0): Date {
  return new Date(Date.UTC(anio, mes0, dia, hora + OFFSET_HORAS, minuto));
}

/** Devuelve los componentes Y/M/D actuales en hora de México. */
export function hoyMx(base = new Date()): { anio: number; mes0: number; dia: number } {
  const local = new Date(base.getTime() - OFFSET_HORAS * HORA);
  return { anio: local.getUTCFullYear(), mes0: local.getUTCMonth(), dia: local.getUTCDate() };
}

/** Día de jornada a N días desde hoy (hora de inicio 9:00). */
export function diaJornadaDesdeHoy(dias: number, hora = 9): Date {
  const h = hoyMx();
  return fechaMx(h.anio, h.mes0, h.dia + dias, hora);
}

/** Fecha límite D-n: el día n antes de la jornada a las 18:00 h. */
export function fechaLimiteDesde(fechaJornadaIso: string, diasAntes: number): string {
  const d = new Date(fechaJornadaIso);
  const h = hoyMx(d);
  return fechaMx(h.anio, h.mes0, h.dia - diasAntes, 18).toISOString();
}

/** La jornada se considera completada cuando termina el día en que se realizó (hora de México). */
export function jornadaCompletada(fechaIso: string, ahora = Date.now()): boolean {
  const h = hoyMx(new Date(fechaIso));
  return ahora >= fechaMx(h.anio, h.mes0, h.dia + 1, 0).getTime();
}

export function horasRestantes(iso: string, ahora = Date.now()): number {
  return (new Date(iso).getTime() - ahora) / HORA;
}

export function diasRestantes(iso: string, ahora = Date.now()): number {
  return Math.ceil((new Date(iso).getTime() - ahora) / DIA);
}

const fmtFecha = new Intl.DateTimeFormat("es-MX", {
  timeZone: ZONA,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const fmtFechaLarga = new Intl.DateTimeFormat("es-MX", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const fmtCorta = new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, day: "numeric", month: "short" });
const fmtFechaHora = new Intl.DateTimeFormat("es-MX", {
  timeZone: ZONA,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export const formatoFecha = (iso: string) => fmtFecha.format(new Date(iso));
export const formatoFechaLarga = (iso: string) => fmtFechaLarga.format(new Date(iso));
export const formatoCorta = (iso: string) => fmtCorta.format(new Date(iso));
export const formatoFechaHora = (iso: string) => fmtFechaHora.format(new Date(iso));

/** Texto relativo amigable: "vence en 26 h", "vence en 3 días", "venció hace 2 días". */
export function textoVencimiento(iso: string, ahora = Date.now()): string {
  const h = horasRestantes(iso, ahora);
  if (h < 0) {
    const abs = Math.abs(h);
    return abs < 24 ? `venció hace ${Math.max(1, Math.round(abs))} h` : `venció hace ${Math.round(abs / 24)} días`;
  }
  if (h < 48) return `vence en ${Math.max(1, Math.round(h))} h`;
  const d = Math.round(h / 24);
  return `vence en ${d} días`;
}

export function textoFaltanDias(iso: string, ahora = Date.now()): string {
  const d = diasRestantes(iso, ahora);
  if (d < 0) return `hace ${Math.abs(d)} días`;
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  return `en ${d} días`;
}
