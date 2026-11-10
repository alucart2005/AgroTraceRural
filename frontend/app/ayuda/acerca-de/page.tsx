"use client";

import { useState } from "react";
import { about as es } from "@/content/about/es";
import { about as en } from "@/content/about/en";
import { about as pt } from "@/content/about/pt";
import type { ContenidoAbout } from "@/content/about/tipos";
import { ENLACES, VERSION } from "@/lib/version";
import NavegacionAyuda from "@/components/NavegacionAyuda";
import SelectorIdioma from "@/components/SelectorIdioma";

const ABOUTS = { es, en, pt };

/** Acerca de AgroTrace Rural, en español, inglés y portugués. */
export default function AcercaDePage() {
  const [idioma, setIdioma] = useState<"es" | "en" | "pt">("es");
  const contenido: ContenidoAbout = ABOUTS[idioma];

  const enlaces = [
    { etiqueta: "Aplicación", href: ENLACES.app },
    { etiqueta: "API (backend)", href: ENLACES.api },
    { etiqueta: "Repositorio", href: ENLACES.repositorio },
    { etiqueta: "Video público", href: ENLACES.video },
  ];

  return (
    <div className="space-y-8">
      <header className="border-b border-emerald-900/10 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
              Ayuda · Acerca de
            </p>
            <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[36px]">
              {contenido.titulo}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
              {contenido.bajada}
            </p>
          </div>
          <SelectorIdioma valor={idioma} onCambiar={setIdioma} />
        </div>
        <NavegacionAyuda className="mt-6" />
      </header>

      <div className="space-y-8">
        {contenido.bloques.map((bloque) => (
          <section key={bloque.id} id={bloque.id} className="scroll-mt-24">
            <h2 className="font-display text-[22px] font-semibold tracking-tight text-emerald-950">
              {bloque.titulo}
            </h2>

            {bloque.parrafos?.map((parrafo) => (
              <p
                key={parrafo.slice(0, 24)}
                className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-emerald-900/80"
              >
                {parrafo}
              </p>
            ))}

            {bloque.lista && (
              <ul className="mt-4 grid max-w-[72ch] gap-2">
                {bloque.lista.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-relaxed text-emerald-900/80"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {bloque.tabla && (
              <div className="mt-4 overflow-x-auto rounded-card border border-emerald-900/10 bg-superficie">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-900/10 bg-emerald-50/50">
                      {bloque.tabla.columnas.map((columna) => (
                        <th
                          key={columna}
                          scope="col"
                          className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/55"
                        >
                          {columna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/10">
                    {bloque.tabla.filas.map((fila) => (
                      <tr key={fila[0]}>
                        {fila.map((celda, i) => (
                          <td
                            key={`${fila[0]}-${i}`}
                            className={
                              i === 0
                                ? "px-4 py-2.5 font-medium text-emerald-950"
                                : "px-4 py-2.5 text-emerald-900/75"
                            }
                          >
                            {celda}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-card border border-emerald-900/10 bg-superficie p-5 sm:p-6">
        <h2 className="font-display text-[20px] font-semibold tracking-tight text-emerald-950">
          Enlaces y versión
        </h2>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <a
                href={enlace.href}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-700 underline underline-offset-4"
              >
                {enlace.etiqueta}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-emerald-900/10 pt-3 text-sm text-emerald-900/60">
          AgroTrace Rural · v{VERSION}
        </p>
      </section>
    </div>
  );
}
