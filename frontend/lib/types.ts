export type EventoTipo =
  | "cosecha"
  | "clasificacion"
  | "empaque"
  | "despacho";

export interface Evento {
  id: string;
  tipo: EventoTipo;
  fecha: string;
  descripcion: string;
}

export interface Evidencia {
  nombre: string;
  tamano: number;
}

export interface Lote {
  id: string;
  codigo: string;
  fecha_cosecha: string;
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
