"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cerrarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";
import Logo from "@/components/Logo";
import MenuNavegacion from "@/components/MenuNavegacion";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Shell del área del productor (desktop ≥ md). En móvil el nav sigue siendo
 * el header con hamburguesa: este componente ni se monta.
 */
export default function SidebarProductor() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    setUsuario(leerSesion()?.usuario ?? null);
  }, [pathname]);

  function salir() {
    cerrarSesion();
    setUsuario(null);
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="no-print hidden w-full shrink-0 flex-col rounded-card border border-emerald-900/10 bg-superficie p-4 md:sticky md:top-6 md:flex md:max-h-[calc(100vh-3rem)] md:w-64 md:self-start">
      <Link
        href="/"
        className="border-b border-emerald-900/10 px-2 pb-4"
        aria-label="Ir al inicio"
      >
        <Logo tamano="lg" />
      </Link>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <MenuNavegacion variante="sidebar" />
      </div>

      <div className="mt-4 border-t border-emerald-900/10 pt-3">
        <div className="flex items-center gap-2">
          <ThemeToggle className="-ml-2" />
          {usuario ? (
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5">
              {usuario.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={usuario.foto_url}
                  alt={usuario.nombre}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden className="text-lg">👤</span>
              )}
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-emerald-950">
                {usuario.nombre || usuario.email}
              </span>
              <button
                onClick={salir}
                className="rounded-md bg-superficie px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-900/10 transition hover:bg-emerald-100"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-secondary w-full">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
