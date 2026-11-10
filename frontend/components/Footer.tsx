import Link from "next/link";
import Logo from "@/components/Logo";

const enlaces = [
  {
    titulo: "Consulta",
    items: [
      { label: "Buscar un lote", href: "/#buscar" },
      { label: "Lote verificado", href: "/lote/HUE-2026-008" },
      { label: "Etiqueta QR", href: "/lote/HUE-2026-008/etiqueta" },
    ],
  },
  {
    titulo: "Productor",
    items: [
      { label: "Mis lotes", href: "/productor" },
      { label: "Registrar lote", href: "/productor/nuevo" },
      { label: "Cadena de custodia", href: "/productor/lote/HUE-2026-008/eventos" },
    ],
  },
  {
    titulo: "Catálogo",
    items: [
      { label: "Productos", href: "/productor/productos" },
      { label: "Evidencias", href: "/productor/evidencias" },
      { label: "Mi perfil", href: "/productor/configuracion" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-emerald-900/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-emerald-900/60 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo tamano="lg" />
          <p className="mt-3 max-w-xs">
            Finca Guarumo, Cáceres (Antioquia), Colombia.
          </p>
          <p className="mt-2">
            Trazabilidad con{" "}
            <span className="font-semibold text-emerald-800">
              SHA-256 + Stellar Testnet
            </span>
          </p>
        </div>

        {enlaces.map((columna) => (
          <nav key={columna.titulo} aria-label={columna.titulo}>
            <p className="text-[13px] font-semibold text-emerald-900/80">
              {columna.titulo}
            </p>
            <ul className="mt-3 space-y-1.5">
              {columna.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition hover:text-emerald-900 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
