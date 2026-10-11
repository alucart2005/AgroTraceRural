"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listarLotes } from "@/lib/api";
import type { Lote } from "@/lib/types";

export default function ProductorPage() {
  const [lotes, setLotes] = useState<Lote[] | null>(null);

  useEffect(() => {
    listarLotes().then(setLotes);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Mis lotes</h1>
          <p className="text-sm text-emerald-900/70">
            Registro de cosechas de la Finca Guarumo (HU-01 · HU-05).
          </p>
        </div>
        <Link href="/productor/nuevo" className="btn-primary">
          + Nuevo lote
        </Link>
      </div>

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
        <ul className="grid gap-4">
          {lotes.map((l) => (
            <li key={l.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {l.codigo}
                  </p>
                  <p className="text-lg font-bold text-emerald-950">
                    {l.linea_productiva} · {l.cantidad} {l.unidad}
                  </p>
                  <p className="text-sm text-emerald-900/70">
                    Cosecha: {l.fecha_cosecha} · {l.municipio}
                  </p>
                  <p className="mt-1 font-mono text-xs text-emerald-900/50">
                    SHA-256: {l.hash_sha256.slice(0, 32)}…
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link href={`/lote/${l.codigo}`} className="btn-secondary">
                    Ver público
                  </Link>
                  <Link href={`/lote/${l.codigo}/etiqueta`} className="btn-primary">
                    QR
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
