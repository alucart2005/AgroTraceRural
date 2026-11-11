"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lote } from "@/lib/types";
import { obtenerLote } from "@/lib/api";
import EtiquetaLote from "@/components/EtiquetaLote";

/** Etiquetas por hoja carta al imprimir: cuadrícula 2×3 (ver
 * `.hoja-impresion` en globals.css). */
const ETIQUETAS_POR_HOJA = 6;

export default function EtiquetaPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [lote, setLote] = useState<Lote | null | undefined>(undefined);
  const [url, setUrl] = useState("");

  useEffect(() => {
    obtenerLote(id).then(setLote);
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setUrl(`${base}/lote/${id}`);
  }, [id]);

  // HU-04: la fecha de empaque es la del evento "empaque" si existe.
  const evEmpaque = lote?.eventos
    ?.filter((e) => e.tipo === "empaque")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const fechaEmpaque = evEmpaque
    ? new Date(evEmpaque.fecha).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : lote?.fecha_cosecha;

  if (lote === undefined) {
    return <p className="text-sm text-emerald-900/60">Cargando etiqueta…</p>;
  }
  if (lote === null) {
    return (
      <div className="card border-red-400/40 bg-red-50 text-center">
        <h1 className="text-xl font-bold text-red-900">Lote no encontrado</h1>
        <p className="mt-2 text-sm">
          <Link href="/productor" className="font-semibold text-emerald-700 underline">
            Volver a mis lotes
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/10 pb-5">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-emerald-950">
              Etiqueta QR
            </h1>
            <p className="mt-1 text-sm text-emerald-900/70">
              Lista para imprimir y adherir a la cubeta.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-primary">
              Imprimir
            </button>
            <Link href={`/lote/${lote.codigo}`} className="btn-secondary">
              Ver ficha pública
            </Link>
          </div>
        </div>

        {/* Vista previa en pantalla: una etiqueta grande con su URL. */}
        <EtiquetaLote
          lote={lote}
          url={url}
          fechaEmpaque={fechaEmpaque}
          variante="preview"
        />
      </div>

      {/* Hoja de impresión: 6 etiquetas iguales en 2×3. Oculta en pantalla
          (.hoja-impresion) y única cosa visible al imprimir. aria-hidden
          evita que el lector de pantalla anuncie la etiqueta dos veces. */}
      <div className="hoja-impresion" aria-hidden>
        {Array.from({ length: ETIQUETAS_POR_HOJA }, (_, i) => (
          <EtiquetaLote
            key={i}
            lote={lote}
            url={url}
            fechaEmpaque={fechaEmpaque}
            variante="hoja"
          />
        ))}
      </div>
    </>
  );
}
