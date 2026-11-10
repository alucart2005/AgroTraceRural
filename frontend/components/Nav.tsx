"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cerrarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";
import Logo from "@/components/Logo";
import MenuNavegacion from "@/components/MenuNavegacion";
import MenuAyuda from "@/components/MenuAyuda";
import ThemeToggle from "@/components/ThemeToggle";

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

  const sesionMovil = usuario ? (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-3 ring-1 ring-emerald-900/10">
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
        className="rounded-md bg-superficie px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 ring-1 ring-emerald-900/10"
      >
        Salir
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      onClick={() => setMenuAbierto(false)}
      className={`mt-3 block rounded-lg px-3 py-3 text-base font-semibold transition ${
        pathname === "/login"
          ? "marca"
          : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
      }`}
    >
      Iniciar sesión
    </Link>
  );

  // En el área del productor el shell de escritorio es el sidebar (mockup del
  // rediseño): la barra horizontal sobra en ≥ md, pero en móvil se conserva.
  const esProductor = pathname.startsWith("/productor");

  return (
    <header
      ref={headerRef}
      className={`no-print sticky top-0 z-40 border-b border-emerald-900/10 bg-superficie/90 backdrop-blur ${
        esProductor ? "md:hidden" : ""
      }`}
    >
      <div className="relative mx-auto flex max-w-5xl items-center justify-center gap-4 px-4 py-3 md:justify-between">
        <Link href="/" aria-label="AgroTrace Rural — ir al inicio">
          <Logo />
        </Link>

        {/* Escritorio (≥ md) fuera del área del productor: barra horizontal. */}
        {!esProductor && (
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href="/"
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                pathname === "/"
                  ? "marca"
                  : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/#buscar"
              className="rounded-lg px-3 py-2 font-semibold text-emerald-900/70 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              Consultar lote
            </Link>
            <Link
              href="/productor"
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                pathname.startsWith("/productor")
                  ? "marca"
                  : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              Productor
            </Link>
            <Link
              href="/productor/nuevo"
              className="rounded-lg px-3 py-2 font-semibold text-emerald-900/70 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              Registrar lote
            </Link>
            <Link
              href="/lote/HUE-2026-008"
              className="rounded-lg px-3 py-2 font-semibold text-emerald-900/70 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              Lote demo
            </Link>
            <ThemeToggle className="ml-1" />
            <MenuAyuda />
          </nav>
        )}

        {/* Móvil (< md): conmutador de tema, ayuda y hamburguesa */}
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 md:hidden">
          <ThemeToggle />
          <MenuAyuda />
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="rounded-lg p-2 text-emerald-900 transition hover:bg-emerald-50"
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
      </div>

      {/* Panel desplegable móvil con el menú completo y sus submenús */}
      {menuAbierto && (
        <nav
          id="menu-movil"
          className="max-h-[80vh] overflow-y-auto border-t border-emerald-900/10 bg-superficie px-4 py-4 md:hidden"
        >
          <MenuNavegacion variante="movil" onNavegar={() => setMenuAbierto(false)} />
          {sesionMovil}
        </nav>
      )}
    </header>
  );
}
