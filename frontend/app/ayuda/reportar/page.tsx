import Link from "next/link";
import { ENLACES, VERSION } from "@/lib/version";
import NavegacionAyuda from "@/components/NavegacionAyuda";

/** Reportar un problema: qué incluir, correo e incidencias. */
export default function ReportarPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-emerald-900/10 pb-6">
        <p className="mb-1.5 text-[13px] font-medium text-emerald-900/55">
          Ayuda · Soporte
        </p>
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950 sm:text-[36px]">
          Reportar un problema
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-900/70">
          Si algo no funciona, si un lote no aparece o si los datos de un
          registro no cuadran, cuéntanoslo. Cada reporte nos sirve para
          corregirlo.
        </p>
        <NavegacionAyuda className="mt-6" />
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-[20px] font-semibold tracking-tight text-emerald-950">
          Qué conviene incluir
        </h2>
        <ul className="grid max-w-[72ch] gap-2">
          {[
            "El código del lote (por ejemplo HUE-2026-008), si el problema tiene que ver con un registro.",
            "Qué estabas haciendo y qué pasó en lugar de lo esperado.",
            "El mensaje exacto que aparece en pantalla, si salió alguno.",
            "Desde qué dispositivo y navegador lo viste.",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-relaxed text-emerald-900/80"
            >
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-emerald-900/10 bg-superficie p-5">
          <h2 className="font-semibold text-emerald-950">Correo</h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900/70">
            Escríbenos y lo revisamos. Respondemos en horario de finca.
          </p>
          <a
            href={`mailto:${ENLACES.correo}?subject=Reporte%20AgroTrace`}
            className="btn-primary mt-4"
          >
            Escribir un correo
          </a>
        </div>

        <div className="rounded-card border border-emerald-900/10 bg-superficie p-5">
          <h2 className="font-semibold text-emerald-950">Incidencia pública</h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900/70">
            Si el problema afecta a varias personas, conviene registrarlo como
            incidencia para que quede documentado.
          </p>
          <a
            href={`${ENLACES.repositorio}/issues/new`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary mt-4"
          >
            Crear una incidencia
          </a>
        </div>
      </section>

      <div className="recuadro recuadro--nota max-w-[72ch]">
        <p className="font-semibold">Antes de reportar</p>
        <p className="mt-1">
          Si la aplicación muestra «Modo demo», el backend no respondió y la
          información que ves está guardada solo en tu navegador. Espera unos
          segundos y vuelve a cargar; si el aviso sigue, repórtalo.
        </p>
      </div>

      <p className="text-sm text-emerald-900/60">
        Versión activa: v{VERSION} ·{" "}
        <Link
          href="/ayuda/versiones"
          className="font-semibold text-emerald-700 underline underline-offset-4"
        >
          Ver el historial de cambios
        </Link>
      </p>
    </div>
  );
}
