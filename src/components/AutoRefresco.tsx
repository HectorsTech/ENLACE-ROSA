"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Refresco "en tiempo real": consulta la versión de la base de datos local cada pocos segundos
 * y, si cambió (por una acción hecha en otra vista /gob o /eira), vuelve a renderizar la página.
 */
export function AutoRefresco({ intervalo = 2500 }: { intervalo?: number }) {
  const router = useRouter();
  const ultima = useRef<number | null>(null);

  useEffect(() => {
    let activo = true;
    const revisar = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = (await res.json()) as { version: number };
        if (!activo) return;
        if (ultima.current !== null && version !== ultima.current) router.refresh();
        ultima.current = version;
      } catch {
        /* sin conexión: reintentar en el siguiente ciclo */
      }
    };
    revisar();
    const id = setInterval(revisar, intervalo);
    const alEnfocar = () => revisar();
    window.addEventListener("focus", alEnfocar);
    return () => {
      activo = false;
      clearInterval(id);
      window.removeEventListener("focus", alEnfocar);
    };
  }, [router, intervalo]);

  return null;
}
