"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { iniciarSesionEira, type EstadoForm } from "@/lib/auth-actions";

export function FormLoginEira() {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(iniciarSesionEira, {});
  return (
    <form action={accion} className="mt-6 space-y-4">
      <label className="block">
        <span className="etiqueta">Usuario</span>
        <input name="usuario" className="campo" autoComplete="username" required autoFocus />
      </label>
      <label className="block">
        <span className="etiqueta">Contraseña</span>
        <input name="clave" type="password" className="campo" autoComplete="current-password" required />
      </label>
      {estado.error && <p className="text-sm font-medium text-estado-observado">{estado.error}</p>}
      <button type="submit" disabled={pendiente} className="btn-primario w-full py-3">
        {pendiente && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
      </button>
    </form>
  );
}
