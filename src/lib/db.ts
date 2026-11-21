import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { crearSeed, ESQUEMA } from "./seed";
import type { BaseDatos, Jornada } from "./types";

// Lectura en cada petición para que los cambios de /gob se vean al instante en /eira y viceversa.
// Persistencia:
//  1) Redis REST (Upstash / Vercel KV) si existen KV_REST_API_URL y KV_REST_API_TOKEN
//     (o UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN): compartido entre todas las instancias serverless.
//  2) Si no, archivo temporal en el directorio del sistema (/tmp) con respaldo en memoria.
//     En Vercel esto NO se comparte entre instancias.

const RUTA = path.join(os.tmpdir(), "enlace-rosa-data.json");
const CLAVE = "enlace-rosa:db";

const global_ = globalThis as unknown as { __enlaceRosaDB?: BaseDatos };

const urlRedis = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const tokenRedis = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const hayRedis = () => !!urlRedis() && !!tokenRedis();

async function redis(comando: unknown[]): Promise<unknown> {
  const r = await fetch(urlRedis()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenRedis()}`, "Content-Type": "application/json" },
    body: JSON.stringify(comando),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  return ((await r.json()) as { result: unknown }).result;
}

function escribirLocal(db: BaseDatos) {
  global_.__enlaceRosaDB = db;
  try {
    const tmp = `${RUTA}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db), "utf8");
    fs.renameSync(tmp, RUTA);
  } catch {
    // Sin escritura disponible: se conserva solo en memoria.
  }
}

function leerLocal(): BaseDatos {
  try {
    const db = JSON.parse(fs.readFileSync(RUTA, "utf8")) as BaseDatos;
    if (db.esquema !== ESQUEMA) throw new Error("esquema obsoleto");
    global_.__enlaceRosaDB = db;
    return db;
  } catch {
    if (global_.__enlaceRosaDB?.esquema === ESQUEMA) return global_.__enlaceRosaDB;
    const db = crearSeed();
    escribirLocal(db);
    return db;
  }
}

async function escribir(db: BaseDatos) {
  if (hayRedis()) {
    try {
      await redis(["SET", CLAVE, JSON.stringify(db)]);
      return;
    } catch {
      // Redis no disponible: se cae al almacenamiento local.
    }
  }
  escribirLocal(db);
}

export async function leerDB(): Promise<BaseDatos> {
  if (hayRedis()) {
    try {
      const crudo = await redis(["GET", CLAVE]);
      if (typeof crudo === "string") {
        const db = JSON.parse(crudo) as BaseDatos;
        if (db.esquema === ESQUEMA) return db;
      }
      const db = crearSeed();
      await redis(["SET", CLAVE, JSON.stringify(db)]);
      return db;
    } catch {
      // Redis no disponible: se cae al almacenamiento local.
    }
  }
  return leerLocal();
}

/** Aplica una mutación y guarda, incrementando la versión global. */
export async function mutarDB<T>(fn: (db: BaseDatos) => T): Promise<T> {
  const db = await leerDB();
  const resultado = fn(db);
  db.version += 1;
  db.actualizadoEn = new Date().toISOString();
  await escribir(db);
  return resultado;
}

export async function reiniciarDB(): Promise<BaseDatos> {
  const db = crearSeed();
  db.version = (await leerDB()).version + 1;
  await escribir(db);
  return db;
}

export const listarJornadas = async (): Promise<Jornada[]> => (await leerDB()).jornadas;
export const jornadaPorId = async (id: string) => (await leerDB()).jornadas.find((j) => j.id === id);
export const jornadaPorToken = async (token: string) => (await leerDB()).jornadas.find((j) => j.token === token);
