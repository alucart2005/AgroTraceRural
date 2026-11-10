import { ENLACES, NOVEDADES, VERSION } from "@/lib/version";
import NavegacionAyuda from "@/components/NavegacionAyuda";

/** Historial de versiones de la aplicación. */
export default function VersionesPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-emerald-900/10 pb-6">
        <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
          Ayuda · Novedades
        </p>
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[36px]">
          Novedades y versiones
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
          Qué cambió en cada ciclo y qué versión está en producción ahora.
        </p>
        <NavegacionAyuda className="mt-6" />
      </header>

      <section className="rounded-card border border-emerald-900/10 bg-superficie p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/55">
          Versión en producción
        </p>
        <p className="mt-1 font-display text-3xl font-semibold text-emerald-950">
          v{VERSION}
        </p>
      </section>

      <ol className="space-y-6">
        {NOVEDADES.map((novedad) => (
          <li
            key={novedad.version}
            className="rounded-card border border-emerald-900/10 bg-superficie p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-emerald-950">
                v{novedad.version}
                <span className="ml-3 text-sm font-normal text-emerald-900/50">
                  {novedad.ciclo} · {novedad.fecha}
                </span>
              </h2>
            </div>
            <p className="mt-1 font-medium text-emerald-900/80">{novedad.titulo}</p>
            <ul className="mt-4 grid gap-2">
              {novedad.cambios.map((cambio) => (
                <li
                  key={cambio}
                  className="flex gap-3 text-sm leading-relaxed text-emerald-900/75"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
                  />
                  <span>{cambio}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="text-sm text-emerald-900/60">
        El historial completo está en{" "}
        <a
          href={ENLACES.repositorio}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-emerald-700 underline underline-offset-4"
        >
          el repositorio del proyecto
        </a>
        .
      </p>
    </div>
  );
}
