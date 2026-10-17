"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { EventoTipo, Lote } from "@/lib/types";
import { EVENTO_LABELS } from "@/lib/types";
import { agregarEvento, modoDemoActivo, obtenerLote } from "@/lib/api";
import AvisoModoDemo from "@/components/AvisoModoDemo";
import Timeline from "@/components/Timeline";

const TIPOS_REGISTRABLES: Exclude<EventoTipo, "cosecha">[] = [
  "clasificacion",
  "empaque",
  "despacho",
];

function hoyHoraLocal(): { fecha: string; hora: string } {
  const now = new Date();
  const fecha = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  return { fecha, hora: now.toTimeString().slice(0, 5) };
}

/**
 * HU-05 — el productor registra los eventos de la cadena de custodia
 * (clasificación, empaque, despacho) para que el distribuidor vea la
 * línea de tiempo completa en la ficha pública.
 */
export default function EventosLotePage({ codigo }: { codigo: string }) {
  const [lote, setLote] = useState<Lote | null | undefined>(undefined);
  const [demo, setDemo] = useState(false);
  const [tipo, setTipo] = useState<EventoTipo>("clasificacion");
  const [{ fecha, hora }, setMomento] = useState(hoyHoraLocal());
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const recargar = useCallback(() => {
    obtenerLote(codigo).then((l) => {
      // Se lee inmediatamente después del await, antes de que otra llamada
      // pueda reemplazar el marcador.
      setDemo(modoDemoActivo());
      setLote(l);
    });
  }, [codigo]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!descripcion.trim()) {
      setError("Escribe una descripción del evento.");
      return;
    }
    const momento = new Date(`${fecha}T${hora || "00:00"}`);
    if (Number.isNaN(momento.getTime())) {
      setError("Selecciona una fecha y hora válidas.");
      return;
    }
    setEnviando(true);
    try {
      const actualizado = await agregarEvento(codigo, {
        tipo,
        fecha: momento.toISOString(),
        descripcion: descripcion.trim(),
      });
      if (!actualizado) {
        setError("No se encontró el lote para guardar el evento.");
        return;
      }
      setLote(actualizado);
      setDescripcion("");
      setMomento(hoyHoraLocal());
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? `No se pudo registrar el evento: ${err.message}`
          : "No se pudo registrar el evento. Intenta de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (lote === undefined) {
    return <p className="text-sm text-emerald-900/60">Cargando lote…</p>;
  }

  if (lote === null) {
    return (
      <div className="card border-red-400/40 bg-red-50 text-center">
        <h1 className="text-xl font-bold text-red-900">Lote no encontrado</h1>
        <p className="mt-2 text-sm">
          El código <strong>{codigo}</strong> no existe.
        </p>
        <Link href="/productor" className="btn-secondary mt-4">
          Volver a mis lotes
        </Link>
      </div>
    );
  }

  const registrados = new Set(lote.eventos.map((e) => e.tipo));
  const pendientes = TIPOS_REGISTRABLES.filter((t) => !registrados.has(t));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {lote.codigo} · {lote.linea_productiva} · {lote.cantidad} {lote.unidad}
          </p>
          <h1 className="text-3xl font-bold text-emerald-950">
            Cadena de custodia
          </h1>
          <p className="text-sm text-emerald-900/70">
            HU-05 — registra la clasificación, el empaque y el despacho para que
            el distribuidor vea la línea de tiempo completa.
          </p>
        </div>
        <Link href={`/lote/${lote.codigo}`} className="btn-secondary">
          Ver ficha pública
        </Link>
      </div>

      {(demo || lote.demo) && (
        <AvisoModoDemo
          detalle={
            lote.demo
              ? "este lote es un ejemplo incluido con la aplicación"
              : "el backend no respondió; este historial se guarda solo en tu navegador"
          }
        />
      )}

      <section className="card">
        <h2 className="mb-4 text-xl font-bold text-emerald-950">
          📜 Historial actual
        </h2>
        <Timeline eventos={lote.eventos} />
        {pendientes.length > 0 && (
          <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
            ⏳ Faltan eventos por registrar:{" "}
            {pendientes.map((t) => EVENTO_LABELS[t]).join(", ")}.
          </p>
        )}
      </section>

      <form onSubmit={onSubmit} className="card space-y-4">
        <h2 className="text-xl font-bold text-emerald-950">+ Registrar evento</h2>

        <div>
          <label className="label" htmlFor="tipo">
            Tipo de evento
          </label>
          <select
            id="tipo"
            className="input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as EventoTipo)}
          >
            {TIPOS_REGISTRABLES.map((t) => (
              <option key={t} value={t}>
                {EVENTO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fecha">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              className="input"
              value={fecha}
              onChange={(e) => setMomento((m) => ({ ...m, fecha: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="hora">
              Hora
            </label>
            <input
              id="hora"
              type="time"
              className="input"
              value={hora}
              onChange={(e) => setMomento((m) => ({ ...m, hora: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="descripcion">
            Descripción
          </label>
          <input
            id="descripcion"
            type="text"
            className="input"
            placeholder="Clasificación por tamaño y revisión de calidad"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={enviando} className="btn-primary w-full">
          {enviando ? "Guardando…" : "Guardar evento"}
        </button>
      </form>
    </div>
  );
}
