"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cerrarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#buscar", label: "Consultar lote" },
  { href: "/productor", label: "Productor" },
  { href: "/productor/nuevo", label: "Registrar lote" },
  { href: "/lote/HUE-2026-008", label: "Lote demo" },
];

function linkActivo(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  const base = href.replace(/\/HUE-.*$/, "").replace(/\/$/, "") || "/";
  return pathname.startsWith(base);
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Se relee en cada ruta: el login en /login y el logout deben verse al instante.
  useEffect(() => {
    setUsuario(leerSesion()?.usuario ?? null);
  }, [pathname]);

  // Navegando desde el menú móvil: se cierra solo.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  // Escape y clic fuera del header cierran el menú.
  useEffect(() => {
    if (!menuAbierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuAbierto(false);
    }
    function onMouseDown(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [menuAbierto]);

  function salir() {
    cerrarSesion();
    setUsuario(null);
    setMenuAbierto(false);
    router.push("/");
    router.refresh();
  }

  const claseLink = (activo: boolean) =>
    `rounded-lg px-3 py-2 transition ${
      activo
        ? "bg-emerald-700 text-white"
        : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
    }`;

  const claseLinkMovil = (activo: boolean) =>
    `block rounded-lg px-3 py-3 text-base transition ${
      activo
        ? "bg-emerald-700 text-white"
        : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
    }`;

  const sesionMovil = usuario ? (
    <div className="mt-2 flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-3 ring-1 ring-emerald-900/10">
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
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-emerald-950">
        {usuario.nombre || usuario.email}
      </span>
      <button
        onClick={salir}
        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 ring-1 ring-emerald-900/10"
      >
        Salir
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      onClick={() => setMenuAbierto(false)}
      className={`mt-2 block rounded-lg px-3 py-3 text-base font-semibold transition ${
        pathname === "/login"
          ? "bg-emerald-700 text-white"
          : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
      }`}
    >
      Iniciar sesión
    </Link>
  );

  return (
    <header
      ref={headerRef}
      className="no-print sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
          <span className="text-xl">🌱</span>
          <span>AgroTrace Rural</span>
        </Link>

        {/* Escritorio (≥ md): barra horizontal como siempre */}
        <nav className="hidden flex-wrap items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={claseLink(linkActivo(l.href, pathname))}>
              {l.label}
            </Link>
          ))}

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

        {/* Móvil (< md): hamburguesa */}
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          className="rounded-lg p-2 text-emerald-900 transition hover:bg-emerald-50 md:hidden"
        >
          {menuAbierto ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Panel desplegable móvil */}
      {menuAbierto && (
        <nav
          id="menu-movil"
          className="border-t border-emerald-900/10 bg-white px-4 py-3 md:hidden"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={claseLinkMovil(linkActivo(l.href, pathname))}>
              {l.label}
            </Link>
          ))}
          {sesionMovil}
        </nav>
      )}
    </header>
  );
}
