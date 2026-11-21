"use server";

import { revalidatePath } from "next/cache";
import { mutarDB, reiniciarDB } from "./db";
import { fechaLimiteDesde, fechaMx } from "./fechas";
import { construirRequisitos, nuevoId, requisitoDesdeDefinicion } from "./logica";
import { evaluarFicha } from "./ficha";
import { exigirEira } from "./auth-actions";
import { MODULOS, PLANTILLA_BASE, RANGOS_PERSONAS, TEXTO_RANGO } from "./catalogo";
import type { CartaDatos, FichaCampo, Jornada, MedioContacto, ModuloClave, RangoPersonas } from "./types";

function revalidarTodo() {
  revalidatePath("/", "layout");
}

type Resultado = { ok: true } | { ok: false; error: string };

async function conRequisito(
  jornadaId: string,
  requisitoId: string,
  fn: (j: Jornada, r: Jornada["requisitos"][number]) => void,
): Promise<Resultado> {
  try {
    await mutarDB((db) => {
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
  await exigirEira();
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
  await exigirEira();
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
    await mutarDB((db) => {
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
    await mutarDB((db) => {
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

type DatosCartaInput = Omit<CartaDatos, "actualizadoEn" | "firma" | "firmadaEn">;

function aplicarCarta(j: Jornada, d: DatosCartaInput, firma?: string | null) {
  const corto = (t: string, n = 600) => t.trim().slice(0, n);
  const campos: DatosCartaInput = {
    autoridad: corto(d.autoridad, 120),
    cargoAutoridad: corto(d.cargoAutoridad, 120),
    dependencia: corto(d.dependencia, 120),
    sede: corto(d.sede, 160),
    direccion: corto(d.direccion, 200),
    horaInicio: corto(d.horaInicio, 10),
    horaFin: corto(d.horaFin, 10),
    mobiliario: corto(d.mobiliario),
    transporte: corto(d.transporte),
    seguridad: corto(d.seguridad),
  };
  const previa = j.carta;
  const cambio = !previa || (Object.keys(campos) as (keyof DatosCartaInput)[]).some((k) => previa[k] !== campos[k]);
  const ahora = new Date().toISOString();
  j.carta = {
    ...campos,
    firma: typeof firma === "string" ? firma : firma === null || cambio ? undefined : previa?.firma,
    firmadaEn: typeof firma === "string" ? ahora : firma === null || cambio ? undefined : previa?.firmadaEn,
    actualizadoEn: ahora,
  };
}

/** Municipio: guarda los campos variables de la carta compromiso (si cambian, la firma digital se invalida). */
export async function guardarCarta(input: { jornadaId: string; datos: DatosCartaInput; firma?: string | null }): Promise<Resultado> {
  const d = input.datos;
  if (typeof input.firma === "string" && !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(input.firma)) return { ok: false, error: "Firma no válida." };
  if (!d.autoridad.trim() || !d.sede.trim()) return { ok: false, error: "Indica al menos la autoridad municipal y la sede." };
  try {
    await mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === input.jornadaId);
      if (!j) throw new Error("Jornada no encontrada.");
      aplicarCarta(j, d, input.firma);
    });
    revalidarTodo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Municipio: firma la carta con el mouse y la envía a EIRA (requisito → Recibido). */
export async function firmarCarta(input: { jornadaId: string; datos: DatosCartaInput; firma: string }): Promise<Resultado> {
  const d = input.datos;
  if (!d.autoridad.trim() || !d.sede.trim()) return { ok: false, error: "Indica al menos la autoridad municipal y la sede." };
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(input.firma) || input.firma.length > 300_000) return { ok: false, error: "Dibuja tu firma en el recuadro." };
  try {
    await mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === input.jornadaId);
      const r = j?.requisitos.find((x) => x.clave === "carta_compromiso");
      if (!j || !r) throw new Error("No se encontró el requisito.");
      if (r.estado === "aprobado") throw new Error("La carta ya está aprobada.");
      aplicarCarta(j, d, input.firma);
      const numero = r.versiones.length + 1;
      const fecha = new Date().toISOString();
      const autor = j.enlaceMunicipal.nombre;
      const archivo = `Carta compromiso firmada digitalmente (v${numero}).pdf`;
      r.versiones.push({ numero, archivo, tamano: "PDF generado", subidoPor: autor, fecha, estado: "recibido" });
      r.estado = "recibido";
      r.motivoObservacion = undefined;
      r.historial.push({ id: nuevoId("ev"), tipo: "subida", actor: autor, rol: "municipio", fecha, version: numero, detalle: `Firmó digitalmente y envió la carta compromiso (v${numero}).` });
    });
    revalidarTodo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Municipio: guarda la ficha de campo y aplica la lógica condicional (requisitos y alertas). */
export async function guardarFicha(input: {
  jornadaId: string;
  ficha: Omit<FichaCampo, "actualizadoEn">;
}): Promise<{ ok: true; efectos: string[] } | { ok: false; error: string }> {
  const f = input.ficha;
  if (f.internet.length === 0) return { ok: false, error: "Indica qué señal o internet hay en el lugar (o elige \"Ninguna\")." };
  try {
    const efectos = await mutarDB((db) => {
      const j = db.jornadas.find((x) => x.id === input.jornadaId);
      if (!j) throw new Error("Jornada no encontrada.");
      const ahora = new Date().toISOString();
      const efectos: string[] = [];
      j.ficha = { ...f, internet: f.internet.includes("ninguna") ? ["ninguna"] : f.internet, actualizadoEn: ahora };
      const ev = evaluarFicha(j.ficha);

      const sistema = (detalle: string) => ({ id: nuevoId("ev"), tipo: "creado" as const, actor: "Sistema Enlace Rosa", rol: "sistema" as const, fecha: ahora, detalle });

      if (ev.pedirTraductora && !j.requisitos.some((r) => r.clave === "traductora")) {
        const def = MODULOS.find((m) => m.clave === "comunidad_indigena")!;
        for (const d of def.requisitos) {
          j.requisitos.push(requisitoDesdeDefinicion(d, j.fecha, ahora, "Activado automáticamente: la ficha de campo indica que se habla una lengua indígena."));
        }
        if (!j.modulos.includes("comunidad_indigena")) j.modulos.push("comunidad_indigena");
        efectos.push("Se activó el requisito de registrar a la promotora bilingüe o traductora.");
      }

      const fotos = j.requisitos.find((r) => r.clave === "fotos_espacio");
      if (ev.pedirFotos && fotos && fotos.opcional && fotos.estado !== "aprobado") {
        fotos.opcional = false;
        fotos.critico = true;
        fotos.descripcion =
          "Obligatorias: la ficha de campo indica problemas de electricidad, acceso o privacidad. Sube 3 fotografías claras del lugar.";
        fotos.historial.push(sistema("Pasó a obligatorio por problemas de electricidad, acceso o privacidad reportados en la ficha."));
        efectos.push("Se activó como obligatorio subir 3 fotografías claras del lugar.");
      }

      const previas = new Map(j.alertas.map((a) => [a.clave, a.fecha]));
      j.alertas = ev.alertas.map((a) => ({ id: nuevoId("al"), ...a, fecha: previas.get(a.clave) ?? ahora }));
      const nuevas = j.alertas.filter((a) => !previas.has(a.clave));
      if (nuevas.length) efectos.push(`Se avisó a EIRA de ${nuevas.length} alerta(s) operativa(s).`);

      const req = j.requisitos.find((r) => r.clave === "ficha_condiciones");
      if (req && req.estado !== "aprobado") {
        const numero = req.versiones.length + 1;
        const autor = j.enlaceMunicipal.nombre;
        req.versiones.push({ numero, archivo: "Ficha de campo (formulario en línea)", tamano: "—", subidoPor: autor, fecha: ahora, estado: "recibido" });
        req.estado = "recibido";
        req.motivoObservacion = undefined;
        req.historial.push({ id: nuevoId("ev"), tipo: "subida", actor: autor, rol: "municipio", fecha: ahora, version: numero, detalle: `Envió la ficha de campo (v${numero}).` });
      }
      return efectos;
    });
    revalidarTodo();
    return { ok: true, efectos };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function marcarAtendido(input: { jornadaId: string; mensajeId: string }): Promise<Resultado> {
  await exigirEira();
  await mutarDB((db) => {
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
  await exigirEira();
  if (!input.municipio.trim() || !input.sede.trim() || !input.fecha) {
    return { ok: false, error: "Completa municipio, sede y fecha." };
  }
  const [a, m, d] = input.fecha.split("-").map(Number);
  if (!a || !m || !d) return { ok: false, error: "Fecha inválida." };
  const fecha = fechaMx(a, m - 1, d, 9).toISOString();
  const creadaEn = new Date().toISOString();

  const res = await mutarDB((db) => {
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
      alertas: [],
    };
    db.jornadas.push(jornada);
    return { id, token };
  });
  revalidarTodo();
  return { ok: true, ...res };
}

/** Restaura los datos de demostración. */
export async function reiniciarDemo(): Promise<Resultado> {
  await exigirEira();
  await reiniciarDB();
  revalidarTodo();
  return { ok: true };
}
