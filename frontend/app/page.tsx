import Link from "next/link";
import Buscador from "@/components/Buscador";
import Logo from "@/components/Logo";
import {
  IconoCapas,
  IconoCheckCircle,
  IconoEvidencias,
  IconoHistorial,
} from "@/components/icons";

/** Datos reales del lote de ejemplo (producción) para el pasaporte del hero. */
const LOTE = {
  codigo: "HUE-2026-008",
  linea: "Huevos Guarumo",
  cantidad: 35,
  unidad: "cubetas",
  cosecha: "2026-10-25",
  finca: "Finca Guarumo",
  municipio: "Cáceres, Antioquia",
  foto: "https://pub-7266506c2285455391c094f81085c086.r2.dev/evidencias/68eeee09-7510-4fa6-8f79-ea0b958d2eda/00_ATR-3.jpeg",
};

const pasos = [
  {
    n: "1",
    titulo: "Registro del lote",
    texto:
      "El productor ingresa fecha, línea productiva y cantidad, y adjunta una foto de evidencia.",
    href: "/productor/nuevo",
    hu: "HU-01",
  },
  {
    n: "2",
    titulo: "Hash y ancla en Stellar",
    texto:
      "El sistema calcula el SHA-256 de los datos y ancla la huella en Stellar Testnet (solo el hash).",
    href: "/lote/HUE-2026-008",
    hu: "HU-03",
  },
  {
    n: "3",
    titulo: "Etiqueta QR imprimible",
    texto:
      "Se genera un QR único por cubeta que enlaza a la página pública del lote.",
    href: "/lote/HUE-2026-008/etiqueta",
    hu: "HU-04",
  },
  {
    n: "4",
    titulo: "Consulta del consumidor",
    texto:
      "El cliente escanea el QR y ve origen, fecha, fotos y la línea de tiempo del lote.",
    href: "/lote/HUE-2026-008",
    hu: "HU-02 · HU-05",
  },
];

const accesos = [
  {
    titulo: "Catálogo de productos",
    texto:
      "Líneas productivas registradas con su volumen acumulado y los lotes de cada una.",
    href: "/productor/productos",
    icono: IconoCapas,
  },
  {
    titulo: "Galería de evidencias",
    texto:
      "Todas las fotos que respaldan tus lotes, con su archivo y su ficha.",
    href: "/productor/evidencias",
    icono: IconoEvidencias,
  },
  {
    titulo: "Cadena de custodia",
    texto:
      "Registra clasificación, empaque y despacho para que el distribuidor vea la línea de tiempo.",
    href: "/productor/lote/HUE-2026-008/eventos",
    icono: IconoHistorial,
  },
];

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero: a la izquierda el relato, a la derecha el objeto real del
          dominio — la etiqueta del lote verificado. */}
      <section className="grid items-start gap-8 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-14 lg:gap-y-0 lg:[grid-template-areas:'hero_passport'_'search_search']">
        <div className="space-y-5 lg:[grid-area:hero] lg:space-y-6">
          {/* En móvil el header ya muestra la marca: aquí solo en escritorio. */}
          <div className="hidden lg:flex">
            <Logo tamano="lg" />
          </div>
          <p className="text-[13px] text-emerald-900/70 sm:text-sm">
            Finca Guarumo, Cáceres (Antioquia), Colombia
          </p>
          <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-emerald-950 sm:text-[42px] lg:text-[54px] lg:leading-[1.04]">
            Del campo al cliente, con trazabilidad verificable
          </h1>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-emerald-900/75 sm:text-lg">
            Un pasaporte digital por cubeta: la foto de la evidencia se queda
            fuera de la red, su huella{" "}
            <strong className="font-semibold text-emerald-950">SHA-256</strong>{" "}
            queda anclada en{" "}
            <strong className="font-semibold text-emerald-950">
              Stellar Testnet
            </strong>{" "}
            y un QR lleva al comprador hasta el origen.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link href="/productor/nuevo" className="btn-primary w-full sm:w-auto">
              Registrar lote
            </Link>
            <Link
              href="/lote/HUE-2026-008"
              className="btn-secondary w-full sm:w-auto"
            >
              <IconoCheckCircle className="h-4 w-4" />
              Ver lote verificado
            </Link>
            {/* En móvil el buscador va justo debajo: el enlace sobra. */}
            <Link
              href="/#buscar"
              className="hidden text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline sm:inline"
            >
              Consultar un lote
            </Link>
          </div>

          {/* Cifras: en pantalla angosta, una línea; en escritorio, columnas. */}
          <p className="border-t border-emerald-900/10 pt-4 text-[13px] leading-relaxed text-emerald-900/70 sm:hidden">
            <strong className="font-semibold text-emerald-950">8 campos</strong>{" "}
            en la huella ·{" "}
            <strong className="font-semibold text-emerald-950">1 XLM</strong> por
            ancla ·{" "}
            <strong className="font-semibold text-emerald-950">3–5 s</strong> de
            confirmación
          </p>
          <dl className="hidden max-w-lg grid-cols-3 gap-4 border-t border-emerald-900/10 pt-5 text-sm sm:grid">
            <div>
              <dt className="text-emerald-900/55">Campos en la huella</dt>
              <dd className="font-display text-2xl font-semibold text-emerald-950">8</dd>
            </div>
            <div>
              <dt className="text-emerald-900/55">Transacción</dt>
              <dd className="font-display text-2xl font-semibold text-emerald-950">1 XLM</dd>
            </div>
            <div>
              <dt className="text-emerald-900/55">Confirmación</dt>
              <dd className="font-display text-2xl font-semibold text-emerald-950">
                3–5 s
              </dd>
            </div>
          </dl>
        </div>

        {/* En móvil el buscador va antes que el pasaporte: primero la acción,
            después la demostración. En escritorio, el buscador baja a una fila
            de ancho completo. */}
        <div className="lg:[grid-area:search] lg:mt-14">
          <Buscador />
        </div>

        {/* El pasaporte del lote: la pieza que el consumidor escanea. */}
        <Link
          href={`/lote/${LOTE.codigo}`}
          className="group block rounded-card border border-emerald-900/10 bg-superficie p-4 transition hover:border-emerald-700/40 sm:p-5 lg:[grid-area:passport]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-emerald-900/60">
              Pasaporte del lote
            </p>
            <span className="sello">
              <IconoCheckCircle className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOTE.foto}
              alt="Evidencia fotográfica del lote HUE-2026-008"
              className="aspect-[3/2] w-full object-cover sm:aspect-[4/3]"
            />
          </div>
          <p className="mt-4 font-display text-[26px] font-semibold leading-none tracking-tight text-emerald-950">
            {LOTE.codigo}
          </p>
          <p className="mt-1 text-sm text-emerald-900/70">{LOTE.linea}</p>
          <dl className="mt-4 divide-y divide-emerald-900/10 border-t border-emerald-900/10 text-sm">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-emerald-900/60">Productor</dt>
              <dd className="font-medium text-emerald-950">{LOTE.finca}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-emerald-900/60">Cantidad</dt>
              <dd className="font-medium text-emerald-950">
                {LOTE.cantidad} {LOTE.unidad}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-emerald-900/60">Cosecha</dt>
              <dd className="font-medium text-emerald-950">{LOTE.cosecha}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm font-semibold text-emerald-700 group-hover:underline">
            Ver la ficha completa
          </p>
        </Link>
      </section>

      {/* El flujo sí es una secuencia: los números ordenan pasos reales. */}
      <section className="space-y-4 sm:space-y-5">
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-emerald-950 sm:text-[26px]">
          El flujo de trazabilidad
        </h2>
        <ol className="border-t border-emerald-900/10">
          {pasos.map((p) => (
            <li key={p.n}>
              <Link
                href={p.href}
                className="group block border-b border-emerald-900/10 py-4 transition hover:bg-emerald-50/40 sm:grid sm:grid-cols-[3rem_minmax(0,15rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 sm:py-5"
              >
                <span className="flex items-baseline gap-3 sm:contents">
                  <span className="font-display text-lg font-semibold text-emerald-300">
                    {p.n}
                  </span>
                  <span className="font-medium text-emerald-950 group-hover:underline">
                    {p.titulo}
                  </span>
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-emerald-900/70 sm:mt-0">
                  {p.texto}
                </span>
                <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/40 sm:mt-0 sm:text-right">
                  {p.hu}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4 sm:space-y-5">
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-emerald-950 sm:text-[26px]">
          Todo el sistema del productor
        </h2>
        <ul className="grid gap-x-10 gap-y-1 border-t border-emerald-900/10 md:grid-cols-3">
          {accesos.map(({ titulo, texto, href, icono: Icono }) => (
            <li key={titulo} className="border-b border-emerald-900/10">
              <Link href={href} className="group flex items-start gap-3 py-4 sm:py-5">
                <Icono className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <span>
                  <span className="block font-medium text-emerald-950 group-hover:underline">
                    {titulo}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-emerald-900/70">
                    {texto}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-l-2 border-emerald-600 pl-5 sm:pl-6">
        <h2 className="font-display text-[20px] font-semibold tracking-tight text-emerald-950 sm:text-[22px]">
          Por qué la blockchain aquí
        </h2>
        <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-emerald-900/75 sm:text-sm">
          Los archivos pesados —las fotos— nunca van a la blockchain: se guardan
          en almacenamiento externo. En Stellar <em>solo</em> viaja la huella
          SHA-256 de 32 bytes dentro del <em>memo</em> de una transacción. Así
          productor, consumidor y autoridad sanitaria pueden auditar de forma
          independiente que los registros no fueron alterados, con costos casi
          nulos y confirmación en 3–5 segundos.
        </p>
        <p className="mt-4 text-sm">
          <Link
            href="/lote/HUE-2026-008"
            className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
          >
            Probar la verificación de integridad
          </Link>
        </p>
      </section>
    </div>
  );
}
