/** Estructura de la página «Acerca de AgroTrace». */

export interface BloqueAbout {
  id: string;
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  tabla?: { columnas: string[]; filas: string[][] };
}

export interface ContenidoAbout {
  titulo: string;
  bajada: string;
  bloques: BloqueAbout[];
}
