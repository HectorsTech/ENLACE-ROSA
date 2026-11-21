import type { GrupoRequisito, ModuloClave, RangoPersonas } from "./types";

// Catálogo de requisitos (Plantilla base de jornada EIRA).
// Las fechas límite se calculan hacia atrás desde el día de la jornada (D).

export interface DefinicionRequisito {
  clave: string;
  nombre: string;
  descripcion: string;
  grupo: GrupoRequisito;
  criterio: string;
  formatos: string;
  diasAntes: number;
  critico: boolean;
  opcional: boolean;
  modulo?: ModuloClave;
}

export const PLANTILLA_BASE = "Plantilla base Jornada EIRA · v3.2";

export const GRUPOS: Record<GrupoRequisito, { titulo: string; descripcion: string }> = {
  juridico: {
    titulo: "Jurídico y administrativo",
    descripcion: "Permiten que la jornada se realice sin problemas administrativos ni de seguridad.",
  },
  identidad: {
    titulo: "Identidad y convocatoria",
    descripcion: "Datos de contacto, información operativa y sociocultural, y convocatoria de pacientes.",
  },
  evidencia: {
    titulo: "Evidencia del espacio",
    descripcion: "Fotografías para confirmar que el lugar es seguro y adecuado para el tamizaje.",
  },
};

export const REQUISITOS_BASE: DefinicionRequisito[] = [
  {
    clave: "carta_compromiso",
    nombre: "Carta compromiso firmada y sellada",
    descripcion:
      "Convenio de colaboración firmado y con sello oficial de la Presidencia Municipal o del DIF. Las cláusulas institucionales de EIRA no se pueden editar.",
    grupo: "juridico",
    criterio:
      "PDF legible, firma de la persona enlace o autoridad, sello oficial visible y cláusulas institucionales intactas (normativa clínica, privacidad y fallas eléctricas externas).",
    formatos: "PDF",
    diasAntes: 10,
    critico: true,
    opcional: false,
  },
  {
    clave: "permiso_espacio",
    nombre: "Permiso de uso de espacio o vía pública",
    descripcion:
      "Emitido por la Secretaría General o la Dirección de Gobierno municipal. Autoriza la instalación de carpas, consultorios móviles o unidades.",
    grupo: "juridico",
    criterio:
      "Oficio en hoja membretada con fecha y sede de la jornada, firma de la autoridad emisora y sello visible.",
    formatos: "PDF o imagen nítida",
    diasAntes: 10,
    critico: true,
    opcional: false,
  },
  {
    clave: "proteccion_civil",
    nombre: "Visto bueno de Protección Civil Municipal",
    descripcion:
      "Confirma que el lugar cuenta con condiciones básicas de seguridad y rutas de evacuación.",
    grupo: "juridico",
    criterio:
      "Dictamen u oficio vigente que mencione la sede, rutas de evacuación y aforo; firmado por la Coordinación de Protección Civil.",
    formatos: "PDF",
    diasAntes: 10,
    critico: true,
    opcional: false,
  },
  {
    clave: "jurisdiccion_sanitaria",
    nombre: "Vinculación con Jurisdicción Sanitaria (SSA / IMSS-Bienestar)",
    descripcion:
      "Asegura una ruta de referencia para casos sospechosos (BI-RADS 4 o 5) hacia atención y biopsia.",
    grupo: "juridico",
    criterio:
      "Oficio de aviso o vinculación con nombre de la unidad receptora, contacto responsable y ruta de referencia para BI-RADS 4/5.",
    formatos: "PDF",
    diasAntes: 10,
    critico: true,
    opcional: false,
  },
  {
    clave: "ficha_condiciones",
    nombre: "Ficha de condiciones del lugar, comunidad e idioma",
    descripcion:
      "Cuestionario sobre electricidad, internet, privacidad, baños, mobiliario, lengua, horarios, transporte y permisos de la comunidad.",
    grupo: "identidad",
    criterio: "Cuestionario completo con todas las secciones respondidas y comentarios donde aplique.",
    formatos: "Formulario en línea",
    diasAntes: 15,
    critico: false,
    opcional: false,
  },
  {
    clave: "confirmacion_enlace",
    nombre: "Confirmación de persona enlace y transporte",
    descripcion:
      "Nombre, correo, celular y WhatsApp de la persona enlace, medio preferido y horarios de transporte comunitario.",
    grupo: "identidad",
    criterio: "Datos de contacto verificados y horarios de ida y vuelta confirmados por escrito.",
    formatos: "Formulario o PDF",
    diasAntes: 5,
    critico: true,
    opcional: false,
  },
  {
    clave: "fotos_espacio",
    nombre: "Fotografías del espacio",
    descripcion:
      "Opcionales, pero muy sugeridas si la ficha de condiciones no tiene respuestas satisfactorias para un tamizaje seguro.",
    grupo: "evidencia",
    criterio:
      "Al menos tres imágenes nítidas: vista general del área (tamaño, piso nivelado, privacidad), centro de carga o toma eléctrica (con distancia al área de trabajo) y ruta de acceso.",
    formatos: "JPG o PNG",
    diasAntes: 5,
    critico: false,
    opcional: true,
  },
];

export interface DefinicionModulo {
  clave: ModuloClave;
  nombre: string;
  descripcion: string;
  requisitos: DefinicionRequisito[];
}

export const MODULOS: DefinicionModulo[] = [
  {
    clave: "unidad_movil",
    nombre: "Tamizaje Rosa",
    descripcion: "Agrega la validación de la ruta de acceso y el espacio de estacionamiento de la unidad de Tamizaje Rosa.",
    requisitos: [
      {
        clave: "acceso_unidad_movil",
        nombre: "Ruta de acceso y estacionamiento de la unidad de Tamizaje Rosa",
        descripcion:
          "Confirma que la unidad puede llegar sin problemas por calles estrechas, topes o caminos de terracería.",
        grupo: "evidencia",
        criterio:
          "Fotos o video del trayecto final y del área de estacionamiento (mínimo 12 × 4 m, piso firme y nivelado) a menos de 20 m de una toma eléctrica.",
        formatos: "JPG, PNG o MP4",
        diasAntes: 5,
        critico: true,
        opcional: false,
        modulo: "unidad_movil",
      },
    ],
  },
  {
    clave: "comunidad_indigena",
    nombre: "Comunidad indígena / lengua originaria",
    descripcion: "Solicita los datos de promotoras de salud bilingües o traductoras asignadas.",
    requisitos: [
      {
        clave: "traductora",
        nombre: "Promotora bilingüe o traductora asignada",
        descripcion:
          "Apoya durante el consentimiento informado y la explicación de los estudios. De preferencia, mujeres.",
        grupo: "identidad",
        criterio: "Nombre, teléfono, lengua y variante local de cada promotora o traductora asignada por el municipio.",
        formatos: "Formulario o PDF",
        diasAntes: 15,
        critico: true,
        opcional: false,
        modulo: "comunidad_indigena",
      },
    ],
  },
  {
    clave: "estancia_multiple",
    nombre: "Estancia de más de un día",
    descripcion: "Solicita el plan de resguardo nocturno del equipo médico.",
    requisitos: [
      {
        clave: "resguardo_nocturno",
        nombre: "Resguardo nocturno del equipo médico",
        descripcion: "Indica dónde y quién resguardará el equipo médico durante la noche.",
        grupo: "juridico",
        criterio: "Oficio con lugar de resguardo, nombre del responsable, teléfono y horario de vigilancia.",
        formatos: "PDF",
        diasAntes: 10,
        critico: true,
        opcional: false,
        modulo: "estancia_multiple",
      },
    ],
  },
];

export const SERVICIOS_EIRA = [
  "Mastografía",
  "Exploración clínica de mama",
  "Papanicolaou",
  "Ultrasonido mamario",
  "Plática de autoexploración",
  "Prueba de VPH",
];

export const RANGOS_PERSONAS: { clave: RangoPersonas; texto: string }[] = [
  { clave: "menos_50", texto: "Menos de 50" },
  { clave: "50_100", texto: "De 50 a 100" },
  { clave: "100_200", texto: "De 100 a 200" },
  { clave: "mas_200", texto: "Más de 200" },
];

export const TEXTO_RANGO: Record<RangoPersonas, string> = Object.fromEntries(
  RANGOS_PERSONAS.map((r) => [r.clave, r.texto]),
) as Record<RangoPersonas, string>;

export const REFERENCIA_EDADES =
  "Mastografía para mujeres de 40 a 69 años; exploración clínica o Papanicolaou para mujeres de 25 años o más.";

export const NOMBRE_MODULO: Record<ModuloClave, string> = {
  unidad_movil: "Tamizaje Rosa",
  comunidad_indigena: "Comunidad indígena",
  estancia_multiple: "Estancia > 1 día",
};
