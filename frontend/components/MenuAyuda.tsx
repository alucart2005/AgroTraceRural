"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { VERSION } from "@/lib/version";

const enlaces = [
  { href: "/ayuda/manual", label: "Manual de usuario", detalle: "Guía paso a paso" },
  { href: "/ayuda/versiones", label: "Novedades y versiones", detalle: "Qué cambió y cuándo" },
  { href: "/ayuda/acerca-de", label: "Acerca de AgroTrace", detalle: "El proyecto y el piloto" },
  { href: "/ayuda/reportar", label: "Reportar un problema", detalle: "Correo e incidencias" },
];

/**
 * Menú de ayuda del encabezado: un panel con las secciones de ayuda y la
 * versión activa de la aplicación.
 */
export default function MenuAyuda() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    function onMouseDown(e: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label="Ayuda"
        title="Ayuda"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-900/15 text-emerald-900 transition hover:bg-emerald-50"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.2a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.4" />
          <path d="M12 17h.01" />
        </svg>
      </button>

      {abierto && (
        <div className="panel absolute right-0 z-50 mt-2 w-72 p-2">
          <ul className="grid gap-0.5">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={() => setAbierto(false)}
                  className="block rounded-lg px-3 py-2 transition hover:bg-emerald-50"
                >
                  <span className="block text-sm font-semibold text-emerald-950">
                    {enlace.label}
                  </span>
                  <span className="block text-xs text-emerald-900/60">
                    {enlace.detalle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-1 border-t border-emerald-900/10 px-3 pt-2 text-xs text-emerald-900/55">
            Versión{" "}
            <Link
              href="/ayuda/versiones"
              onClick={() => setAbierto(false)}
              className="font-semibold text-emerald-700 underline underline-offset-4"
            >
              v{VERSION}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
