"use client";

import { useEffect, useState } from "react";

export type Tema = "claro" | "oscuro";

const CLAVE = "agrotrace.tema";

/** Aplica el tema al documento (la clase `dark` reescribe toda la paleta). */
export function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "oscuro");
  document.documentElement.style.colorScheme = tema;
}

function temaGuardado(): Tema | null {
  try {
    const valor = window.localStorage.getItem(CLAVE);
    return valor === "claro" || valor === "oscuro" ? valor : null;
  } catch {
    return null;
  }
}

function temaDelSistema(): Tema {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "oscuro"
      : "claro";
  } catch {
    return "claro";
  }
}

/**
 * Conmutador claro/oscuro. Sin ajuste propio: el tema se guarda en
 * localStorage y, si nunca se eligió, sigue la preferencia del sistema.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  // null hasta montar: el servidor no sabe el tema y así no hay
  // desajuste de hidratación ni destello al cargar.
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const inicial = temaGuardado() ?? temaDelSistema();
    setTema(inicial);
    aplicarTema(inicial);
  }, []);

  function alternar() {
    const nuevo: Tema = tema === "oscuro" ? "claro" : "oscuro";
    setTema(nuevo);
    aplicarTema(nuevo);
    try {
      window.localStorage.setItem(CLAVE, nuevo);
    } catch {
      /* modo privado sin almacenamiento: el tema dura esta sesión */
    }
  }

  const oscuro = tema === "oscuro";
  const etiqueta = tema
    ? oscuro
      ? "Cambiar a tema claro"
      : "Cambiar a tema oscuro"
    : "Cambiar de tema";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      className={`rounded-lg p-2 text-emerald-900 transition hover:bg-emerald-100/60 ${className}`}
    >
      {tema === null ? (
        <span className="block h-5 w-5" aria-hidden />
      ) : oscuro ? (
        // Sol: el destino del clic.
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna: el destino del clic.
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
}
