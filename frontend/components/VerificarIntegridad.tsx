"use client";

import { useEffect, useState } from "react";
import type { Lote, Verificacion } from "@/lib/types";
import { verificarLote } from "@/lib/api";

function trunc(hex: string | null, n = 16): string {
  if (!hex) return "—";
  return hex.length > n * 2 ? `${hex.slice(0, n)}…` : hex;
}

export default function VerificarIntegridad({
  lote,
  inicial,
}: {
  lote: Lote;
  /**
   * Resultado de una verificación ya realizada (la ficha la dispara al cargar
   * para pintar el banner). Sirve para mostrar el detalle sin obligar a
   * pulsar «Verificar ahora» otra vez. ``undefined`` = sin verificación previa.
   */
  inicial?: Verificacion | null;
}) {
  const [estado, setEstado] = useState<
    "idle" | "verificando" | "ok" | "error" | "fallo"
  >("idle");
  const [resultado, setResultado] = useState<Verificacion | null>(null);

  // Se refleja la verificación previa en cuanto llega (sin Dispararla otra vez).
  useEffect(() => {
    if (inicial === undefined) return;
    setResultado(inicial);
    if (inicial === null) {
      // Sin backend/Stellar no se puede afirmar nada: se marca como no disponible.
      setEstado("fallo");
    } else if (inicial.verificado) {
      setEstado("ok");
    } else {
      setEstado(inicial.error ? "fallo" : "error");
    }
  }, [inicial]);

  async function verificar() {
    setEstado("verificando");
    const r = await verificarLote(lote.codigo);
    setResultado(r);
    if (r?.verificado) {
      setEstado("ok");
    } else if (!r || r.error) {
      // null = backend/Stellar inaccesible; error = falla de infraestructura.
      // En ninguno de los dos casos se afirma "alterado".
      setEstado("fallo");
    } else {
      setEstado("error");
    }
  }

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-900">
            🔒 Verificar integridad on-chain
          </h2>
          <p className="mt-1 text-sm text-emerald-900/70">
            Recalcula el hash SHA-256 de los datos del lote y la cadena de
            custodia de sus eventos, y los compara con lo registrado en{" "}
            <strong>Stellar Testnet</strong>.
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
            {/* HU-28: el hash del lote puede coincidir y aun así haber un
                evento inyectado o borrado; aquí se muestra que la cadena
                completa también se recalculó. */}
            <div>
              <dt className="font-semibold text-emerald-900">
                Cadena de custodia
              </dt>
              <dd className="font-mono text-xs">
                {resultado.eventos_verificados ?? 0} evento
                {(resultado.eventos_verificados ?? 0) === 1 ? "" : "s"}{" "}
                encadenado
                {(resultado.eventos_verificados ?? 0) === 1 ? "" : "s"} sin
                alteraciones
                {resultado.hash_cadena && (
                  <span className="block break-all text-emerald-900/60">
                    eslabón final: {trunc(resultado.hash_cadena, 16)}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {resultado.cache?.hit && (
            <p className="mt-2 text-xs text-emerald-800/70">
              Resultado on-chain servido desde caché (hace{" "}
              {resultado.cache.edad} s). El hash y la cadena se recalcularon
              ahora mismo.
            </p>
          )}
          {resultado.demo && (
            <p className="mt-2 text-xs text-emerald-800/70">
              Modo demo: el ancla está simulada en el navegador. Con el backend
              activo se consulta Stellar Testnet real.
            </p>
          )}
        </div>
      )}

      {estado === "fallo" && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-50 p-4">
          <p className="badge bg-amber-600 text-white">
            ⚠️ Verificación no disponible
          </p>
          <p className="mt-2 text-sm text-amber-900">
            {resultado?.error
              ? `No se pudo completar la verificación on-chain: ${resultado.error}`
              : "No se pudo consultar el backend o Stellar Testnet en este momento. Intenta de nuevo en unos segundos."}
          </p>
          {resultado && (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="font-semibold text-amber-900">
                  Hash registrado en Stellar
                </dt>
                <dd className="break-all font-mono text-xs">
                  {resultado.hash_registrado ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-amber-900">
                  Hash recalculado ahora
                </dt>
                <dd className="break-all font-mono text-xs">
                  {resultado.hash_calculado}
                </dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {estado === "error" && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-50 p-4">
          <p className="badge bg-red-600 text-white">
            🚨 Información alterada
          </p>
          {resultado &&
          resultado.hash_calculado === resultado.hash_registrado &&
          resultado.cadena_valida === false ? (
            <p className="mt-2 text-sm text-red-800">
              Los datos del lote siguen intactos, pero el{" "}
              <strong>historial de custodia</strong> no encadena: el evento
              nº{" "}
              {resultado.indice_alterado != null
                ? resultado.indice_alterado + 1
                : "?"}{" "}
              fue modificado, borrado o insertado después del registro. El hash
              del lote no cubre los eventos, y por eso la cadena los protege
              aparte.
            </p>
          ) : (
            <p className="mt-2 text-sm text-red-800">
              El hash calculado no coincide con el registrado. Los datos del
              lote fueron modificados después del anclaje.
            </p>
          )}
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
              {resultado.cadena_valida === false && (
                <div>
                  <dt className="font-semibold text-red-900">
                    Cadena de custodia
                  </dt>
                  <dd className="font-mono text-xs text-red-800">
                    rota en el evento nº{" "}
                    {resultado.indice_alterado != null
                      ? resultado.indice_alterado + 1
                      : "?"}{" "}
                    de {resultado.eventos_verificados ?? 0}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
