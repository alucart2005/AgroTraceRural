"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Lote } from "@/lib/types";
import Logo from "@/components/Logo";

/** Lado máximo del QR en píxeles de pantalla: mantiene el código grande sin
 * que desborde la tarjeta ni pierda la zona de silencio que necesita el
 * escáner. Solo lo usa la variante "preview". */
const QR_MAX = 300;
const QR_MIN = 150;

/** Lado del QR en la hoja impresa: 166 px CSS ≈ 44 mm a 96 dpi — legible con
 * el celular a 40–50 cm, la distancia natural para escanear una cubeta. */
const QR_HOJA = 166;

/**
 * Etiqueta QR de un lote en sus dos formas:
 *
 * - `preview`: la tarjeta grande de la pantalla, con el QR medido contra el
 *   ancho disponible y la URL en texto plano como respaldo del código.
 * - `hoja`: una celda de la cuadrícula 2×3 que se imprime en papel carta
 *   (ver `.hoja-impresion` en globals.css). QR de tamaño fijo, sin la línea
 *   de URL — el propio código la lleva — y contenido compacto para que
 *   quepa en 94 × 81 mm sin desbordes.
 *
 * Ambas variantes usan `.ficha-impresa`: la etiqueta es un artefacto
 * imprimible y siempre sale en tema claro, aunque el sitio esté en oscuro.
 */
export default function EtiquetaLote({
  lote,
  url,
  fechaEmpaque,
  variante = "preview",
}: {
  lote: Lote;
  url: string;
  /** Fecha del evento "empaque" o, en su defecto, la de cosecha. */
  fechaEmpaque?: string;
  variante?: "preview" | "hoja";
}) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(240);

  // El QR de pantalla toma el ancho disponible en la tarjeta: se ve
  // proporcional en escritorio y en móvil, y nunca se sale de la caja. La
  // hoja no mide nada: su QR es fijo para que salga igual en todas las
  // impresiones.
  useEffect(() => {
    if (variante !== "preview") return;
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
  }, [variante, lote]);

  const valor = url || `https://agrotrace.example/lote/${lote.codigo}`;

  if (variante === "hoja") {
    return (
      <div className="etiqueta-celda ficha-impresa flex flex-col items-center justify-center overflow-hidden border border-dashed border-emerald-900/25 px-3 py-2.5 text-center">
        <div className="flex w-full items-center justify-between gap-2">
          <Logo tamano="md" />
          <p className="min-w-0 text-[11px] font-medium leading-tight text-emerald-900/80">
            {lote.finca} · {lote.municipio}
          </p>
        </div>
        {/* Marco con filete punteado: en la hoja el QR va a tamaño fijo. */}
        <div className="mt-1.5 border-y border-dashed border-emerald-900/20 px-2 py-1">
          <QRCodeSVG
            value={valor}
            size={QR_HOJA}
            marginSize={3}
            level="M"
            fgColor="#14351F"
            bgColor="#FFFFFF"
          />
        </div>
        <p className="mt-1.5 font-display text-[24px] font-semibold leading-none tracking-tight text-emerald-950">
          {lote.codigo}
        </p>
        <p className="mt-1 text-[11px] leading-tight text-emerald-900/75">
          {lote.linea_productiva} · {lote.cantidad} {lote.unidad}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-emerald-900/60">
          Fecha de empaque: {fechaEmpaque ?? "—"}
        </p>
        <p className="mt-1 text-[9px] leading-tight text-emerald-900/55">
          Escanea para verificar el origen y la integridad del lote.
        </p>
      </div>
    );
  }

  return (
    <div className="no-print ficha-impresa mx-auto w-full max-w-sm rounded-card border border-emerald-900/20 bg-white p-7 text-center">
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
            value={valor}
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
      <p className="mt-4 break-all font-mono text-[10px] text-emerald-900/45">
        {url}
      </p>
      <p className="mt-3 text-[11px] leading-relaxed text-emerald-900/55">
        Escanea para verificar el origen y la integridad del lote en Stellar.
      </p>
    </div>
  );
}
