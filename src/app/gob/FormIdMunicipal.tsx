"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { entrarMunicipal, type EstadoForm } from "@/lib/auth-actions";

export function FormIdMunicipal() {
  const [estado, accion, pendiente] = useActionState<EstadoForm, FormData>(entrarMunicipal, {});
  return (
    <form action={accion} className="space-y-4">
      <label className="block">
        <span className="etiqueta">ID único</span>
        <input name="id" className="campo" placeholder="Ej. naucalpan-2026" autoComplete="off" required autoFocus />
      </label>
      {estado.error && <p className="text-sm font-medium text-estado-observado">{estado.error}</p>}
      <button type="submit" disabled={pendiente} className="btn-guinda w-full py-3">
        {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Entrar a mi panel
      </button>
    </form>
  );
}
