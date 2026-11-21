"use server";

import { revalidatePath } from "next/cache";
import { mutarDB, reiniciarDB } from "./db";
import { fechaLimiteDesde, fechaMx } from "./fechas";
import { construirRequisitos, nuevoId } from "./logica";
import { PLANTILLA_BASE, RANGOS_PERSONAS, TEXTO_RANGO } from "./catalogo";
import type { Jornada, MedioContacto, ModuloClave, RangoPersonas } from "./types";

function revalidarTodo() {
  revalidatePath("/", "layout");
}

type Resultado = { ok: true } | { ok: false; error: string };

function conRequisito(
  jornadaId: string,
  requisitoId: string,
  fn: (j: Jornada, r: Jornada["requisitos"][number]) => void,
): Resultado {
  try {
    mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === jornadaId);
      const r = j?.requisitos.find((x) => x.id === requisitoId);
      if (!j || !r) throw new Error("No se encontró el requisito.");
      fn(j, r);
    });
    revalidarTodo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

/** Municipio: sube un archivo (simulado) como nueva versión → estado Recibido. */
export async function subirArchivo(input: {
  jornadaId: string;
  requisitoId: string;
  archivo: string;
  tamano: string;
}): Promise<Resultado> {
  const archivo = input.archivo.trim().slice(0, 140);
  if (!archivo) return { ok: false, error: "Selecciona un archivo." };
  return conRequisito(input.jornadaId, input.requisitoId, (j, r) => {
    if (r.estado === "aprobado") throw new Error("Este requisito ya está aprobado.");
    const numero = r.versiones.length + 1;
    const fecha = new Date().toISOString();
    const autor = j.enlaceMunicipal.nombre;
    r.versiones.push({ numero, archivo, tamano: input.tamano || "—", subidoPor: autor, fecha, estado: "recibido" });
    r.estado = "recibido";
    r.motivoObservacion = undefined;
    r.historial.push({
      id: nuevoId("ev"),
      tipo: "subida",
      actor: autor,
      rol: "municipio",
      fecha,
      version: numero,
      detalle: `Subió ${archivo} (v${numero}).`,
    });
  });
}

/** EIRA: aprueba la última versión recibida. */
export async function aprobarRequisito(input: { jornadaId: string; requisitoId: string; revisor?: string }): Promise<Resultado> {
  return conRequisito(input.jornadaId, input.requisitoId, (j, r) => {
    const v = r.versiones[r.versiones.length - 1];
    if (!v) throw new Error("No hay archivo para aprobar.");
    const fecha = new Date().toISOString();
    const revisor = input.revisor || j.enlaceEira.nombre;
    v.estado = "aprobado";
    v.revisadoPor = revisor;
    v.fechaRevision = fecha;
    r.estado = "aprobado";
    r.motivoObservacion = undefined;
    r.historial.push({
      id: nuevoId("ev"),
      tipo: "aprobado",
      actor: revisor,
      rol: "eira",
      fecha,
      version: v.numero,
      detalle: `Aprobó la versión v${v.numero}.`,
    });
  });
}

/** EIRA: observa la última versión con un motivo de corrección obligatorio. */
export async function observarRequisito(input: {
  jornadaId: string;
  requisitoId: string;
  motivo: string;
  revisor?: string;
}): Promise<Resultado> {
  const motivo = input.motivo.trim();
  if (motivo.length < 10) return { ok: false, error: "Describe con claridad qué debe corregirse (mínimo 10 caracteres)." };
  return conRequisito(input.jornadaId, input.requisitoId, (j, r) => {
    const v = r.versiones[r.versiones.length - 1];
    if (!v) throw new Error("No hay archivo para observar.");
    const fecha = new Date().toISOString();
    const revisor = input.revisor || j.enlaceEira.nombre;
    v.estado = "observado";
    v.revisadoPor = revisor;
    v.fechaRevision = fecha;
    v.motivo = motivo;
    r.estado = "observado";
    r.motivoObservacion = motivo;
    r.historial.push({
      id: nuevoId("ev"),
      tipo: "observado",
      actor: revisor,
      rol: "eira",
      fecha,
      version: v.numero,
      detalle: `Observó v${v.numero}: ${motivo}`,
    });
  });
}

/** Municipio: pide ayuda general o sobre un requisito específico. */
export async function pedirAyuda(input: { jornadaId: string; requisitoId?: string; mensaje: string }): Promise<Resultado> {
  const mensaje = input.mensaje.trim();
  if (mensaje.length < 5) return { ok: false, error: "Escribe tu pregunta." };
  try {
    mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === input.jornadaId);
      if (!j) throw new Error("Jornada no encontrada.");
      j.mensajes.unshift({
        id: nuevoId("msg"),
        requisitoId: input.requisitoId || undefined,
        autor: j.enlaceMunicipal.nombre,
        fecha: new Date().toISOString(),
        mensaje: mensaje.slice(0, 600),
        atendido: false,
      });
    });
    revalidarTodo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Municipio: modifica el estimado de personas hasta 5 días antes de la visita; se notifica a EIRA. */
export async function actualizarEstimado(input: { jornadaId: string; estimado: RangoPersonas }): Promise<Resultado> {
  if (!RANGOS_PERSONAS.some((r) => r.clave === input.estimado)) return { ok: false, error: "Opción no válida." };
  try {
    mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === input.jornadaId);
      if (!j) throw new Error("Jornada no encontrada.");
      if (Date.now() > new Date(fechaLimiteDesde(j.fecha, 5)).getTime()) {
        throw new Error("Ya pasó el plazo para modificar el estimado (hasta 5 días antes de la visita).");
      }
      if (j.estimadoPersonas === input.estimado) return;
      const anterior = j.estimadoPersonas;
      j.estimadoPersonas = input.estimado;
      j.mensajes.unshift({
        id: nuevoId("msg"),
        tipo: "cambio_estimado",
        autor: j.enlaceMunicipal.nombre,
        fecha: new Date().toISOString(),
        mensaje: `Cambió el estimado de personas a atender: de "${TEXTO_RANGO[anterior]}" a "${TEXTO_RANGO[input.estimado]}".`,
        atendido: false,
      });
    });
    revalidarTodo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function marcarAtendido(input: { jornadaId: string; mensajeId: string }): Promise<Resultado> {
  mutarDB((db) => {
    const m = db.jornadas.find((x) => x.id === input.jornadaId)?.mensajes.find((x) => x.id === input.mensajeId);
    if (m) m.atendido = true;
  });
  revalidarTodo();
  return { ok: true };
}

function slug(txt: string) {
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export interface NuevaJornadaInput {
  municipio: string;
  estado: string;
  sede: string;
  direccion: string;
  fecha: string; // YYYY-MM-DD
  servicios: string[];
  modulos: ModuloClave[];
  estimadoPersonas: RangoPersonas;
  enlaceNombre: string;
  enlaceCargo: string;
  enlaceCorreo: string;
  enlaceCelular: string;
  enlaceWhatsapp: string;
  medioPreferido: MedioContacto;
}

/** EIRA: crea una jornada nueva con sus requisitos calculados (D-15 / D-10 / D-5). */
export async function crearJornada(
  input: NuevaJornadaInput,
): Promise<{ ok: true; id: string; token: string } | { ok: false; error: string }> {
  if (!input.municipio.trim() || !input.sede.trim() || !input.fecha) {
    return { ok: false, error: "Completa municipio, sede y fecha." };
  }
  const [a, m, d] = input.fecha.split("-").map(Number);
  if (!a || !m || !d) return { ok: false, error: "Fecha inválida." };
  const fecha = fechaMx(a, m - 1, d, 9).toISOString();
  const creadaEn = new Date().toISOString();

  const res = mutarDB((db) => {
    const base = `${slug(input.municipio)}-${a}`;
    let token = base;
    let n = 2;
    while (db.jornadas.some((j) => j.token === token)) token = `${base}-${n++}`;
    const id = `jor-${nuevoId("n").slice(2)}`;
    const jornada: Jornada = {
      id,
      token,
      municipio: input.municipio.trim(),
      estado: input.estado.trim(),
      sede: input.sede.trim(),
      direccion: input.direccion.trim(),
      fecha,
      fechaLimite: fechaLimiteDesde(fecha, 5),
      servicios: input.servicios,
      modulos: input.modulos,
      plantilla: PLANTILLA_BASE,
      enlaceEira: {
        nombre: "Lucía Fernández",
        cargo: "Coordinadora de Jornadas EIRA",
        telefono: "55 4120 8890",
        correo: "lucia.fernandez@eira.org.mx",
      },
      enlaceMunicipal: {
        nombre: input.enlaceNombre.trim() || "Por confirmar",
        cargo: input.enlaceCargo.trim(),
        correo: input.enlaceCorreo.trim(),
        celular: input.enlaceCelular.trim(),
        whatsapp: input.enlaceWhatsapp.trim() || input.enlaceCelular.trim(),
        medioPreferido: input.medioPreferido,
      },
      estimadoPersonas: input.estimadoPersonas,
      creadaEn,
      requisitos: construirRequisitos(fecha, input.modulos, creadaEn),
      mensajes: [],
    };
    db.jornadas.push(jornada);
    return { id, token };
  });
  revalidarTodo();
  return { ok: true, ...res };
}

/** Restaura los datos de demostración. */
export async function reiniciarDemo(): Promise<Resultado> {
  reiniciarDB();
  revalidarTodo();
  return { ok: true };
}
