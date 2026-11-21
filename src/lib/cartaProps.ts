import { formatoFechaLarga } from "./fechas";
import type { Jornada } from "./types";

export function propsCarta(j: Jornada) {
  const c = j.carta;
  return {
    inicial: {
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
    },
    contexto: {
      municipio: j.municipio,
      estado: j.estado,
      fechaTexto: formatoFechaLarga(j.fecha),
      enlaceNombre: j.enlaceMunicipal.nombre,
      enlaceCargo: j.enlaceMunicipal.cargo,
      enlaceContacto: [j.enlaceMunicipal.celular, j.enlaceMunicipal.correo].filter(Boolean).join(" · "),
      coordinadoraEira: j.enlaceEira.nombre,
    },
  };
}
