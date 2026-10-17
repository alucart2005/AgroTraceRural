"use client";

/**
 * Aviso de que la pantalla está mostrando el almacén LOCAL del navegador y no
 * el backend.
 *
 * Sin esto, un backend caído o una variable ``NEXT_PUBLIC_API_URL`` mal
 * configurada se traducían en lotes fantasma indistinguibles de los reales:
 * la lista del productor no llevaba ninguna marca y quien registraba un lote
 * creaba datos que solo existían en su propio navegador.
 */
export default function AvisoModoDemo({ detalle }: { detalle?: string }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
    >
      🧪 <strong>Modo demo:</strong> {detalle ?? "estos datos viven solo en tu navegador"}.
      No se está consultando el backend, así que los cambios no se guardarán de
      forma compartida.
    </p>
  );
}
