"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Download, Eye, FileText, Loader2, PenLine, RefreshCw, Save, Upload } from "lucide-react";
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
  pdfUrl,
  modo = "municipio",
}: {
  jornadaId: string;
  requisitoId: string;
  inicial: DatosCarta;
  contexto: ContextoCarta;
  estado: EstadoRequisito;
  versionActual?: string;
  firmaInicial?: string;
  pdfUrl: string;
  modo?: "municipio" | "eira";
}) {
  const router = useRouter();
  const esEira = modo === "eira";
  const [d, setD] = useState<DatosCarta>(inicial);
  const [firma, setFirma] = useState<string | null>(firmaInicial ?? null);
  const [pendiente, iniciar] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [vista, setVista] = useState<"documento" | "pdf">("documento");
  const [pdfKey, setPdfKey] = useState(0);
  const archivo = useRef<HTMLInputElement>(null);
  const set = (k: keyof DatosCarta, v: string) => setD((x) => ({ ...x, [k]: v }));

  const guardarTodo = async () => {
    const res = await guardarCarta({ jornadaId, datos: d, ...(esEira ? {} : { firma }) });
    if (!res.ok) setMsg({ ok: false, texto: res.error });
    return res.ok;
  };

  const guardar = () =>
    iniciar(async () => {
      if (await guardarTodo()) {
        setMsg({ ok: true, texto: "Datos guardados." });
        setPdfKey(Date.now());
      }
      router.refresh();
    });

  const verPdf = () =>
    iniciar(async () => {
      if (await guardarTodo()) {
        setMsg(null);
        setVista("pdf");
        setPdfKey(Date.now());
      }
      router.refresh();
    });

  const descargar = () =>
    iniciar(async () => {
      if (!(await guardarTodo())) return;
      router.refresh();
      window.location.assign(`${pdfUrl}?t=${Date.now()}`);
    });

  const firmarYEnviar = () =>
    iniciar(async () => {
      if (!firma) return setMsg({ ok: false, texto: "Dibuja tu firma en el recuadro." });
      const res = await firmarCarta({ jornadaId, datos: d, firma });
      setMsg(res.ok ? { ok: true, texto: "Carta firmada y enviada a EIRA. Estado: Recibido." } : { ok: false, texto: res.error });
      if (res.ok) setPdfKey(Date.now());
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

  const mensaje = msg && (
    <p className={`flex items-center gap-1.5 text-sm font-medium ${msg.ok ? "text-estado-aprobado" : "text-estado-observado"}`}>
      {msg.ok && <CheckCircle2 className="h-4 w-4" />} {msg.texto}
    </p>
  );

  const pestana = (activa: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${activa ? "bg-guinda text-white" : "bg-white text-pizarra-suave ring-1 ring-borde"}`;

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

        {esEira ? (
          <div className="tarjeta space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Documento</h2>
              <EstadoBadge estado={estado} chico />
            </div>
            <button type="button" disabled={pendiente} onClick={descargar} className="btn-guinda w-full">
              <Download className="h-4 w-4" /> Descargar PDF
            </button>
            <p className="text-[11px] text-pizarra-suave">Si cambias los datos, la firma digital del municipio se invalida y deberá firmar de nuevo.</p>
            {versionActual && <p className="text-xs text-pizarra-suave">Último archivo del municipio: <span className="font-semibold text-pizarra">{versionActual}</span></p>}
            {mensaje}
          </div>
        ) : (
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
            <button type="button" disabled={pendiente} onClick={descargar} className="btn-secundario w-full">
              <Download className="h-4 w-4" /> Descargar PDF para firma y sello
            </button>
            <p className="text-[11px] text-pizarra-suave">Guarda tus datos y firma, y descarga el PDF con ellos. También puedes imprimirlo, firmarlo y sellarlo a mano, y subir el escaneo.</p>
            <input ref={archivo} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => subir(e.target.files?.[0])} />
            <button type="button" disabled={pendiente || estado === "aprobado"} onClick={() => archivo.current?.click()} className="btn-secundario w-full">
              <Upload className="h-4 w-4" /> {versionActual ? "Subir nueva versión firmada y sellada" : "Subir versión firmada y sellada"}
            </button>
            {versionActual && <p className="text-xs text-pizarra-suave">Último archivo: <span className="font-semibold text-pizarra">{versionActual}</span></p>}
            {mensaje}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
          <button type="button" onClick={() => setVista("documento")} className={pestana(vista === "documento")}>
            <FileText className="h-4 w-4" /> Vista del documento
          </button>
          <button type="button" disabled={pendiente} onClick={verPdf} className={pestana(vista === "pdf")}>
            <Eye className="h-4 w-4" /> Vista previa PDF
          </button>
          {vista === "pdf" && (
            <button type="button" disabled={pendiente} onClick={verPdf} className="inline-flex items-center gap-1 text-xs font-semibold text-pizarra-suave hover:text-pizarra">
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </button>
          )}
        </div>
        {vista === "documento" ? (
          <DocumentoCarta d={d} c={contexto} firma={esEira ? firmaInicial : firma} />
        ) : (
          <iframe key={pdfKey} title="Vista previa del PDF" src={`${pdfUrl}?inline=1&t=${pdfKey}`} className="h-[1000px] w-full rounded-lg border border-borde bg-white" />
        )}
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
