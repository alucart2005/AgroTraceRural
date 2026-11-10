import type { ContenidoAbout } from "./tipos";

/** Acerca de AgroTrace — Español (documento base). */
export const about: ContenidoAbout = {
  titulo: "Acerca de AgroTrace Rural",
  bajada:
    "Un canal directo entre la finca y el cliente, con trazabilidad verificable en cada cubeta.",
  bloques: [
    {
      id: "proyecto",
      titulo: "Qué es AgroTrace Rural",
      parrafos: [
        "AgroTrace Rural es un proyecto de trazabilidad agroalimentaria que busca crear un canal finca → cliente: reducir la dependencia de intermediarios y permitir que el consumidor verifique el origen de lo que compra mediante un código QR.",
        "El corazón del proyecto es una plataforma de registros digitales con huellas criptográficas SHA-256 y anclaje selectivo de eventos en la red Stellar. Los documentos, las fotografías y los videos no se almacenan en la blockchain: se conservan en almacenamiento digital y solo se registra su huella criptográfica, la fecha, el lote y la referencia, de modo que una modificación posterior del archivo pueda ser detectada.",
      ],
    },
    {
      id: "piloto",
      titulo: "El piloto",
      tabla: {
        columnas: ["Aspecto", "Detalle"],
        filas: [
          ["Ubicación", "Guarumo, Cáceres — Bajo Cauca antioqueño (Antioquia)"],
          ["Área", "6 hectáreas"],
          [
            "Producción",
            "Peces · gallinas ponedoras · patos · porcinos · bovinos · frutales",
          ],
          ["Producto piloto", "Cubeta de huevos con pasaporte digital QR"],
          ["Inversión preliminar", "$48.000.000 COP"],
          ["Horizonte", "36 meses, con una primera etapa de 12 meses"],
        ],
      },
    },
    {
      id: "sello",
      titulo: "Cómo se sella un lote",
      parrafos: [
        "De cada lote se calcula una huella SHA-256 sobre ocho campos: código, fecha de cosecha, línea productiva, cantidad, unidad, finca, municipio y evidencias. Esa huella de 32 bytes viaja a Stellar Testnet dentro del memo de un pago de 1 XLM; el resto de la información se queda fuera de la red.",
      ],
      lista: [
        "El consumidor recalcula la huella desde la ficha pública y la compara con el ancla.",
        "Si un dato o una foto cambian después de anclar, la comparación falla y la ficha lo dice.",
        "La evidencia fotográfica se guarda en almacenamiento externo y solo viaja su tamaño y nombre.",
      ],
    },
    {
      id: "infraestructura",
      titulo: "Infraestructura real",
      lista: [
        "Frontend en Vercel con Next.js 14.",
        "Backend en FastAPI sobre Docker, desplegado en Render.",
        "Base de datos en Neon Postgres.",
        "Evidencias fotográficas en Cloudflare R2 (compatible con S3).",
        "Anclaje en Stellar Testnet, donde viaja solo el hash SHA-256 como Memo Hash.",
        "En desarrollo local: SQLite y modo demo en el navegador.",
      ],
    },
  ],
};
