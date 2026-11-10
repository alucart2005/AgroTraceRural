"use client";

import { useState } from "react";
import { manual as es } from "@/content/manual/es";
import { manual as en } from "@/content/manual/en";
import { manual as pt } from "@/content/manual/pt";
import type { IdiomaManual, Manual } from "@/content/manual/tipos";
import NavegacionAyuda from "@/components/NavegacionAyuda";
import SelectorIdioma from "@/components/SelectorIdioma";

const MANUALES: Record<IdiomaManual, Manual> = { es, en, pt };

/** Manual de usuario en español, inglés y português. */
export default function ManualPage() {
  const [idioma, setIdioma] = useState<IdiomaManual>("es");
  const manual = MANUALES[idioma];

  return (
    <div className="space-y-8">
      <header className="border-b border-emerald-900/10 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
              Ayuda · Manual
            </p>
            <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[36px]">
              {manual.titulo}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
              {manual.bajada}
            </p>
          </div>
          <SelectorIdioma valor={idioma} onCambiar={setIdioma} />
        </div>
        <NavegacionAyuda className="mt-6" />
      </header>

      {/* Índice de capítulos */}
      <nav aria-label="Capítulos del manual">
        <ol className="grid gap-2 sm:grid-cols-2">
          {manual.secciones.map((seccion, i) => (
            <li key={seccion.id}>
              <a
                href={`#${seccion.id}`}
                className="flex items-baseline gap-3 rounded-lg border border-emerald-900/10 bg-superficie px-4 py-3 transition hover:border-emerald-700/40"
              >
                <span className="font-display text-lg font-semibold text-emerald-300">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-emerald-950">
                  {seccion.titulo}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Capítulos */}
      <div className="space-y-10">
        {manual.secciones.map((seccion, i) => (
          <section key={seccion.id} id={seccion.id} className="scroll-mt-24">
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-emerald-950">
              <span className="mr-3 text-emerald-300">{i + 1}</span>
              {seccion.titulo}
            </h2>

            {seccion.parrafos?.map((parrafo) => (
              <p
                key={parrafo.slice(0, 24)}
                className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-emerald-900/80"
              >
                {parrafo}
              </p>
            ))}

            {seccion.lista && (
              <ul className="mt-4 grid max-w-[72ch] gap-2">
                {seccion.lista.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-emerald-900/80">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {seccion.pasos && (
              <ol className="mt-5 grid max-w-[72ch] gap-3">
                {seccion.pasos.map((paso, n) => (
                  <li
                    key={paso.titulo}
                    className="flex gap-4 rounded-xl border border-emerald-900/10 bg-superficie p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      {n + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-emerald-950">
                        {paso.titulo}
                      </span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-emerald-900/75">
                        {paso.texto}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {seccion.tabla && (
              <div className="mt-5 overflow-x-auto rounded-card border border-emerald-900/10 bg-superficie">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-900/10 bg-emerald-50/50">
                      {seccion.tabla.columnas.map((columna) => (
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
                    {seccion.tabla.filas.map((fila) => (
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

            {seccion.aviso && (
              <div className={`recuadro recuadro--${seccion.aviso.tono} mt-5 max-w-[72ch]`}>
                <p className="font-semibold">{seccion.aviso.titulo}</p>
                <p className="mt-1">{seccion.aviso.texto}</p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
