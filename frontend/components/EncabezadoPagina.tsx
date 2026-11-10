import type { ReactNode } from "react";

/** Encabezado común de las pantallas del productor: rótulo en versalitas
 * moderadas, título en la tipografía display y acciones a la derecha. */
export default function EncabezadoPagina({
  titulo,
  descripcion,
  eyebrow,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  /** Contexto de la pantalla (sección, HU). */
  eyebrow?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[34px]">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
            {descripcion}
          </p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}
