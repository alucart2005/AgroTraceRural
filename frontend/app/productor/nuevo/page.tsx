"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lote } from "@/lib/types";
import { LINEAS_PRODUCTIVAS } from "@/lib/types";
import { registrarLote } from "@/lib/api";

interface EvidenciaLocal {
  file: File;
  preview: string;
  /** false: el navegador no pudo decodificarla (p. ej. HEIC) */
  procesada: boolean;
}

async function leerDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

async function fileToDataUrl(
  file: File,
  maxDim = 800
): Promise<{ dataUrl: string; procesada: boolean }> {
  const original = await leerDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve({ dataUrl: original, procesada: false });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.8), procesada: true });
    };
    // Formato que el navegador no entiende (HEIC, RAW…): se conserva el original.
    img.onerror = () => resolve({ dataUrl: original, procesada: false });
    img.src = original;
  });
}

/** Tamaño en bytes de lo que realmente se envía (el data URL comprimido). */
function bytesDeDataUrl(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return 0;
  const base64 = dataUrl.slice(i + 1);
  const relleno = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(1, Math.floor((base64.length * 3) / 4) - relleno);
}

function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NuevoLotePage() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [fechaPostura, setFechaPostura] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [linea, setLinea] = useState(LINEAS_PRODUCTIVAS[0]);
  const [cantidad, setCantidad] = useState(10);
  const [unidad, setUnidad] = useState("cubetas");
  const [evidencias, setEvidencias] = useState<EvidenciaLocal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState<Lote | null>(null);

  async function onArchivos(files: FileList | null) {
    setError(null);
    setAviso(null);
    if (!files || files.length === 0) {
      setEvidencias([]);
      return;
    }
    const nuevas: EvidenciaLocal[] = [];
    for (const file of Array.from(files)) {
      const { dataUrl, procesada } = await fileToDataUrl(file);
      nuevas.push({ file, preview: dataUrl, procesada });
    }
    setEvidencias((prev) => [...prev, ...nuevas].slice(0, 6));
    const noProcesadas = nuevas.filter((n) => !n.procesada);
    if (noProcesadas.length > 0) {
      setAviso(
        `No se pudo procesar ${noProcesadas.map((n) => n.file.name).join(", ")} ` +
          "(formato que el navegador no entiende, p. ej. HEIC). Se guardará el archivo original: si la foto no se ve, conviértela a JPG."
      );
    }
  }

  function quitarEvidencia(idx: number) {
    setEvidencias((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    // Criterio HU-01, escenario 2: bloquear guardado sin evidencia fotográfica.
    if (evidencias.length === 0) {
      setError("Adjunta al menos una imagen de evidencia antes de guardar.");
      return;
    }
    if (!fecha) {
      setError("Selecciona la fecha de cosecha.");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    // Blocar si hay archivos que el navegador no pudo procesar (p. ej. HEIC)
    const noProcesadas = evidencias.filter((ev) => !ev.procesada);
    if (noProcesadas.length > 0) {
      setError(
        `No se pudo procesar ${noProcesadas.map((n) => n.file.name).join(", ")} ` +
          "(formato que el navegador no entiende, p. ej. HEIC). " +
          "Conviértelas a JPG antes de guardar o selecciona otras fotos."
      );
      return;
    }

    setEnviando(true);
    try {
      const fotos = evidencias.map((ev) => ({
        dataUrl: ev.preview,
        nombre: ev.file.name,
        // El tamaño debe corresponder al data URL comprimido que viaja en la
        // petición, no al archivo original. Enviar el tamaño del archivo
        // (p. ej. 18 MB de una foto de celular) hacía fallar la validación del
        // backend (≤ 10 MB) aunque la imagen ya estuviera comprimida a 800 px.
        tamano: bytesDeDataUrl(ev.preview),
      }));
      const lote = await registrarLote({
        fecha_cosecha: fecha,
        fecha_postura: fechaPostura || fecha,
        linea_productiva: linea,
        cantidad,
        unidad,
        fotos,
      });
      setCreado(lote);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo registrar el lote. Intenta de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (creado) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="card border-emerald-600/40 bg-emerald-50 text-center">
          <p className="text-4xl">✅</p>
          <h1 className="mt-2 text-2xl font-bold text-emerald-950">
            Lote registrado
          </h1>
          <p className="mt-1 text-sm text-emerald-900/70">
            Se creó el identificador único del lote y su huella quedó lista para
            anclarse en Stellar Testnet.
          </p>
          <p className="mt-4 text-3xl font-black text-emerald-800">
            {creado.codigo}
          </p>
          <dl className="mt-4 space-y-1 text-left text-xs">
            <div>
              <dt className="font-semibold text-emerald-900">SHA-256</dt>
              <dd className="break-all font-mono">{creado.hash_sha256}</dd>
            </div>
            <div>
              <dt className="font-semibold text-emerald-900">Tx Stellar</dt>
              <dd className="break-all font-mono">
                {creado.stellar_tx_hash ?? "pendiente"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-emerald-900">Evidencias</dt>
              <dd>
                {creado.evidencias
                  .map((ev) => `${ev.nombre} (${formatarBytes(ev.tamano)})`)
                  .join(", ") || "—"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/lote/${creado.codigo}`} className="btn-primary">
            Ver página pública
          </Link>
          <Link href={`/lote/${creado.codigo}/etiqueta`} className="btn-secondary">
            Generar etiqueta QR
          </Link>
          <Link
            href={`/productor/lote/${creado.codigo}/eventos`}
            className="btn-secondary"
          >
            Registrar eventos (HU-05)
          </Link>
          <button
            onClick={() => setCreado(null)}
            className="btn-secondary"
          >
            Registrar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-950">Registrar lote</h1>
        <p className="text-sm text-emerald-900/70">
          HU-01 — registro de cosecha por el productor. La foto es obligatoria.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fecha">
              Fecha de cosecha
            </label>
            <input
              id="fecha"
              type="date"
              className="input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="fecha-postura">
              Fecha de postura
            </label>
            <input
              id="fecha-postura"
              type="date"
              className="input"
              value={fechaPostura}
              onChange={(e) => setFechaPostura(e.target.value)}
            />
            <p className="mt-1 text-xs text-emerald-900/50">
              Se muestra al consumidor en la ficha pública (HU-02).
            </p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="linea">
            Línea productiva
          </label>
          <select
            id="linea"
            className="input"
            value={linea}
            onChange={(e) => setLinea(e.target.value)}
          >
            {LINEAS_PRODUCTIVAS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cantidad">
              Cantidad
            </label>
            <input
              id="cantidad"
              type="number"
              min={1}
              className="input"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="unidad">
              Unidad
            </label>
            <select
              id="unidad"
              className="input"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
            >
              <option>cubetas</option>
              <option>docenas</option>
              <option>kg</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="foto">
            Foto de evidencia * <span className="font-normal">(mínimo una)</span>
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            multiple
            className="input"
            onChange={(e) => onArchivos(e.target.files)}
          />
          <p className="mt-1 text-xs text-emerald-900/50">
            Puedes adjuntar varias imágenes (máx. 6). Se comprimen a 800 px para
            guardarlas en tu navegador; en Stellar solo viaja su huella SHA-256.
          </p>

          {evidencias.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {evidencias.map((ev, i) => (
                <li
                  key={`${ev.file.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/50 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.preview}
                    alt={`Evidencia ${i + 1}`}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-emerald-900/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-emerald-950">
                      {ev.file.name}
                    </p>
                    <p className="text-[11px] text-emerald-900/60">
                      {formatarBytes(ev.file.size)} ·{" "}
                      {ev.procesada ? "lista" : "formato original"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarEvidencia(i)}
                    aria-label={`Quitar ${ev.file.name}`}
                    className="shrink-0 rounded-lg border border-red-300/60 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {aviso && (
          <p className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
            ⚠️ {aviso}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={enviando} className="btn-primary w-full">
          {enviando ? "Guardando…" : "Guardar lote"}
        </button>
      </form>
    </div>
  );
}
