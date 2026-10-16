import type { Evento, Lote } from "./types";
import { hashLote, payloadDeLote, sha256Hex } from "./hash";

const KEY = "agrotrace.demo.lotes.v2";

function readStore(): Lote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Lote[]) : [];
  } catch {
    return [];
  }
}

function writeStore(lotes: Lote[], podar = false): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(lotes));
  } catch {
    // Sin espacio: NUNCA se descartan las fotos en silencio (HU-01: la foto es
    // evidencia obligatoria). Se lanza un error visible para quien registra.
    if (!podar) {
      throw new Error(
        "Tu navegador no tiene espacio para guardar la evidencia. " +
          "Borra lotes de prueba o libera almacenamiento y vuelve a intentarlo."
      );
    }
    const slim = lotes.map((l) => ({ ...l, fotos: [] }));
    try {
      localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      // se ignora: solo aplica al crear la semilla inicial
    }
  }
}

export function nuevoCodigo(fechaISO: string, existentes: string[]): string {
  const anio = (fechaISO || new Date().toISOString()).slice(0, 4);
  let max = 0;
  for (const c of existentes) {
    const m = c.match(/^HUE-(\d{4})-(\d{3})$/);
    if (m && m[1] === anio) max = Math.max(max, parseInt(m[2], 10));
  }
  return `HUE-${anio}-${String(max + 1).padStart(3, "0")}`;
}

async function makeSeed(): Promise<Lote> {
  const base = {
    codigo: "HUE-2027-001",
    fecha_cosecha: "2027-03-14",
    fecha_postura: "2027-03-13",
    linea_productiva: "Huevos Guarumo",
    cantidad: 10,
    unidad: "cubetas",
    finca: "Finca Guarumo",
    municipio: "Cáceres, Antioquia",
    evidencias: [{ nombre: "galpon-huevos.jpg", tamano: 2481930 }],
  };
  const hash = await hashLote(payloadDeLote(base));
  const tx = await sha256Hex("demo-anchor:" + hash);
  const eventos: Evento[] = [
    {
      id: "ev-1",
      tipo: "cosecha",
      fecha: "2027-03-14T06:40:00-05:00",
      descripcion: "Recolección de 10 cubetas en el galpón de ponedoras.",
    },
    {
      id: "ev-2",
      tipo: "clasificacion",
      fecha: "2027-03-14T09:15:00-05:00",
      descripcion: "Clasificación por tamaño y revisión de calidad.",
    },
    {
      id: "ev-3",
      tipo: "empaque",
      fecha: "2027-03-14T11:30:00-05:00",
      descripcion: "Empaque en cubetas y etiquetado QR.",
    },
    {
      id: "ev-4",
      tipo: "despacho",
      fecha: "2027-03-14T14:05:00-05:00",
      descripcion: "Salida hacia el punto de venta en Cáceres.",
    },
  ];
  return {
    id: "demo-0001",
    codigo: base.codigo,
    fecha_cosecha: base.fecha_cosecha,
    fecha_postura: base.fecha_postura,
    linea_productiva: base.linea_productiva,
    cantidad: base.cantidad,
    unidad: base.unidad,
    finca: base.finca,
    municipio: base.municipio,
    fotos: ["/evidencia-demo.svg"],
    evidencias: base.evidencias,
    hash_sha256: hash,
    stellar_tx_hash: tx,
    stellar_ledger: 5129949,
    eventos,
    created_at: "2027-03-14T06:45:00-05:00",
    demo: true,
  };
}

export async function ensureSeed(): Promise<Lote[]> {
  if (typeof window === "undefined") return [];
  let lotes = readStore();
  if (lotes.length === 0) {
    const seed = await makeSeed();
    lotes = [seed];
    writeStore(lotes, true);
  }
  return lotes;
}

export async function crearLote(input: {
  fecha_cosecha: string;
  fecha_postura?: string;
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  fotos: { dataUrl: string; nombre: string; tamano: number }[];
}): Promise<Lote> {
  const lotes = await ensureSeed();
  const codigo = nuevoCodigo(
    input.fecha_cosecha,
    lotes.map((l) => l.codigo)
  );
  const base = {
    codigo,
    fecha_cosecha: input.fecha_cosecha,
    fecha_postura: input.fecha_postura || input.fecha_cosecha,
    linea_productiva: input.linea_productiva,
    cantidad: input.cantidad,
    unidad: input.unidad,
    finca: "Finca Guarumo",
    municipio: "Cáceres, Antioquia",
    evidencias: input.fotos.map((f) => ({ nombre: f.nombre, tamano: f.tamano })),
  };
  const hash = await hashLote(payloadDeLote(base));
  const tx = await sha256Hex("demo-anchor:" + hash);
  const now = new Date().toISOString();
  const lote: Lote = {
    id: `demo-${Date.now()}`,
    ...base,
    fotos: input.fotos.map((f) => f.dataUrl),
    hash_sha256: hash,
    stellar_tx_hash: tx,
    stellar_ledger: 5129949 + lotes.length,
    eventos: [
      {
        id: "ev-1",
        tipo: "cosecha",
        fecha: `${input.fecha_cosecha}T07:00:00-05:00`,
        descripcion: `Recolección de ${input.cantidad} ${input.unidad} de ${input.linea_productiva}.`,
      },
    ],
    created_at: now,
    demo: true,
  };
  writeStore([lote, ...lotes]);
  return lote;
}

export async function guardarEvento(
  codigo: string,
  evento: Pick<Evento, "tipo" | "fecha" | "descripcion">
): Promise<Lote | null> {
  const lotes = await ensureSeed();
  const idx = lotes.findIndex((l) => l.codigo === codigo);
  if (idx < 0) return null;
  const lote: Lote = {
    ...lotes[idx],
    eventos: [
      ...lotes[idx].eventos,
      { id: `ev-${Date.now()}`, ...evento },
    ],
  };
  lotes[idx] = lote;
  writeStore(lotes);
  return lote;
}
