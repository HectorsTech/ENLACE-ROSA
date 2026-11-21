"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Download, Loader2, PenLine, Save, Upload } from "lucide-react";
import { EstadoBadge } from "@/components/Insignias";
import { firmarCarta, guardarCarta, subirArchivo } from "@/lib/actions";
import type { EstadoRequisito } from "@/lib/types";
import { FirmaPad } from "./FirmaPad";
import { DocumentoCarta, type ContextoCarta, type DatosCarta } from "./DocumentoCarta";

export function CartaEditor({
  jornadaId,
  requisitoId,
  inicial,
  contexto,
  estado,
  versionActual,
  firmaInicial,
  token,
}: {
  jornadaId: string;
  requisitoId: string;
  inicial: DatosCarta;
  contexto: ContextoCarta;
  estado: EstadoRequisito;
  versionActual?: string;
  firmaInicial?: string;
  token: string;
}) {
  const router = useRouter();
  const [d, setD] = useState<DatosCarta>(inicial);
  const [firma, setFirma] = useState<string | null>(firmaInicial ?? null);
  const [pendiente, iniciar] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const set = (k: keyof DatosCarta, v: string) => setD((x) => ({ ...x, [k]: v }));

  const guardar = () =>
    iniciar(async () => {
      const res = await guardarCarta({ jornadaId, datos: d });
      setMsg(res.ok ? { ok: true, texto: "Datos guardados." } : { ok: false, texto: res.error });
      router.refresh();
    });

  const firmarYEnviar = () =>
    iniciar(async () => {
      if (!firma) return setMsg({ ok: false, texto: "Dibuja tu firma en el recuadro." });
      const res = await firmarCarta({ jornadaId, datos: d, firma });
      setMsg(res.ok ? { ok: true, texto: "Carta firmada y enviada a EIRA. Estado: Recibido." } : { ok: false, texto: res.error });
      router.refresh();
    });

  const subir = (f?: File) => {
    if (!f) return;
    iniciar(async () => {
      const kb = f.size > 1_048_576 ? `${(f.size / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`;
      const res = await subirArchivo({ jornadaId, requisitoId, archivo: f.name, tamano: kb });
      setMsg(res.ok ? { ok: true, texto: "Carta firmada enviada a EIRA. Estado: Recibido." } : { ok: false, texto: res.error });
      if (archivo.current) archivo.current.value = "";
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <div className="space-y-4 print:hidden">
        <div className="tarjeta space-y-3 p-5">
          <h2 className="text-base font-bold">Campos variables</h2>
          <p className="text-xs text-pizarra-suave">Las cláusulas 5 a 7 son institucionales de EIRA y no se pueden modificar.</p>
          <Campo t="Autoridad municipal que firma"><input className="campo" value={d.autoridad} onChange={(e) => set("autoridad", e.target.value)} placeholder="Ej. Lic. Ana Pérez" /></Campo>
          <Campo t="Cargo"><input className="campo" value={d.cargoAutoridad} onChange={(e) => set("cargoAutoridad", e.target.value)} placeholder="Ej. Presidenta Municipal" /></Campo>
          <Campo t="Dependencia"><input className="campo" value={d.dependencia} onChange={(e) => set("dependencia", e.target.value)} placeholder="Ej. DIF Municipal" /></Campo>
          <Campo t="Sede"><input className="campo" value={d.sede} onChange={(e) => set("sede", e.target.value)} /></Campo>
          <Campo t="Dirección"><input className="campo" value={d.direccion} onChange={(e) => set("direccion", e.target.value)} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo t="Hora de inicio"><input type="time" className="campo" value={d.horaInicio} onChange={(e) => set("horaInicio", e.target.value)} /></Campo>
            <Campo t="Hora de término"><input type="time" className="campo" value={d.horaFin} onChange={(e) => set("horaFin", e.target.value)} /></Campo>
          </div>
          <Campo t="Mobiliario y espacio"><textarea rows={2} className="campo" value={d.mobiliario} onChange={(e) => set("mobiliario", e.target.value)} placeholder="Ej. 6 mesas, 20 sillas, 2 carpas y sanitarios" /></Campo>
          <Campo t="Transporte"><textarea rows={2} className="campo" value={d.transporte} onChange={(e) => set("transporte", e.target.value)} placeholder="Ej. Dos camionetas desde las comunidades" /></Campo>
          <Campo t="Seguridad"><textarea rows={2} className="campo" value={d.seguridad} onChange={(e) => set("seguridad", e.target.value)} placeholder="Ej. Seguridad Pública y Protección Civil en sitio" /></Campo>
          <button type="button" disabled={pendiente} onClick={guardar} className="btn-secundario w-full">
            {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar datos
          </button>
        </div>

        <div className="tarjeta space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Firma y envío</h2>
            <EstadoBadge estado={estado} chico />
          </div>
          <p className="etiqueta">Firma de la autoridad municipal</p>
          <FirmaPad inicial={firmaInicial} onChange={setFirma} />
          <button type="button" disabled={pendiente || !firma || estado === "aprobado"} onClick={firmarYEnviar} className="btn-guinda w-full">
            {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />} Firmar y enviar a EIRA
          </button>
          <a href={`/gob/${token}/carta/pdf`} className="btn-secundario w-full">
            <Download className="h-4 w-4" /> Descargar PDF para firma y sello
          </a>
          <p className="text-[11px] text-pizarra-suave">Descarga la última versión guardada. También puedes imprimirla, firmarla y sellarla a mano, y subir el escaneo.</p>
          <input ref={archivo} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => subir(e.target.files?.[0])} />
          <button type="button" disabled={pendiente || estado === "aprobado"} onClick={() => archivo.current?.click()} className="btn-secundario w-full">
            <Upload className="h-4 w-4" /> {versionActual ? "Subir nueva versión firmada y sellada" : "Subir versión firmada y sellada"}
          </button>
          {versionActual && <p className="text-xs text-pizarra-suave">Último archivo: <span className="font-semibold text-pizarra">{versionActual}</span></p>}
          {msg && (
            <p className={`flex items-center gap-1.5 text-sm font-medium ${msg.ok ? "text-estado-aprobado" : "text-estado-observado"}`}>
              {msg.ok && <CheckCircle2 className="h-4 w-4" />} {msg.texto}
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="ojal mb-2 print:hidden">Vista previa del documento</p>
        <DocumentoCarta d={d} c={contexto} firma={firma} />
      </div>
    </div>
  );
}

function Campo({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="etiqueta">{t}</span>
      {children}
    </label>
  );
}
