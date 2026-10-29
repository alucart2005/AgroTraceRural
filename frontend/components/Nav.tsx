"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cerrarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#buscar", label: "Consultar lote" },
  { href: "/productor", label: "Productor" },
  { href: "/productor/nuevo", label: "Registrar lote" },
  { href: "/lote/HUE-2027-001", label: "Lote demo" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Se relee en cada ruta: el login en /login y el logout deben verse al instante.
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
    <header className="no-print sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
          <span className="text-xl">🌱</span>
          <span>AgroTrace Rural</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href.replace(/\/HUE-.*$/, "").replace(/\/$/, "") || "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {usuario ? (
            <span className="ml-1 flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-950 ring-1 ring-emerald-900/10">
              {usuario.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={usuario.foto_url}
                  alt={usuario.nombre}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden>👤</span>
              )}
              <span className="max-w-[9rem] truncate text-xs font-semibold">
                {usuario.nombre || usuario.email}
              </span>
              <button
                onClick={salir}
                className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Salir
              </button>
            </span>
          ) : (
            <Link
              href="/login"
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                pathname === "/login"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
              }`}
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
