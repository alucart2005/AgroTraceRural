"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lote } from "@/lib/types";
import { listarLotes, modoDemoActivo } from "@/lib/api";
import AvisoModoDemo from "@/components/AvisoModoDemo";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import ProtegerProductor from "@/components/ProtegerProductor";

export default function ProductosPage() {
  return (
    <ProtegerProductor>
      <CatalogoProductos />
    </ProtegerProductor>
  );
}

interface LineaProducto {
  linea: string;
  lotes: Lote[];
  total: number;
  unidad: string;
  ultimaCosecha: string;
  fotos: string[];
}

/**
 * Catálogo de productos: agrupa los lotes por línea productiva. Se apoya
 * solo en ``GET /api/lotes`` (lectura pública), sin tocar el backend.
 */
function CatalogoProductos() {
  const [lotes, setLotes] = useState<Lote[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    listarLotes()
      .then((l) => {
        setDemo(modoDemoActivo());
        setLotes(l);
      })
      .catch(() => setLotes([]));
  }, []);

  const lineas = useMemo<LineaProducto[]>(() => {
    if (!lotes) return [];
    const mapa = new Map<string, Lote[]>();
    for (const lote of lotes) {
      const lista = mapa.get(lote.linea_productiva) ?? [];
      lista.push(lote);
      mapa.set(lote.linea_productiva, lista);
    }
    return Array.from(mapa.entries())
      .map(([linea, lista]) => {
        const ordenados = [...lista].sort((a, b) =>
          b.fecha_cosecha.localeCompare(a.fecha_cosecha)
        );
        const unidad = lista[0]?.unidad ?? "";
        return {
          linea,
          lotes: ordenados,
          total: lista.reduce((acc, l) => acc + l.cantidad, 0),
          unidad,
          ultimaCosecha: ordenados[0]?.fecha_cosecha ?? "",
          fotos: ordenados.flatMap((l) => l.fotos).slice(0, 4),
        };
      })
      .sort((a, b) => a.linea.localeCompare(b.linea));
  }, [lotes]);

  const visibles = lineas.filter((l) =>
    filtro.trim()
      ? l.linea.toLowerCase().includes(filtro.trim().toLowerCase()) ||
        l.lotes.some((lote) => lote.codigo.toLowerCase().includes(filtro.trim().toLowerCase()))
      : true
  );

  const totalLotes = lotes?.length ?? 0;
  const totalEvidencias =
    lotes?.reduce((acc, l) => acc + l.fotos.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Catálogo"
        titulo="Productos"
        descripcion="Cada línea productiva registrada en la finca, con sus lotes, su volumen acumulado y la evidencia que lo respalda."
        acciones={
          <Link href="/productor/nuevo" className="btn-primary">
            + Nuevo lote
          </Link>
        }
      />

      {(demo || lotes?.some((l) => l.demo)) && (
        <AvisoModoDemo detalle="el catálogo se armó con los datos de ejemplo" />
      )}

      {lotes === null ? (
        <p className="text-sm text-emerald-900/60">Cargando catálogo…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Líneas productivas
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">
                {lineas.length}
              </p>
            </div>
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Lotes registrados
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">{totalLotes}</p>
            </div>
            <div className="card py-4">
              <p className="text-[13px] font-medium text-emerald-900/60">
                Evidencias gráficas
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-900">
                {totalEvidencias}
              </p>
            </div>
          </div>

          <div className="card py-4">
            <label className="label" htmlFor="filtro-productos">
              Filtrar por línea o código
            </label>
            <input
              id="filtro-productos"
              type="search"
              className="input"
              placeholder="Ej. Huevos o HUE-2026-008"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {visibles.length === 0 ? (
            <div className="card text-center">
              <p className="font-semibold text-emerald-950">
                {lineas.length === 0
                  ? "Todavía no hay lotes en el catálogo."
                  : "Ninguna línea coincide con el filtro."}
              </p>
              <Link href="/productor/nuevo" className="btn-primary mt-4">
                Registrar el primer lote
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {visibles.map((linea) => (
                <li key={linea.linea} className="card space-y-4">
                  <div className="flex gap-4">
                    <div className="grid shrink-0 grid-cols-2 gap-1">
                      {linea.fotos.length > 0 ? (
                        linea.fotos.slice(0, 4).map((f, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={`${f.slice(0, 20)}-${i}`}
                            src={f}
                            alt={`${linea.linea} evidencia ${i + 1}`}
                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-emerald-900/10"
                          />
                        ))
                      ) : (
                        <div className="col-span-2 flex h-16 w-32 items-center justify-center rounded-lg bg-emerald-50 text-[11px] text-emerald-900/50">
                          Sin fotos
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-emerald-950">
                        {linea.linea}
                      </h2>
                      <p className="mt-1 text-sm text-emerald-900/70">
                        {linea.lotes.length} lote
                        {linea.lotes.length === 1 ? "" : "s"} ·{" "}
                        {linea.total} {linea.unidad}
                      </p>
                      <p className="text-xs text-emerald-900/50">
                        Última cosecha: {linea.ultimaCosecha || "—"}
                      </p>
                      <Link
                        href="/productor/nuevo"
                        className="mt-2 inline-flex text-xs font-semibold text-emerald-700 underline"
                      >
                        Registrar lote de esta línea
                      </Link>
                    </div>
                  </div>

                  <ul className="divide-y divide-emerald-900/10 rounded-xl border border-emerald-900/10">
                    {linea.lotes.map((lote) => (
                      <li
                        key={lote.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/lote/${lote.codigo}`}
                            className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
                          >
                            {lote.codigo}
                          </Link>
                          <p className="text-xs text-emerald-900/60">
                            {lote.cantidad} {lote.unidad} · cosecha {lote.fecha_cosecha}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/productor/lote/${lote.codigo}/eventos`}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          >
                            Eventos
                          </Link>
                          <Link
                            href={`/lote/${lote.codigo}`}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          >
                            Ficha
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
