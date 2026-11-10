"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ENTRADAS, esGrupo, enlaceActivo, type ClaveIcono } from "@/lib/menu";
import {
  IconoBuscar,
  IconoCapas,
  IconoCheckCircle,
  IconoChevron,
  IconoConfiguracion,
  IconoEvidencias,
  IconoHistorial,
  IconoInicio,
  IconoLotes,
  IconoNuevoLote,
  IconoProductos,
  IconoQr,
  IconoUsuario,
} from "@/components/icons";

/** Todos los iconos comparten la misma firma: reciben ``className`` opcional. */
type ComponenteIcono = (props: { className?: string }) => ReactNode;

const ICONOS: Record<ClaveIcono, ComponenteIcono> = {
  inicio: IconoInicio,
  consulta: IconoBuscar,
  lotes: IconoLotes,
  catalogo: IconoCapas,
  config: IconoConfiguracion,
  buscar: IconoBuscar,
  qr: IconoQr,
  demo: IconoCheckCircle,
  nuevo: IconoNuevoLote,
  eventos: IconoHistorial,
  productos: IconoProductos,
  evidencias: IconoEvidencias,
  perfil: IconoUsuario,
};

/**
 * Navegación de la app con submenús.
 *
 * - ``sidebar`` (escritorio): cada sección es plegable; la sección de la ruta
 *   activa se abre sola y el usuario puede desplegar las demás.
 * - ``movil``: las secciones se muestran siempre abiertas, con los submenús
 *   sangrados debajo de su título.
 */
export default function MenuNavegacion({
  variante = "sidebar",
  onNavegar,
}: {
  variante?: "sidebar" | "movil";
  /** Se ejecuta al pulsar un enlace (el panel móvil se cierra). */
  onNavegar?: () => void;
}) {
  const pathname = usePathname();
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});

  // La sección que contiene la ruta activa se abre al entrar en ella.
  useEffect(() => {
    setAbiertos((prev) => {
      const siguiente = { ...prev };
      for (const entrada of ENTRADAS) {
        if (!esGrupo(entrada)) continue;
        if (entrada.items.some((i) => enlaceActivo(i.href, pathname))) {
          siguiente[entrada.id] = true;
        }
      }
      return siguiente;
    });
  }, [pathname]);

  const plegable = variante === "sidebar";

  return (
    <nav
      className="flex flex-col gap-1"
      aria-label={plegable ? "Secciones del productor" : "Menú principal"}
    >
      {ENTRADAS.map((entrada) => {
        if (!esGrupo(entrada)) {
          const Icono = ICONOS[entrada.icono];
          const activo = enlaceActivo(entrada.href, pathname);
          return (
            <Link
              key={entrada.id}
              href={entrada.href}
              onClick={onNavegar}
              aria-current={activo ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                activo
                  ? "marca shadow-sm"
                  : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              <Icono className="h-5 w-5 shrink-0" />
              {entrada.label}
            </Link>
          );
        }

        const IconoGrupo = ICONOS[entrada.icono];
        const grupoActivo = entrada.items.some((i) => enlaceActivo(i.href, pathname));
        const abierto = plegable ? !!abiertos[entrada.id] : true;

        return (
          <div key={entrada.id}>
            <button
              type="button"
              onClick={() =>
                setAbiertos((prev) => ({ ...prev, [entrada.id]: !prev[entrada.id] }))
              }
              aria-expanded={abierto}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                grupoActivo
                  ? "text-emerald-950"
                  : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              <IconoGrupo className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{entrada.label}</span>
              {plegable && (
                <IconoChevron
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    abierto ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {abierto && (
              <ul className="mt-1 space-y-0.5 border-l border-emerald-900/10 pl-3">
                {entrada.items.map((item) => {
                  const Icono = ICONOS[item.icono];
                  const activo = enlaceActivo(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavegar}
                        aria-current={activo ? "page" : undefined}
                        title={item.descripcion}
                        className={`flex items-center gap-2.5 rounded-r-md py-2 pl-3 pr-2 text-[13px] transition ${
                          activo
                            ? "bg-emerald-50 font-bold text-emerald-900"
                            : "text-emerald-900/65 hover:bg-emerald-50/60 hover:text-emerald-900"
                        }`}
                      >
                        <Icono
                          className={`h-4 w-4 shrink-0 ${
                            activo ? "text-emerald-700" : "text-emerald-900/45"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
