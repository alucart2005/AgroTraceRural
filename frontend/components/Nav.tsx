"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/#buscar", label: "Consultar lote" },
  { href: "/productor", label: "Productor" },
  { href: "/productor/nuevo", label: "Registrar lote" },
  { href: "/lote/HUE-2027-001", label: "Lote demo" },
];

export default function Nav() {
  const pathname = usePathname();
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
        </nav>
      </div>
    </header>
  );
}
