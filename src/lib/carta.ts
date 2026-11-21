import { jsPDF } from "jspdf";
import { CLAUSULAS_FIJAS } from "./clausulas";
import { formatoFechaLarga } from "./fechas";
import type { Jornada } from "./types";

const ROSA: [number, number, number] = [229, 115, 115];
const GUINDA: [number, number, number] = [105, 28, 50];

/** Genera la carta compromiso en PDF (una hoja carta) con los datos guardados y la firma digital, si existe. */
export function generarCartaPdf(j: Jornada): Uint8Array {
  const c = j.carta;
  const v = (t?: string, vacio = "[por completar]") => (t && t.trim() ? t.trim() : vacio);
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = 215.9;
  const M = 18;
  const ancho = W - M * 2;
  let y = 18;

  const parrafo = (texto: string, x = M, w = ancho, tam = 9, estilo: "normal" | "bold" = "normal", sep = 3.9) => {
    doc.setFont("helvetica", estilo).setFontSize(tam);
    const lineas = doc.splitTextToSize(texto, w) as string[];
    doc.text(lineas, x, y, { align: "justify", maxWidth: w });
    y += lineas.length * sep;
  };

  doc.setFillColor(...ROSA).circle(M + 5, y + 2, 5, "F");
  doc.setTextColor(0).setFont("helvetica", "bold").setFontSize(12).text("EIRA Movimiento Rosa A.C.", M + 13, y + 1.5);
  doc.setFont("helvetica", "normal").setFontSize(8).text("Jornadas de detección oportuna", M + 13, y + 5.5);
  doc.setFont("helvetica", "bold").setFontSize(12).text(`H. Ayuntamiento de ${j.municipio}`, W - M, y + 1.5, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(8).text(j.estado, W - M, y + 5.5, { align: "right" });
  y += 11;
  doc.setDrawColor(...GUINDA).setLineWidth(0.6).line(M, y, W - M, y);
  y += 8;

  const fecha = formatoFechaLarga(j.fecha);
  doc.setFont("helvetica", "bold").setFontSize(13).text("CARTA COMPROMISO DE COLABORACIÓN", W / 2, y, { align: "center" });
  y += 5.5;
  doc.setFont("helvetica", "normal").setFontSize(9).text(`Jornada de detección oportuna de cáncer de mama y cervicouterino · ${fecha}`, W / 2, y, { align: "center" });
  y += 8;

  parrafo(
    `Por una parte, EIRA Movimiento Rosa A.C. (en adelante «EIRA»), y por la otra, el H. Ayuntamiento de ${j.municipio}, ${j.estado} (en adelante «el Municipio»), acuerdan colaborar en la realización de la jornada de salud descrita, bajo las siguientes cláusulas:`,
  );
  y += 3;

  const contacto = [j.enlaceMunicipal.celular, j.enlaceMunicipal.correo].filter(Boolean).join(" · ") || "por confirmar";
  const variables: [number, string, string][] = [
    [
      1,
      "Autoridades y persona enlace",
      `Suscribe por el Municipio ${v(c?.autoridad)}, ${v(c?.cargoAutoridad, "[cargo]")}${c?.dependencia?.trim() ? ` (${c.dependencia.trim()})` : ""}. La persona enlace designada es ${j.enlaceMunicipal.nombre}${j.enlaceMunicipal.cargo ? `, ${j.enlaceMunicipal.cargo}` : ""}; contacto: ${contacto}.`,
    ],
    [
      2,
      "Sede y horarios",
      `La jornada se realizará en ${v(c?.sede ?? j.sede)}${(c?.direccion ?? j.direccion) ? `, ubicada en ${c?.direccion ?? j.direccion}` : ""}, el ${fecha}, en horario de ${v(c?.horaInicio, "[inicio]")} a ${v(c?.horaFin, "[término]")} horas.`,
    ],
    [3, "Espacio y mobiliario", `El Municipio proporcionará: ${v(c?.mobiliario, "[mobiliario por completar]")}.`],
    [4, "Transporte y seguridad", `Transporte: ${v(c?.transporte, "[por completar]")}. Seguridad y resguardo: ${v(c?.seguridad, "[por completar]")}.`],
  ];
  for (const [n, t, texto] of variables) {
    parrafo(`CLÁUSULA ${n}. ${t.toUpperCase()}`, M, ancho, 9, "bold");
    parrafo(texto);
    y += 2.5;
  }

  for (const cl of CLAUSULAS_FIJAS) {
    const lineas = doc.setFont("helvetica", "normal").setFontSize(9).splitTextToSize(cl.texto, ancho - 8) as string[];
    const alto = 7 + lineas.length * 3.9;
    doc.setFillColor(248, 238, 241).setDrawColor(...GUINDA).setLineWidth(0.25).roundedRect(M, y - 4, ancho, alto, 1.5, 1.5, "FD");
    doc.setTextColor(...GUINDA).setFont("helvetica", "bold").setFontSize(9).text(`CLÁUSULA ${cl.n}. ${cl.titulo.toUpperCase()}`, M + 4, y);
    doc.setFont("helvetica", "normal").setFontSize(7.5).text("Cláusula institucional no editable", W - M - 4, y, { align: "right" });
    doc.setTextColor(0);
    y += 3.9;
    doc.setFont("helvetica", "normal").setFontSize(9).text(lineas, M + 4, y, { align: "justify", maxWidth: ancho - 8 });
    y += lineas.length * 3.9 + 4.5;
  }

  y = Math.max(y + 12, 218);
  const col = 68;
  const xs = [M + 10, W - M - 10 - col];
  if (c?.firma) {
    try {
      doc.addImage(c.firma, "PNG", xs[0] + 4, y - 22, 60, 20);
    } catch {
      /* firma ilegible: se omite */
    }
  }
  doc.setDrawColor(0).setLineWidth(0.3);
  xs.forEach((x) => doc.line(x, y, x + col, y));
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text(v(c?.autoridad, "Autoridad municipal"), xs[0] + col / 2, y + 4.5, { align: "center" });
  doc.text(j.enlaceEira.nombre, xs[1] + col / 2, y + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  doc.text(v(c?.cargoAutoridad, "Cargo"), xs[0] + col / 2, y + 8.5, { align: "center" });
  doc.text("Sello oficial del Municipio", xs[0] + col / 2, y + 12.5, { align: "center" });
  doc.text("Coordinadora de Jornadas", xs[1] + col / 2, y + 8.5, { align: "center" });
  doc.text("EIRA Movimiento Rosa A.C.", xs[1] + col / 2, y + 12.5, { align: "center" });
  if (c?.firmadaEn) {
    doc.setFontSize(7.5).setTextColor(110).text(`Firmada digitalmente el ${new Date(c.firmadaEn).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })}`, xs[0] + col / 2, y + 17, { align: "center" });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
