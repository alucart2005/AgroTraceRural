"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
          placeholder="HUE-2027-001"
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
    <section id="buscar" className="card mx-auto max-w-xl text-center">
      <h2 className="text-xl font-bold text-emerald-950">🔍 Consultar un lote</h2>
      <p className="mt-1 text-sm text-emerald-900/70">
        Distribuidor o comprador: escribe el código impreso bajo el QR de la
        cubeta (HU-05).
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          className="input"
          placeholder="HUE-2027-001"
          aria-label="Código del lote"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary shrink-0">
          Ver historial
        </button>
      </form>
      <p className="mt-3 text-xs text-emerald-900/50">
        ¿No tienes a la mano un código? Prueba con{" "}
        <button
          type="button"
          className="font-semibold text-emerald-700 underline"
          onClick={() => router.push("/lote/HUE-2027-001")}
        >
          HUE-2027-001
        </button>
        .
      </p>
    </section>
  );
}
