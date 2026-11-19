import type { Lote, Sesion, Usuario, Verificacion } from "./types";
import { hashEvento, payloadDeLote, hashLote } from "./hash";
import { crearLote, ensureSeed, guardarEvento } from "./demoStore";
import { cerrarSesion, tokenActual } from "./auth";

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

function peticion(path: string, init?: RequestInit): Promise<Response> {
  const token = tokenActual();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      // Sesión del productor (HU-06). Sin token no se envía la cabecera: el
      // backend responde 401 y la UI lo trata como "no hay sesión".
      ...(token && token !== "demo" ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

async function lanzarSiFalla(res: Response): Promise<void> {
  if (res.ok) return;
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

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await peticion(path, init);
  await lanzarSiFalla(res);
  return (await res.json()) as T;
}

/** Página de lotes con el total de filas que reporta el backend (HU-30). */
export interface PaginaLotes {
  lotes: Lote[];
  total: number;
}

function totalDe(res: Response, cantidad: number): number {
  const cabecera = res.headers.get("X-Total-Count");
  const total = cabecera ? Number(cabecera) : NaN;
  return Number.isFinite(total) ? total : cantidad;
}

/**
 * Listado público paginado (HU-30).
 *
 * Igual que el resto de lecturas, un backend caído cae al almacén local pero
 * dejando la marca de ``modoDemoActivo()`` para que la pantalla lo anuncie.
 */
export async function listarLotesPaginado(
  limit = 20,
  offset = 0
): Promise<PaginaLotes> {
  if (!API_URL) {
    _modoDemo = true;
    const todos = await ensureSeed();
    return { lotes: todos.slice(offset, offset + limit), total: todos.length };
  }
  try {
    const res = await peticion(`/api/lotes?limit=${limit}&offset=${offset}`);
    await lanzarSiFalla(res);
    const lotes = (await res.json()) as Lote[];
    _modoDemo = false;
    return { lotes, total: totalDe(res, lotes.length) };
  } catch {
    // Backend inaccesible: se recurre al almacén local pero quedando constancia,
    // para que la pantalla lo advierta en vez de fingir que son datos reales.
    _modoDemo = true;
    const todos = await ensureSeed();
    return { lotes: todos.slice(offset, offset + limit), total: todos.length };
  }
}

export async function listarLotes(): Promise<Lote[]> {
  return (await listarLotesPaginado(50, 0)).lotes;
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
  // En modo demo (sin backend o con la sesión sintética) el evento se guarda
  // en el almacén local; viajaría al backend como 401 y nadie podría añadirlo.
  if (!API_URL || tokenActual() === "demo") {
    return guardarEvento(codigo, evento as never);
  }
  // Con backend y sesión real, el fallo se propaga: sin fallback fantasma.
  return fetchJson<Lote>(`/api/lotes/${codigo}/eventos`, {
    method: "POST",
    body: JSON.stringify(evento),
  });
}

/**
 * Reintenta el ancla de un lote (HU-25). Solo el productor dueño puede.
 *
 * NO tiene fallback demo: es una escritura y un fallo debe verse tal cual.
 */
export async function reintentarAnclaje(codigo: string): Promise<Lote> {
  if (!API_URL) {
    throw new ApiError(0, "No hay backend configurado; usa el modo demo.");
  }
  return fetchJson<Lote>(`/api/lotes/${codigo}/anclar`, { method: "POST" });
}

/** Recalcula la cadena de custodia en el navegador (modo demo, HU-28). */
async function cadenaDemo(lote: Lote): Promise<{
  valida: boolean;
  indice: number | null;
  final: string;
}> {
  let anterior = lote.hash_sha256;
  const eventos = lote.eventos ?? [];
  for (let i = 0; i < eventos.length; i++) {
    const e = eventos[i];
    if (!e.hash_evento || e.hash_evento_anterior !== anterior) {
      return { valida: false, indice: i, final: anterior };
    }
    const esperado = await hashEvento(
      anterior,
      e.tipo,
      e.fecha,
      e.descripcion
    );
    if (esperado !== e.hash_evento) {
      return { valida: false, indice: i, final: anterior };
    }
    anterior = e.hash_evento;
  }
  return { valida: true, indice: null, final: anterior };
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
  const cadena = await cadenaDemo(lote);
  const verificado =
    !!lote.stellar_tx_hash &&
    hashCalculado === lote.hash_sha256 &&
    cadena.valida;
  return {
    verificado,
    hash_calculado: hashCalculado,
    hash_registrado: lote.hash_sha256,
    tx_hash: lote.stellar_tx_hash,
    ledger: lote.stellar_ledger,
    demo: !!lote.demo,
    cadena_valida: cadena.valida,
    eventos_verificados: lote.eventos?.length ?? 0,
    hash_cadena: cadena.final,
    indice_alterado: cadena.indice,
  };
}

// --- Autenticación con Google (HU-06, HU-07) ---------------------------------

/**
 * Intercambia el ID token de Google por la sesión de AgroTrace.
 *
 * NO tiene fallback demo: sin backend el error se muestra y la pantalla de
 * login ofrece entrar en modo demo de forma explícita (nunca de forma silenciosa).
 */
export async function loginConGoogle(idToken: string): Promise<Sesion> {
  if (!API_URL) {
    throw new ApiError(0, "No hay backend configurado; usa el modo demo.");
  }
  return fetchJson<Sesion>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

/** Perfil del productor autenticado (requiere sesión en localStorage). */
export async function obtenerYo(): Promise<Usuario> {
  return fetchJson<Usuario>("/api/auth/me");
}

/** Guarda los 5 datos del primer ingreso (HU-07). */
export async function actualizarPerfil(datos: {
  nombre: string;
  cedula: string;
  telefono: string;
  finca: string;
  municipio: string;
}): Promise<Usuario> {
  return fetchJson<Usuario>("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

/**
 * "Mis lotes" paginado (HU-08/HU-30). Un 401 NO cae en demo: rompe la sesión y
 * se propaga para que la pantalla mande al usuario a /login.
 */
export async function listarMisLotesPaginado(
  limit = 20,
  offset = 0
): Promise<PaginaLotes> {
  // Sin backend, o con la sesión sintética de demo, no se consulta la API:
  // se va al almacén local siempre marcado como demo (un token "demo" nunca
  // debe viajar al backend, que lo rechazaría con 401).
  if (!API_URL || tokenActual() === "demo") {
    _modoDemo = true;
    const todos = await ensureSeed();
    return { lotes: todos.slice(offset, offset + limit), total: todos.length };
  }
  try {
    const res = await peticion(`/api/lotes/mios?limit=${limit}&offset=${offset}`);
    await lanzarSiFalla(res);
    const lotes = (await res.json()) as Lote[];
    _modoDemo = false;
    return { lotes, total: totalDe(res, lotes.length) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      _modoDemo = false;
      cerrarSesion();
      throw err;
    }
    _modoDemo = true;
    const todos = await ensureSeed();
    return { lotes: todos.slice(offset, offset + limit), total: todos.length };
  }
}

export async function listarMisLotes(): Promise<Lote[]> {
  return (await listarMisLotesPaginado(50, 0)).lotes;
}
