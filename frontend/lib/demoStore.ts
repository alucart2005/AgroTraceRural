import type { Evento, Lote } from "./types";
import { hashLote, payloadDeLote, sha256Hex } from "./hash";

// v3: la semilla pasa a ser el lote real HUE-2026-008 (antes HUE-2027-001);
// subir la versión fuerza el re-sembrado en navegadores con datos viejos.
const KEY = "agrotrace.demo.lotes.v3";

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
    codigo: "HUE-2026-008",
    fecha_cosecha: "2026-10-25",
    fecha_postura: "2026-10-25",
    linea_productiva: "Huevos Guarumo",
    cantidad: 35,
    unidad: "cubetas",
    finca: "Finca Guarumo",
    municipio: "Cáceres, Antioquia",
    evidencias: [
      { nombre: "ATR-3.jpeg", tamano: 80194 },
      { nombre: "ATR-1.jpg", tamano: 74776 },
      { nombre: "ATR-2.jpeg", tamano: 81361 },
      { nombre: "ATR-4.jpg", tamano: 112351 },
      { nombre: "ATR-5.png", tamano: 97448 },
    ],
  };
  // El lote demo replica el lote real HUE-2026-008 de producción: con los
  // mismos 8 campos canónicos, hashLote reproduce el hash anclado en Stellar
  // (paridad backend/frontend probada en tests/test_sha256.py).
  const hash = await hashLote(payloadDeLote(base));
  const eventos: Evento[] = [
    {
      id: "ev-1",
      tipo: "cosecha",
      fecha: "2026-10-25T06:40:00-05:00",
      descripcion: "Recolección de 35 cubetas en el galpón de ponedoras.",
    },
    {
      id: "ev-2",
      tipo: "clasificacion",
      fecha: "2026-10-25T09:15:00-05:00",
      descripcion: "Clasificación por tamaño y revisión de calidad.",
    },
    {
      id: "ev-3",
      tipo: "empaque",
      fecha: "2026-10-25T11:30:00-05:00",
      descripcion: "Empaque en cubetas y etiquetado QR.",
    },
    {
      id: "ev-4",
      tipo: "despacho",
      fecha: "2026-10-25T14:05:00-05:00",
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
    fotos: [
      "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/00_ATR-3.jpeg",
      "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/01_ATR-1.jpg",
      "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/02_ATR-2.jpeg",
      "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/03_ATR-4.jpg",
      "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/04_ATR-5.png",
    ],
    evidencias: base.evidencias,
    hash_sha256: hash,
    // Ancla real del lote en Stellar Testnet (viewable en cualquier explorador).
    stellar_tx_hash: "0b3a48c0934f2d5e512ddae3a2dc79ec6051bf3599302a0c286dcffa9c118ca9",
    stellar_ledger: 5377565,
    eventos,
    created_at: "2026-10-25T06:56:49.864498Z",
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
    stellar_ledger: 5377565 + lotes.length,
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
