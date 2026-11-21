"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { guardarFicha } from "@/lib/actions";
import { CAMPOS_GENERAL, evaluarFicha, tomar, type FICHA_VACIA } from "@/lib/ficha";
import type { SenalInternet, SiNo } from "@/lib/types";

type Datos = typeof FICHA_VACIA;

const SENALES: { clave: SenalInternet; texto: string }[] = [
  { clave: "wifi", texto: "Wi-Fi" },
  { clave: "telcel", texto: "Telcel" },
  { clave: "altan_cfe", texto: "Altán / CFE" },
  { clave: "ninguna", texto: "Ninguna" },
];

export function FichaForm({ jornadaId, inicial, enviada }: { jornadaId: string; inicial: Datos; enviada: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Datos>(inicial);
  const [pendiente, iniciar] = useTransition();
  const [res, setRes] = useState<{ ok: boolean; texto: string; efectos?: string[] } | null>(null);
  const set = <K extends keyof Datos>(k: K, v: Datos[K]) => setF((x) => ({ ...x, [k]: v }));
  const ev = useMemo(() => evaluarFicha(f), [f]);
  const alertasGeneral = ev.alertas.filter((a) => a.origen === "general");

  const alternarSenal = (s: SenalInternet) =>
    set(
      "internet",
      s === "ninguna" ? (f.internet.includes("ninguna") ? [] : ["ninguna"]) : f.internet.filter((x) => x !== "ninguna" && x !== s).concat(f.internet.includes(s) ? [] : [s]),
    );

  const enviar = () =>
    iniciar(async () => {
      const r = await guardarFicha({ jornadaId, ficha: tomar(f, CAMPOS_GENERAL) });
      setRes(r.ok ? { ok: true, texto: "Ficha enviada a EIRA.", efectos: r.efectos } : { ok: false, texto: r.error });
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <Seccion titulo="Instalaciones" texto="Conectividad, baños, agua y mobiliario. Electricidad, privacidad y acceso se responden en el formulario de evidencia del espacio.">
        <Grupo titulo="Internet y señal">
          <p className="text-xs text-pizarra-suave">Marca todo lo que funcione en el lugar.</p>
          <div className="flex flex-wrap gap-2">
            {SENALES.map((s) => {
              const on = f.internet.includes(s.clave);
              return (
                <button key={s.clave} type="button" aria-pressed={on} onClick={() => alternarSenal(s.clave)} className={chip(on)}>
                  {s.texto}
                </button>
              );
            })}
          </div>
        </Grupo>

        <Grupo titulo="Baños y agua">
          <Pregunta t="¿Hay baños disponibles?"><SiNoSel v={f.banos} on={(v) => set("banos", v)} /></Pregunta>
          <Pregunta t="¿Hay agua disponible?"><SiNoSel v={f.aguaDisponible} on={(v) => set("aguaDisponible", v)} /></Pregunta>
        </Grupo>

        <Grupo titulo="Mobiliario">
          <Pregunta t="¿Hay mesas y sillas suficientes?"><SiNoSel v={f.mesasSillas} on={(v) => set("mesasSillas", v)} /></Pregunta>
          <Comentarios v={f.comentariosMobiliario} on={(v) => set("comentariosMobiliario", v)} />
        </Grupo>
      </Seccion>

      <Seccion titulo="Comunidad" texto="Lengua, costumbres locales, transporte y resguardo.">
        <Grupo titulo="Lengua y cultura">
          <Pregunta t="¿Se habla una lengua indígena en la comunidad?"><SiNoSel v={f.hablaLenguaIndigena} on={(v) => set("hablaLenguaIndigena", v)} /></Pregunta>
          {f.hablaLenguaIndigena === "si" && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block"><span className="etiqueta">Lengua</span><input className="campo" value={f.lengua} onChange={(e) => set("lengua", e.target.value)} placeholder="Ej. Náhuatl" /></label>
              <label className="block"><span className="etiqueta">Variante local</span><input className="campo" value={f.variante} onChange={(e) => set("variante", e.target.value)} placeholder="Ej. Náhuatl de la Sierra Norte" /></label>
            </div>
          )}
          <label className="block">
            <span className="etiqueta">Días y horarios locales a considerar (ej. día de plaza)</span>
            <input className="campo" value={f.diasHorariosLocales} onChange={(e) => set("diasHorariosLocales", e.target.value)} placeholder="Ej. Los jueves hay plaza; evitar de 8 a 11 h" />
          </label>
          <Pregunta t="¿La comunidad requiere atención por personal femenino?"><SiNoSel v={f.personalFemenino} on={(v) => set("personalFemenino", v)} /></Pregunta>
        </Grupo>

        <Grupo titulo="Transporte y resguardo">
          <Pregunta t="¿Se necesita transporte comunitario para las pacientes?"><SiNoSel v={f.transporteComunitario} on={(v) => set("transporteComunitario", v)} /></Pregunta>
          {f.transporteComunitario === "si" && (
            <input className="campo" value={f.transporteDetalle} onChange={(e) => set("transporteDetalle", e.target.value)} placeholder="Rutas, comunidades y horarios aproximados" />
          )}
          <Pregunta t="¿Se necesita resguardo nocturno del equipo?"><SiNoSel v={f.resguardoNocturno} on={(v) => set("resguardoNocturno", v)} /></Pregunta>
          {f.resguardoNocturno === "si" && (
            <input className="campo" value={f.resguardoDetalle} onChange={(e) => set("resguardoDetalle", e.target.value)} placeholder="Lugar y responsable del resguardo" />
          )}
        </Grupo>

      </Seccion>

      {(ev.pedirTraductora || alertasGeneral.length > 0) && (
        <section className="rounded-2xl border border-dorado/40 bg-dorado-50 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#8A6A3A]"><AlertTriangle className="h-4 w-4" /> Con estas respuestas, al enviar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-pizarra">
            {ev.pedirTraductora && <li>Te pediremos registrar a una promotora bilingüe o traductora.</li>}
            {alertasGeneral.map((a) => <li key={a.clave}>EIRA recibirá la alerta: {a.titulo}.</li>)}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={pendiente} onClick={enviar} className="btn-guinda px-7 py-3">
          {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {enviada ? "Actualizar y reenviar ficha" : "Enviar ficha a EIRA"}
        </button>
        {res && (
          <p className={`text-sm font-medium ${res.ok ? "text-estado-aprobado" : "text-estado-observado"}`}>
            {res.ok && <CheckCircle2 className="mr-1 inline h-4 w-4" />} {res.texto}
          </p>
        )}
      </div>
      {res?.efectos && res.efectos.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-pizarra-suave">
          {res.efectos.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}

export const chip = (on: boolean) =>
  `rounded-full border px-4 py-1.5 text-sm font-medium transition ${on ? "border-rosa bg-rosa-50 text-rosa-700" : "border-borde bg-white hover:border-rosa-200"}`;

export function Seccion({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section className="tarjeta space-y-6 p-6">
      <div>
        <h2 className="font-serif text-2xl font-normal">{titulo}</h2>
        <p className="text-sm text-pizarra-suave">{texto}</p>
      </div>
      {children}
    </section>
  );
}

export function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl bg-crema p-4">
      <p className="ojal">{titulo}</p>
      {children}
    </div>
  );
}

export function Pregunta({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm">{t}</p>
      {children}
    </div>
  );
}

export function Opciones<T extends string>({ v, on, ops }: { v: T; on: (v: T) => void; ops: [T, string][] }) {
  return (
    <div className="flex gap-1.5">
      {ops.map(([k, t]) => (
        <button key={k} type="button" aria-pressed={v === k} onClick={() => on(k)} className={chip(v === k)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export const SiNoSel = ({ v, on }: { v: SiNo; on: (v: SiNo) => void }) => <Opciones v={v} on={on} ops={[["si", "Sí"], ["no", "No"]]} />;

export function Comentarios({ v, on }: { v: string; on: (v: string) => void }) {
  return <input className="campo" value={v} onChange={(e) => on(e.target.value)} placeholder="Comentarios (opcional)" />;
}
