import type { ContenidoAbout } from "./tipos";

/** Sobre o AgroTrace — Português. */
export const about: ContenidoAbout = {
  titulo: "Sobre o AgroTrace Rural",
  bajada:
    "Um canal direto entre a fazenda e o comprador, com rastreabilidade verificável em cada bandeja.",
  bloques: [
    {
      id: "proyecto",
      titulo: "O que é o AgroTrace Rural",
      parrafos: [
        "O AgroTrace Rural é um projeto de rastreabilidade agroalimentar que quer criar um canal fazenda → comprador: reduzir a dependência de intermediários e permitir que o consumidor verifique a origem do que compra por meio de um código QR.",
        "O coração do projeto é uma plataforma de registros digitais com impressões criptográficas SHA-256 e ancoragem seletiva de eventos na rede Stellar. Documentos, fotografias e vídeos não ficam na blockchain: ficam em armazenamento digital e só se registra a impressão criptográfica, a data, o lote e a referência, de modo que uma alteração posterior do arquivo possa ser detectada.",
      ],
    },
    {
      id: "piloto",
      titulo: "O piloto",
      tabla: {
        columnas: ["Aspecto", "Detalhe"],
        filas: [
          ["Localização", "Guarumo, Cáceres — Bajo Cauca, Antioquia (Colômbia)"],
          ["Área", "6 hectares"],
          [
            "Produção",
            "Peixes · galinhas poedeiras · patos · suínos · bovinos · frutas",
          ],
          ["Produto piloto", "Bandeja de ovos com passaporte digital QR"],
          ["Investimento preliminar", "$48.000.000 COP"],
          ["Horizonte", "36 meses, com uma primeira etapa de 12 meses"],
        ],
      },
    },
    {
      id: "sello",
      titulo: "Como um lote é selado",
      parrafos: [
        "De cada lote se calcula uma impressão SHA-256 sobre oito campos: código, data da colheita, linha produtiva, quantidade, unidade, fazenda, município e evidências. Essa impressão de 32 bytes viaja ao Stellar Testnet dentro do memo de um pagamento de 1 XLM; todo o restante fica fora da rede.",
      ],
      lista: [
        "O comprador recalcula a impressão pela página pública e compara com a âncora.",
        "Se um dado ou uma foto mudam depois da ancoragem, a comparação falha e a página avisa.",
        "A evidência fotográfica fica em armazenamento externo; da foto só viajam o tamanho e o nome.",
      ],
    },
    {
      id: "infraestructura",
      titulo: "Infraestrutura real",
      lista: [
        "Frontend na Vercel com Next.js 14.",
        "Backend em FastAPI sobre Docker, hospedado no Render.",
        "Banco de dados no Neon Postgres.",
        "Evidências fotográficas no Cloudflare R2 (compatível com S3).",
        "Ancoragem no Stellar Testnet, onde viaja apenas o hash SHA-256 como Memo Hash.",
        "No desenvolvimento local: SQLite e modo demo no navegador.",
      ],
    },
  ],
};
