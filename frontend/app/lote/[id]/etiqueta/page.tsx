"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Lote } from "@/lib/types";
import { obtenerLote } from "@/lib/api";
import Logo from "@/components/Logo";

/** Lado máximo del QR en píxeles: mantiene el código grande sin que desborde
 * la tarjeta ni pierda la zona de silencio que necesita el escáner. */
const QR_MAX = 300;
const QR_MIN = 150;

export default function EtiquetaPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [lote, setLote] = useState<Lote | null | undefined>(undefined);
  const [url, setUrl] = useState("");
  const cajaRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(240);

  useEffect(() => {
    obtenerLote(id).then(setLote);
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setUrl(`${base}/lote/${id}`);
  }, [id]);

  // El QR toma el ancho disponible en la tarjeta: se ve proporcional en
  // escritorio y en móvil, y nunca se sale de la caja.
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    const medir = () => {
      const ancho = caja.clientWidth;
      if (ancho > 0) {
        // Se descuenta el padding del marco (px-2 a cada lado) para que el
        // filete punteado nunca se salga de la tarjeta.
        setQrSize(Math.max(QR_MIN, Math.min(Math.floor(ancho) - 16, QR_MAX)));
      }
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(caja);
    return () => observador.disconnect();
  }, [lote]);

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

      <div className="ficha-impresa mx-auto w-full max-w-sm rounded-card border border-emerald-900/20 bg-white p-7 text-center">
        <div className="flex justify-center">
          <Logo tamano="lg" />
        </div>
        <p className="mt-2 text-sm font-medium text-emerald-900/80">
          {lote.finca} · {lote.municipio}
        </p>
        {/* Marco con filete punteado que abraza el QR; el código se mide contra
            el ancho disponible, así queda centrado y proporcional. */}
        <div ref={cajaRef} className="mt-6">
          <div className="mx-auto w-fit border-y border-dashed border-emerald-900/20 px-2 py-4">
            <QRCodeSVG
              value={url || `https://agrotrace.example/lote/${lote.codigo}`}
              size={qrSize}
              marginSize={3}
              level="M"
              fgColor="#14351F"
              bgColor="#FFFFFF"
            />
          </div>
        </div>
        <p className="font-display text-[28px] font-semibold leading-none tracking-tight text-emerald-950">
          {lote.codigo}
        </p>
        <p className="mt-2 text-sm text-emerald-900/75">
          {lote.linea_productiva} · {lote.cantidad} {lote.unidad}
        </p>
        <p className="mt-1 text-xs text-emerald-900/60">
          Fecha de empaque: {fechaEmpaque ?? "—"}
        </p>
        <p className="mt-4 break-all font-mono text-[10px] text-emerald-900/45">{url}</p>
        <p className="mt-3 text-[11px] leading-relaxed text-emerald-900/55">
          Escanea para verificar el origen y la integridad del lote en Stellar.
        </p>
      </div>
    </div>
  );
}
