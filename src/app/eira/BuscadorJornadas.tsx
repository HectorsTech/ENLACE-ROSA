"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";

export interface ItemBusqueda {
  id: string;
  municipio: string;
  estado: string;
  sede: string;
  token: string;
}

const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function BuscadorJornadas({ jornadas }: { jornadas: ItemBusqueda[] }) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const resultados = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return jornadas.filter((j) => norm(`${j.municipio} ${j.estado} ${j.sede} ${j.token} ${j.id}`).includes(t)).slice(0, 6);
  }, [q, jornadas]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        placeholder="Buscar jornada o municipio"
        aria-label="Buscar jornada"
        className="campo rounded-full pl-10"
      />
      {abierto && q.trim() && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-borde bg-white shadow-flotante">
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-pizarra-suave">Sin resultados.</p>
          ) : (
            resultados.map((j) => (
              <Link key={j.id} href={`/eira/jornadas/${j.id}`} onClick={() => setQ("")} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-rosa-50">
                <MapPin className="h-4 w-4 shrink-0 text-rosa" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{j.municipio}</span>
                  <span className="block truncate text-xs text-pizarra-suave">{j.estado} · {j.sede}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
