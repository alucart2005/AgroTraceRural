"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Subnavegación de la sección Ayuda, compartida por sus cuatro páginas. */
const enlaces = [
  { href: "/ayuda/manual", label: "Manual de usuario" },
  { href: "/ayuda/versiones", label: "Novedades y versiones" },
  { href: "/ayuda/acerca-de", label: "Acerca de AgroTrace" },
  { href: "/ayuda/reportar", label: "Reportar un problema" },
];

export default function NavegacionAyuda({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Secciones de ayuda"
      className={`flex flex-wrap items-center gap-1 ${className}`}
    >
      {enlaces.map((enlace) => {
        const activo = pathname === enlace.href;
        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activo
                ? "bg-emerald-700 text-white"
                : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-950"
            }`}
          >
            {enlace.label}
          </Link>
        );
      })}
    </nav>
  );
}
