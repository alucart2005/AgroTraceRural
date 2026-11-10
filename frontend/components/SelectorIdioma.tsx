"use client";

import { IDIOMAS, NOMBRES_IDIOMA, type IdiomaManual } from "@/content/manual/tipos";

/** Selector ES / EN / PT del manual de usuario. */
export default function SelectorIdioma({
  valor,
  onCambiar,
  className = "",
}: {
  valor: IdiomaManual;
  onCambiar: (idioma: IdiomaManual) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Idioma del manual"
      className={`inline-flex items-center gap-1 rounded-lg border border-emerald-900/15 bg-superficie p-1 ${className}`}
    >
      {IDIOMAS.map((idioma) => {
        const activo = idioma === valor;
        return (
          <button
            key={idioma}
            type="button"
            onClick={() => onCambiar(idioma)}
            aria-pressed={activo}
            title={NOMBRES_IDIOMA[idioma]}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              activo
                ? "marca"
                : "text-emerald-900/65 hover:bg-emerald-50 hover:text-emerald-950"
            }`}
          >
            {idioma.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
