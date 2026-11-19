"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  listarMisLotesPaginado,
  modoDemoActivo,
  reintentarAnclaje,
} from "@/lib/api";
import type { Lote } from "@/lib/types";
import AvisoModoDemo from "@/components/AvisoModoDemo";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import { EstadoAnclajeBadge, estadoAnclaje } from "@/components/EstadoAnclaje";
import ProtegerProductor from "@/components/ProtegerProductor";

/** Tamaño de página de "Mis lotes" (HU-30; el backend acepta hasta 50). */
const PAGINA = 20;

export default function ProductorPage() {
  return (
    <ProtegerProductor>
      <MisLotes />
    </ProtegerProductor>
  );
}

function MisLotes() {
  const router = useRouter();
  const [lotes, setLotes] = useState<Lote[] | null>(null);
  const [total, setTotal] = useState(0);
  const [demo, setDemo] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [reintentando, setReintentando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  const manejarError = useCallback(
    (err: unknown) => {
      // Sesión rechazada por el backend (borrada/expirada de verdad): fuera.
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setAviso(
        err instanceof ApiError
          ? err.message
          : "No se pudo completar la operación. Intenta de nuevo."
      );
    },
    [router]
  );

  useEffect(() => {
    listarMisLotesPaginado(PAGINA, 0)
      .then(({ lotes: primera, total: n }) => {
        // Se lee inmediatamente después del await, antes de que otra llamada
        // pueda reemplazar el marcador.
        setDemo(modoDemoActivo());
        setLotes(primera);
        setTotal(n);
      })
      .catch((err) => {
        manejarError(err);
        setLotes([]);
      });
  }, [manejarError]);

  async function cargarMas() {
    if (!lotes) return;
    setCargandoMas(true);
    setAviso("");
    try {
      const { lotes: siguiente, total: n } = await listarMisLotesPaginado(
        PAGINA,
        lotes.length
      );
      setDemo(modoDemoActivo());
      setLotes([...lotes, ...siguiente]);
      setTotal(n);
    } catch (err) {
      manejarError(err);
    } finally {
      setCargandoMas(false);
    }
  }

  async function reintentar(codigo: string) {
    setReintentando(codigo);
    setAviso("");
    try {
      const actualizado = await reintentarAnclaje(codigo);
      setLotes((prev) =>
        prev?.map((l) => (l.codigo === codigo ? actualizado : l)) ?? prev
      );
    } catch (err) {
      manejarError(err);
    } finally {
      setReintentando(null);
    }
  }

  const hayMas = lotes !== null && lotes.length < total;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Productor"
        titulo="Mis lotes"
        descripcion="Registro de cosechas de la Finca Guarumo (HU-01 · HU-05)."
        acciones={
          <Link href="/productor/nuevo" className="btn-primary">
            + Nuevo lote
          </Link>
        }
      />

      {demo && <AvisoModoDemo detalle="estos lotes son de ejemplo" />}

      {aviso && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/50 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {aviso}
        </p>
      )}

      {lotes === null && (
        <p className="text-sm text-emerald-900/60">Cargando lotes…</p>
      )}

      {lotes !== null && lotes.length === 0 && (
        <div className="card text-center">
          <p className="font-semibold">Aún no hay lotes registrados.</p>
          <Link href="/productor/nuevo" className="btn-primary mt-4">
            Registrar el primero
          </Link>
        </div>
      )}

      {lotes !== null && lotes.length > 0 && (
        <div className="overflow-hidden rounded-card border border-emerald-900/10 bg-superficie">
          <div className="hidden border-b border-emerald-900/10 bg-emerald-50/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/55 md:grid md:grid-cols-[7.5rem_minmax(0,1fr)_7rem_7rem_auto] md:gap-3">
            <span>Lote</span>
            <span>Línea y origen</span>
            <span>Cantidad</span>
            <span>Cosecha</span>
            <span className="text-right">Acciones</span>
          </div>
          <ul className="divide-y divide-emerald-900/10">
            {lotes.map((l) => (
              <li
                key={l.id}
                className="grid gap-2 px-4 py-4 transition hover:bg-emerald-50/40 md:grid-cols-[7.5rem_minmax(0,1fr)_7rem_7rem_auto] md:items-center md:gap-3"
              >
                <div className="space-y-1">
                  <Link
                    href={`/lote/${l.codigo}`}
                    className="font-display text-[17px] font-semibold tracking-tight text-emerald-950 underline-offset-4 hover:underline"
                  >
                    {l.codigo}
                  </Link>
                  <div>
                    <EstadoAnclajeBadge lote={l} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-emerald-950">
                    {l.linea_productiva}
                  </p>
                  <p className="truncate text-xs text-emerald-900/60">
                    {l.finca} · {l.municipio}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm text-emerald-900/80">
                  {l.cantidad} {l.unidad}
                </p>
                <p className="whitespace-nowrap text-sm text-emerald-900/80">
                  {l.fecha_cosecha}
                </p>
                <div className="flex flex-wrap gap-1 md:justify-end">
                  {estadoAnclaje(l) !== "anclado" && (
                    <button
                      type="button"
                      onClick={() => reintentar(l.codigo)}
                      disabled={reintentando === l.codigo}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                    >
                      {reintentando === l.codigo
                        ? "Reintentando…"
                        : "Reintentar ancla"}
                    </button>
                  )}
                  <Link
                    href={`/productor/lote/${l.codigo}/eventos`}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Eventos
                  </Link>
                  <Link
                    href={`/lote/${l.codigo}`}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Ficha
                  </Link>
                  <Link
                    href={`/lote/${l.codigo}/etiqueta`}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    QR
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900/10 px-4 py-3">
            <p className="text-xs text-emerald-900/60">
              {lotes.length} de {total} lote{total === 1 ? "" : "s"}
            </p>
            {hayMas && (
              <button
                type="button"
                onClick={cargarMas}
                disabled={cargandoMas}
                className="btn-secondary text-sm disabled:opacity-60"
              >
                {cargandoMas ? "Cargando…" : "Cargar más"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
