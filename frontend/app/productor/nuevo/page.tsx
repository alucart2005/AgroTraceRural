"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lote } from "@/lib/types";
import { LINEAS_PRODUCTIVAS } from "@/lib/types";
import { leerSesion } from "@/lib/auth";
import { registrarLote } from "@/lib/api";
import ProtegerProductor from "@/components/ProtegerProductor";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import {
  IconoCamara,
  IconoCheck,
  IconoCheckCircle,
  IconoFlechaDerecha,
  IconoFlechaIzquierda,
} from "@/components/icons";

export default function NuevoLotePage() {
  // HU-06/HU-08: sin sesión (o sin perfil completo) no se llega al formulario.
  return (
    <ProtegerProductor>
      <WizardLote />
    </ProtegerProductor>
  );
}

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

const PASOS = ["Datos del lote", "Evidencias", "Resumen"] as const;

/** Stepper del mockup: paso activo en verde, pasos cumplidos con check. */
function Stepper({
  paso,
  irA,
}: {
  paso: number;
  irA: (n: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Pasos del registro">
      {PASOS.map((nombre, i) => {
        const n = i + 1;
        const activo = n === paso;
        const completo = n < paso;
        return (
          <li key={nombre} className="flex flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => completo && irA(n)}
              disabled={!activo && !completo}
              aria-current={activo ? "step" : undefined}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                activo
                  ? "marca shadow-sm"
                  : completo
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border-2 border-emerald-900/15 bg-superficie text-emerald-900/45"
              }`}
            >
              {completo ? <IconoCheck className="h-5 w-5" /> : n}
            </button>
            <span
              className={`hidden text-sm sm:block ${
                activo
                  ? "font-bold text-emerald-950"
                  : "font-semibold text-emerald-900/50"
              }`}
            >
              {nombre}
            </span>
            {i < PASOS.length - 1 && (
              <span
                aria-hidden
                className={`h-0.5 flex-1 rounded ${
                  n < paso ? "bg-emerald-600" : "bg-emerald-900/15"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function WizardLote() {
  const [paso, setPaso] = useState(1);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [fechaPostura, setFechaPostura] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [linea, setLinea] = useState(LINEAS_PRODUCTIVAS[0]);
  const [cantidad, setCantidad] = useState(10);
  const [unidad, setUnidad] = useState("cubetas");
  const [evidencias, setEvidencias] = useState<EvidenciaLocal[]>([]);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState<Lote | null>(null);

  async function onArchivos(files: FileList | null) {
    setError(null);
    setAviso(null);
    if (!files || files.length === 0) {
      setEvidencias([]);
      setFotoActiva(0);
      return;
    }
    const nuevas: EvidenciaLocal[] = [];
    for (const file of Array.from(files)) {
      const { dataUrl, procesada } = await fileToDataUrl(file);
      nuevas.push({ file, preview: dataUrl, procesada });
    }
    setEvidencias((prev) => [...prev, ...nuevas].slice(0, 6));
    setFotoActiva((prev) => (evidencias.length === 0 ? 0 : prev));
    const noProcesadas = nuevas.filter((n) => !n.procesada);
    if (noProcesadas.length > 0) {
      setAviso(
        `No se pudo procesar ${noProcesadas.map((n) => n.file.name).join(", ")} ` +
          "(formato que el navegador no entiende, p. ej. HEIC). Se guardará el archivo original: si la foto no se ve, conviértela a JPG."
      );
    }
  }

  function quitarEvidencia(idx: number) {
    setEvidencias((prev) => {
      const restantes = prev.filter((_, i) => i !== idx);
      setFotoActiva((f) => Math.min(f, Math.max(0, restantes.length - 1)));
      return restantes;
    });
  }

  function validarPaso1(): boolean {
    if (!fecha) {
      setError("Selecciona la fecha de producción.");
      return false;
    }
    if (!cantidad || cantidad <= 0) {
      setError("Ingresa una cantidad válida.");
      return false;
    }
    return true;
  }

  function validarPaso2(): boolean {
    // Criterio HU-01, escenario 2: la evidencia fotográfica es obligatoria.
    if (evidencias.length === 0) {
      setError("Adjunta al menos una imagen de evidencia antes de continuar.");
      return false;
    }
    const noProcesadas = evidencias.filter((ev) => !ev.procesada);
    if (noProcesadas.length > 0) {
      setError(
        `No se pudo procesar ${noProcesadas.map((ev) => ev.file.name).join(", ")} ` +
          "(formato que el navegador no entiende, p. ej. HEIC). " +
          "Conviértelas a JPG antes de continuar o selecciona otras fotos."
      );
      return false;
    }
    return true;
  }

  function siguiente() {
    setError(null);
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;
    setPaso((p) => Math.min(PASOS.length, p + 1));
  }

  function atras() {
    setError(null);
    setPaso((p) => Math.max(1, p - 1));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (!validarPaso1()) {
      setPaso(1);
      return;
    }
    if (!validarPaso2()) {
      setPaso(2);
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
          <IconoCheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
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
          <button onClick={() => setCreado(null)} className="btn-secondary">
            Registrar otro
          </button>
        </div>
      </div>
    );
  }

  const usuario = leerSesion()?.usuario ?? null;
  const activa = evidencias[fotoActiva];

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="HU-01"
        titulo="Registrar nuevo lote"
        descripcion="Registro de cosecha por el productor. La foto de evidencia es obligatoria: es lo que respalda la huella del lote."
      />

      <Stepper paso={paso} irA={(n) => { setError(null); setPaso(n); }} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={onSubmit} className="card space-y-5">
          {paso === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="linea">
                  Producto
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

              <div>
                <label className="label" htmlFor="fecha">
                  Fecha de producción
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
                <label className="label" htmlFor="fecha-postura">
                  Fecha de postura <span className="font-normal">(opcional)</span>
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

              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-900/70">
                La finca y la ubicación se toman de tu perfil de productor
                {usuario?.finca ? ` (${usuario.finca}${usuario.municipio ? `, ${usuario.municipio}` : ""})` : ""}
                : edítalas en «Completar mi perfil» si están desactualizadas.
              </p>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  Evidencias del lote
                </h2>
                <p className="text-sm text-emerald-900/70">
                  Adjunta al menos una foto: es la evidencia que respalda el
                  registro y de la que se calcula la huella SHA-256.
                </p>
              </div>

              <label
                htmlFor="foto"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-900/20 bg-emerald-50/50 px-4 py-5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                <IconoCamara className="h-5 w-5" />
                Tomar o elegir fotos (máx. 6)
                <input
                  id="foto"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onArchivos(e.target.files)}
                />
              </label>

              {evidencias.length > 0 && (
                <ul className="grid gap-2">
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
                        className="shrink-0 rounded-lg border border-red-300/60 bg-superficie px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  Resumen del registro
                </h2>
                <p className="text-sm text-emerald-900/70">
                  Revisa los datos antes de guardar: son los que entran en la
                  huella que se ancla en Stellar.
                </p>
              </div>

              <dl className="divide-y divide-emerald-900/10 text-sm">
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">Producto</dt>
                  <dd className="text-right text-emerald-900/75">{linea}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">
                    Fecha de producción
                  </dt>
                  <dd className="text-right text-emerald-900/75">{fecha}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">
                    Fecha de postura
                  </dt>
                  <dd className="text-right text-emerald-900/75">
                    {fechaPostura || "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">Cantidad</dt>
                  <dd className="text-right text-emerald-900/75">
                    {cantidad} {unidad}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">Finca</dt>
                  <dd className="text-right text-emerald-900/75">
                    {usuario?.finca ?? "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">Ubicación</dt>
                  <dd className="text-right text-emerald-900/75">
                    {usuario?.municipio ?? "—"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="font-semibold text-emerald-950">Evidencias</dt>
                  <dd className="text-right text-emerald-900/75">
                    {evidencias.length} imagen
                    {evidencias.length === 1 ? "" : "es"} ·{" "}
                    {evidencias
                      .map((ev) => formatarBytes(bytesDeDataUrl(ev.preview)))
                      .join(", ") || "—"}
                  </dd>
                </div>
              </dl>

              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-900/70">
                Al guardar se calcula el SHA-256 de los 8 campos del lote (código,
                fechas, producto, cantidad, unidad, finca, ubicación y
                evidencias) y solo esa huella viaja a Stellar Testnet. Las fotos
                quedan como evidencia y nunca se suben a la red pública.
              </p>
            </div>
          )}

          {aviso && paso === 2 && (
            <p className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
              ⚠️ {aviso}
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              ⚠️ {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            {paso > 1 ? (
              <button type="button" onClick={atras} className="btn-secondary">
                <IconoFlechaIzquierda className="h-4 w-4" />
                Atrás
              </button>
            ) : (
              <span />
            )}

            {paso < PASOS.length ? (
              <button type="button" onClick={siguiente} className="btn-primary">
                Siguiente
                <IconoFlechaDerecha className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={enviando} className="btn-primary">
                {enviando ? "Guardando…" : "Registrar lote"}
              </button>
            )}
          </div>
        </form>

        {paso < PASOS.length && (
          <aside className="card h-fit space-y-3 lg:sticky lg:top-6">
            <h2 className="text-sm font-semibold text-emerald-900/70">
              Evidencia fotográfica
            </h2>

            {activa ? (
              <>
                <div className="relative overflow-hidden rounded-2xl bg-emerald-50 ring-1 ring-emerald-900/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activa.preview}
                    alt={`Evidencia ${fotoActiva + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <label
                    htmlFor="foto-panel"
                    title="Agregar más fotos"
                    className="absolute bottom-2 right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-superficie text-emerald-900 shadow-md ring-1 ring-emerald-900/10 transition hover:bg-emerald-50"
                  >
                    <IconoCamara className="h-5 w-5" />
                    <input
                      id="foto-panel"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => onArchivos(e.target.files)}
                    />
                  </label>
                </div>

                {evidencias.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {evidencias.map((ev, i) => (
                      <button
                        key={`thumb-${i}-${ev.file.name}`}
                        type="button"
                        onClick={() => setFotoActiva(i)}
                        aria-label={`Ver ${ev.file.name}`}
                        aria-current={i === fotoActiva}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                          i === fotoActiva
                            ? "ring-emerald-600"
                            : "ring-transparent hover:ring-emerald-900/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.preview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => quitarEvidencia(fotoActiva)}
                  className="w-full rounded-xl border border-red-300/60 bg-superficie px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Quitar esta foto
                </button>
              </>
            ) : (
              <label
                htmlFor="foto-panel-vacio"
                className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-900/20 bg-emerald-50/50 text-center transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                <IconoCamara className="h-9 w-9 text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-900">
                  Sin fotos todavía
                </span>
                <span className="text-xs text-emerald-900/60">
                  La evidencia se adjunta en el paso «Evidencias»
                </span>
                <input
                  id="foto-panel-vacio"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onArchivos(e.target.files)}
                />
              </label>
            )}

            <p className="text-xs text-emerald-900/50">
              Las imágenes se comprimen a 800 px para guardarlas; en Stellar solo
              viaja su huella SHA-256.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
