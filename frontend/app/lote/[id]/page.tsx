"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lote, Verificacion } from "@/lib/types";
import { modoDemoActivo, obtenerLote, verificarLote } from "@/lib/api";
import AvisoModoDemo from "@/components/AvisoModoDemo";
import VerificarIntegridad from "@/components/VerificarIntegridad";
import Timeline from "@/components/Timeline";
import CarruselFotos from "@/components/CarruselFotos";
import {
  IconoCalendario,
  IconoCantidad,
  IconoCheckCircle,
  IconoDescripcion,
  IconoInfo,
  IconoProductor,
  IconoUbicacion,
} from "@/components/icons";

/** Estado de la verificación on-chain, tal como lo devuelve /api/verify. */
type EstadoVerificacion = "verificando" | "verificado" | "noverificado" | "nodisponible";

function estadoDe(v: Verificacion | null | undefined): EstadoVerificacion {
  if (v === undefined) return "verificando";
  if (v === null) return "nodisponible";
  return v.verificado ? "verificado" : "noverificado";
}

/** Banner superior del mockup: solo afirma lo que la verificación证明了. */
function BannerVerificacion({ estado }: { estado: EstadoVerificacion }) {
  if (estado === "verificando") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white px-4 py-3">
        <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-emerald-100" />
        <div>
          <p className="text-lg font-bold text-emerald-950">Verificando lote…</p>
          <p className="text-sm text-emerald-900/70">
            Consultando la huella SHA-256 en Stellar Testnet.
          </p>
        </div>
      </div>
    );
  }

  if (estado === "verificado") {
    return (
      <div className="flex items-center gap-4 rounded-card border border-emerald-700/25 bg-emerald-50 px-5 py-4">
        <span className="sello">
          <IconoCheckCircle className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-[22px] font-semibold leading-tight tracking-tight text-emerald-950">
            Lote verificado
          </p>
          <p className="text-sm text-emerald-800/80">
            Información íntegra y registrada
          </p>
        </div>
      </div>
    );
  }

  if (estado === "noverificado") {
    return (
      <div className="flex items-center gap-4 rounded-card border border-red-300/50 bg-red-50 px-5 py-4">
        <span className="sello bg-red-500">
          <IconoCheckCircle className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-[22px] font-semibold leading-tight tracking-tight text-red-900">
            Lote no verificado
          </p>
          <p className="text-sm text-red-800/80">
            La huella calculada no coincide con la anclada en Stellar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-card border border-amber-400/50 bg-amber-50 px-5 py-4">
      <span className="sello bg-amber-500">
        <IconoCheckCircle className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-[22px] font-semibold leading-tight tracking-tight text-amber-900">
          Verificación no disponible
        </p>
        <p className="text-sm text-amber-900/80">
          No se pudo consultar el backend o Stellar Testnet.
        </p>
      </div>
    </div>
  );
}

function BadgeEstado({ estado }: { estado: EstadoVerificacion }) {
  if (estado === "verificado") {
    return (
      <span className="badge whitespace-nowrap bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/30">
        Verificado en blockchain
      </span>
    );
  }
  if (estado === "noverificado") {
    return (
      <span className="badge whitespace-nowrap bg-red-100 text-red-700 ring-1 ring-red-500/30">
        No verificado
      </span>
    );
  }
  if (estado === "verificando") {
    return (
      <span className="badge whitespace-nowrap bg-emerald-50 text-emerald-900/60">
        Verificando…
      </span>
    );
  }
  return (
    <span className="badge whitespace-nowrap bg-amber-100 text-amber-800 ring-1 ring-amber-500/30">
      Verificación no disponible
    </span>
  );
}

export default function LotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [lote, setLote] = useState<Lote | null | undefined>(undefined);
  const [demo, setDemo] = useState(false);
  const [verificacion, setVerificacion] = useState<
    Verificacion | null | undefined
  >(undefined);
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  useEffect(() => {
    obtenerLote(id).then((l) => {
      // Se lee inmediatamente después del await, antes de que otra llamada
      // pueda reemplazar el marcador.
      setDemo(modoDemoActivo());
      setLote(l);
      if (l) {
        // La verificación se dispara sola para poder pintar el banner honesto.
        verificarLote(l.codigo).then(setVerificacion);
      }
    });
  }, [id]);

  if (lote === undefined) {
    return <p className="text-sm text-emerald-900/60">Consultando lote…</p>;
  }

  // HU-02 escenario 2: lote inexistente o QR alterado.
  if (lote === null) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card border-red-400/40 bg-red-50 text-center">
          <p className="text-4xl">⛔</p>
          <h1 className="mt-2 text-2xl font-bold text-red-900">
            Lote no encontrado
          </h1>
          <p className="mt-2 text-sm text-red-800">
            El código <strong>{id}</strong> no corresponde a ningún lote activo
            en el sistema. El lote no existe o el código QR no es auténtico.
          </p>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-semibold text-emerald-700 underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    );
  }

  const estado = estadoDe(verificacion);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {(demo || lote.demo) && (
        <AvisoModoDemo
          detalle={
            lote.demo
              ? "este lote es un ejemplo incluido con la aplicación"
              : "el backend no respondió, así que se muestra una copia guardada en tu navegador"
          }
        />
      )}

      <BannerVerificacion estado={estado} />

      <section className="card space-y-5">
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-emerald-950">
            Lote {lote.codigo}
          </h1>
          <p className="mt-1 text-sm text-emerald-900/70">
            {lote.linea_productiva}
          </p>
        </div>

        <CarruselFotos fotos={lote.fotos} alt={`Evidencia del lote ${lote.codigo}`} />

        <dl className="divide-y divide-emerald-900/10">
          <div className="flex items-start gap-3 py-2.5">
            <IconoProductor className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Productor
            </dt>
            <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
              {lote.finca}
            </dd>
          </div>

          <div className="flex items-start gap-3 py-2.5">
            <IconoUbicacion className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Ubicación
            </dt>
            <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
              {lote.municipio}
            </dd>
          </div>

          <div className="flex items-start gap-3 py-2.5">
            <IconoCalendario className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Fecha de producción
            </dt>
            <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
              {lote.fecha_cosecha}
            </dd>
          </div>

          {lote.fecha_postura && lote.fecha_postura !== lote.fecha_cosecha && (
            <div className="flex items-start gap-3 py-2.5">
              <IconoCalendario className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
                Fecha de postura
              </dt>
              <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
                {lote.fecha_postura}
              </dd>
            </div>
          )}

          <div className="flex items-start gap-3 py-2.5">
            <IconoCantidad className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Cantidad
            </dt>
            <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
              {lote.cantidad} {lote.unidad}
            </dd>
          </div>

          <div className="flex items-start gap-3 py-2.5">
            <IconoDescripcion className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Descripción
            </dt>
            <dd className="min-w-0 flex-1 text-right text-sm text-emerald-900/75">
              {lote.linea_productiva}
            </dd>
          </div>

          <div className="flex items-start gap-3 py-2.5">
            <IconoCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <dt className="w-32 shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-950">
              Estado
            </dt>
            <dd className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <BadgeEstado estado={estado} />
              <button
                type="button"
                onClick={() => setDetalleAbierto((v) => !v)}
                aria-expanded={detalleAbierto}
                aria-label="Ver detalle de la verificación"
                title="Ver detalle de la verificación"
                className="rounded-full p-1 text-emerald-700 transition hover:bg-emerald-50"
              >
                <IconoInfo className="h-4 w-4" />
              </button>
            </dd>
          </div>
        </dl>

        {detalleAbierto && (
          <VerificarIntegridad lote={lote} inicial={verificacion} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900/10 pt-4">
          <p className="text-xs text-emerald-900/50">
            Registrado el {lote.created_at.slice(0, 10)}
          </p>
          <Link href={`/lote/${lote.codigo}/etiqueta`} className="btn-secondary no-print">
            Ver etiqueta QR
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-emerald-950">
          Evidencias del lote
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {lote.fotos.map((f, i) => (
            <a
              key={`${i}-${f.slice(0, 24)}`}
              href={f}
              target="_blank"
              rel="noreferrer"
              title={lote.evidencias[i]?.nombre ?? `Evidencia ${i + 1}`}
              className="block overflow-hidden rounded-lg ring-1 ring-emerald-900/10 transition hover:ring-emerald-600/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f}
                alt={`Evidencia ${i + 1} del lote ${lote.codigo}`}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
        {lote.fotos.length === 0 && (
          <p className="text-sm text-emerald-900/60">Sin fotos disponibles.</p>
        )}
        <p className="text-xs text-emerald-900/50">
          Evidencias:{" "}
          {lote.evidencias.map((e) => `${e.nombre} (${e.tamano} bytes)`).join(", ") || "—"}
        </p>
      </section>

      <section className="card">
        <h2 className="mb-5 font-display text-[22px] font-semibold tracking-tight text-emerald-950">
          Historial del lote
        </h2>
        <Timeline eventos={lote.eventos} />
      </section>
    </div>
  );
}
