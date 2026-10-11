import type { Lote, Verificacion } from "./types";
import { payloadDeLote, hashLote } from "./hash";
import { crearLote, ensureSeed, guardarEvento } from "./demoStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
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
  linea_productiva: string;
  cantidad: number;
  unidad: string;
  fotoDataUrl: string;
  fotoNombre: string;
  fotoTamano: number;
}): Promise<Lote> {
  if (API_URL) {
    try {
      return await fetchJson<Lote>("/api/lotes", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch {
      // backend no disponible → modo demo
    }
  }
  return crearLote(input);
}

export async function agregarEvento(
  codigo: string,
  evento: { tipo: string; fecha: string; descripcion: string }
): Promise<Lote | null> {
  if (API_URL) {
    try {
      return await fetchJson<Lote>(`/api/lotes/${codigo}/eventos`, {
        method: "POST",
        body: JSON.stringify(evento),
      });
    } catch {
      // backend no disponible → modo demo
    }
  }
  return guardarEvento(codigo, evento as never);
}

export async function verificarLote(codigo: string): Promise<Verificacion | null> {
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
