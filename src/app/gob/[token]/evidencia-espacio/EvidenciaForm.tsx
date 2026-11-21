"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Camera, CheckCircle2, Loader2, Send } from "lucide-react";
import { guardarEvidencia } from "@/lib/actions";
import { CAMPOS_EVIDENCIA, evaluarFicha, FICHA_VACIA, tomar, type DatosEvidencia } from "@/lib/ficha";
import { Comentarios, Grupo, Opciones, Pregunta, Seccion, SiNoSel } from "../ficha-campo/FichaForm";

export function EvidenciaForm({ jornadaId, inicial, respondido }: { jornadaId: string; inicial: DatosEvidencia; respondido: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<DatosEvidencia>(inicial);
  const [pendiente, iniciar] = useTransition();
  const [res, setRes] = useState<{ ok: boolean; texto: string; efectos?: string[] } | null>(null);
  const set = <K extends keyof DatosEvidencia>(k: K, v: DatosEvidencia[K]) => setF((x) => ({ ...x, [k]: v }));
  const ev = useMemo(() => evaluarFicha({ ...FICHA_VACIA, ...f }), [f]);
  const alertas = ev.alertas.filter((a) => a.origen === "evidencia");

  const enviar = () =>
    iniciar(async () => {
      const r = await guardarEvidencia({ jornadaId, datos: tomar(f, CAMPOS_EVIDENCIA) });
      setRes(r.ok ? { ok: true, texto: "Formulario enviado a EIRA.", efectos: r.efectos } : { ok: false, texto: r.error });
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <Seccion titulo="Electricidad" texto="Necesitamos energía estable cerca del área de trabajo.">
        <Grupo titulo="Suministro">
          <Pregunta t="¿Hay una toma eléctrica a menos de 20 m del área de trabajo?"><SiNoSel v={f.tomaMenos20m} on={(v) => set("tomaMenos20m", v)} /></Pregunta>
          <Pregunta t="¿El voltaje es estable?"><SiNoSel v={f.voltajeEstable} on={(v) => set("voltajeEstable", v)} /></Pregunta>
          <Pregunta t="¿Hay apagones en la zona?">
            <Opciones v={f.apagones} on={(v) => set("apagones", v)} ops={[["nunca", "Nunca"], ["ocasionales", "Ocasionales"], ["frecuentes", "Frecuentes"]]} />
          </Pregunta>
          <Pregunta t="¿Existe planta eléctrica de respaldo?"><SiNoSel v={f.plantaRespaldo} on={(v) => set("plantaRespaldo", v)} /></Pregunta>
          <Comentarios v={f.comentariosElectricidad} on={(v) => set("comentariosElectricidad", v)} />
        </Grupo>
      </Seccion>

      <Seccion titulo="Privacidad y clima" texto="El espacio debe cuidar la privacidad de las pacientes.">
        <Grupo titulo="Espacio">
          <Pregunta t="¿El espacio permite privacidad para los estudios?"><SiNoSel v={f.espacioPrivado} on={(v) => set("espacioPrivado", v)} /></Pregunta>
          <Pregunta t="¿Está techado o protegido del clima?"><SiNoSel v={f.espacioTechado} on={(v) => set("espacioTechado", v)} /></Pregunta>
          <Comentarios v={f.comentariosPrivacidad} on={(v) => set("comentariosPrivacidad", v)} />
        </Grupo>
      </Seccion>

      <Seccion titulo="Acceso y caminos" texto="Para saber si el equipo y la unidad pueden llegar sin problemas.">
        <Grupo titulo="Ruta de llegada">
          <Pregunta t="¿La ruta de acceso es complicada para vehículos grandes?">
            <Opciones v={f.accesoVehicular} on={(v) => set("accesoVehicular", v)} ops={[["facil", "No, es fácil"], ["dificil", "Sí, es difícil"]]} />
          </Pregunta>
          <Pregunta t="¿Se requiere vehículo 4×4 para llegar?"><SiNoSel v={f.caminos4x4} on={(v) => set("caminos4x4", v)} /></Pregunta>
          <label className="block">
            <span className="etiqueta">Clima y estado de los caminos</span>
            <textarea rows={2} className="campo" value={f.climaCaminos} onChange={(e) => set("climaCaminos", e.target.value)} placeholder="Ej. En lluvias el camino de terracería se vuelve intransitable" />
          </label>
        </Grupo>
      </Seccion>

      <section className={`rounded-2xl border p-5 ${ev.pedirFotos ? "border-guinda-100 bg-guinda-50/60" : "border-borde bg-white"}`}>
        <p className="flex items-center gap-2 font-semibold">
          <Camera className="h-4 w-4 text-rosa" />
          {ev.pedirFotos ? "Subir las 3 fotografías del espacio será OBLIGATORIO" : "Subir las fotografías del espacio será OPCIONAL (recomendado)"}
        </p>
        <p className="mt-1 text-sm text-pizarra-suave">
          {ev.pedirFotos
            ? "Por tus respuestas necesitamos ver el lugar: vista general del área, centro de carga o toma eléctrica (con la distancia al área de trabajo) y ruta de acceso."
            : "Con tus respuestas, el espacio parece adecuado. Aun así, las fotos ayudan a EIRA a confirmarlo."}
        </p>
        {alertas.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {alertas.map((a) => <li key={a.clave}>EIRA recibirá la alerta: {a.titulo}.</li>)}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={pendiente} onClick={enviar} className="btn-guinda px-7 py-3">
          {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {respondido ? "Actualizar y reenviar formulario" : "Enviar formulario a EIRA"}
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
