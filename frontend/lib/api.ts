import type { Lote, Verificacion } from "./types";
import { payloadDeLote, hashLote } from "./hash";
import { crearLote, ensureSeed, guardarEvento } from "./demoStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Marca si la última LECTURA cayó en el almacén local del navegador (sin
// backend, o con el backend caído). La interfaz lo consulta con
// ``modoDemoActivo()`` justo después del await para poder ANUNCIARLO: sin este
// aviso un backend caído se veía como si los datos fantasma fueran reales.
let _modoDemo = false;

/** true si los datos que acaban de cargarse vienen del modo demo, no del backend. */
export function modoDemoActivo(): boolean {
  return _modoDemo;
}

/** Error de la API con su código HTTP, para distinguir un 404 real de una caída. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    // Muestra el motivo real del backend (p.ej. "R2 no configurado...").
    const cuerpo = await res.json().catch(() => null);
    const detalle =
      cuerpo && typeof cuerpo === "object" && "detail" in cuerpo
        ? String((cuerpo as { detail: unknown }).detail)
        : "";
    throw new ApiError(
      res.status,
      detalle ? `API ${res.status}: ${detalle}` : `API ${res.status}`
    );
  }
  return (await res.json()) as T;
}

export async function listarLotes(): Promise<Lote[]> {
  if (!API_URL) {
    _modoDemo = true;
    return ensureSeed();
  }
  try {
    const lotes = await fetchJson<Lote[]>("/api/lotes");
    _modoDemo = false;
    return lotes;
  } catch {
    // Backend inaccesible: se recurre al almacén local pero quedando constancia,
    // para que la pantalla lo advierta en vez de fingir que son datos reales.
    _modoDemo = true;
    return ensureSeed();
  }
}

export async function obtenerLote(codigo: string): Promise<Lote | null> {
  if (!API_URL) {
    _modoDemo = true;
    const lotes = await ensureSeed();
    return lotes.find((l) => l.codigo === codigo) ?? null;
  }
  try {
    const lote = await fetchJson<Lote>(`/api/lotes/${codigo}`);
    _modoDemo = false;
    return lote;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // El backend respondió y no conoce ese código: el lote NO existe. Aquí no
      // se busca en el almacén local, o un QR falso "existiría" para el usuario.
      _modoDemo = false;
      return null;
    }
    _modoDemo = true;
    const lotes = await ensureSeed();
    return lotes.find((l) => l.codigo === codigo) ?? null;
  }
}

export async function registrarLote(input: {
  fecha_cosecha: string;
  fecha_postura?: string;
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  fotos: { dataUrl: string; nombre: string; tamano: number }[];
}): Promise<Lote> {
  if (API_URL) {
    // Con backend configurado el fallo se propaga: nunca se guarda un lote
    // "fantasma" en localStorage que no exista en el servidor.
    return fetchJson<Lote>("/api/lotes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  return crearLote(input);
}

export async function agregarEvento(
  codigo: string,
  evento: { tipo: string; fecha: string; descripcion: string }
): Promise<Lote | null> {
  if (API_URL) {
    // Misma regla que registrarLote: error visible en la UI, sin fallback demo.
    return fetchJson<Lote>(`/api/lotes/${codigo}/eventos`, {
      method: "POST",
      body: JSON.stringify(evento),
    });
  }
  return guardarEvento(codigo, evento as never);
}

export async function verificarLote(codigo: string): Promise<Verificacion | null> {
  if (API_URL) {
    try {
      // El backend es la fuente de verdad: recalcula el hash en el servidor
      // y contrasta el ancla con Horizon (HU-03).
      return await fetchJson<Verificacion>(`/api/verify/${codigo}`);
    } catch {
      // Sin backend/Stellar no se puede afirmar verificación → null.
      return null;
    }
  }

  const lote = await obtenerLote(codigo);
  if (!lote) return null;
  const hashCalculado = await hashLote(payloadDeLote(lote));
  const verificado =
    !!lote.stellar_tx_hash && hashCalculado === lote.hash_sha256;
  return {
    verificado,
    hash_calculado: hashCalculado,
    hash_registrado: lote.hash_sha256,
    tx_hash: lote.stellar_tx_hash,
    ledger: lote.stellar_ledger,
    demo: !!lote.demo,
  };
}
