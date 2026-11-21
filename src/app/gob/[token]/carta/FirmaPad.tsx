"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

export function FirmaPad({ inicial, onChange }: { inicial?: string | null; onChange: (png: string | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [hayTrazo, setHayTrazo] = useState(!!inicial);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !inicial) return;
    const img = new Image();
    img.onload = () => c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
    img.src = inicial;
  }, [inicial]);

  const punto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const iniciar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current!.getContext("2d")!;
    canvas.current!.setPointerCapture(e.pointerId);
    dibujando.current = true;
    const p = punto(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
  };

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return;
    const ctx = canvas.current!.getContext("2d")!;
    const p = punto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const terminar = () => {
    if (!dibujando.current) return;
    dibujando.current = false;
    setHayTrazo(true);
    onChange(canvas.current!.toDataURL("image/png"));
  };

  const limpiar = () => {
    const c = canvas.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHayTrazo(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-rosa bg-white">
        <canvas
          ref={canvas}
          width={480}
          height={160}
          className="h-40 w-full cursor-crosshair touch-none"
          onPointerDown={iniciar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerLeave={terminar}
          aria-label="Recuadro para firmar con el mouse"
        />
        {!hayTrazo && <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-slate-400">Firma aquí con el mouse o el dedo</p>}
        <span className="pointer-events-none absolute inset-x-6 bottom-6 border-t border-slate-300" />
      </div>
      <button type="button" onClick={limpiar} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-pizarra-suave hover:text-pizarra">
        <Eraser className="h-3.5 w-3.5" /> Borrar firma
      </button>
    </div>
  );
}
