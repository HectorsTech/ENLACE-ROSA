import { Lock, Ribbon } from "lucide-react";
import { CLAUSULAS_FIJAS } from "@/lib/clausulas";
import type { CartaDatos } from "@/lib/types";

export type DatosCarta = Omit<CartaDatos, "actualizadoEn" | "firma" | "firmadaEn">;

export interface ContextoCarta {
  municipio: string;
  estado: string;
  fechaTexto: string;
  enlaceNombre: string;
  enlaceCargo: string;
  enlaceContacto: string;
  coordinadoraEira: string;
}

const vacio = (t: string, marcador: string) => (t.trim() ? t.trim() : <span className="text-slate-400">[{marcador}]</span>);

function Fija({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-guinda-100 bg-guinda-50/50 px-3 py-2 print:border-slate-400 print:bg-transparent">
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide text-guinda print:text-black">
          Cláusula {n}. {titulo}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-guinda px-2 py-0.5 text-[9px] font-bold text-white print:hidden">
          <Lock className="h-2.5 w-2.5" /> Cláusula institucional no editable
        </span>
      </div>
      <p>{children}</p>
    </section>
  );
}

function Variable({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="px-3">
      <h3 className="font-sans text-[11px] font-bold uppercase tracking-wide">
        Cláusula {n}. {titulo}
      </h3>
      <p>{children}</p>
    </section>
  );
}

export function DocumentoCarta({ d, c, firma }: { d: DatosCarta; c: ContextoCarta; firma?: string | null }) {
  return (
    <article
      id="carta-doc"
      className="space-y-2.5 rounded-lg border border-borde bg-white p-8 font-serif text-[11.5px] leading-snug text-black shadow-suave print:space-y-2 print:rounded-none print:border-0 print:p-0 print:text-[9.5pt] print:shadow-none"
    >
      <header className="flex items-start justify-between gap-4 border-b-2 border-guinda pb-2 print:border-black">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-rosa text-white print:bg-transparent print:text-black print:ring-1 print:ring-black">
            <Ribbon className="h-4 w-4" />
          </span>
          <div className="font-sans leading-tight">
            <p className="text-sm font-bold">EIRA Movimiento Rosa A.C.</p>
            <p className="text-[10px] text-slate-500 print:text-black">Jornadas de detección oportuna</p>
          </div>
        </div>
        <div className="text-right font-sans leading-tight">
          <p className="text-sm font-bold">H. Ayuntamiento de {c.municipio}</p>
          <p className="text-[10px] text-slate-500 print:text-black">{c.estado}</p>
        </div>
      </header>

      <div className="text-center">
        <h2 className="font-serif text-base font-bold uppercase tracking-wide">Carta compromiso de colaboración</h2>
        <p className="text-[10.5px]">Jornada de detección oportuna de cáncer de mama y cervicouterino · {c.fechaTexto}</p>
      </div>

      <p className="px-3 text-justify">
        Por una parte, EIRA Movimiento Rosa A.C. (en adelante «EIRA»), y por la otra, el H. Ayuntamiento de {c.municipio}, {c.estado} (en adelante
        «el Municipio»), acuerdan colaborar en la realización de la jornada de salud descrita, bajo las siguientes cláusulas:
      </p>

      <Variable n={1} titulo="Autoridades y persona enlace">
        Suscribe por el Municipio {vacio(d.autoridad, "autoridad municipal")}, {vacio(d.cargoAutoridad, "cargo")}
        {d.dependencia.trim() && <> ({d.dependencia.trim()})</>}. La persona enlace designada es {c.enlaceNombre}
        {c.enlaceCargo && <>, {c.enlaceCargo}</>}; contacto: {c.enlaceContacto || "por confirmar"}.
      </Variable>
      <Variable n={2} titulo="Sede y horarios">
        La jornada se realizará en {vacio(d.sede, "sede")}
        {d.direccion.trim() && <>, ubicada en {d.direccion.trim()}</>}, el {c.fechaTexto}, en horario de {vacio(d.horaInicio, "hora de inicio")} a{" "}
        {vacio(d.horaFin, "hora de término")} horas.
      </Variable>
      <Variable n={3} titulo="Espacio y mobiliario">
        El Municipio proporcionará: {vacio(d.mobiliario, "mesas, sillas, carpas y demás mobiliario")}.
      </Variable>
      <Variable n={4} titulo="Transporte y seguridad">
        Transporte: {vacio(d.transporte, "transporte comunitario o de apoyo")}. Seguridad y resguardo: {vacio(d.seguridad, "personal de seguridad, protección civil")}.
      </Variable>

      {CLAUSULAS_FIJAS.map((cl) => (
        <Fija key={cl.n} n={cl.n} titulo={cl.titulo}>{cl.texto}</Fija>
      ))}

      <div className="grid grid-cols-2 gap-10 px-6 pt-14 text-center font-sans text-[10.5px] leading-tight">
        <div className="relative">
          {firma && /* eslint-disable-next-line @next/next/no-img-element */ <img src={firma} alt="Firma" className="absolute -top-14 left-1/2 h-14 -translate-x-1/2" />}
          <div className="border-t border-black pt-1">
            <p className="font-bold">{d.autoridad.trim() || "Autoridad municipal"}</p>
            <p>{d.cargoAutoridad.trim() || "Cargo"}</p>
            <p>Sello oficial del Municipio</p>
          </div>
        </div>
        <div>
          <div className="border-t border-black pt-1">
            <p className="font-bold">{c.coordinadoraEira}</p>
            <p>Coordinadora de Jornadas</p>
            <p>EIRA Movimiento Rosa A.C.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
