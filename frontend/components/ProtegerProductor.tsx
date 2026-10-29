"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { leerSesion } from "@/lib/auth";

interface Props {
  children: ReactNode;
  /**
   * true (por defecto): exige además el perfil del primer ingreso completo
   * (HU-07) y manda a /productor/completar si falta. La página de completar
   * pasa false para mostrar su formulario aunque el perfil esté a medias.
   */
  exigirPerfil?: boolean;
}

/**
 * Protege las rutas /productor/* (HU-06, escenario 3).
 *
 * Se resuelve en el cliente porque la sesión vive en localStorage: un
 * middleware de Next.js no puede leerla (solo cookies). Mientras no haya
 * sesión se muestra un aviso corto y se redirige a /login.
 */
export default function ProtegerProductor({
  children,
  exigirPerfil = true,
}: Props) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const sesion = leerSesion();
    if (!sesion) {
      router.replace("/login");
      return;
    }
    if (exigirPerfil && !sesion.usuario.perfil_completo) {
      router.replace("/productor/completar");
      return;
    }
    setAutorizado(true);
  }, [router, exigirPerfil]);

  if (!autorizado) {
    return (
      <p className="py-10 text-center text-sm text-emerald-900/60">
        Verificando sesión…
      </p>
    );
  }
  return <>{children}</>;
}
