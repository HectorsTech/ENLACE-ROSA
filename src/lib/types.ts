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

export type SiNo = "si" | "no";
export type SenalInternet = "wifi" | "telcel" | "altan_cfe" | "ninguna";

export interface CartaDatos {
  autoridad: string;
  cargoAutoridad: string;
  dependencia: string;
  sede: string;
  direccion: string;
  horaInicio: string;
  horaFin: string;
  mobiliario: string;
  transporte: string;
  seguridad: string;
  firma?: string;
  firmadaEn?: string;
  actualizadoEn: string;
}

export interface FichaCampo {
  tomaMenos20m: SiNo;
  voltajeEstable: SiNo;
  apagones: "nunca" | "ocasionales" | "frecuentes";
  plantaRespaldo: SiNo;
  comentariosElectricidad: string;
  internet: SenalInternet[];
  espacioPrivado: SiNo;
  espacioTechado: SiNo;
  comentariosPrivacidad: string;
  banos: SiNo;
  aguaDisponible: SiNo;
  mesasSillas: SiNo;
  comentariosMobiliario: string;
  accesoVehicular: "facil" | "dificil";
  caminos4x4: SiNo;
  climaCaminos: string;
  hablaLenguaIndigena: SiNo;
  lengua: string;
  variante: string;
  diasHorariosLocales: string;
  personalFemenino: SiNo;
  transporteComunitario: SiNo;
  transporteDetalle: string;
  resguardoNocturno: SiNo;
  resguardoDetalle: string;
  actualizadoEn: string;
}

export interface AlertaOperativa {
  id: string;
  clave: string;
  titulo: string;
  detalle: string;
  severidad: "alta" | "media";
  fecha: string;
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
  carta?: CartaDatos;
  ficha?: FichaCampo;
  alertas: AlertaOperativa[];
}

export interface BaseDatos {
  esquema?: number;
  version: number; // se incrementa en cada escritura (para refresco en tiempo real)
  actualizadoEn: string;
  jornadas: Jornada[];
}
