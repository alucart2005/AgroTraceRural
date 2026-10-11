export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return "{" + entries.map(([k, v]) => JSON.stringify(k) + ":" + canonicalJson(v)).join(",") + "}";
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface PayloadLote {
  codigo: string;
  fecha_cosecha: string;
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  finca: string;
  municipio: string;
  evidencias: { nombre: string; tamano: number }[];
}

export function payloadDeLote(lote: {
  codigo: string;
  fecha_cosecha: string;
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  finca: string;
  municipio: string;
  evidencias: { nombre: string; tamano: number }[];
}): PayloadLote {
  return {
    codigo: lote.codigo,
    fecha_cosecha: lote.fecha_cosecha,
    linea_productiva: lote.linea_productiva,
    cantidad: lote.cantidad,
    unidad: lote.unidad,
    finca: lote.finca,
    municipio: lote.municipio,
    evidencias: lote.evidencias.map((e) => ({ nombre: e.nombre, tamano: e.tamano })),
  };
}

export async function hashLote(payload: PayloadLote): Promise<string> {
  return sha256Hex(canonicalJson(payload));
}
