"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, loginConGoogle } from "@/lib/api";
import { cerrarSesion, guardarSesion, leerSesion } from "@/lib/auth";
import type { Sesion, Usuario } from "@/lib/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const HAY_API = !!process.env.NEXT_PUBLIC_API_URL;
const SCRIPT_GSI = "https://accounts.google.com/gsi/client";

interface RespuestaGoogle {
  credential: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize(opts: {
        client_id: string;
        callback: (respuesta: RespuestaGoogle) => void;
        locale?: string;
      }): void;
      renderButton(
        elemento: HTMLElement,
        opts: {
          theme?: string;
          size?: string;
          text?: string;
          shape?: string;
          width?: number;
        }
      ): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

/** Sesión sintética para explorar la app sin backend (mismo aviso del modo demo). */
const USUARIO_DEMO: Usuario = {
  id: "demo",
  email: "productor@demo.local",
  nombre: "Productor demo",
  foto_url: null,
  cedula: "0000000",
  telefono: "3000000000",
  finca: "Finca Guarumo",
  municipio: "Cáceres, Antioquia",
  perfil_completo: true,
};

export default function LoginPage() {
  const router = useRouter();
  const divBoton = useRef<HTMLDivElement>(null);
  const enCurso = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [sinBackend, setSinBackend] = useState(false);

  const entrar = useCallback(
    (sesion: Sesion) => {
      guardarSesion(sesion);
      router.push(
        sesion.usuario.perfil_completo ? "/productor" : "/productor/completar"
      );
    },
    [router]
  );

  const alAutenticar = useCallback(
    async (respuesta: RespuestaGoogle) => {
      if (enCurso.current) return;
      enCurso.current = true;
      setError(null);
      try {
        const sesion = await loginConGoogle(respuesta.credential);
        entrar(sesion);
      } catch (err) {
        setError(
          err instanceof Error && err.message
            ? err.message
            : "No se pudo iniciar sesión. Intenta de nuevo."
        );
        // Red caída o backend en error 5xx → se ofrece el modo demo, igual que
        // las lecturas. Un 401/422 del backend NO: ahí hay que corregir el token.
        if (!(err instanceof ApiError) || err.status >= 500) setSinBackend(true);
        enCurso.current = false;
      }
    },
    [entrar]
  );

  // Carga de Google Identity Services + botón (solo si hay Client ID).
  useEffect(() => {
    if (!CLIENT_ID) return;
    if (leerSesion()) {
      router.replace("/productor");
      return;
    }

    let cancelado = false;
    const inicializar = () => {
      const google = window.google;
      if (cancelado || !google?.accounts?.id || !divBoton.current) return;
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        locale: "es",
        callback: (respuesta) => void alAutenticar(respuesta),
      });
      google.accounts.id.renderButton(divBoton.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 280,
      });
    };

    if (window.google?.accounts?.id) {
      inicializar();
      return;
    }
    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_GSI}"]`
    );
    const script = existente ?? document.createElement("script");
    script.src = SCRIPT_GSI;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", inicializar);
    if (!existente) document.head.appendChild(script);
    return () => {
      cancelado = true;
      script.removeEventListener("load", inicializar);
    };
  }, [alAutenticar, router]);

  function entrarComoDemo() {
    cerrarSesion();
    entrar({ token: "demo", usuario: USUARIO_DEMO });
  }

  // Sin backend, con el backend caído o sin Client ID de Google: la única
  // puerta posible es el modo demo (si no, la pantalla quedaría sin salida).
  const mostrarDemo = !HAY_API || sinBackend || !CLIENT_ID;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-4xl">🌱</p>
        <h1 className="mt-2 text-3xl font-bold text-emerald-950">
          Ingreso de productores
        </h1>
        <p className="mt-1 text-sm text-emerald-900/70">
          Entra con tu cuenta de Google para registrar y consultar tus lotes.
        </p>
      </div>

      <div className="card space-y-4 text-center">
        {!CLIENT_ID && (
          <p className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
            ⚠️ Google no está configurado: define
            <code className="mx-1 rounded bg-amber-100 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
            en el frontend y recarga.
          </p>
        )}

        {CLIENT_ID && (
          <>
            <div ref={divBoton} className="flex justify-center" />
            <p className="text-xs text-emerald-900/60">
              Primera vez aquí? Te pediremos tus datos de productor después de
              entrar.
            </p>
          </>
        )}

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </p>
        )}

        {mostrarDemo && (
          <div className="border-t border-emerald-900/10 pt-4">
            <button onClick={entrarComoDemo} className="btn-secondary w-full">
              Entrar como demo (sin backend)
            </button>
            <p className="mt-2 text-[11px] text-emerald-900/50">
              Explora la app con datos de ejemplo; nada se guarda en el servidor.
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-sm">
        <Link href="/" className="text-emerald-800 underline hover:text-emerald-950">
          ← Volver al inicio
        </Link>
      </p>
    </div>
  );
}
