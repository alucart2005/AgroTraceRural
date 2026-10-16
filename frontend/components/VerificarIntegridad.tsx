"use client";

import { useState } from "react";
import type { Lote, Verificacion } from "@/lib/types";
import { verificarLote } from "@/lib/api";

function trunc(hex: string | null, n = 16): string {
  if (!hex) return "—";
  return hex.length > n * 2 ? `${hex.slice(0, n)}…` : hex;
}

export default function VerificarIntegridad({ lote }: { lote: Lote }) {
  const [estado, setEstado] = useState<"idle" | "verificando" | "ok" | "error">(
    "idle"
  );
  const [resultado, setResultado] = useState<Verificacion | null>(null);

  async function verificar() {
    setEstado("verificando");
    const r = await verificarLote(lote.codigo);
    setResultado(r);
    setEstado(r?.verificado ? "ok" : "error");
  }

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900">
            🔒 Verificar integridad on-chain
          </h2>
          <p className="mt-1 text-sm text-emerald-900/70">
            Recalcula el hash SHA-256 de los datos del lote y lo compara con el
            hash registrado en <strong>Stellar Testnet</strong>.
          </p>
        </div>
        <button onClick={verificar} disabled={estado === "verificando"} className="btn-primary shrink-0">
          {estado === "verificando" ? "Verificando…" : "Verificar ahora"}
        </button>
      </div>

      {estado === "ok" && resultado && (
        <div className="mt-4 rounded-xl border border-emerald-600/30 bg-emerald-50 p-4">
          <p className="badge bg-emerald-600 text-white">✅ Información verificada e inalterada</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="font-semibold text-emerald-900">Hash registrado en Stellar</dt>
              <dd className="break-all font-mono text-xs">{resultado.hash_registrado ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-emerald-900">Hash recalculado ahora</dt>
              <dd className="break-all font-mono text-xs">{resultado.hash_calculado}</dd>
            </div>
            <div>
              <dt className="font-semibold text-emerald-900">
                Transacción{resultado.ledger ? ` · ledger ${resultado.ledger}` : ""}
              </dt>
              <dd className="break-all font-mono text-xs">
                {trunc(resultado.tx_hash, 24)}
                {resultado.tx_hash && (
                  <a
                    className="ml-2 text-emerald-700 underline"
                    href={`https://horizon-testnet.stellar.org/transactions/${resultado.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ver en Horizon ↗
                  </a>
                )}
              </dd>
            </div>
          </dl>
          {resultado.demo && (
            <p className="mt-2 text-xs text-emerald-800/70">
              Modo demo: el ancla está simulada en el navegador. Con el backend
              activo se consulta Stellar Testnet real.
            </p>
          )}
        </div>
      )}

      {estado === "error" && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-50 p-4">
          <p className="badge bg-red-600 text-white">🚨 Información alterada</p>
          <p className="mt-2 text-sm text-red-800">
            El hash calculado no coincide con el registrado. Los datos del lote
            fueron modificados después del anclaje.
          </p>
          {resultado && (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="font-semibold text-red-900">Hash registrado</dt>
                <dd className="break-all font-mono text-xs text-red-800">
                  {resultado.hash_registrado ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-red-900">Hash recalculado ahora</dt>
                <dd className="break-all font-mono text-xs text-red-800">
                  {resultado.hash_calculado}
                </dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
