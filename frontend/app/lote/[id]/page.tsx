"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lote } from "@/lib/types";
import { obtenerLote } from "@/lib/api";
import VerificarIntegridad from "@/components/VerificarIntegridad";
import Timeline from "@/components/Timeline";

export default function LotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [lote, setLote] = useState<Lote | null | undefined>(undefined);

  useEffect(() => {
    obtenerLote(id).then(setLote);
  }, [id]);

  if (lote === undefined) {
    return <p className="text-sm text-emerald-900/60">Consultando lote…</p>;
  }

  // HU-02 escenario 2: lote inexistente o QR alterado.
  if (lote === null) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card border-red-400/40 bg-red-50 text-center">
          <p className="text-4xl">⛔</p>
          <h1 className="mt-2 text-2xl font-bold text-red-900">
            Lote no encontrado
          </h1>
          <p className="mt-2 text-sm text-red-800">
            El código <strong>{id}</strong> no corresponde a ningún lote activo
            en el sistema. El lote no existe o el código QR no es auténtico.
          </p>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-semibold text-emerald-700 underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lote.demo && (
        <p className="badge bg-amber-100 text-amber-900">
          🧪 Modo demo — datos de ejemplo en tu navegador
        </p>
      )}

      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Pasaporte digital · {lote.codigo}
            </p>
            <h1 className="text-3xl font-bold text-emerald-950">
              {lote.linea_productiva}
            </h1>
            <p className="mt-1 text-emerald-900/75">
              <strong>{lote.finca}</strong> — {lote.municipio}
            </p>
            <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-emerald-900">Fecha de postura</dt>
                <dd>{lote.fecha_postura ?? lote.fecha_cosecha}</dd>
              </div>
              <div>
                <dt className="font-semibold text-emerald-900">Fecha de cosecha</dt>
                <dd>{lote.fecha_cosecha}</dd>
              </div>
              <div>
                <dt className="font-semibold text-emerald-900">Cantidad</dt>
                <dd>
                  {lote.cantidad} {lote.unidad}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-emerald-900">Registrado</dt>
                <dd>{lote.created_at.slice(0, 10)}</dd>
              </div>
            </dl>
          </div>
          <Link href={`/lote/${lote.codigo}/etiqueta`} className="btn-secondary no-print">
            🏷️ Ver etiqueta QR
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-emerald-950">Evidencia fotográfica</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {lote.fotos.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={f}
              alt={`Evidencia ${i + 1} del lote ${lote.codigo}`}
              className="h-56 w-full rounded-2xl object-cover ring-1 ring-emerald-900/10"
            />
          ))}
          {lote.fotos.length === 0 && (
            <p className="text-sm text-emerald-900/60">Sin fotos disponibles.</p>
          )}
        </div>
        <p className="text-xs text-emerald-900/50">
          Evidencias:{" "}
          {lote.evidencias.map((e) => `${e.nombre} (${e.tamano} bytes)`).join(", ") || "—"}
        </p>
      </section>

      <VerificarIntegridad lote={lote} />

      <section className="card">
        <h2 className="mb-4 text-xl font-bold text-emerald-950">
          📜 Historial del lote
        </h2>
        <Timeline eventos={lote.eventos} />
      </section>
    </div>
  );
}
