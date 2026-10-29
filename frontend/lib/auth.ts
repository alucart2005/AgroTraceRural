/** Sesión del productor en el navegador (HU-06).

El JWT que emite el backend vive en ``localStorage`` y se envía en cada
petición como ``Authorization: Bearer``. La expiración se comprueba leyendo el
claim ``exp`` del propio token: así, un token vencido corta la sesión en el
navegador sin esperar a que el backend responda 401.

El modo demo (sin backend) usa un token sintético ``"demo"`` que no tiene
``exp``: su validez la marca el propio usuario al cerrar sesión.
 */

import type { Sesion } from "./types";

const CLAVE = "agrotrace.sesion.v1";

/** Lee la sesión; devuelve null si no hay, está corrupta o ya venció. */
export function leerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const bruto = window.localStorage.getItem(CLAVE);
  if (!bruto) return null;
  try {
    const sesion = JSON.parse(bruto) as Sesion;
    if (!sesion?.token || !sesion?.usuario) return null;
    if (sesion.token !== "demo" && estaExpirado(sesion.token)) {
      cerrarSesion();
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function cerrarSesion(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLAVE);
}

/** Token Bearer para los headers, o null si no hay sesión. */
export function tokenActual(): string | null {
  return leerSesion()?.token ?? null;
}

/** true si el ``exp`` del JWT ya pasó (cualquier problema → se trata como expirado). */
function estaExpirado(token: string): boolean {
  try {
    const parte = token.split(".")[1] ?? "";
    const json = atob(parte.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
