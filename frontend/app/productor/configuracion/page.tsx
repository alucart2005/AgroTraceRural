"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { actualizarPerfil, obtenerYo } from "@/lib/api";
import { guardarSesion, leerSesion } from "@/lib/auth";
import type { Usuario } from "@/lib/types";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import ProtegerProductor from "@/components/ProtegerProductor";
import { IconoCheck, IconoUbicacion } from "@/components/icons";

const HAY_API = !!process.env.NEXT_PUBLIC_API_URL;

interface Formulario {
  nombre: string;
  cedula: string;
  telefono: string;
  finca: string;
  municipio: string;
}

const CAMPOS: { key: keyof Formulario; label: string; placeholder: string }[] = [
  { key: "nombre", label: "Nombre completo", placeholder: "Nombre y apellidos" },
  { key: "cedula", label: "Cédula", placeholder: "Documento de identidad" },
  { key: "telefono", label: "Teléfono", placeholder: "Celular de contacto" },
  { key: "finca", label: "Nombre de la finca", placeholder: "Ej. Finca Guarumo" },
  { key: "municipio", label: "Municipio", placeholder: "Ej. Cáceres, Antioquia" },
];

export default function ConfiguracionPage() {
  return (
    <ProtegerProductor exigirPerfil={false}>
      <PanelConfiguracion />
    </ProtegerProductor>
  );
}

function PanelConfiguracion() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [datos, setDatos] = useState<Formulario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const sesion = leerSesion();
    if (sesion) {
      setUsuario(sesion.usuario);
      setDatos({
        nombre: sesion.usuario.nombre ?? "",
        cedula: sesion.usuario.cedula ?? "",
        telefono: sesion.usuario.telefono ?? "",
        finca: sesion.usuario.finca ?? "",
        municipio: sesion.usuario.municipio ?? "",
      });
    }
    // Con backend se refresca el perfil desde la fuente de verdad (HU-07).
    if (!HAY_API) return;
    obtenerYo()
      .then((u) => {
        setUsuario(u);
        setDatos({
          nombre: u.nombre ?? "",
          cedula: u.cedula ?? "",
          telefono: u.telefono ?? "",
          finca: u.finca ?? "",
          municipio: u.municipio ?? "",
        });
      })
      .catch(() => {
        /* se conserva lo que hay en la sesión */
      });
  }, []);

  function actualizar(campo: keyof Formulario, valor: string) {
    setDatos((prev) => (prev ? { ...prev, [campo]: valor } : prev));
    setError(null);
    setGuardado(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!datos) return;
    setError(null);
    setAviso(null);
    setGuardado(false);

    const faltantes = CAMPOS.filter((c) => !datos[c.key].trim()).map(
      (c) => c.label.toLowerCase()
    );
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
      setUsuario(actualizado);
      setGuardado(true);
    } catch (err) {
      setAviso(
        err instanceof Error && err.message
          ? err.message
          : "No se pudieron guardar los cambios. Intenta de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Configuración"
        titulo="Mi perfil"
        descripcion="Estos datos identifican al productor que respalda cada cosecha: viajan con el lote y aparecen en su ficha pública."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={onSubmit} className="card space-y-4">
          <h2 className="text-lg font-bold text-emerald-950">
            Datos del productor
          </h2>

          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3">
            {usuario?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.foto_url}
                alt={usuario.nombre}
                className="h-11 w-11 rounded-full object-cover ring-1 ring-emerald-900/20"
              />
            ) : (
              <span aria-hidden className="text-2xl">👤</span>
            )}
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-emerald-950">
                {usuario?.nombre || "Productor"}
              </p>
              <p className="truncate text-xs text-emerald-900/60">
                {usuario?.email ?? "Sesión de demostración"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS.map((campo) => (
              <div key={campo.key}>
                <label className="label" htmlFor={campo.key}>
                  {campo.label}
                </label>
                <input
                  id={campo.key}
                  className="input"
                  placeholder={campo.placeholder}
                  value={datos?.[campo.key] ?? ""}
                  onChange={(e) => actualizar(campo.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {!HAY_API && (
            <p className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
              🧪 Modo demo: no hay backend configurado, así que los cambios no se
              guardan en el servidor.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              ⚠️ {error}
            </p>
          )}

          {aviso && (
            <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              ⚠️ {aviso}
            </p>
          )}

          {guardado && (
            <p className="rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <IconoCheck className="mr-1 inline h-4 w-4" />
              Perfil actualizado.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={guardando || !HAY_API} className="btn-primary">
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
            <Link href="/productor/completar" className="btn-secondary">
              Abrir formulario de primer ingreso
            </Link>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="card space-y-3">
            <h2 className="text-lg font-bold text-emerald-950">Cómo se ancla</h2>
            <p className="text-sm text-emerald-900/75">
              Al registrar un lote se calcula el SHA-256 de 8 campos: código,
              fecha de cosecha, línea productiva, cantidad, unidad, finca,
              municipio y evidencias.
            </p>
            <p className="text-sm text-emerald-900/75">
              Solo esa huella (32 bytes) viaja a{" "}
              <strong className="text-emerald-800">Stellar Testnet</strong> como
              memo de un pago de 1 XLM. Las fotos nunca se suben a la red
              pública.
            </p>
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900/75">
              <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              El consumidor puede recalcular la huella desde la ficha pública y
              compararla con el ancla.
            </p>
          </section>

          <section className="card space-y-2">
            <h2 className="text-lg font-bold text-emerald-950">Accesos rápidos</h2>
            <Link href="/productor" className="block text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
              Mis lotes
            </Link>
            <Link href="/productor/productos" className="block text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
              Catálogo de productos
            </Link>
            <Link href="/productor/evidencias" className="block text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
              Galería de evidencias
            </Link>
            <Link href="/productor/nuevo" className="block text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline">
              Registrar un lote nuevo
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
