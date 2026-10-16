import type { Lote, Verificacion } from "./types";
import { payloadDeLote, hashLote } from "./hash";
import { crearLote, ensureSeed, guardarEvento } from "./demoStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

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
    throw new Error(detalle ? `API ${res.status}: ${detalle}` : `API ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function listarLotes(): Promise<Lote[]> {
  if (API_URL) {
    try {
      return await fetchJson<Lote[]>("/api/lotes");
    } catch {
      // backend no disponible → modo demo
    }
  }
  return ensureSeed();
}

export async function obtenerLote(codigo: string): Promise<Lote | null> {
  if (API_URL) {
    try {
      return await fetchJson<Lote>(`/api/lotes/${codigo}`);
    } catch {
      // backend no disponible → modo demo
    }
  }
  const lotes = await ensureSeed();
  return lotes.find((l) => l.codigo === codigo) ?? null;
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
