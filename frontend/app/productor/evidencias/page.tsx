"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lote } from "@/lib/types";
import { listarMisLotes, modoDemoActivo } from "@/lib/api";
import AvisoModoDemo from "@/components/AvisoModoDemo";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import ProtegerProductor from "@/components/ProtegerProductor";

export default function EvidenciasPage() {
  return (
    <ProtegerProductor>
      <GaleriaEvidencias />
    </ProtegerProductor>
  );
}

interface FotoEvidencia {
  lote: Lote;
  url: string;
  nombre: string;
  tamano: number | null;
}

/**
 * Galería de evidencias: todas las fotos de los lotes del productor con su
 * ficha asociada. Usa ``GET /api/lotes/mios`` (lectura ya existente).
 */
function GaleriaEvidencias() {
  const [lotes, setLotes] = useState<Lote[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    listarMisLotes()
      .then((l) => {
        setDemo(modoDemoActivo());
        setLotes(l);
      })
      .catch(() => setLotes([]));
  }, []);

  const fotos = useMemo<FotoEvidencia[]>(() => {
    if (!lotes) return [];
    return lotes.flatMap((lote) =>
      lote.fotos.map((url, i) => ({
        lote,
        url,
        nombre: lote.evidencias[i]?.nombre ?? `evidencia-${i + 1}`,
        tamano: lote.evidencias[i]?.tamano ?? null,
      }))
    );
  }, [lotes]);

  const termino = filtro.trim().toLowerCase();
  const visibles = termino
    ? fotos.filter(
        (f) =>
          f.lote.codigo.toLowerCase().includes(termino) ||
          f.lote.linea_productiva.toLowerCase().includes(termino) ||
          f.nombre.toLowerCase().includes(termino)
      )
    : fotos;

  const lotesConFoto = new Set(fotos.map((f) => f.lote.id)).size;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Catálogo"
        titulo="Evidencias"
        descripcion="Las fotos que respaldan cada lote. Son la prueba que entra en la huella SHA-256 que se ancla en Stellar."
        acciones={
          <Link href="/productor/nuevo" className="btn-primary">
            + Nuevo lote
          </Link>
        }
      />

      {(demo || lotes?.some((l) => l.demo)) && (
        <AvisoModoDemo detalle="estas evidencias son de ejemplo" />
      )}

      {lotes === null ? (
        <p className="text-sm text-emerald-900/60">Cargando evidencias…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Evidencias
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">
                {fotos.length}
              </p>
            </div>
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Lotes con evidencia
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">
                {lotesConFoto}
              </p>
            </div>
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Lotes registrados
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">
                {lotes.length}
              </p>
            </div>
          </div>

          <div className="card py-4">
            <label className="label" htmlFor="filtro-evidencias">
              Filtrar por lote o archivo
            </label>
            <input
              id="filtro-evidencias"
              type="search"
              className="input"
              placeholder="Ej. HUE-2026-008 o ATR-1"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {visibles.length === 0 ? (
            <div className="card text-center">
              <p className="font-semibold text-emerald-950">
                {fotos.length === 0
                  ? "Todavía no hay evidencias registradas."
                  : "Ninguna evidencia coincide con el filtro."}
              </p>
              <p className="mt-1 text-sm text-emerald-900/70">
                La evidencia fotográfica es obligatoria al registrar un lote.
              </p>
              <Link href="/productor/nuevo" className="btn-primary mt-4">
                Registrar un lote
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visibles.map((f, i) => (
                <li key={`${f.lote.id}-${i}`} className="card space-y-2 p-3">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    title={f.nombre}
                    className="block overflow-hidden rounded-xl ring-1 ring-emerald-900/10 transition hover:ring-emerald-600/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={`${f.nombre} del lote ${f.lote.codigo}`}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  <div className="min-w-0">
                    <Link
                      href={`/lote/${f.lote.codigo}`}
                      className="block truncate text-xs font-bold text-emerald-800 underline-offset-2 hover:underline"
                    >
                      {f.lote.codigo}
                    </Link>
                    <p className="truncate text-[11px] text-emerald-900/55">
                      {f.nombre}
                      {f.tamano ? ` · ${Math.round(f.tamano / 1024)} KB` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
