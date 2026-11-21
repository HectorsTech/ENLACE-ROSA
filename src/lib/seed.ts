import { PLANTILLA_BASE } from "./catalogo";
import { diaJornadaDesdeHoy, fechaLimiteDesde } from "./fechas";
import { construirRequisitos, nuevoId } from "./logica";
import type { BaseDatos, Jornada, ModuloClave, Requisito } from "./types";

const H = 3600_000;
const haceHoras = (h: number) => new Date(Date.now() - h * H).toISOString();

type Paso =
  | { t: "subida"; archivo: string; tamano: string; por: string; hace: number }
  | { t: "aprobado"; por: string; hace: number }
  | { t: "observado"; por: string; hace: number; motivo: string };

/** Aplica una secuencia de eventos a un requisito para construir su historial y versiones. */
function aplicar(req: Requisito, pasos: Paso[]) {
  for (const p of pasos) {
    const fecha = haceHoras(p.hace);
    if (p.t === "subida") {
      const numero = req.versiones.length + 1;
      req.versiones.push({ numero, archivo: p.archivo, tamano: p.tamano, subidoPor: p.por, fecha, estado: "recibido" });
      req.estado = "recibido";
      req.motivoObservacion = undefined;
      req.historial.push({
        id: nuevoId("ev"),
        tipo: "subida",
        actor: p.por,
        rol: "municipio",
        fecha,
        version: numero,
        detalle: `Subió ${p.archivo} (v${numero}).`,
      });
    } else {
      const v = req.versiones[req.versiones.length - 1];
      if (v) {
        v.estado = p.t;
        v.revisadoPor = p.por;
        v.fechaRevision = fecha;
        if (p.t === "observado") v.motivo = p.motivo;
      }
      req.estado = p.t;
      req.motivoObservacion = p.t === "observado" ? p.motivo : undefined;
      req.historial.push({
        id: nuevoId("ev"),
        tipo: p.t,
        actor: p.por,
        rol: "eira",
        fecha,
        version: v?.numero,
        detalle: p.t === "aprobado" ? `Aprobó la versión v${v?.numero}.` : `Observó v${v?.numero}: ${p.motivo}`,
      });
    }
  }
}

interface OpcionesJornada {
  id: string;
  token: string;
  municipio: string;
  estado: string;
  sede: string;
  direccion: string;
  diasParaJornada: number;
  creadaHaceHoras: number;
  servicios: string[];
  modulos: ModuloClave[];
  metaPacientes: number;
  enlaceEira: Jornada["enlaceEira"];
  enlaceMunicipal: Jornada["enlaceMunicipal"];
  historia: Record<string, Paso[]>;
  mensajes?: Jornada["mensajes"];
}

function crear(o: OpcionesJornada): Jornada {
  const fecha = diaJornadaDesdeHoy(o.diasParaJornada).toISOString();
  const creadaEn = haceHoras(o.creadaHaceHoras);
  const requisitos = construirRequisitos(fecha, o.modulos, creadaEn);
  for (const req of requisitos) {
    const pasos = o.historia[req.clave];
    if (pasos) aplicar(req, pasos);
  }
  return {
    id: o.id,
    token: o.token,
    municipio: o.municipio,
    estado: o.estado,
    sede: o.sede,
    direccion: o.direccion,
    fecha,
    fechaLimite: fechaLimiteDesde(fecha, 5),
    servicios: o.servicios,
    modulos: o.modulos,
    plantilla: PLANTILLA_BASE,
    enlaceEira: o.enlaceEira,
    enlaceMunicipal: o.enlaceMunicipal,
    metaPacientes: o.metaPacientes,
    creadaEn,
    requisitos,
    mensajes: o.mensajes ?? [],
  };
}

const LUCIA = { nombre: "Lucía Fernández", cargo: "Coordinadora de Jornadas EIRA", telefono: "55 4120 8890", correo: "lucia.fernandez@eira.org.mx" };
const ANDREA = { nombre: "Andrea Márquez", cargo: "Enlace operativo EIRA", telefono: "55 3318 2271", correo: "andrea.marquez@eira.org.mx" };

export function crearSeed(): BaseDatos {
  // 1) Naucalpan — 65 %, carta observada y 2 pendientes críticos próximos a vencer.
  const nau = "Mariana Robles (Naucalpan)";
  const naucalpan = crear({
    id: "jor-naucalpan",
    token: "naucalpan-2026",
    municipio: "Naucalpan de Juárez",
    estado: "Estado de México",
    sede: "Explanada del Palacio Municipal",
    direccion: "Av. Juárez 39, El Mueble, 53000 Naucalpan de Juárez, Méx.",
    diasParaJornada: 12,
    creadaHaceHoras: 24 * 9,
    servicios: ["Mastografía (40–69 años)", "Exploración clínica de mama", "Papanicolaou (25 años o más)"],
    modulos: ["unidad_movil"],
    metaPacientes: 180,
    enlaceEira: LUCIA,
    enlaceMunicipal: {
      nombre: "Lic. Mariana Robles Aguilar",
      cargo: "Directora de Salud Municipal",
      correo: "mariana.robles@naucalpan.gob.mx",
      celular: "55 2290 1145",
      whatsapp: "55 2290 1145",
      medioPreferido: "whatsapp",
    },
    historia: {
      carta_compromiso: [
        { t: "subida", archivo: "Carta_Compromiso_Naucalpan_firmada.pdf", tamano: "1.8 MB", por: nau, hace: 30 },
        {
          t: "observado",
          por: LUCIA.nombre,
          hace: 20,
          motivo:
            "El sello oficial de la Presidencia Municipal no es visible en la última página y la cláusula 7 (fallas eléctricas externas) fue modificada. Suban la versión oficial sin cambios, firmada y con sello legible.",
        },
      ],
      jurisdiccion_sanitaria: [
        { t: "subida", archivo: "Oficio_Jurisdiccion_Sanitaria_III.pdf", tamano: "640 KB", por: nau, hace: 96 },
        { t: "aprobado", por: LUCIA.nombre, hace: 90 },
      ],
      logotipos: [
        { t: "subida", archivo: "captura_escudo_whatsapp.jpg", tamano: "88 KB", por: nau, hace: 170 },
        { t: "observado", por: ANDREA.nombre, hace: 160, motivo: "Es una captura de pantalla borrosa. Necesitamos el escudo en PNG transparente, SVG o AI." },
        { t: "subida", archivo: "Escudo_Naucalpan_y_DIF.svg", tamano: "312 KB", por: nau, hace: 140 },
        { t: "aprobado", por: ANDREA.nombre, hace: 130 },
      ],
      ficha_condiciones: [
        { t: "subida", archivo: "Ficha_condiciones_Naucalpan.pdf", tamano: "420 KB", por: nau, hace: 150 },
        { t: "aprobado", por: LUCIA.nombre, hace: 140 },
      ],
      lista_registro: [{ t: "subida", archivo: "Registro_preliminar_Naucalpan.xlsx", tamano: "96 KB", por: nau, hace: 6 }],
      confirmacion_enlace: [
        { t: "subida", archivo: "Confirmacion_enlace_y_transporte.pdf", tamano: "210 KB", por: nau, hace: 72 },
        { t: "aprobado", por: ANDREA.nombre, hace: 70 },
      ],
      fotos_espacio: [
        { t: "subida", archivo: "Fotos_explanada_toma_acceso.zip", tamano: "8.4 MB", por: nau, hace: 80 },
        { t: "aprobado", por: ANDREA.nombre, hace: 75 },
      ],
      acceso_unidad_movil: [
        { t: "subida", archivo: "Video_ruta_unidad_movil.mp4", tamano: "24 MB", por: nau, hace: 80 },
        { t: "aprobado", por: ANDREA.nombre, hace: 74 },
      ],
    },
    mensajes: [
      {
        id: "msg-nau-1",
        requisitoId: undefined,
        autor: "Lic. Mariana Robles Aguilar",
        fecha: haceHoras(5),
        mensaje: "¿El permiso de espacio público lo puede firmar el Secretario del Ayuntamiento o debe ser la Dirección de Gobierno?",
        atendido: false,
      },
    ],
  });

  // 2) Toluca — 100 %, Luz Verde Logística.
  const tol = "Ing. Roberto Salgado (Toluca)";
  const todo = (archivo: string, tamano: string, hace: number): Paso[] => [
    { t: "subida", archivo, tamano, por: tol, hace },
    { t: "aprobado", por: LUCIA.nombre, hace: hace - 4 },
  ];
  const toluca = crear({
    id: "jor-toluca",
    token: "toluca-2026",
    municipio: "Toluca",
    estado: "Estado de México",
    sede: "Centro de Desarrollo Comunitario San Pablo Autopan",
    direccion: "Calle Independencia s/n, San Pablo Autopan, 50290 Toluca de Lerdo, Méx.",
    diasParaJornada: 6,
    creadaHaceHoras: 24 * 25,
    servicios: [
      "Mastografía (40–69 años)",
      "Exploración clínica de mama",
      "Ultrasonido mamario",
      "Plática de autoexploración",
    ],
    modulos: ["estancia_multiple"],
    metaPacientes: 240,
    enlaceEira: LUCIA,
    enlaceMunicipal: {
      nombre: "Ing. Roberto Salgado Peña",
      cargo: "Subdirector de Atención Ciudadana, DIF Toluca",
      correo: "roberto.salgado@toluca.gob.mx",
      celular: "722 410 3378",
      whatsapp: "722 410 3378",
      medioPreferido: "whatsapp",
    },
    historia: {
      carta_compromiso: todo("Carta_Compromiso_Toluca_firmada_sellada.pdf", "2.1 MB", 260),
      permiso_espacio: todo("Permiso_uso_CDC_San_Pablo.pdf", "540 KB", 250),
      proteccion_civil: todo("Dictamen_Proteccion_Civil_Toluca.pdf", "880 KB", 240),
      jurisdiccion_sanitaria: todo("Vinculacion_Jurisdiccion_Toluca.pdf", "610 KB", 300),
      logotipos: todo("Logos_Toluca_DIF.ai", "4.2 MB", 400),
      ficha_condiciones: todo("Ficha_condiciones_Toluca.pdf", "390 KB", 380),
      lista_registro: todo("Registro_San_Pablo_Autopan.csv", "54 KB", 60),
      confirmacion_enlace: todo("Confirmacion_transporte_Toluca.pdf", "180 KB", 50),
      fotos_espacio: todo("Fotos_CDC_San_Pablo.zip", "11 MB", 120),
      resguardo_nocturno: todo("Oficio_resguardo_nocturno_Seguridad_Publica.pdf", "300 KB", 200),
    },
  });

  // 3) San Pedro Cholula — 30 %, recién creada, críticos a < 48 h.
  const cho = "Mtra. Itzel Tecuatl (Cholula)";
  const sanPedro = crear({
    id: "jor-cholula",
    token: "cholula-2026",
    municipio: "San Pedro Cholula",
    estado: "Puebla",
    sede: "Auditorio de la Junta Auxiliar San Gregorio Zacapechpan",
    direccion: "Calle 2 Norte s/n, San Gregorio Zacapechpan, 72760 San Pedro Cholula, Pue.",
    diasParaJornada: 11,
    creadaHaceHoras: 52,
    servicios: ["Mastografía (40–69 años)", "Papanicolaou (25 años o más)", "Plática de autoexploración"],
    modulos: ["comunidad_indigena"],
    metaPacientes: 150,
    enlaceEira: ANDREA,
    enlaceMunicipal: {
      nombre: "Mtra. Itzel Tecuatl Xicoténcatl",
      cargo: "Coordinadora del DIF Municipal",
      correo: "itzel.tecuatl@cholula.gob.mx",
      celular: "222 614 0921",
      whatsapp: "222 614 0921",
      medioPreferido: "correo",
    },
    historia: {
      logotipos: [
        { t: "subida", archivo: "Escudo_San_Pedro_Cholula.png", tamano: "1.2 MB", por: cho, hace: 40 },
        { t: "aprobado", por: ANDREA.nombre, hace: 36 },
      ],
      ficha_condiciones: [
        { t: "subida", archivo: "Ficha_condiciones_Zacapechpan.pdf", tamano: "350 KB", por: cho, hace: 30 },
        { t: "aprobado", por: ANDREA.nombre, hace: 26 },
      ],
      traductora: [
        { t: "subida", archivo: "Promotoras_bilingues_nahuatl.pdf", tamano: "150 KB", por: cho, hace: 28 },
        { t: "aprobado", por: ANDREA.nombre, hace: 25 },
      ],
    },
  });

  return {
    version: 1,
    actualizadoEn: new Date().toISOString(),
    jornadas: [naucalpan, toluca, sanPedro],
  };
}
