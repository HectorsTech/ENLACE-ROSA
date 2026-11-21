import fs from "node:fs";
import path from "node:path";
import { crearSeed } from "./seed";
import type { BaseDatos, Jornada } from "./types";

// Persistencia local: un archivo JSON en el servidor (data/db.json).
// Lectura en cada petición para que los cambios de /gob se vean al instante en /eira y viceversa.

const RUTA = path.join(process.cwd(), "data", "db.json");

function escribir(db: BaseDatos) {
  fs.mkdirSync(path.dirname(RUTA), { recursive: true });
  const tmp = `${RUTA}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, RUTA);
}

export function leerDB(): BaseDatos {
  if (!fs.existsSync(RUTA)) {
    const db = crearSeed();
    escribir(db);
    return db;
  }
  try {
    return JSON.parse(fs.readFileSync(RUTA, "utf8")) as BaseDatos;
  } catch {
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
  const anterior = fs.existsSync(RUTA) ? leerDB().version : 0;
  db.version = anterior + 1;
  escribir(db);
  return db;
}

export const listarJornadas = (): Jornada[] => leerDB().jornadas;
export const jornadaPorId = (id: string) => leerDB().jornadas.find((j) => j.id === id);
export const jornadaPorToken = (token: string) => leerDB().jornadas.find((j) => j.token === token);
