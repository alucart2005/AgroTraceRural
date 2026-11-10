"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconoBuscar } from "@/components/icons";

/**
 * HU-05 — el distribuidor ingresa el identificador del lote en el buscador
 * de la plataforma y accede a su detalle. Si el código no existe, la página
 * del lote muestra la alerta correspondiente.
 */
export default function Buscador({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (!limpio) return;
    router.push(`/lote/${encodeURIComponent(limpio)}`);
  }

  if (compacto) {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="search"
          className="input"
          placeholder="HUE-2026-008"
          aria-label="Código del lote"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary shrink-0">
          Buscar
        </button>
      </form>
    );
  }

  return (
    <section
      id="buscar"
      className="grid gap-6 rounded-card border border-emerald-900/10 bg-white p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:items-center md:p-8"
    >
      <div>
        <h2 className="font-display text-[24px] font-semibold tracking-tight text-emerald-950">
          Consultar un lote
        </h2>
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-emerald-900/70">
          Escribe el código impreso bajo el QR de la cubeta. Verás el origen, las
          fotos y la comprobación de la huella en Stellar.
        </p>
        <p className="mt-3 text-sm text-emerald-900/60">
          ¿No tienes un código a mano?{" "}
          <button
            type="button"
            className="font-semibold text-emerald-700 underline underline-offset-4"
            onClick={() => router.push("/lote/HUE-2026-008")}
          >
            Prueba con HUE-2026-008
          </button>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-900/40" />
          <input
            type="search"
            className="input pl-9 font-mono uppercase tracking-wide"
            placeholder="HUE-2026-008"
            aria-label="Código del lote"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Ver el lote
        </button>
      </form>
    </section>
  );
}
