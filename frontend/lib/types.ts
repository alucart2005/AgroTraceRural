export type EventoTipo =
  | "cosecha"
  | "clasificacion"
  | "empaque"
  | "despacho";

/** Estado del ancla on-chain del lote (HU-24/HU-25). */
export type EstadoAnclaje =
  | "pendiente"
  | "anclado"
  | "fallido"
  | "fallido_definitivo";

export interface Evento {
  id: string;
  tipo: EventoTipo;
  fecha: string;
  descripcion: string;
  /** Eslabón de la cadena de custodia (HU-28). */
  hash_evento?: string | null;
  hash_evento_anterior?: string | null;
}

export interface Evidencia {
  nombre: string;
  tamano: number;
}

export interface Lote {
  id: string;
  codigo: string;
  fecha_cosecha: string;
  /** Fecha de postura de los huevos (HU-02). Opcional: si falta se usa la de cosecha. */
  fecha_postura?: string;
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  finca: string;
  municipio: string;
  fotos: string[];
  evidencias: Evidencia[];
  hash_sha256: string;
  stellar_tx_hash: string | null;
  stellar_ledger: number | null;
  /** HU-24/HU-25: el lote existe aunque el ancla siga en curso. */
  anclaje_estado?: EstadoAnclaje;
  eventos: Evento[];
  created_at: string;
  demo?: boolean;
}

export interface Verificacion {
  verificado: boolean;
  hash_calculado: string;
  hash_registrado: string | null;
  tx_hash: string | null;
  ledger: number | null;
  demo: boolean;
  /** Motivo de falla de infraestructura (Horizon caído, lote sin anclar...). */
  error?: string | null;
  /** HU-28: estado de la cadena de eventos encadenados. */
  cadena_valida?: boolean | null;
  eventos_verificados?: number;
  hash_cadena?: string | null;
  indice_alterado?: number | null;
  /** HU-29: origen del dato on-chain (caché local o consulta a Horizon). */
  cache?: { hit: boolean; edad: number } | null;
}

export const EVENTO_LABELS: Record<EventoTipo, string> = {
  cosecha: "Cosecha",
  clasificacion: "Clasificación",
  empaque: "Empaque",
  despacho: "Despacho",
};

export const LINEAS_PRODUCTIVAS = [
  "Huevos Guarumo",
  "Pescado Tilapia",
  "Frutales varios",
];

// --- Autenticación con Google (HU-06, HU-07) ---------------------------------

/** Shape exacto de ``UsuarioOut`` del backend. */
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  foto_url: string | null;
  cedula: string | null;
  telefono: string | null;
  finca: string | null;
  municipio: string | null;
  /** false → el primer ingreso aún no diligencia los 5 datos (HU-07). */
  perfil_completo: boolean;
}

/** Respuesta de ``POST /api/auth/google``: JWT + productor. */
export interface Sesion {
  token: string;
  usuario: Usuario;
}
