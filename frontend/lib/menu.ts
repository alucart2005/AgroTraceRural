/**
 * Menú de la aplicación, compartido por el sidebar de escritorio y el panel
 * móvil: una sola fuente de verdad para la navegación.
 *
 * Cada sección puede ser un enlace directo («Inicio») o un grupo con
 * submenú. Todos los destinos existen dentro de la app: los submenú que antes
 * eran «Próximamente» ahora apuntan a páginas reales construidas sobre los
 * endpoints que ya tenía el backend.
 */

export type ClaveIcono =
  | "inicio"
  | "consulta"
  | "lotes"
  | "catalogo"
  | "config"
  | "buscar"
  | "qr"
  | "demo"
  | "nuevo"
  | "eventos"
  | "productos"
  | "evidencias"
  | "perfil"
  | "ayuda"
  | "versiones"
  | "info"
  | "soporte";

export interface EnlaceMenu {
  href: string;
  label: string;
  descripcion: string;
  icono: ClaveIcono;
}

export interface GrupoMenu {
  id: string;
  label: string;
  icono: ClaveIcono;
  items: EnlaceMenu[];
}

/** Lote de ejemplo: es real y está anclado en Stellar Testnet. */
export const LOTE_DEMO = "HUE-2026-008";

export const ENTRADAS: (GrupoMenu | (EnlaceMenu & { id: string }))[] = [
  {
    id: "inicio",
    href: "/",
    label: "Inicio",
    descripcion: "Portada de AgroTrace Rural",
    icono: "inicio",
  },
  {
    id: "consulta",
    label: "Consulta",
    icono: "consulta",
    items: [
      {
        href: "/#buscar",
        label: "Buscar un lote",
        descripcion: "Escanea o escribe el código del lote",
        icono: "buscar",
      },
      {
        href: `/lote/${LOTE_DEMO}`,
        label: "Lote verificado",
        descripcion: "Ficha pública con evidencia y ancla",
        icono: "demo",
      },
      {
        href: `/lote/${LOTE_DEMO}/etiqueta`,
        label: "Etiqueta QR",
        descripcion: "Etiqueta imprimible para la cubeta",
        icono: "qr",
      },
    ],
  },
  {
    id: "lotes",
    label: "Lotes",
    icono: "lotes",
    items: [
      {
        href: "/productor",
        label: "Mis lotes",
        descripcion: "Cosechas registradas por ti",
        icono: "lotes",
      },
      {
        href: "/productor/nuevo",
        label: "Registrar lote",
        descripcion: "Formulario guiado en 3 pasos",
        icono: "nuevo",
      },
      {
        href: `/productor/lote/${LOTE_DEMO}/eventos`,
        label: "Cadena de custodia",
        descripcion: "Clasificación, empaque y despacho",
        icono: "eventos",
      },
    ],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    icono: "catalogo",
    items: [
      {
        href: "/productor/productos",
        label: "Productos",
        descripcion: "Líneas productivas registradas",
        icono: "productos",
      },
      {
        href: "/productor/evidencias",
        label: "Evidencias",
        descripcion: "Galería de fotos de tus lotes",
        icono: "evidencias",
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icono: "config",
    items: [
      {
        href: "/productor/configuracion",
        label: "Mi perfil",
        descripcion: "Datos del productor y de la finca",
        icono: "perfil",
      },
      {
        href: "/productor/completar",
        label: "Datos del primer ingreso",
        descripcion: "Cédula, teléfono, finca y municipio",
        icono: "config",
      },
    ],
  },
  {
    id: "ayuda",
    label: "Ayuda",
    icono: "ayuda",
    items: [
      {
        href: "/ayuda/manual",
        label: "Manual de usuario",
        descripcion: "Guía paso a paso en español, inglés y portugués",
        icono: "ayuda",
      },
      {
        href: "/ayuda/versiones",
        label: "Novedades y versiones",
        descripcion: "Qué cambió en cada ciclo",
        icono: "versiones",
      },
      {
        href: "/ayuda/acerca-de",
        label: "Acerca de AgroTrace",
        descripcion: "El proyecto, el piloto y la infraestructura",
        icono: "info",
      },
      {
        href: "/ayuda/reportar",
        label: "Reportar un problema",
        descripcion: "Correo de soporte o incidencia",
        icono: "soporte",
      },
    ],
  },
];

export function esGrupo(
  entrada: GrupoMenu | (EnlaceMenu & { id: string })
): entrada is GrupoMenu {
  return "items" in entrada;
}

/** true si la entrada (o alguno de sus submenú) corresponde a la ruta actual. */
export function entradaActiva(
  entrada: GrupoMenu | (EnlaceMenu & { id: string }),
  pathname: string
): boolean {
  if (esGrupo(entrada)) {
    return entrada.items.some((i) => enlaceActivo(i.href, pathname));
  }
  return enlaceActivo(entrada.href, pathname);
}

/** Coincidencia exacta de ruta (los enlaces con # solo aplican a su base). */
export function enlaceActivo(href: string, pathname: string): boolean {
  const base = href.split("#")[0];
  if (!base || base === "/") return pathname === "/";
  return pathname === base;
}
