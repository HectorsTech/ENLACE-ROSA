"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { claveEira, COOKIE_EIRA, crearTokenEira, DURACION_SESION, iguales, tokenEiraValido, usuarioEira } from "./auth";
import { jornadaPorToken } from "./db";

export type EstadoForm = { error?: string };

export async function iniciarSesionEira(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const usuario = String(datos.get("usuario") ?? "").trim();
  const clave = String(datos.get("clave") ?? "");
  if (!iguales(usuario, usuarioEira()) || !iguales(clave, claveEira())) return { error: "Usuario o contraseña incorrectos." };
  (await cookies()).set(COOKIE_EIRA, await crearTokenEira(usuario), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SESION,
  });
  redirect("/eira");
}

export async function cerrarSesionEira() {
  (await cookies()).delete(COOKIE_EIRA);
  redirect("/login-eira");
}

export async function entrarMunicipal(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const id = String(datos.get("id") ?? "").trim().toLowerCase();
  const j = id ? jornadaPorToken(id) : undefined;
  if (!j) return { error: "No encontramos ese ID. Revisa el enlace que te envió EIRA." };
  redirect(`/gob/${j.token}`);
}

export async function exigirEira() {
  if (!(await tokenEiraValido((await cookies()).get(COOKIE_EIRA)?.value))) throw new Error("No autorizado.");
}
