"use client";

import type { EstadoAnclaje, Lote } from "@/lib/types";

/**
 * Estado del ancla on-chain (HU-24/HU-25).
 *
 * El lote ya existe aunque el ancla siga en curso: la ficha, el QR y la lista
 * deben decirlo sin alarmar. Antes de esta entrega el 201 esperaba a Horizon y
 * un timeout dejaba al productor sin saber si su lote se había guardado.
 */

const ETIQUETA: Record<
  EstadoAnclaje,
  { texto: string; clase: string; detalle: string }
> = {
  anclado: {
    texto: "Anclado en Stellar",
    clase: "bg-emerald-100 text-emerald-800",
    detalle: "El hash del lote está registrado en Stellar Testnet.",
  },
  pendiente: {
    texto: "Ancla en proceso",
    clase: "bg-amber-100 text-amber-900",
    detalle:
      "El lote está guardado. El hash se está registrando en Stellar; " +
      "mientras tanto la verificación on-chain aún no está disponible.",
  },
  fallido: {
    texto: "Ancla pendiente de reintento",
    clase: "bg-amber-100 text-amber-900",
    detalle:
      "El lote está guardado, pero Stellar no confirmó el ancla. " +
      "Se reintenta automáticamente cada 10 minutos.",
  },
  fallido_definitivo: {
    texto: "Ancla no confirmada",
    clase: "bg-red-100 text-red-800",
    detalle:
      "El lote está guardado, pero el ancla agotó los reintentos. " +
      "Contacta al equipo para revisarlo.",
  },
};

/** Estado del ancla del lote; ``undefined`` se muestra como pendiente. */
export function estadoAnclaje(lote: Lote): EstadoAnclaje {
  return lote.anclaje_estado ?? (lote.stellar_tx_hash ? "anclado" : "pendiente");
}

/** Etiqueta compacta para listas y fichas. */
export function EstadoAnclajeBadge({ lote }: { lote: Lote }) {
  const estado = estadoAnclaje(lote);
  const etiqueta = ETIQUETA[estado];
  return (
    <span
      className={`badge ${etiqueta.clase}`}
      title={etiqueta.detalle}
    >
      {estado === "anclado" ? "⛓️" : "⏳"} {etiqueta.texto}
    </span>
  );
}

/**
 * Aviso largo para la ficha y la etiqueta: explica qué se puede y qué no
 * afirmar cuando el ancla todavía no está confirmada.
 */
export default function AvisoAnclaje({
  lote,
  onReintentar,
  reintentando,
}: {
  lote: Lote;
  /** Solo se ofrece en "Mis lotes" (requiere sesión del dueño). */
  onReintentar?: () => void;
  reintentando?: boolean;
}) {
  const estado = estadoAnclaje(lote);
  if (estado === "anclado") return null;
  const etiqueta = ETIQUETA[estado];

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <p className="font-semibold">
        {estado === "fallido_definitivo" ? "⚠️" : "⏳"} {etiqueta.texto}: este
        lote aún no es verificable on-chain.
      </p>
      <p className="mt-1 text-xs">{etiqueta.detalle}</p>
      {onReintentar && estado !== "pendiente" && (
        <button
          type="button"
          onClick={onReintentar}
          disabled={reintentando}
          className="mt-2 rounded-md border border-amber-600/40 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
        >
          {reintentando ? "Reintentando…" : "Reintentar ancla ahora"}
        </button>
      )}
    </div>
  );
}
