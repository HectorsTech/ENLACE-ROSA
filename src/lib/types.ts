// Tipos de dominio de Enlace Rosa

export type EstadoRequisito = "pendiente" | "recibido" | "observado" | "aprobado";
export type GrupoRequisito = "juridico" | "identidad" | "evidencia";
export type ModuloClave = "unidad_movil" | "comunidad_indigena" | "estancia_multiple";
export type Rol = "eira" | "municipio" | "sistema";
export type MedioContacto = "whatsapp" | "correo" | "llamada";
export type RangoPersonas = "menos_50" | "50_100" | "100_200" | "mas_200";

export interface VersionArchivo {
  numero: number;
  archivo: string;
  tamano: string;
  subidoPor: string;
  fecha: string; // ISO
  estado: EstadoRequisito; // estado de esta versión concreta
  revisadoPor?: string;
  fechaRevision?: string;
  motivo?: string;
}

export interface EventoHistorial {
  id: string;
  tipo: "creado" | "subida" | "aprobado" | "observado" | "ayuda";
  actor: string;
  rol: Rol;
  fecha: string;
  detalle: string;
  version?: number;
}

export interface Requisito {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  grupo: GrupoRequisito;
  criterio: string;
  formatos: string;
  diasAntes: number; // D-n
  fechaLimite: string; // ISO
  critico: boolean;
  opcional: boolean;
  modulo?: ModuloClave;
  estado: EstadoRequisito;
  motivoObservacion?: string;
  versiones: VersionArchivo[];
  historial: EventoHistorial[];
}

export interface Contacto {
  nombre: string;
  cargo: string;
  correo: string;
  celular: string;
  whatsapp: string;
  medioPreferido: MedioContacto;
}

export interface MensajeAyuda {
  id: string;
  requisitoId?: string;
  autor: string;
  fecha: string;
  mensaje: string;
  atendido: boolean;
  tipo?: "pregunta" | "cambio_estimado";
}

export interface Jornada {
  id: string;
  token: string;
  municipio: string;
  estado: string; // entidad federativa
  sede: string;
  direccion: string;
  fecha: string; // ISO día D (hora de inicio)
  fechaLimite: string; // ISO fecha límite general (último requisito)
  servicios: string[];
  modulos: ModuloClave[];
  plantilla: string;
  enlaceEira: { nombre: string; cargo: string; telefono: string; correo: string };
  enlaceMunicipal: Contacto;
  estimadoPersonas: RangoPersonas;
  creadaEn: string;
  requisitos: Requisito[];
  mensajes: MensajeAyuda[];
}

export interface BaseDatos {
  esquema?: number;
  version: number; // se incrementa en cada escritura (para refresco en tiempo real)
  actualizadoEn: string;
  jornadas: Jornada[];
}
