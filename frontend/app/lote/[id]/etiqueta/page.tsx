"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Lote } from "@/lib/types";
import { obtenerLote } from "@/lib/api";

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
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-950">Etiqueta QR</h1>
          <p className="text-sm text-emerald-900/70">
            HU-04 — lista para imprimir y adherir a la cubeta.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Imprimir
          </button>
          <Link href={`/lote/${lote.codigo}`} className="btn-secondary">
            Ver página pública
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-emerald-900/20 bg-white p-8 text-center shadow-md">
        <p className="text-2xl font-black text-emerald-800">🌱 AgroTrace Rural</p>
        <p className="mt-1 text-sm font-semibold text-emerald-900">
          {lote.finca} · {lote.municipio}
        </p>
        <div className="mt-5 flex justify-center">
          <QRCodeSVG
            value={url || `https://agrotrace.example/lote/${lote.codigo}`}
            size={200}
            level="M"
            includeMargin
          />
        </div>
        <p className="mt-4 text-lg font-black text-emerald-950">{lote.codigo}</p>
        <p className="text-sm text-emerald-900/75">
          {lote.linea_productiva} · {lote.cantidad} {lote.unidad}
        </p>
        <p className="mt-1 text-xs text-emerald-900/60">
          Fecha de empaque: {lote.fecha_cosecha}
        </p>
        <p className="mt-3 break-all font-mono text-[10px] text-emerald-900/50">{url}</p>
        <p className="mt-3 text-[10px] text-emerald-900/50">
          Escanea para verificar origen e integridad on-chain
        </p>
      </div>
    </div>
  );
}
