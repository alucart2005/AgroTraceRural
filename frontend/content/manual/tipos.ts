/**
 * Estructura del manual de usuario.
 *
 * El contenido vive en `es.ts`, `en.ts` y `pt.ts` con la misma forma: si un
 * idioma se queda corto, TypeScript lo avisa al compilar.
 */

export type TonoAviso = "info" | "nota" | "alerta";

export interface BloqueManual {
  id: string;
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  pasos?: { titulo: string; texto: string }[];
  aviso?: { tono: TonoAviso; titulo: string; texto: string };
  tabla?: { columnas: string[]; filas: string[][] };
}

export interface Manual {
  titulo: string;
  bajada: string;
  secciones: BloqueManual[];
}

export const IDIOMAS = ["es", "en", "pt"] as const;

export type IdiomaManual = (typeof IDIOMAS)[number];

export const NOMBRES_IDIOMA: Record<IdiomaManual, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};
