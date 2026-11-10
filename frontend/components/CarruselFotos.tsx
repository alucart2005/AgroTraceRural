"use client";

import { useState } from "react";

/** Carrusel de fotos de la ficha del lote (mockup móvil): pista con
 * desplazamiento por transform, flechas y dots. Sin dependencias. */
export default function CarruselFotos({
  fotos,
  alt,
}: {
  fotos: string[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-emerald-50 text-sm text-emerald-900/50 ring-1 ring-emerald-900/10">
        Sin fotos disponibles.
      </div>
    );
  }

  const total = fotos.length;
  const anterior = () => setIdx((i) => (i - 1 + total) % total);
  const siguiente = () => setIdx((i) => (i + 1) % total);

  return (
    <div className="relative overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-900/10">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {fotos.map((f, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${i}-${f.slice(0, 24)}`}
            src={f}
            alt={`${alt} (evidencia ${i + 1} de ${total})`}
            className="aspect-[4/3] w-full shrink-0 object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
            </svg>
          </button>

          <div
            role="tablist"
            aria-label="Seleccionar foto"
            className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5"
          >
            {fotos.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Foto ${i + 1} de ${total}`}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
