import Link from "next/link";
import { ENLACES, VERSION } from "@/lib/version";

const secciones = [
  {
    href: "/ayuda/manual",
    titulo: "Manual de usuario",
    texto:
      "Guía paso a paso en español, inglés y portugués: registrar un lote, seguir su cadena de custodia, consultar y verificar.",
    etiqueta: "7 capítulos",
  },
  {
    href: "/ayuda/versiones",
    titulo: "Novedades y versiones",
    texto:
      "Qué cambió en cada ciclo, desde el anclaje en Stellar hasta el diseño actual, con la versión que está en producción.",
    etiqueta: "Historial completo",
  },
  {
    href: "/ayuda/acerca-de",
    titulo: "Acerca de AgroTrace Rural",
    texto:
      "El proyecto, el piloto en Finca Guarumo, cómo se sella un lote y la infraestructura que lo sostiene.",
    etiqueta: "Es · En · Pt",
  },
  {
    href: "/ayuda/reportar",
    titulo: "Reportar un problema",
    texto:
      "Correo de soporte o incidencia pública en el repositorio, con la lista de datos que conviene adjuntar.",
    etiqueta: "Soporte",
  },
];

export default function AyudaPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-emerald-900/10 pb-6">
        <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
          Ayuda
        </p>
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[36px]">
          Centro de ayuda
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
          Todo lo necesario para usar AgroTrace con soltura: la guía completa,
          el historial de cambios, la historia del proyecto y el contacto para
          reportar cualquier cosa.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {secciones.map((seccion) => (
          <li key={seccion.href}>
            <Link
              href={seccion.href}
              className="group flex h-full flex-col rounded-card border border-emerald-900/10 bg-superficie p-5 transition hover:border-emerald-700/40"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/50">
                {seccion.etiqueta}
              </span>
              <span className="mt-1.5 font-display text-[20px] font-semibold tracking-tight text-emerald-950 group-hover:underline">
                {seccion.titulo}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-emerald-900/70">
                {seccion.texto}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-card border border-emerald-900/10 bg-superficie p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[20px] font-semibold tracking-tight text-emerald-950">
            Versión activa
          </h2>
          <p className="font-display text-2xl font-semibold text-emerald-900">
            v{VERSION}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">
          La aplicación se despliega automáticamente: siempre verás aquí la
          versión que está en línea.
        </p>
        <ul className="mt-4 flex flex-wrap gap-4 border-t border-emerald-900/10 pt-3 text-sm">
          <li>
            <a
              href={ENLACES.app}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline underline-offset-4"
            >
              Aplicación
            </a>
          </li>
          <li>
            <a
              href={ENLACES.api}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline underline-offset-4"
            >
              API
            </a>
          </li>
          <li>
            <a
              href={ENLACES.repositorio}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline underline-offset-4"
            >
              Repositorio
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
