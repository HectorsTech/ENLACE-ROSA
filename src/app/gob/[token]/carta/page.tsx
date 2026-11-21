import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { jornadaPorToken } from "@/lib/db";
import { formatoFechaLarga } from "@/lib/fechas";
import { CartaEditor } from "./CartaEditor";

export const dynamic = "force-dynamic";

export default async function CartaCompromiso({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const j = await jornadaPorToken(decodeURIComponent(token));
  if (!j) notFound();

  const req = j.requisitos.find((r) => r.clave === "carta_compromiso");
  if (!req) notFound();
  const ultima = req.versiones[req.versiones.length - 1];
  const c = j.carta;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-pizarra-suave print:hidden">
        <Link href="/gob" className="hover:text-pizarra">Municipios</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/gob/${j.token}`} className="hover:text-pizarra">{j.municipio}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-pizarra">Carta compromiso</span>
      </nav>
      <div className="print:hidden">
        <p className="ojal">Documento institucional</p>
        <h1 className="mt-1 font-serif text-4xl font-normal tracking-tight">Carta <em>compromiso</em></h1>
        <p className="mt-1 text-pizarra-suave">Completa los campos variables, descarga el PDF, fírmalo y séllalo, y súbelo aquí.</p>
      </div>
      <CartaEditor
        jornadaId={j.id}
        requisitoId={req.id}
        estado={req.estado}
        versionActual={ultima?.archivo}
        firmaInicial={c?.firma}
        token={j.token}
        inicial={{
          autoridad: c?.autoridad ?? "",
          cargoAutoridad: c?.cargoAutoridad ?? "",
          dependencia: c?.dependencia ?? "",
          sede: c?.sede ?? j.sede,
          direccion: c?.direccion ?? j.direccion,
          horaInicio: c?.horaInicio ?? "09:00",
          horaFin: c?.horaFin ?? "17:00",
          mobiliario: c?.mobiliario ?? "",
          transporte: c?.transporte ?? "",
          seguridad: c?.seguridad ?? "",
        }}
        contexto={{
          municipio: j.municipio,
          estado: j.estado,
          fechaTexto: formatoFechaLarga(j.fecha),
          enlaceNombre: j.enlaceMunicipal.nombre,
          enlaceCargo: j.enlaceMunicipal.cargo,
          enlaceContacto: [j.enlaceMunicipal.celular, j.enlaceMunicipal.correo].filter(Boolean).join(" · "),
          coordinadoraEira: j.enlaceEira.nombre,
        }}
      />
    </div>
  );
}
