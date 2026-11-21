// Sesión simple del perfil EIRA: cookie firmada con HMAC (Web Crypto, válido en Edge y Node).
// Configura EIRA_USER, EIRA_PASSWORD y EIRA_SECRET en producción; si faltan se usan valores de demostración.

export const COOKIE_EIRA = "eira_sesion";
export const DURACION_SESION = 60 * 60 * 8;

export const usuarioEira = () => process.env.EIRA_USER || "eira";
export const claveEira = () => process.env.EIRA_PASSWORD || "rosa2026";
const secreto = () => process.env.EIRA_SECRET || "enlace-rosa-demo-secret";

async function firmar(valor: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secreto()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(valor));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const iguales = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export async function crearTokenEira(usuario: string) {
  return `${usuario}.${await firmar(usuario)}`;
}

export async function tokenEiraValido(token?: string) {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i < 1) return false;
  const usuario = token.slice(0, i);
  return iguales(token.slice(i + 1), await firmar(usuario)) && usuario === usuarioEira();
}
