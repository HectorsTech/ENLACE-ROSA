import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { crearSeed, ESQUEMA } from "./seed";
import type { BaseDatos, Jornada } from "./types";

// Lectura en cada petición para que los cambios de /gob se vean al instante en /eira y viceversa.
// Compatible con Vercel (filesystem de solo lectura): se escribe en el directorio temporal
// del sistema (/tmp) y, si falla, se usa un store en memoria inicializado con el seed.

const RUTA = path.join(os.tmpdir(), "enlace-rosa-data.json");

const global_ = globalThis as unknown as { __enlaceRosaDB?: BaseDatos };

function escribir(db: BaseDatos) {
  global_.__enlaceRosaDB = db;
  try {
    const tmp = `${RUTA}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db), "utf8");
    fs.renameSync(tmp, RUTA);
  } catch {
    // Sin escritura disponible: se conserva solo en memoria.
  }
}

export function leerDB(): BaseDatos {
  try {
    const db = JSON.parse(fs.readFileSync(RUTA, "utf8")) as BaseDatos;
    if (db.esquema !== ESQUEMA) throw new Error("esquema obsoleto");
    global_.__enlaceRosaDB = db;
    return db;
  } catch {
    if (global_.__enlaceRosaDB?.esquema === ESQUEMA) return global_.__enlaceRosaDB;
    const db = crearSeed();
    escribir(db);
    return db;
  }
}

/** Aplica una mutación y guarda, incrementando la versión global. */
export function mutarDB<T>(fn: (db: BaseDatos) => T): T {
  const db = leerDB();
  const resultado = fn(db);
  db.version += 1;
  db.actualizadoEn = new Date().toISOString();
  escribir(db);
  return resultado;
}

export function reiniciarDB(): BaseDatos {
  const db = crearSeed();
  const anterior = leerDB().version;
  db.version = anterior + 1;
  escribir(db);
  return db;
}

export const listarJornadas = (): Jornada[] => leerDB().jornadas;
export const jornadaPorId = (id: string) => leerDB().jornadas.find((j) => j.id === id);
export const jornadaPorToken = (token: string) => leerDB().jornadas.find((j) => j.token === token);
