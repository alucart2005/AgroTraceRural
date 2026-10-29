"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import ProtegerProductor from "@/components/ProtegerProductor";
import { actualizarPerfil } from "@/lib/api";
import { guardarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";

interface Formulario {
  nombre: string;
  cedula: string;
  telefono: string;
  finca: string;
  municipio: string;
}

const VACIO: Formulario = {
  nombre: "",
  cedula: "",
  telefono: "",
  finca: "",
  municipio: "",
};

export default function CompletarPerfilPage() {
  return (
    <ProtegerProductor exigirPerfil={false}>
      <FormularioPerfil />
    </ProtegerProductor>
  );
}

function FormularioPerfil() {
  const router = useRouter();
  const [datos, setDatos] = useState<Formulario>(VACIO);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const sesion = leerSesion();
    if (!sesion) return;
    setUsuario(sesion.usuario);
    // El nombre viene de Google como referencia; el resto se pide completo.
    setDatos({ ...VACIO, nombre: sesion.usuario.nombre ?? "" });
    setListo(true);
  }, []);

  function actualizar(campo: keyof Formulario, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Escenario 3 (HU-07): no se guarda nada con campos vacíos.
    const faltantes = (
      Object.entries(datos) as [keyof Formulario, string][]
    )
      .filter(([, valor]) => !valor.trim())
      .map(([campo]) => LABELS[campo]);
    if (faltantes.length > 0) {
      setError(`Completa: ${faltantes.join(", ")}.`);
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarPerfil({
        nombre: datos.nombre.trim(),
        cedula: datos.cedula.trim(),
        telefono: datos.telefono.trim(),
        finca: datos.finca.trim(),
        municipio: datos.municipio.trim(),
      });
      const sesion = leerSesion();
      if (sesion) guardarSesion({ token: sesion.token, usuario: actualizado });
      router.push("/productor");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudieron guardar tus datos. Intenta de nuevo."
      );
      setGuardando(false);
    }
  }

  if (!listo) {
    return (
      <p className="py-10 text-center text-sm text-emerald-900/60">
        Cargando…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-950">
          Bienvenido a AgroTrace
        </h1>
        <p className="text-sm text-emerald-900/70">
          Antes de registrar tu primer lote, cuéntanos tus datos (HU-07). Los
          usamos para identificar quién respalda cada cosecha.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/60 p-3">
        {usuario?.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={usuario.foto_url}
            alt={usuario.nombre}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-emerald-900/20"
          />
        ) : (
          <span className="text-2xl">👤</span>
        )}
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold text-emerald-950">
            {usuario?.nombre || "Productor"}
          </p>
          <p className="truncate text-xs text-emerald-900/60">
            {usuario?.email} · cuenta de Google verificada
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="nombre">
            Nombre completo *
          </label>
          <input
            id="nombre"
            className="input"
            value={datos.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="Nombre y apellidos"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="cedula">
              Cédula *
            </label>
            <input
              id="cedula"
              className="input"
              value={datos.cedula}
              onChange={(e) => actualizar("cedula", e.target.value)}
              placeholder="Documento de identidad"
              inputMode="numeric"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="telefono">
              Teléfono *
            </label>
            <input
              id="telefono"
              className="input"
              value={datos.telefono}
              onChange={(e) => actualizar("telefono", e.target.value)}
              placeholder="Celular de contacto"
              inputMode="tel"
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="finca">
              Nombre de la finca *
            </label>
            <input
              id="finca"
              className="input"
              value={datos.finca}
              onChange={(e) => actualizar("finca", e.target.value)}
              placeholder="Ej. Finca Guarumo"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="municipio">
              Municipio *
            </label>
            <input
              id="municipio"
              className="input"
              value={datos.municipio}
              onChange={(e) => actualizar("municipio", e.target.value)}
              placeholder="Ej. Cáceres, Antioquia"
              required
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={guardando} className="btn-primary w-full">
          {guardando ? "Guardando…" : "Guardar mis datos"}
        </button>
      </form>
    </div>
  );
}

const LABELS: Record<keyof Formulario, string> = {
  nombre: "nombre completo",
  cedula: "cédula",
  telefono: "teléfono",
  finca: "finca",
  municipio: "municipio",
};
