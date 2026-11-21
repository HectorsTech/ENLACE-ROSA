import type { FichaCampo } from "./types";

export const FICHA_VACIA: Omit<FichaCampo, "actualizadoEn"> = {
  tomaMenos20m: "si",
  voltajeEstable: "si",
  apagones: "nunca",
  plantaRespaldo: "no",
  comentariosElectricidad: "",
  internet: [],
  espacioPrivado: "si",
  espacioTechado: "si",
  comentariosPrivacidad: "",
  banos: "si",
  aguaDisponible: "si",
  mesasSillas: "si",
  comentariosMobiliario: "",
  accesoVehicular: "facil",
  caminos4x4: "no",
  climaCaminos: "",
  hablaLenguaIndigena: "no",
  lengua: "",
  variante: "",
  diasHorariosLocales: "",
  personalFemenino: "no",
  transporteComunitario: "no",
  transporteDetalle: "",
  resguardoNocturno: "no",
  resguardoDetalle: "",
};

export interface AlertaCalculada {
  clave: string;
  titulo: string;
  detalle: string;
  severidad: "alta" | "media";
}

export interface EvaluacionFicha {
  alertas: AlertaCalculada[];
  pedirTraductora: boolean;
  pedirFotos: boolean;
}

/** Reglas condicionales: qué requisitos y alertas activa una ficha de campo. */
export function evaluarFicha(f: Omit<FichaCampo, "actualizadoEn">): EvaluacionFicha {
  const alertas: AlertaCalculada[] = [];

  const problemaElectrico = f.tomaMenos20m === "no" || f.voltajeEstable === "no" || f.apagones === "frecuentes";
  const problemaAcceso = f.accesoVehicular === "dificil" || f.caminos4x4 === "si";
  const problemaPrivacidad = f.espacioPrivado === "no";
  const sinConexion = f.internet.length === 0 || f.internet.includes("ninguna");

  if (f.hablaLenguaIndigena === "si") {
    alertas.push({
      clave: "traductora",
      titulo: "Requiere traductora bilingüe",
      detalle: `Se habla ${f.lengua.trim() || "lengua indígena"}${f.variante.trim() ? ` (${f.variante.trim()})` : ""}. Se activó el requisito de registrar a la promotora bilingüe o traductora.`,
      severidad: "alta",
    });
  }
  if (problemaElectrico && f.plantaRespaldo === "no") {
    alertas.push({
      clave: "planta_electrica",
      titulo: "Requiere planta eléctrica o regulador",
      detalle: "La electricidad del lugar no es confiable (toma lejana, voltaje inestable o apagones) y no hay planta de respaldo.",
      severidad: "alta",
    });
  } else if (problemaElectrico) {
    alertas.push({
      clave: "electricidad_riesgo",
      titulo: "Electricidad con riesgo; hay planta de respaldo",
      detalle: "Se reportaron problemas eléctricos. Confirmar capacidad y combustible de la planta de respaldo.",
      severidad: "media",
    });
  }
  if (sinConexion) {
    alertas.push({
      clave: "sin_conexion",
      titulo: "Operación en modo sin conexión",
      detalle: "El lugar no cuenta con internet ni señal. Preparar registro y captura sin conexión.",
      severidad: "alta",
    });
  }
  if (problemaPrivacidad) {
    alertas.push({
      clave: "privacidad",
      titulo: "Privacidad insuficiente",
      detalle: "El espacio no garantiza privacidad para los estudios. Evaluar divisiones o consultorios móviles.",
      severidad: "alta",
    });
  }
  if (f.espacioTechado === "no") {
    alertas.push({ clave: "clima", titulo: "Espacio sin techo", detalle: "Riesgo por lluvia, sol o viento. Considerar carpas.", severidad: "media" });
  }
  if (f.banos === "no" || f.aguaDisponible === "no") {
    alertas.push({ clave: "banos_agua", titulo: "Sin baños o agua disponibles", detalle: "Coordinar baños portátiles o suministro de agua.", severidad: "media" });
  }
  if (f.transporteComunitario === "si") {
    alertas.push({
      clave: "transporte_comunitario",
      titulo: "Requiere transporte comunitario",
      detalle: f.transporteDetalle.trim() || "El municipio requiere coordinar transporte para las pacientes.",
      severidad: "media",
    });
  }
  if (problemaAcceso) {
    alertas.push({
      clave: "acceso_4x4",
      titulo: f.caminos4x4 === "si" ? "Acceso 4×4 por caminos difíciles" : "Ruta de acceso difícil",
      detalle: f.climaCaminos.trim() || "Verificar la ruta de llegada del equipo y de la unidad.",
      severidad: "alta",
    });
  }
  if (f.resguardoNocturno === "si") {
    alertas.push({
      clave: "resguardo_nocturno",
      titulo: "Requiere resguardo nocturno del equipo",
      detalle: f.resguardoDetalle.trim() || "El equipo médico permanecerá en sitio durante la noche.",
      severidad: "media",
    });
  }
  if (f.personalFemenino === "si") {
    alertas.push({
      clave: "personal_femenino",
      titulo: "Atención exclusiva por personal femenino",
      detalle: "La comunidad requiere sensibilidad cultural: asignar personal femenino.",
      severidad: "media",
    });
  }

  return {
    alertas,
    pedirTraductora: f.hablaLenguaIndigena === "si",
    pedirFotos: problemaElectrico || problemaAcceso || problemaPrivacidad,
  };
}
